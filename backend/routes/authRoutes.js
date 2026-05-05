const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  createDoctor,
  setDoctorPassword,
  loginAsDoctor,
  getMe // ✅ ADD
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");
const {
  authorizeRoles,
} = require("../middleware/roleMiddleware");

// ================= PUBLIC ROUTES =================

// Register user
router.post("/register", registerUser);

// Login user
router.post("/login", loginUser);

// ================= GET CURRENT USER =================
router.get("/me", protect, getMe); // ✅ ADD

// ================= DOCTOR PASSWORD SET =================
router.post("/set-password/:id", setDoctorPassword);

// ================= HOSPITAL ROUTES =================

// Create doctor (ONLY hospital)
router.post(
  "/create-doctor",
  protect,
  authorizeRoles("hospital"),
  createDoctor
);

// Login as doctor (hospital impersonation)
router.post(
  "/login-doctor/:doctorId",
  protect,
  authorizeRoles("hospital"),
  loginAsDoctor
);

module.exports = router;