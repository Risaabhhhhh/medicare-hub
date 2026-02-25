const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleMiddleware");

const { createDoctor } = require("../controllers/hospitalController");

router.post("/create-doctor", protect, roleCheck("hospital"), createDoctor);

module.exports = router;
