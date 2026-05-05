const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const {
  authorizeRoles,
  authorizePermissions,
} = require("../middleware/roleMiddleware");

const {
  bookAppointment,
  getDoctorAppointments,
  approveAppointment,
  getUserAppointments,
  uploadReport,
  updateAppointmentStatus,
  createOfflineAppointment,
  getTodayQueue,
} = require("../controllers/appointmentController");


// ================= PATIENT =================

// Book appointment
router.post(
  "/",
  protect,
  authorizeRoles("user"),
  bookAppointment
);

// View own appointments
router.get(
  "/user",
  protect,
  authorizeRoles("user"),
  getUserAppointments
);


// ================= COMMON =================

// Get today's queue
router.get(
  "/queue/today",
  protect,
  getTodayQueue
);


// ================= DOCTOR / HOSPITAL =================

// View appointments
router.get(
  "/doctor",
  protect,
  authorizeRoles("doctor", "hospital"),
  getDoctorAppointments
);

// Approve appointment
router.put(
  "/approve/:id",
  protect,
  authorizeRoles("doctor", "hospital"),
  approveAppointment
);

// Update status (hospital only)
router.put(
  "/status/:id",
  protect,
  authorizeRoles("hospital"),
  updateAppointmentStatus
);

// Create offline appointment (hospital only)
router.post(
  "/offline",
  protect,
  authorizeRoles("hospital"),
  createOfflineAppointment
);

// Upload report (doctor only)
router.put(
  "/upload-report/:id",
  protect,
  authorizeRoles("doctor"),
  uploadReport
);


module.exports = router;