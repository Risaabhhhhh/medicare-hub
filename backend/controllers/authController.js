const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// ================= REGISTER =================
exports.registerUser = async (req, res) => {
  try {

    console.log("BODY RECEIVED:", req.body);

    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || "user"
    });

    // 🔥 IMPORTANT FIX
    return res.status(201).json({
      message: "User registered successfully"
    });

  } catch (error) {

    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};



// ================= LOGIN =================
exports.loginUser = async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

res.json({
  token,
  user: {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role     // ✅ ADD THIS
  }
});


  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================= HOSPITAL CREATE DOCTOR =================
exports.createDoctor = async (req, res) => {
  try {
    const { username, email, specialization } = req.body;

    const tempPassword = crypto.randomBytes(8).toString("hex");
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const doctorUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: "doctor",
      hospitalId: req.user._id   // ✅ VERY IMPORTANT
    });

    await DoctorProfile.create({
      userId: doctorUser._id,
      hospitalName: req.user.username,
      specialization
    });

    res.status(201).json({
      message: "Doctor created",
      resetPassword: `/set-password/${doctorUser._id}`
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ================= SET DOCTOR PASSWORD =================
exports.setDoctorPassword = async (req, res) => {
  try {

    const { password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    await User.findByIdAndUpdate(req.params.id, {
      password: hashed
    });

    res.json({ message: "Password set successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================= LOGIN AS DOCTOR (HOSPITAL) =================
exports.loginAsDoctor = async (req, res) => {

  const doctor = await User.findById(req.params.doctorId);

  if (!doctor || doctor.role !== "doctor") {
    return res.status(404).json({ message: "Doctor not found" });
  }

  const token = jwt.sign(
    { id: doctor._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token });

};
