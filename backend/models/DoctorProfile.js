const mongoose = require("mongoose");

const doctorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // ✅ one profile per doctor
      index: true,
    },

    specialization: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },

    experience: {
      type: Number, // years
      min: 0,
      default: 0,
    },

    qualifications: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);


// ================= INDEXES =================
doctorProfileSchema.index({ userId: 1 });

module.exports = mongoose.model("DoctorProfile", doctorProfileSchema);