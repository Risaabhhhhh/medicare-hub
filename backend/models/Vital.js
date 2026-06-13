const mongoose = require("mongoose");

const vitalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  bp: String,
  pulse: String,
  sugar: String,
  temp: String,
  spo2: String,
  weight: String,
  note: String,
}, { timestamps: true });

module.exports = mongoose.model("Vital", vitalSchema);