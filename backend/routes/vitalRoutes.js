const express = require("express");
const router = express.Router();
const Vital = require("../models/Vital");
const protect = require("../middleware/authMiddleware");

// ✅ GET all vitals
router.get("/", protect, async (req, res) => {
  try {
    const vitals = await Vital.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(vitals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ ADD vital
router.post("/", protect, async (req, res) => {
  try {
    const vital = new Vital({
      user: req.user._id,
      ...req.body,
    });

    const saved = await vital.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ DELETE vital
router.delete("/:id", protect, async (req, res) => {
  try {
    const vital = await Vital.findById(req.params.id);
    if (!vital) {
      return res.status(404).json({ message: "Vital not found" });
    }
    if (String(vital.user) !== String(req.user._id) && String(vital.user) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not authorized to delete this vital" });
    }
    await Vital.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;