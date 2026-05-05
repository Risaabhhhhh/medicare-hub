const User = require("../models/User");
const DoctorProfile = require("../models/DoctorProfile");
const crypto = require("crypto");

const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const generateToken = require("../utils/generateToken");


// ================= REGISTER =================
exports.registerUser = asyncHandler(async (req, res) => {
  console.log("REGISTER BODY:", req.body);
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    throw new ApiError("All fields are required", 400);
  }

  if (password.length < 6) {
    throw new ApiError("Password must be at least 6 characters", 400);
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError("User already exists", 400);
  }

  const user = await User.create({
    username,
    email,
    password,
    role: "user",
  });

  const token = generateToken(user);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
  });
});


// ================= LOGIN =================
exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError("Email and password required", 400);
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError("Invalid credentials", 401);
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new ApiError("Invalid credentials", 401);
  }

  const token = generateToken(user);

  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
});


// ================= CREATE DOCTOR =================
exports.createDoctor = asyncHandler(async (req, res) => {
  const { username, email, specialization } = req.body;

  if (!username || !email || !specialization) {
    throw new ApiError("All fields are required", 400);
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError("Doctor already exists", 400);
  }

  const tempPassword = crypto.randomBytes(8).toString("hex");

  const doctorUser = await User.create({
    username,
    email,
    password: tempPassword,
    role: "doctor",
    hospitalId: req.user.id,
  });

  await DoctorProfile.create({
    userId: doctorUser._id,
    specialization,
  });

  res.status(201).json({
    success: true,
    message: "Doctor created",
    tempPassword, // ⚠️ send via email in real app
  });
});


// ================= GET ME =================
// FIX 1: Removed duplicate getMe — second definition was silently overwriting the first.
// FIX 2: Return req.user directly (no { success, data } wrapper) so frontend
//         can do `setProfile(pRes.data)` and get username/role/etc. directly.
exports.getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});


// ================= SET DOCTOR PASSWORD =================
exports.setDoctorPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password || password.length < 6) {
    throw new ApiError("Password must be at least 6 characters", 400);
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  user.password = password;
  await user.save();

  res.json({
    success: true,
    message: "Password set successfully",
  });
});


// ================= LOGIN AS DOCTOR =================
// FIX 3: Guard so only a hospital account can impersonate a doctor.
//         Without this, any role (including the doctor themselves) could
//         call this endpoint and overwrite their own token, causing the
//         dashboard to flip and the doctors list to vanish.
exports.loginAsDoctor = asyncHandler(async (req, res) => {
  if (req.user.role !== "hospital") {
    throw new ApiError("Only hospital accounts can impersonate a doctor", 403);
  }

  const doctor = await User.findById(req.params.doctorId);

  if (!doctor || doctor.role !== "doctor") {
    throw new ApiError("Doctor not found", 404);
  }

  // Confirm the doctor belongs to this hospital
  if (String(doctor.hospitalId) !== String(req.user._id || req.user.id)) {
    throw new ApiError("This doctor does not belong to your hospital", 403);
  }

  const token = generateToken(doctor);

  res.json({
    success: true,
    token,
    user: {
      id: doctor._id,
      username: doctor.username,
      email: doctor.email,
      role: doctor.role,
    },
  });
});