import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for frontend requests
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

// Register AI Sourcing Concierge Routes
import aiRouter from "./routes/ai.js";
app.use("/api/ai", aiRouter);

// Health Check Route
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "northlane-api", timestamp: new Date() });
});

app.listen(port, () => {
  console.log(`[Server] Northlane API service is running on http://localhost:${port}`);
});
