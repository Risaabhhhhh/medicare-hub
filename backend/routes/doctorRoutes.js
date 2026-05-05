const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

router.get("/dashboard", protect, authorizeRoles("doctor"), (req, res) => {
  res.json({ message: "Welcome Doctor Dashboard" });
});

module.exports = router;
