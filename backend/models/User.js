const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ================= SCHEMA =================
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email"],
      index: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // hide password
    },

    // HEALTH PROFILE
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      default: null,
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    medicalHistory: {
      type: String,
      default: "",
    },

    // ROLE
    role: {
      type: String,
      enum: ["user", "doctor", "hospital"],
      default: "user",
      index: true,
    },

    // RELATION
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  }
);

// HASH PASSWORD
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

// COMPARE PASSWORD
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// INDEXES
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ hospitalId: 1 });

module.exports =
  mongoose.models.User || mongoose.model("User", userSchema);