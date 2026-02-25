const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleMiddleware");

router.get("/dashboard", protect, roleCheck("doctor"), (req, res) => {
  res.json({ message: "Welcome Doctor Dashboard" });
});

module.exports = router;
