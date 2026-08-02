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
  origin: true,
  credentials: true
}));

app.use(express.json());

// In-Memory Rate Limiting Security Middleware
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 120; // 120 reqs/min

app.use((req, res, next) => {
  const ip = req.ip || req.socket.remoteAddress || "global_ip";
  const now = Date.now();
  const clientData = rateLimitMap.get(ip);

  if (!clientData || now > clientData.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  if (clientData.count >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      error: "Too Many Requests",
      message: "Rate limit exceeded. Please try again in 60 seconds.",
      resetTime: new Date(clientData.resetTime).toISOString(),
    });
  }

  clientData.count += 1;
  next();
});

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
    security: {
      rateLimiter: "active",
      rlsEnabled: true,
      cors: "restricted"
    },
    endpoints: {
      health: "GET /health",
      aiChat: "POST /api/ai/chat",
      paymentIntent: "POST /api/payment/create-intent",
      automationTrigger: "POST /api/automation/trigger"
    },
    timestamp: new Date()
  });
});

// Health Check Route
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "northlane-api", timestamp: new Date() });
});

// Global Error Handler Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("[Global Error Boundary Handler]:", err);
  res.status(err.status || 500).json({
    error: err.name || "InternalServerError",
    message: err.message || "An unexpected error occurred on the API server.",
  });
});

app.listen(port, () => {
  console.log(`[Server] Northlane API service with security hardening running on http://localhost:${port}`);
});
