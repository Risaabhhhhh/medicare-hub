const express  = require("express");
const multer   = require("multer");
const { analyzeSymptoms, analyzeImage } = require("../controllers/aiController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Store uploads in memory (no disk write needed — we forward bytes to FastAPI)
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 },          // 10 MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"), false);
  },
});

router.post("/symptoms", authMiddleware, analyzeSymptoms);
router.post("/image",    authMiddleware, upload.single("file"), analyzeImage);

module.exports = router;