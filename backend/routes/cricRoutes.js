import express from "express";
import { getMatchDetails } from "../services/cricService.js";
import { getLatestMatches } from "../server.js";

const router = express.Router();

router.get("/live-scores", async (req, res) => {
  try {
    // REST endpoints must return cached normalized data ONLY
    const data = getLatestMatches();
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch live scores" });
  }
});

router.get("/match/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "id is required" });

    const match = await getMatchDetails(id);
    return res.json(match);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch match details" });
  }
});

export default router;

