import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

import authRouter from "./Routes/authRoute.js";
import userRouter from "./Routes/userRoute.js";
import productRouter from "./Routes/productsRouter.js";
import historyRouter from "./Routes/historyRoute.js";
import liabilityRouter from "./Routes/LiabilityRoute.js";
import financialRouter from "./Routes/financialRoute.js";
import categoryRouter from "./Routes/categoryRoute.js";
import SalesRouter from "./Routes/salesRoute.js";
import uploadRouter from "./Routes/uploadRoute.js";
import loanRouter from "./Routes/loanRoute.js";
import purchaseRouter from "./Routes/purchaseRoute.js";
import reportRouter from "./Routes/ReportsRoute.js";
import { connectdb } from "./lib/connectDB.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS: use only CORS_ORIGIN in production, localhost:5173 in dev
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? process.env.CORS_ORIGIN // e.g. https://your-app.vercel.app
      : "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Ensure uploads dir locally (Vercel can't write to disk)
const uploadsDir = path.join(process.cwd(), "uploads");
if (process.env.VERCEL !== "1") {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use("/uploads", express.static(uploadsDir));
}

// Per-request DB connection (cached inside connectdb)
app.use(async (_req, res, next) => {
  try {
    await connectdb();
    next();
  } catch (err) {
    console.error("Database connection failed:", err);
    res.status(500).json({
      message: "Database connection failed",
      error: err.message,
    });
  }
});

// Diagnostics
app.get("/api", (_req, res) => {
  res.json({
    message: "CASRI Inventory Management System API is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    mongoConnected: mongoose.connection.readyState === 1,
    cors: {
      allowedOrigins: corsOptions.origin,
      credentials: corsOptions.credentials,
    },
  });
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/history", historyRouter);
app.use("/api/liability", liabilityRouter);
app.use("/api/financial", financialRouter);
app.use("/api/sales", SalesRouter);
app.use("/api/loans", loanRouter);
app.use("/api/purchases", purchaseRouter);
app.use("/api/reports", reportRouter);

// Only start HTTP server locally (Vercel sets VERCEL=1)
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(
      `CORS Origin: ${
        process.env.NODE_ENV === "production"
          ? process.env.CORS_ORIGIN
          : "http://localhost:5173"
      }`
    );
  });
}

export default app;