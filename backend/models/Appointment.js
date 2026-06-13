const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // ✅ allow walk-in patients
      index: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ✅ USE REAL DATE TYPE
    date: {
      type: Date,
      required: true,
      index: true,
    },

    time: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "in-progress", "done"],
      default: "pending",
      index: true,
    },

    tokenNumber: {
      type: String,
      default: null,
    },

    reportUrl: {
      type: String,
      default: "",
      match: [/^https?:\/\/.+/, "Invalid URL"],
    },
  },
  { timestamps: true }
);


// ================= INDEXES =================

// Fast queries: doctor + date
appointmentSchema.index({ doctor: 1, date: 1 });

// Fast hospital queries
appointmentSchema.index({ hospital: 1, date: 1 });

// Patient history
appointmentSchema.index({ patient: 1 });

// Prevent duplicate tokens per doctor per day
appointmentSchema.index(
  { doctor: 1, date: 1, tokenNumber: 1 },
  { unique: true, sparse: true }
);


module.exports = mongoose.model("Appointment", appointmentSchema);