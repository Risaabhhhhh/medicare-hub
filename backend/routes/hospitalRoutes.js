const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleMiddleware");

// ✅ CORRECT CONTROLLER FILE
const { createDoctor } = require("../controllers/hospitalController");

// Hospital creates doctor
router.post(
  "/create-doctor",
  protect,
  roleCheck("hospital"),
  createDoctor
);

module.exports = router;
