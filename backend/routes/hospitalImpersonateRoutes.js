const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleMiddleware");

const {
  loginAsDoctor
} = require("../controllers/authController");

router.post("/login-as-doctor/:doctorId", protect, loginAsDoctor);

router.post(
  "/login-as-doctor/:doctorId",
  protect,
  roleCheck("hospital"),
  loginAsDoctor
);

module.exports = router;
