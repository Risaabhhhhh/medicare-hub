const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const {
  createDoctor,
  getHospitalDoctors,
  loginAsDoctor,
  deleteDoctor,
} = require("../controllers/hospitalController");

// ================= HOSPITAL =================

// Create doctor
router.post(
  "/create-doctor",
  protect,
  authorizeRoles("hospital"),
  createDoctor
);

// Get all doctors of hospital
router.get(
  "/doctors",
  protect,
  authorizeRoles("hospital"),
  getHospitalDoctors
);

// Login as doctor
router.post(
  "/login-doctor/:doctorId",
  protect,
  authorizeRoles("hospital"),
  loginAsDoctor
);

// Delete doctor
router.delete(
  "/doctor/:doctorId",
  protect,
  authorizeRoles("hospital"),
  deleteDoctor
);

module.exports = router;