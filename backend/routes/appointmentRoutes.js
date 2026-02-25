const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleMiddleware");
const { uploadReport } = require("../controllers/appointmentController");
const { updateAppointmentStatus } = require("../controllers/appointmentController");
const { createOfflineAppointment } = require("../controllers/appointmentController");
const { getTodayQueue } = require("../controllers/appointmentController");




const {
  bookAppointment,
  getDoctorAppointments,
  approveAppointment,
  getUserAppointments
} = require("../controllers/appointmentController");

// Patient books
router.post("/", protect, roleCheck("user"), bookAppointment);

// User views own
router.get("/user", protect, roleCheck("user"), getUserAppointments);

router.get("/queue/today", protect, getTodayQueue);

// Doctor or Hospital views
router.get("/doctor", protect, getDoctorAppointments);

// Doctor approves
router.put(
  "/approve/:id",
  protect,
  roleCheck("doctor", "hospital"),
  approveAppointment
);

router.put(
  "/status/:id",
  protect,
  roleCheck("hospital"),
  updateAppointmentStatus
);

router.post(
  "/offline",
  protect,
  roleCheck("hospital"),
  createOfflineAppointment
);


router.put(
  "/upload-report/:id",
  protect,
  roleCheck("doctor"),
  uploadReport
);



module.exports = router;
