const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const vitalRoutes = require("./routes/vitalRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");
const aiRoutes = require("./routes/aiRoutes");

const errorMiddleware = require("./middleware/errorMiddleware");

dotenv.config();

const app = express();

// ================= SECURITY =================
app.use(helmet());

// ================= CORS (🔥 FIXED) =================
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ================= BODY PARSING =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= RATE LIMIT =================
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests, try again later",
  })
);

// ================= ROUTES =================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/appointments", require("./routes/appointmentRoutes"));
app.use("/api/hospital", require("./routes/hospitalRoutes"));
app.use("/api/hospital-impersonate", require("./routes/hospitalImpersonateRoutes"));
app.use("/api/vitals", require("./routes/vitalRoutes"));
app.use("/api/prescriptions", require("./routes/prescriptionRoutes"));
app.use("/api/vitals", vitalRoutes);
app.use("/api/prescriptions", prescriptionRoutes); 
app.use("/api/ai", aiRoutes); 


// ================= ROOT =================
app.get("/", (req, res) => {
  res.send("Medicare Hub API Running");
});

// ================= ERROR HANDLER =================
app.use(errorMiddleware);

module.exports = app;