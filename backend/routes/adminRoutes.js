import express from "express";
import bcrypt from "bcrypt";
import { Admin } from "../models/Admin.js";
import { MatchLinks } from "../models/MatchLinks.js";
import { requireAdminAuth, signAdminJwt } from "../services/authService.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body ?? {};
    if (!username || !password) return res.status(400).json({ error: "username and password required" });

    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(String(password), admin.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signAdminJwt(admin);
    return res.json({ token });
  } catch (err) {
    return res.status(500).json({ error: "Login failed" });
  }
});

router.post("/links", requireAdminAuth, async (req, res) => {
  try {
    console.log("📥 Incoming body:", req.body);
    const { matchId, links } = req.body ?? {};
    if (!matchId) return res.status(400).json({ error: "matchId is required" });

    let incoming = [];
    if (Array.isArray(links)) {
      incoming = links;
    } else if (typeof links === "string") {
      incoming = [links];
    }

    incoming = incoming.map((l) => String(l).trim()).filter(Boolean);
    if (incoming.length === 0) return res.status(400).json({ error: "links must contain at least one value" });

    const updatedDoc = await MatchLinks.findOneAndUpdate(
      { matchId },
      { matchId, links: Array.from(new Set(incoming)), updatedAt: new Date() },
      { upsert: true, new: true }
    );

    console.log("✅ Links saved successfully:", updatedDoc.matchId);
    return res.json(updatedDoc);
  } catch (err) {
    console.error("❌ Save links error:", err);
    return res.status(500).json({ error: "Failed to save links" });
  }
});

// List all match links (Admin only)
router.get("/links", requireAdminAuth, async (req, res) => {
  try {
    const docs = await MatchLinks.find({}).sort({ updatedAt: -1 });
    return res.json(docs);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch all links" });
  }
});

// Public endpoint to get all matches that have streaming links
router.get("/all-links", async (req, res) => {
  try {
    const docs = await MatchLinks.find({ links: { $not: { $size: 0 } } }).sort({ updatedAt: -1 });
    return res.json(docs);
  } catch (err) {
    console.error("❌ Fetch all links error:", err);
    return res.status(500).json({ error: "Failed to fetch links" });
  }
});

// Public endpoint so users can open the "Watch Live" modal for a specific match.
router.get("/links/:matchId", async (req, res) => {
  try {
    const { matchId } = req.params;
    const doc = await MatchLinks.findOne({ matchId });
    return res.json({ matchId, links: doc?.links ?? [] });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch links" });
  }
});

router.delete("/links/:matchId", requireAdminAuth, async (req, res) => {
  try {
    const { matchId } = req.params;
    await MatchLinks.deleteOne({ matchId });
    console.log(`✅ Links for match ${matchId} deleted`);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Delete links error:", err);
    res.status(500).json({ error: "Failed to delete links" });
  }
});

export default router;

