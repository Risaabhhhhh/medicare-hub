const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  createDoctor,
  setDoctorPassword,
  loginAsDoctor
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

// ================= AUTH =================
router.post("/register", registerUser);
router.post("/login", loginUser);

// ================= HOSPITAL ACTIONS =================
router.post("/create-doctor", protect, createDoctor);
router.post("/set-password/:id", setDoctorPassword);
router.post("/login-as-doctor/:doctorId", protect, loginAsDoctor);

module.exports = router;
