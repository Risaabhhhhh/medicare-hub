const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  getProfile,
  updateProfile,
  getDoctors,
  getDoctorsByHospital,
  getDoctorsByHospitalName,
  getHospitalByName
} = require("../controllers/userController");

// ================= PROFILE =================
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

// ================= DOCTORS =================
router.get("/doctors", protect, getDoctors);
router.get("/doctors/:hospitalId", protect, getDoctorsByHospital);
router.get("/doctors/hospital/:name", protect, getDoctorsByHospitalName);

// ================= HOSPITAL =================
router.get("/hospital/by-name/:name", protect, getHospitalByName);

module.exports = router;
