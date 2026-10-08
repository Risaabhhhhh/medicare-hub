const express = require("express");
const router = express.Router();
const Prescription = require("../models/Prescription");
const protect = require("../middleware/authMiddleware");

// ✅ GET all prescriptions
router.get("/", protect, async (req, res) => {
  try {
    const prescriptions = await Prescription.find({
      user: req.user._id || req.user.id,
    }).sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ ADD prescription
router.post("/", protect, async (req, res) => {
  try {
    const prescription = new Prescription({
      user: req.user._id || req.user.id,
      ...req.body,
      isManual: true,
    });

    const saved = await prescription.save();

    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ DELETE prescription
router.delete("/:id", protect, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }
    if (String(prescription.user) !== String(req.user._id) && String(prescription.user) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not authorized to delete this prescription" });
    }
    await Prescription.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;