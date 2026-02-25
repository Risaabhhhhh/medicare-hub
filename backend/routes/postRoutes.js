const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  createPost,
  getPosts
} = require("../controllers/postController");

router.post("/", protect, createPost);
router.get("/", protect, getPosts);

module.exports = router;
