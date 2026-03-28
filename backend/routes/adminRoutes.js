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
    const { matchId, links, link } = req.body ?? {};
    if (!matchId) return res.status(400).json({ error: "matchId is required" });

    let incoming = [];
    if (Array.isArray(links)) incoming = links;
    else if (typeof links === "string") incoming = [links];
    else if (typeof link === "string") incoming = [link];

    incoming = incoming.map((l) => String(l).trim()).filter(Boolean);
    if (incoming.length === 0) return res.status(400).json({ error: "links must contain at least one value" });

    const doc = await MatchLinks.findOne({ matchId });
    if (!doc) {
      const created = await MatchLinks.create({ matchId, links: Array.from(new Set(incoming)) });
      return res.status(201).json(created);
    }

    const merged = Array.from(new Set([...(doc.links ?? []), ...incoming]));
    doc.links = merged;
    await doc.save();
    return res.json(doc);
  } catch (err) {
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

// Public endpoint so users can open the "Watch Live" modal.
router.get("/links/:matchId", async (req, res) => {
  try {
    const { matchId } = req.params;
    const doc = await MatchLinks.findOne({ matchId });
    return res.json({ matchId, links: doc?.links ?? [] });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch links" });
  }
});

router.delete("/links/:id", requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Frontend deletes by index as `${matchId}:${index}`.
    if (String(id).includes(":")) {
      const [matchId, indexStr] = String(id).split(":", 2);
      const index = Number.parseInt(indexStr ?? "", 10);
      if (!matchId || !Number.isFinite(index)) return res.status(400).json({ error: "Invalid id format" });

      const doc = await MatchLinks.findOne({ matchId });
      if (!doc) return res.status(404).json({ error: "Match links not found" });

      if (index < 0 || index >= (doc.links ?? []).length) return res.status(404).json({ error: "Link not found" });

      doc.links.splice(index, 1);
      if (doc.links.length === 0) {
        await MatchLinks.deleteOne({ _id: doc._id });
        return res.status(200).json({ ok: true });
      }

      await doc.save();
      return res.json(doc);
    }

    // Fallback: treat `id` as document id.
    const deleted = await MatchLinks.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Match links not found" });
    return res.json(deleted);
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete link" });
  }
});

export default router;

