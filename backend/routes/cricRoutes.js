import express from "express";
import { getMatchDetails, getApiStatus } from "../services/cricService.js";
import { getLatestMatches } from "../server.js";

const router = express.Router();

router.get("/live-scores", async (req, res) => {
  try {
    // REST endpoints must return cached normalized data ONLY
    const { matches, sequence } = getLatestMatches();
    const apiStatus = getApiStatus(matches);
    return res.json({ apiStatus, data: matches, sequence });
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

