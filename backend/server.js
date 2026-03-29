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
      // Basic normalization for live matches from CricAPI
      const team1 = resolveTeam(fixture.homeTeam);
      const team2 = resolveTeam(fixture.awayTeam);
      const team1ScoreObj = (live.score || []).find(s => s.inning.toLowerCase().includes(fixture.homeTeam.toLowerCase())) || {};
      const team2ScoreObj = (live.score || []).find(s => s.inning.toLowerCase().includes(fixture.awayTeam.toLowerCase())) || {};
      
      const team1Score = team1ScoreObj.r ? `${team1ScoreObj.r}/${team1ScoreObj.w}` : "";
      const team2Score = team2ScoreObj.r ? `${team2ScoreObj.r}/${team2ScoreObj.w}` : "";

      return {
        ...fixture,
        id: live.id || fixture.id,
        apiId: live.id,
        team1,
        team2,
        team1Logo: team1?.logo || "🏏",
        team2Logo: team2?.logo || "🏏",
        team1Score,
        team2Score,
        team1Overs: team1ScoreObj.o || "",
        team2Overs: team2ScoreObj.o || "",
        score: team1Score || team2Score ? `${team1Score} vs ${team2Score}` : "—",
        status: live.matchEnded ? "finished" : "live",
        statusText: live.status || "Live",
        matchStarted: !!live.matchStarted,
        matchEnded: !!live.matchEnded,
        venue: live.venue || fixture.venue,
        tossWinner: live.tossWinner || "",
        tossChoice: live.tossChoice || "",
        result: live.matchEnded ? live.status : "",
        target: live.score && live.score.length === 2 ? Number(live.score[0]?.r || live.score[0]?.R || 0) + 1 : 0,
        currentInnings: live.score ? (live.score.length === 2 ? "2nd Innings" : "1st Innings") : "",
        matchState: live.matchEnded ? "Completed" : "In Progress",
      };
    }

    const fixtureDateTime = new Date(`${fixture.dateRaw}T${fixture.timeRaw}:00+05:30`);

    if (fixtureDateTime > now) {
      const team1 = resolveTeam(fixture.homeTeam);
      const team2 = resolveTeam(fixture.awayTeam);
      return {
        ...fixture,
        team1,
        team2,
        team1Logo: team1?.logo || "🏏",
        team2Logo: team2?.logo || "🏏",
        status: "upcoming",
        statusText: `Starts at ${fixture.time} IST`,
        score: "—",
        teams: [fixture.homeTeam, fixture.awayTeam],
        venue: fixture.venue,
        matchState: "Scheduled",
      };
    }

    const team1 = resolveTeam(fixture.homeTeam);
    const team2 = resolveTeam(fixture.awayTeam);
    return {
      ...fixture,
      team1,
      team2,
      team1Logo: team1?.logo || "🏏",
      team2Logo: team2?.logo || "🏏",
      status: "finished",
      statusText: fixture.statusText || "Match completed",
      score: "—",
      teams: [fixture.homeTeam, fixture.awayTeam],
      venue: fixture.venue,
      result: fixture.statusText || "",
      matchState: "Completed",
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
        // Use the rate-limited cached service
        const liveData = await fetchCurrentMatches();
        const liveMatches = Array.isArray(liveData?.data) ? liveData.data : [];

        const schedule = await getIplSchedule();
        const mergedMatches = mergeScheduleWithLive(schedule, liveMatches);

        latestMatches = mergedMatches;

        if (!liveData.fromCache) {
          console.log(
            `🏏 [FRESH] Matches updated: Live(${mergedMatches.filter((m) => m.status === "live").length}), Upcoming(${mergedMatches.filter((m) => m.status === "upcoming").length}), Finished(${mergedMatches.filter((m) => m.status === "finished").length})`,
          );
        }

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

    // Initial fetch after short delay
    setTimeout(() => pollAndEmit(), 1000);

    // STRICT: Only one global polling loop, every 20-30 seconds
    const POLL_INTERVAL = 20000; // 20 seconds
    setInterval(pollAndEmit, POLL_INTERVAL);

    server.listen(PORT, () => {
      console.log(`🚀 Backend running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server startup failed:", err.message);
    process.exit(1);
  }
}

start();
