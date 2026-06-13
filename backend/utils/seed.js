/**
 * Seed script — run once: node utils/seed.js
 * Creates: 2 hospitals, 4 doctors, 2 patients
 */
require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const User     = require("../models/User");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/medicarehub";

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  /* wipe existing seeded users */
  await User.deleteMany({ email: { $regex: /@seed\.mh$/ } });

  const salt = await bcrypt.genSalt(10);
  const hash = (pw) => bcrypt.hash(pw, salt);

  /* Hospitals */
  const h1 = await User.create({
    username: "Apollo Hospital Mumbai",
    email:    "apollo@seed.mh",
    password: await hash("hospital123"),
    role:     "hospital",
    address:  "Navi Mumbai, Maharashtra",
    location: { lat: 19.076, lng: 72.877 },
  });

  const h2 = await User.create({
    username: "Lilavati Hospital",
    email:    "lilavati@seed.mh",
    password: await hash("hospital123"),
    role:     "hospital",
    address:  "Bandra West, Mumbai",
    location: { lat: 19.056, lng: 72.825 },
  });

  /* Doctors */
  await User.create([
    {
      username:       "Dr. Arjun Sharma",
      email:          "sharma@seed.mh",
      password:       await hash("doctor123"),
      role:           "doctor",
      specialization: "Cardiology",
      hospital:       h1._id,
    },
    {
      username:       "Dr. Priya Nair",
      email:          "nair@seed.mh",
      password:       await hash("doctor123"),
      role:           "doctor",
      specialization: "General Medicine",
      hospital:       h1._id,
    },
    {
      username:       "Dr. Rahul Mehta",
      email:          "mehta@seed.mh",
      password:       await hash("doctor123"),
      role:           "doctor",
      specialization: "Orthopedics",
      hospital:       h2._id,
    },
    {
      username:       "Dr. Sneha Kulkarni",
      email:          "kulkarni@seed.mh",
      password:       await hash("doctor123"),
      role:           "doctor",
      specialization: "Dermatology",
      hospital:       h2._id,
    },
  ]);

  /* Patients */
  await User.create([
    {
      username:   "Rishabh",
      email:      "rishabh@seed.mh",
      password:   await hash("patient123"),
      role:       "patient",
      phone:      "9876543210",
      bloodGroup: "B+",
    },
    {
      username: "Test Patient",
      email:    "patient@seed.mh",
      password: await hash("patient123"),
      role:     "patient",
    },
  ]);

  console.log("✅ Seed complete!");
  console.log("\nTest credentials:");
  console.log("  Patient:  rishabh@seed.mh  / patient123");
  console.log("  Doctor:   sharma@seed.mh   / doctor123");
  console.log("  Hospital: apollo@seed.mh   / hospital123");

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
