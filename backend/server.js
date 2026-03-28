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
import { fetchCurrentMatches } from "./services/cricService.js";
import { getIplSchedule } from "./services/scheduleService.js";
import { Admin } from "./models/Admin.js";

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
  const now = new Date();

  const merged = schedule.map((fixture) => {
    const live = liveMatches.find((m) => teamsMatch(fixture, m));

    if (live) {
      return {
        ...fixture,
        apiId: live.id,
        teams: live.teams || [fixture.homeTeam, fixture.awayTeam],
        score: live.score || [],
        status: live.matchEnded ? "finished" : "live",
        statusText: live.status || "Live",
        matchStarted: !!live.matchStarted,
        matchEnded: !!live.matchEnded,
      };
    }

    const fixtureDateTime = new Date(`${fixture.dateRaw}T${fixture.timeRaw}:00+05:30`);

    if (fixtureDateTime > now) {
      return {
        ...fixture,
        status: "upcoming",
        statusText: `Starts at ${fixture.time} IST`,
        score: [],
        teams: [fixture.homeTeam, fixture.awayTeam],
      };
    }

    return {
      ...fixture,
      status: "finished",
      statusText: fixture.statusText || "Match completed",
      score: [],
      teams: [fixture.homeTeam, fixture.awayTeam],
    };
  });

  const order = { live: 0, upcoming: 1, finished: 2 };
  merged.sort((a, b) => order[a.status] - order[b.status]);

  return merged;
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
      "http://localhost:8080",
      "http://localhost:5173",
      "https://ipl-live-frontend.vercel.app",
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    app.use(
      cors({
        origin(origin, callback) {
          if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
          }
          return callback(new Error(`CORS not allowed for origin: ${origin}`));
        },
        credentials: false,
      }),
    );

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
      cors: { origin: "*", methods: ["GET", "POST"] },
    });

    let latestMatches = [];

    async function pollAndEmit() {
      try {
        console.log("📡 Fetching live matches from CricAPI...");
        const liveData = await fetchCurrentMatches();
        const liveMatches = Array.isArray(liveData?.data) ? liveData.data : [];

        const schedule = await getIplSchedule();
        const mergedMatches = mergeScheduleWithLive(schedule, liveMatches);

        latestMatches = mergedMatches;

        console.log(
          `🏏 Matches updated: Live(${mergedMatches.filter((m) => m.status === "live").length}), Upcoming(${mergedMatches.filter((m) => m.status === "upcoming").length}), Finished(${mergedMatches.filter((m) => m.status === "finished").length})`,
        );

        io.emit("liveScores", latestMatches);
      } catch (err) {
        console.error("❌ Socket poll error:", err?.message ?? err);
        io.emit("liveScores", latestMatches);
      }
    }

    io.on("connection", (socket) => {
      console.log("⚡ Client connected:", socket.id);
      socket.emit("liveScores", latestMatches);

      socket.on("disconnect", () => {
        console.log("❌ Client disconnected:", socket.id);
      });
    });

    setTimeout(() => pollAndEmit(), 500);

    const intervalMs = Number(process.env.LIVE_POLL_INTERVAL_MS ?? 7000);
    setInterval(pollAndEmit, intervalMs);

    server.listen(PORT, () => {
      console.log(`🚀 Backend running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server startup failed:", err.message);
    process.exit(1);
  }
}

start();
