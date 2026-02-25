const Appointment = require("../models/Appointment");


// ================= PATIENT BOOK APPOINTMENT =================
exports.bookAppointment = async (req, res) => {
  try {

    const { doctor, date, time, hospitalId } = req.body;

    if (!doctor || !date || !time || !hospitalId) {
      return res.status(400).json({ message: "All fields required" });
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor,
      hospital: hospitalId,
      date,
      time,
      status: "pending"
    });

    res.status(201).json(appointment);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================= USER VIEW OWN APPOINTMENTS =================
exports.getUserAppointments = async (req, res) => {
  try {

    const appointments = await Appointment.find({
      patient: req.user._id
    })
      .populate("doctor", "username")
      .populate("hospital", "username")
      .sort({ date: 1, time: 1 });

    res.json(appointments);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================= DOCTOR / HOSPITAL VIEW APPOINTMENTS =================
exports.getDoctorAppointments = async (req, res) => {
  try {

    const { date } = req.query;

    let filter = {};

    // Doctor sees only his appointments
    if (req.user.role === "doctor") {
      filter.doctor = req.user._id;
    }

    // Hospital sees all under hospital
    else if (req.user.role === "hospital") {
      filter.hospital = req.user._id;
    }

    // Filter by selected date
    if (date) {
      filter.date = date;
    }

    const appointments = await Appointment.find(filter)
      .populate("patient", "username email")
      .populate("doctor", "username")
      .populate("hospital", "username")
      .sort({ doctor: 1, date: 1, time: 1 });

    res.json(appointments);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================= DOCTOR APPROVE =================
exports.approveAppointment = async (req, res) => {
  try {

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Count approved appointments for SAME doctor on SAME date
    const count = await Appointment.countDocuments({
      doctor: appointment.doctor,
      date: appointment.date,
      status: "approved"
    });

    const tokenNumber = `D-${count + 1}`;

    appointment.status = "approved";
    appointment.tokenNumber = tokenNumber;

    await appointment.save();

    res.json({
      message: "Appointment approved",
      tokenNumber
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================= UPLOAD REPORT =================
exports.uploadReport = async (req, res) => {
  try {

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.reportUrl = req.body.reportUrl;

    await appointment.save();

    res.json({ message: "Report uploaded" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= UPDATE STATUS (HOSPITAL) =================
exports.updateAppointmentStatus = async (req, res) => {
  try {

    const { status } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.status = status;
    await appointment.save();

    res.json({ message: "Status updated" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= HOSPITAL CREATE OFFLINE TOKEN =================
exports.createOfflineAppointment = async (req, res) => {
  try {

    const { doctor, date } = req.body;

    if (!doctor || !date) {
      return res.status(400).json({ message: "Doctor and date required" });
    }

    const count = await Appointment.countDocuments({
      doctor,
      date,
      status: "approved"
    });

    const tokenNumber = `D-${count + 1}`;

    const appointment = await Appointment.create({
      patient: null,
      doctor,
      hospital: req.user._id,
      date,
      time: "Walk-in",
      status: "approved",
      tokenNumber
    });

    res.status(201).json(appointment);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= GET TODAY QUEUE =================
exports.getTodayQueue = async (req, res) => {
  try {

    const { doctorId, date } = req.query;

    const appointments = await Appointment.find({
      doctor: doctorId,
      date,
      status: { $in: ["approved", "in-progress"] }
    })
      .sort({ time: 1 });

    res.json(appointments);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

