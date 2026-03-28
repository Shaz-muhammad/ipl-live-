import express from "express";
import { fetchCurrentMatches, getMatchDetails } from "../services/cricService.js";

const router = express.Router();

router.get("/live-scores", async (req, res) => {
  try {
    const data = await fetchCurrentMatches();
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

