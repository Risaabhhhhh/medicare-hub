const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  getProfile,
  updateProfile,
  getDoctors,
  getDoctorsByHospital,
  getDoctorsByHospitalName,
  getHospitalByName,
} = require("../controllers/userController");

// ── PROFILE ──────────────────────────────────────────────
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

// ── DOCTORS ──────────────────────────────────────────────
// ⚠️  ORDER MATTERS: specific static segments MUST come before param segments.
// "/doctors/hospital/:name" must be above "/doctors/:hospitalId" or Express
// will match "hospital" as the :hospitalId value and never reach the name route.
router.get("/doctors/hospital/:name", protect, getDoctorsByHospitalName);
router.get("/doctors/:hospitalId",    protect, getDoctorsByHospital);
router.get("/doctors",                protect, getDoctors);

// ── HOSPITAL ─────────────────────────────────────────────
router.get("/hospital/by-name/:name", protect, getHospitalByName);

module.exports = router;