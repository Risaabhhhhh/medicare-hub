const User = require("../models/User");
const bcrypt = require("bcryptjs");

// ================= HOSPITAL CREATE DOCTOR =================
exports.createDoctor = async (req, res) => {
  try {

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Doctor already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const doctor = await User.create({
      username,
      email,
      password: hashedPassword,
      role: "doctor",
      hospitalId: req.user._id   // 🔥 connects doctor to hospital
    });

    res.status(201).json({
      message: "Doctor created successfully",
      doctor
    });

  } catch (error) {
    console.error("CREATE DOCTOR ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};
