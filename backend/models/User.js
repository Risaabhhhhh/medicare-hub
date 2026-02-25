const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    password: {
      type: String,
      required: true
    },

    // ================= HEALTH PROFILE =================
    bloodGroup: {
      type: String,
      default: ""
    },

    address: {
      type: String,
      default: ""
    },

    medicalHistory: {
      type: String,
      default: ""
    },

    // ================= ROLE =================
    role: {
      type: String,
      enum: ["user", "doctor", "hospital"],
      default: "user"
    },

    // ================= DOCTOR -> HOSPITAL LINK =================
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }

  },
  { timestamps: true }
);

module.exports =
  mongoose.models.User || mongoose.model("User", userSchema);
