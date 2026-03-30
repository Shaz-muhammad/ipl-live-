import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import mongoose from "mongoose";
import { Server as SocketIOServer } from "socket.io";
import bcrypt from "bcrypt";

import adminRoutes from "./routes/adminRoutes.js";
import cricRoutes from "./routes/cricRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import { fetchScores, setCurrentPollingMode, getPollInterval, isMatchLive, getApiStatus } from "./services/cricService.js";
import { getIplSchedule } from "./services/scheduleService.js";
import { Admin } from "./models/Admin.js";
import { resolveTeam } from "./services/teamMap.js";

// Global state for cached merged matches
let latestMatches = [];

export function getLatestMatches() {
  return latestMatches;
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

async function ensureAdminUser() {
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "Shazadmin";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "MarcMax393";
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);

  const existing = await Admin.findOne({ username: ADMIN_USERNAME });
  if (existing) return;

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, saltRounds);
  await Admin.create({ username: ADMIN_USERNAME, password: passwordHash });

  console.log(`✅ Seeded admin user: ${ADMIN_USERNAME}`);
}

function normalizeName(name = "") {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function teamsMatch(scheduleMatch, apiMatch) {
  const apiTeams = (apiMatch.teams || []).map(normalizeName);

  return (
    apiTeams.includes(normalizeName(scheduleMatch.homeTeam)) &&
    apiTeams.includes(normalizeName(scheduleMatch.awayTeam))
  );
}

function mergeScheduleWithLive(schedule, liveMatches) {
  // 1. Start with all live matches from the API (the most reliable source for current data)
  const apiMatches = liveMatches.map((live) => {
    // Try to find enrichment data from the static schedule
    const fixture = schedule.find((f) => teamsMatch(fixture, live));
    
    const team1Data = resolveTeam(live.team1 || fixture?.homeTeam);
    const team2Data = resolveTeam(live.team2 || fixture?.awayTeam);

    return {
      ...live,
      // Ensure flat strings for frontend
      team1: live.team1 || fixture?.homeTeam || "Team 1",
      team2: live.team2 || fixture?.awayTeam || "Team 2",
      team1Short: team1Data?.shortName || live.team1Short || fixture?.homeTeam,
      team2Short: team2Data?.shortName || live.team2Short || fixture?.awayTeam,
      team1Logo: team1Data?.logo || live.team1Logo || "🏏",
      team2Logo: team2Data?.logo || live.team2Logo || "🏏",
      venue: live.venue || fixture?.venue || "Venue",
      status: "live",
      matchState: live.matchState || "In Progress",
    };
  });

  // 2. Sort to prioritize actively started matches
  apiMatches.sort((a, b) => (a.team1Score || a.team2Score ? -1 : 1));

  return apiMatches;
}

async function start() {
  try {
    const MONGO_URI = requireEnv("MONGO_URI");
    const PORT = Number(process.env.PORT ?? 5000);

    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI, { autoIndex: true });
    console.log("✅ MongoDB Connected");

    await ensureAdminUser();

    const app = express();

    // 🌐 CORS Configuration
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:8080",
      "https://ipl-live-frontend.vercel.app",
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    const corsOptions = {
      origin(origin, callback) {
        // Allow if no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const isAllowed = allowedOrigins.includes(origin);
        const isVercelPreview = origin.endsWith(".vercel.app");
        
        if (isAllowed || isVercelPreview) {
          return callback(null, true);
        }
        
        console.warn(`⚠️ CORS blocked for origin: ${origin}`);
        return callback(new Error(`CORS not allowed for origin: ${origin}`));
      },
      credentials: true,
    };

    app.use(cors(corsOptions));

    app.use(express.json({ limit: "1mb" }));

    // 🔍 Debug: Global Request Logger
    app.use((req, res, next) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
      next();
    });

    // 🏥 Health Checks
    app.get("/", (req, res) => {
      res.json({ ok: true, message: "Backend is running" });
    });

    app.get("/health", (req, res) => {
      res.json({ ok: true, message: "Server + DB working ✅" });
    });

    // 🛣️ Route Mounting
    console.log("🛤️ Mounting routes...");
    app.use("/admin", adminRoutes);
    
    // Explicitly mount at root to avoid any ambiguity
    app.use("/", cricRoutes);
    app.use("/", blogRoutes);
    console.log("✅ Routes mounted");

    // 🚫 404 Handler
    app.use((req, res) => {
      console.warn(`⚠️ 404 Not Found: ${req.method} ${req.url}`);
      res.status(404).json({ error: `Path ${req.url} not found on this server` });
    });

    // 🧨 Global Error Handler
    app.use((err, req, res, next) => {
      console.error("❌ Unhandled Server Error:", err);
      res.status(500).json({ error: "Internal server error", details: err.message });
    });

    const server = http.createServer(app);

    const io = new SocketIOServer(server, {
      cors: corsOptions,
    });

    let currentPollingInterval = 1200000; // Default to standby (20m)
    let pollTimer = null;

    async function pollAndEmit() {
      try {
        const payload = await fetchScores();
        const liveMatches = Array.isArray(payload?.data) ? payload.data : [];

        // In previous steps, we decided to focus only on live matches from the API
        // but still use the merge logic if needed for data normalization.
        // If we want ONLY live data, mergeScheduleWithLive currently filters correctly.
        const schedule = await getIplSchedule();
        const mergedMatches = mergeScheduleWithLive(schedule, liveMatches);

        latestMatches = mergedMatches;
        
        const apiStatus = payload.apiStatus || (mergedMatches.length > 0 ? "live" : "no-match");

        // Emit to all clients
        io.emit("liveScores", { apiStatus, data: latestMatches });

        // Update polling mode based on live match status
        const hasLiveMatch = mergedMatches.length > 0;
        const nextInterval = getPollInterval(hasLiveMatch);
        const mode = hasLiveMatch ? "live" : "standby";

        setCurrentPollingMode(mode);

        if (nextInterval !== currentPollingInterval || !pollTimer) {
          currentPollingInterval = nextInterval;
          
          if (pollTimer) clearInterval(pollTimer);
          pollTimer = setInterval(pollAndEmit, currentPollingInterval);
        }
      } catch (err) {
        console.error("❌ [POLL] Socket poll error:", err?.message ?? err);
        // Fallback: emit last known matches even if fetch failed
        const apiStatus = latestMatches.length > 0 ? "live" : "no-match";
        io.emit("liveScores", { apiStatus, data: latestMatches });
      }
    }

    io.on("connection", (socket) => {
      console.log("⚡ [SOCKET] Socket connected:", socket.id);
      // On connection, send cached data only. Do NOT trigger fetch per user.
      const apiStatus = latestMatches.length > 0 ? "live" : "no-match";
      socket.emit("liveScores", { apiStatus, data: latestMatches });

      socket.on("disconnect", () => {
        console.log("❌ [SOCKET] Client disconnected:", socket.id);
      });
    });

    // Initial fetch after short delay
    setTimeout(() => pollAndEmit(), 1000);

    // One global scheduler only - managed by pollAndEmit's interval logic
    // No redundant setInterval here as it's handled by currentPollingInterval logic above

    server.listen(PORT, () => {
      console.log(`🚀 Backend running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server startup failed:", err.message);
    process.exit(1);
  }
}

start();
