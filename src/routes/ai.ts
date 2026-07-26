import { Router } from "express";
import { processAssistantChat } from "../ai/shopping-assistant.js";

const router = Router();

// POST /api/ai/chat
router.post("/chat", async (req, res) => {
  try {
    const { message, sessionId, userId } = req.body;

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Missing required 'message' string parameter in request body." });
      return;
    }

    const response = await processAssistantChat({
      message,
      sessionId: sessionId || "session-anonymous",
      userId: userId || null
    });

    res.json(response);
  } catch (err: any) {
    console.error("[AIRoutes] Error handling assistant chat request:", err.message);
    res.status(500).json({ error: "Internal server error occurred processing AI chat prompt." });
  }
});

export default router;
