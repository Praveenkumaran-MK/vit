const express = require("express");
const router = express.Router();

// GET all notifications
router.get("/all", (req, res) => {
  const userId = req.query.id;
  if (!userId) return res.status(400).json({ message: "User ID required" });

  // Not implemented yet → send empty list
  res.json({ data: [] });
});

// ADD notification
router.post("/add", (req, res) => {
  const { userId, message } = req.body;
  if (!userId || !message) {
    return res.status(400).json({ message: "Missing fields" });
  }

  res.json({ success: true });
});

// CLEAR all notifications
router.delete("/clearAll", (req, res) => {
  res.json({ success: true });
});

// DELETE one notification
router.delete("/delete", (req, res) => {
  res.json({ success: true });
});

module.exports = router;
