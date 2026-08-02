import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Robustly load .env from northlane-api package folder or CWD
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(process.cwd(), "northlane-api/.env") });

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for frontend requests
app.use(cors({
  origin: true, // Allow all origins for development
  credentials: true
}));

app.use(express.json());

// Register API Routes
import aiRouter from "./routes/ai.js";
import paymentRouter from "./routes/payment.js";
import automationRouter from "./routes/automation.js";
app.use("/api/ai", aiRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/automation", automationRouter);

// Root Welcome Route
app.get("/", (req, res) => {
  res.json({
    name: "Northlane Studio API Service",
    status: "online",
    version: "1.0.0",
    endpoints: {
      health: "GET /health",
      aiChat: "POST /api/ai/chat"
    },
    timestamp: new Date()
  });
});

// Health Check Route
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "northlane-api", timestamp: new Date() });
});

app.listen(port, () => {
  console.log(`[Server] Northlane API service is running on http://localhost:${port}`);
});
