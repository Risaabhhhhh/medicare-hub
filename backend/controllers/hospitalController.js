const User = require("../models/User");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");


// ================= CREATE DOCTOR =================
exports.createDoctor = asyncHandler(async (req, res) => {
  if (req.user.role !== "hospital") {
    throw new ApiError("Only hospitals can create doctors", 403);
  }

  const { username, email } = req.body;

  if (!username || !email) {
    throw new ApiError("Username and email required", 400);
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError("Invalid email format", 400);
  }

  const exists = await User.findOne({ email });
  if (exists) {
    throw new ApiError("Doctor already exists", 400);
  }

  // 🔐 temp password
  const tempPassword = crypto.randomBytes(8).toString("hex");

  const doctor = await User.create({
    username,
    email,
    password: tempPassword,
    role: "doctor",
    hospitalId: req.user.id,
  });

  res.status(201).json({
    success: true,
    message: "Doctor created successfully",
    tempPassword,
    doctor: {
      _id: doctor._id, // 🔥 IMPORTANT FIX
      username: doctor.username,
      email: doctor.email,
      role: doctor.role,
    },
  });
});


// ================= GET ALL DOCTORS (FOR HOSPITAL) =================
exports.getHospitalDoctors = asyncHandler(async (req, res) => {
  if (req.user.role !== "hospital") {
    throw new ApiError("Only hospitals can view doctors", 403);
  }

  const doctors = await User.find({
    hospitalId: req.user.id,
    role: "doctor",
  }).select("-password");

  res.json({
    success: true,
    count: doctors.length,
    doctors,
  });
});


// ================= LOGIN AS DOCTOR =================
exports.loginAsDoctor = asyncHandler(async (req, res) => {
  if (req.user.role !== "hospital") {
    throw new ApiError("Only hospital can login as doctor", 403);
  }

  const { doctorId } = req.params;

  if (!doctorId) {
    throw new ApiError("Doctor ID required", 400);
  }

  const doctor = await User.findById(doctorId);

  if (!doctor || doctor.role !== "doctor") {
    throw new ApiError("Doctor not found", 404);
  }

  if (doctor.hospitalId.toString() !== req.user.id) {
    throw new ApiError("Unauthorized access to doctor", 403);
  }

  const token = jwt.sign(
    { id: doctor._id, role: "doctor" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    success: true,
    message: "Logged in as doctor",
    token,
    doctor: {
      _id: doctor._id,
      username: doctor.username,
      email: doctor.email,
      role: doctor.role,
    },
  });
});


// ================= DELETE DOCTOR =================
exports.deleteDoctor = asyncHandler(async (req, res) => {
  if (req.user.role !== "hospital") {
    throw new ApiError("Only hospital can delete doctors", 403);
  }

  const { doctorId } = req.params;

  const doctor = await User.findById(doctorId);

  if (!doctor || doctor.role !== "doctor") {
    throw new ApiError("Doctor not found", 404);
  }

  if (doctor.hospitalId.toString() !== req.user.id) {
    throw new ApiError("Unauthorized", 403);
  }

  await doctor.deleteOne();

  res.json({
    success: true,
    message: "Doctor removed successfully",
  });
});