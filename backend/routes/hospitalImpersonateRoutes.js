const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const {
  loginAsDoctor
} = require("../controllers/authController");

router.post("/login-doctor/:doctorId", protect, loginAsDoctor);

router.post(
  "/login-as-doctor/:doctorId",
  protect,
  authorizeRoles("hospital"),
  loginAsDoctor
);

module.exports = router;
