require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const fs = require("fs");
const logger = require("./config/logger");

const productRoutes = require("./routes/products");
const uploadRoutes = require("./routes/upload");
const healthRoutes = require("./routes/health");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Create logs directory ─────────────────────────────────────
if (!fs.existsSync("logs")) fs.mkdirSync("logs");

// ─── Security Middleware ───────────────────────────────────────
app.use(helmet());

// ─── CORS ──────────────────────────────────────────────────────
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "http://localhost:80",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ─── Rate Limiting ─────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { error: "Too many requests, please try again later." },
});
app.use("/api", limiter);

// ─── Body Parsing ──────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Logging ───────────────────────────────────────────────────
app.use(
  morgan("combined", {
    stream: { write: (msg) => logger.info(msg.trim()) },
  })
);

// ─── Routes ────────────────────────────────────────────────────
app.use("/api/health", healthRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes);

// ─── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  logger.error("Unhandled error", { error: err.message, stack: err.stack });
  res.status(500).json({ error: "Internal server error" });
});

// ─── Start Server ─────────────────────────────────────────────
app.listen(PORT, "0.0.0.0", () => {
  logger.info(`🚀 PriceCompareHub API running on port ${PORT}`);
  logger.info(`   Environment: ${process.env.NODE_ENV || "development"}`);
  logger.info(`   DynamoDB Table: ${process.env.DYNAMODB_TABLE_NAME || "Products"}`);
});

module.exports = app;
