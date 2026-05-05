const axios    = require("axios");
const FormData = require("form-data");

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8001";

/* ── POST /api/ai/symptoms ─────────────────────────────── */
const analyzeSymptoms = async (req, res) => {
  try {
    const { text } = req.body;

    console.log("[AI/symptoms] incoming text:", text);

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Symptom text is required" });
    }

    const response = await axios.post(
      `${FASTAPI_URL}/symptoms`,
      { text },
      { timeout: 30000 }
    );

    console.log("[AI/symptoms] FastAPI response:", response.data);
    return res.json(response.data);

  } catch (err) {
    console.error("[AI/symptoms] ERROR:", err?.response?.data || err.message);

    // Forward FastAPI error if available, otherwise generic 500
    if (err?.response?.data) {
      return res.status(err.response.status || 500).json(err.response.data);
    }
    return res.status(500).json({ message: "AI symptoms service failed", error: err.message });
  }
};

/* ── POST /api/ai/image ────────────────────────────────── */
const analyzeImage = async (req, res) => {
  try {
    console.log("[AI/image] req.file:", req.file);   // ← KEY DEBUG LINE

    if (!req.file) {
      return res.status(400).json({ message: "No image file received. Ensure the field name is 'file'." });
    }

    // Build a multipart form to forward to FastAPI
    const form = new FormData();
    form.append("file", req.file.buffer, {
      filename:    req.file.originalname || "upload.jpg",
      contentType: req.file.mimetype,
    });

    console.log("[AI/image] forwarding to FastAPI, size:", req.file.size, "bytes");

    const response = await axios.post(
      `${FASTAPI_URL}/image`,
      form,
      {
        headers:  form.getHeaders(),
        timeout:  60000,                              // image analysis can be slow
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      }
    );

    console.log("[AI/image] FastAPI response:", response.data);
    return res.json(response.data);

  } catch (err) {
    console.error("[AI/image] ERROR:", err?.response?.data || err.message);

    if (err?.response?.data) {
      return res.status(err.response.status || 500).json(err.response.data);
    }
    return res.status(500).json({ message: "AI image service failed", error: err.message });
  }
};

module.exports = { analyzeSymptoms, analyzeImage };