const Appointment = require("../models/Appointment");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

// ================= BOOK APPOINTMENT =================
exports.bookAppointment = asyncHandler(async (req, res) => {
  const { doctor, date, time, hospital } = req.body;

  // DEBUG (keep this for now)
  console.log("BODY RECEIVED:", req.body);

  if (!doctor || !date || !time || !hospital) {
    throw new ApiError("All fields required", 400);
  }

  const appointment = await Appointment.create({
    patient: req.user.id,
    doctor,
    hospital, // ✅ correct
    date,
    time,
    status: "pending",
  });

  res.status(201).json({
    success: true,
    data: appointment,
  });
});
// ================= USER APPOINTMENTS (PAGINATED) =================
exports.getUserAppointments = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const skip = (page - 1) * limit;

  const appointments = await Appointment.find({
    patient: req.user.id,
  })
    .populate("doctor", "username")
    .populate("hospital", "username")
    .sort({ date: 1, time: 1 })
    .skip(skip)
    .limit(limit)
    .lean();

  res.json({
    success: true,
    page,
    results: appointments.length,
    data: appointments,
  });
});

// ================= DOCTOR / HOSPITAL VIEW =================
exports.getDoctorAppointments = asyncHandler(async (req, res) => {
  const { date, page = 1, limit = 10 } = req.query;

  let filter = {};

  if (req.user.role === "doctor") {
    filter.doctor = req.user.id;
  } else if (req.user.role === "hospital") {
    filter.hospital = req.user.id;
  } else {
    throw new ApiError("Unauthorized role", 403);
  }

  if (date) filter.date = date;

  const skip = (page - 1) * limit;

  const appointments = await Appointment.find(filter)
    .populate("patient", "username email")
    .populate("doctor", "username")
    .populate("hospital", "username")
    .sort({ date: 1, time: 1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  res.json({
    success: true,
    data: appointments,
  });
});

// ================= APPROVE =================
exports.approveAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    throw new ApiError("Appointment not found", 404);
  }

  // 🔐 SECURITY CHECK
  if (req.user.role === "doctor" && appointment.doctor.toString() !== req.user.id) {
    throw new ApiError("Not authorized", 403);
  }

  if (req.user.role === "hospital" && appointment.hospital.toString() !== req.user.id) {
    throw new ApiError("Not authorized", 403);
  }

  // ⚠️ still basic (can upgrade with transactions later)
  const count = await Appointment.countDocuments({
    doctor: appointment.doctor,
    date: appointment.date,
    status: "approved",
  });

  appointment.status = "approved";
  appointment.tokenNumber = `D-${count + 1}`;

  await appointment.save();

  res.json({
    success: true,
    tokenNumber: appointment.tokenNumber,
  });
});

// ================= UPLOAD REPORT =================
exports.uploadReport = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    throw new ApiError("Appointment not found", 404);
  }

  appointment.reportUrl = req.body.reportUrl;

  await appointment.save();

  res.json({
    success: true,
    message: "Report uploaded",
  });
});

// ================= UPDATE STATUS =================
exports.updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    throw new ApiError("Appointment not found", 404);
  }

  appointment.status = status;
  await appointment.save();

  res.json({
    success: true,
    message: "Status updated",
  });
});

// ================= OFFLINE APPOINTMENT =================
exports.createOfflineAppointment = asyncHandler(async (req, res) => {
  const { doctor, date } = req.body;

  if (!doctor || !date) {
    throw new ApiError("Doctor and date required", 400);
  }

  const count = await Appointment.countDocuments({
    doctor,
    date,
    status: "approved",
  });

  const appointment = await Appointment.create({
    patient: null,
    doctor,
    hospital: req.user.id,
    date,
    time: "Walk-in",
    status: "approved",
    tokenNumber: `D-${count + 1}`,
  });

  res.status(201).json({
    success: true,
    data: appointment,
  });
});

// ================= TODAY QUEUE =================
exports.getTodayQueue = asyncHandler(async (req, res) => {
  const { doctorId, date } = req.query;

  const appointments = await Appointment.find({
    doctor: doctorId,
    date,
    status: { $in: ["approved", "in-progress"] },
  })
    .sort({ time: 1 })
    .lean();

  res.json({
    success: true,
    data: appointments,
  });
});