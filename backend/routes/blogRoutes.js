import express from "express";
import { Contact } from "../models/Contact.js";
import { fetchIplNews } from "../services/blogService.js";
import { sendContactEmails } from "../services/emailService.js";

const router = express.Router();

// 🧪 Test Route to verify deployment
router.get("/test-blogs", (req, res) => {
  res.json({ ok: true, message: "Blogs route is accessible", timestamp: new Date().toISOString() });
});

router.post("/test-contact", (req, res) => {
  console.log("📥 Received POST /test-contact:", req.body);
  res.json({ ok: true, message: "Test contact route is working", received: req.body });
});

// 📰 Fetch Live IPL News from official source
router.get("/blogs", async (req, res) => {
  try {
    const blogs = await fetchIplNews();
    res.json(blogs);
  } catch (err) {
    console.error("❌ Blogs route error:", err.message);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

// 📧 Contact Submissions (Real Execution)
router.get("/contact", (req, res) => {
  res.json({ ok: true, message: "Contact GET route is active. Use POST to submit data." });
});

router.post("/contact", async (req, res) => {
  console.log("📥 Received POST /contact request:", req.body);
  try {
    const { name, email, subject, message } = req.body;

    // 1. Validation
    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      console.warn("⚠️ Validation failed: Missing fields");
      return res.status(400).json({ success: false, error: "All fields are required" });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      console.warn("⚠️ Validation failed: Invalid email", email);
      return res.status(400).json({ success: false, error: "Invalid email format" });
    }

    // 2. Store in MongoDB
    let saved = false;
    try {
      await Contact.create({ 
        name: name.trim(), 
        email: email.trim(), 
        subject: subject.trim(),
        message: message.trim(),
        status: "pending"
      });
      saved = true;
      console.log(`✅ MongoDB: Message from ${name} saved.`);
    } catch (err) {
      console.error("❌ MongoDB Error:", err.message);
      return res.status(500).json({ success: false, error: "Database error: Could not save message" });
    }

    // 3. Send Emails
    console.log("📨 Executing email delivery tasks...");
    const emailStatus = await sendContactEmails({ name, email, subject, message });

    if (!emailStatus.supportEmailSent) {
      console.error("❌ Support Email Error:", emailStatus.error);
      return res.status(502).json({ 
        success: false,
        error: `Email delivery failed: ${emailStatus.error || "Unknown error"}`
      });
    }

    // 4. Final Success Response
    console.log("✨ Contact flow completed successfully.");
    res.status(201).json({ 
      success: true,
      message: "Message delivered successfully!"
    });
  } catch (err) {
    console.error("❌ Unexpected Controller Error:", err.message);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
