import express from "express";
import https from "https";
import http from "http";
import fs from "fs";
import dotenv from "dotenv";
import cors from "cors";
import connect from "./db/db.js";
import authRoutes from "./routes/authRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { applySecurity } from "./utils/security.js";

dotenv.config();

const app = express();

// Limit JSON body
app.use(express.json({ limit: "200kb" }));
app.use(cors());

// Security middleware (helmet/hpp/ratelimit/xss/etc.)
applySecurity(app);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);

// Central error handler
app.use(function (err, _req, res, _next) {
  console.error(err);
  res.status(err.status || 500).json({ error: "Something went wrong." });
});

// ---- DB connect BEFORE starting server ----
await connect();

const PORT = Number(process.env.PORT || 5000);
const KEY_FILE = process.env.TLS_KEY_FILE;
const CERT_FILE = process.env.TLS_CERT_FILE;

if (KEY_FILE && CERT_FILE && fs.existsSync(KEY_FILE) && fs.existsSync(CERT_FILE)) {
  const httpsOptions = {
    key: fs.readFileSync(KEY_FILE),
    cert: fs.readFileSync(CERT_FILE),
    minVersion: "TLSv1.2",
  };
  https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`🔐 HTTPS server running on https://localhost:${PORT}`);
  });
}

export default app;
