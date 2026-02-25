const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // ✅ NEW
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    date: String,
    time: String,

status: {
  type: String,
  enum: ["pending", "approved", "in-progress", "done"],
  default: "pending"
},

    tokenNumber: {
      type: String,
      default: null
    },

    reportUrl: {
  type: String,
  default: ""
}
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
