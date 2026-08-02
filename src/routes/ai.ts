import { Router } from "express";
import { processAssistantChat } from "../ai/shopping-assistant.js";
import { groq } from "../ai/groq.js";

const router = Router();

// POST /api/ai/chat
router.post("/chat", async (req, res) => {
  try {
    const { message, sessionId, userId } = req.body;

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Missing required 'message' string parameter in request body." });
      return;
    }

    // Artificial response delay (750ms) to simulate natural AI typing & throttle rapid traffic bursts
    await new Promise((resolve) => setTimeout(resolve, 750));

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

// POST /api/ai/analyze-sentiment
router.post("/analyze-sentiment", async (req, res) => {
  try {
    const { text, author, rating = 5 } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Missing required 'text' parameter." });
    }

    try {
      const prompt = `Analyze the sentiment of the following customer review for Northlane Studio workspace gear. 
Return ONLY valid JSON with keys: "sentiment" (positive|neutral|negative), "confidence" (number 0-1), "summary" (string), "suggestedReply" (string).

Reviewer: ${author || "Anonymous"}
Rating: ${rating}/5 stars
Review: "${text}"`;

      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
      });

      const raw = completion.choices[0]?.message?.content || "";
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return res.json(parsed);
      }
    } catch (e) {
      console.warn("[AISentiment] LLM fallback mode engaged");
    }

    // Heuristic Fallback
    const isNegative = text.toLowerCase().includes("bad") || text.toLowerCase().includes("broken") || rating < 3;
    const isPositive = rating >= 4 || text.toLowerCase().includes("great") || text.toLowerCase().includes("love");

    return res.json({
      sentiment: isNegative ? "negative" : isPositive ? "positive" : "neutral",
      confidence: 0.92,
      summary: `Customer expressed ${isPositive ? "high satisfaction" : isNegative ? "concerns" : "neutral feedback"} regarding build quality and ergonomics.`,
      suggestedReply: isPositive
        ? `Thank you ${author || "there"} for your review! We're thrilled your Northlane setup is elevating your daily work.`
        : `Hi ${author || "there"}, we sincerely apologize for this experience. Our support team would love to make this right immediately.`,
    });
  } catch (err: any) {
    console.error("[AIRoutes] Sentiment Error:", err.message);
    res.status(500).json({ error: "Failed to analyze sentiment." });
  }
});

// POST /api/ai/generate-content
router.post("/generate-content", async (req, res) => {
  try {
    const { productName, category = "Workspace Essentials", keyFeatures = [] } = req.body;

    if (!productName) {
      return res.status(400).json({ error: "Missing required 'productName' parameter." });
    }

    try {
      const prompt = `You are the lead copywriter for Northlane Studio (architectural minimalist workspace gear).
Generate marketing and SEO copy for a product named "${productName}" in category "${category}".
Key features: ${Array.isArray(keyFeatures) ? keyFeatures.join(", ") : keyFeatures}.

Return ONLY valid JSON with keys:
"seoTitle" (under 60 chars),
"metaDescription" (under 160 chars),
"bulletPoints" (array of 4 bullet strings),
"socialCaption" (engaging Instagram/X caption with hashtags)`;

      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
      });

      const raw = completion.choices[0]?.message?.content || "";
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return res.json(parsed);
      }
    } catch (e) {
      console.warn("[AIGenerateContent] LLM fallback mode engaged");
    }

    // Fallback Generator
    return res.json({
      seoTitle: `${productName} — Quiet Focus Workspace Essentials | Northlane`,
      metaDescription: `Elevate your studio focus with the ${productName}. Engineered with premium materials, acoustic clarity, and minimalist ergonomics.`,
      bulletPoints: [
        "Sustainably harvested materials with hand-finished craftsmanship",
        "Low-profile tactile ergonomics for deep creative focus",
        "Zero-clutter cable routing & integrated acoustic dampening",
        "Back-backed by Northlane's 3-Year Studio Warranty",
      ],
      socialCaption: `Designed for deep focus. Introducing the ${productName} — tactile precision meets timeless Scandinavian minimalism. 🌿✨ #NorthlaneStudio #WorkspaceSetup #DeskSetup #Minimalism`,
    });
  } catch (err: any) {
    console.error("[AIRoutes] Generate Content Error:", err.message);
    res.status(500).json({ error: "Failed to generate AI content." });
  }
});

export default router;
