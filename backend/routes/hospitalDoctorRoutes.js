const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const { createDoctor } = require("../controllers/hospitalController");

router.post("/create-doctor", protect, authorizeRoles("hospital"), createDoctor);

module.exports = router;
