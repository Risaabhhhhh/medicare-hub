const User = require("../models/User");


// ================= GET PROFILE =================
exports.getProfile = async (req, res) => {
  res.json(req.user);
};


// ================= UPDATE PROFILE =================
exports.updateProfile = async (req, res) => {
  try {

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.username = req.body.username || user.username;
    user.bloodGroup = req.body.bloodGroup || user.bloodGroup;
    user.address = req.body.address || user.address;
    user.medicalHistory = req.body.medicalHistory || user.medicalHistory;

    await user.save();

    return res.json({ message: "Profile updated successfully" });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


// ================= GET ALL DOCTORS =================
exports.getDoctors = async (req, res) => {
  try {

    const doctors = await User.find({ role: "doctor" })
      .select("username");

    return res.json(doctors);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


// ================= GET DOCTORS OF A HOSPITAL (BY ID) =================
exports.getDoctorsByHospital = async (req, res) => {

  const doctors = await User.find({
    role: "doctor",
    hospitalId: req.params.hospitalId
  }).select("username");

  return res.json(doctors);
};


// ================= GET DOCTORS OF A HOSPITAL (BY NAME) =================
exports.getDoctorsByHospitalName = async (req, res) => {
  try {

    const hospital = await User.findOne({
      username: req.params.name,
      role: "hospital"
    });

    if (!hospital) {
      return res.json([]);
    }

    const doctors = await User.find({
      role: "doctor",
      hospitalId: hospital._id
    }).select("username");

    return res.json(doctors);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


// ================= GET HOSPITAL BY NAME =================
exports.getHospitalByName = async (req, res) => {
  try {

    const hospital = await User.findOne({
      username: req.params.name,
      role: "hospital"
    });

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    return res.json(hospital);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
