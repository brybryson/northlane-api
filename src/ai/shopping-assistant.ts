import { classifyIntent } from "./intent-classifier.js";
import { searchProducts, CatalogProduct } from "../integrations/woocommerce.js";
import { buildSystemPrompt, buildUserPrompt } from "./prompt-builder.js";
import { groq } from "./groq.js";
import { validateResponse } from "./response-validator.js";
import { logSearchQuery, logConversationMessage } from "../analytics/search-logger.js";

export interface AssistantRequest {
  message: string;
  sessionId: string;
  userId?: string | null;
}

export interface AssistantResponse {
  reply: string;
  products: CatalogProduct[];
  intent: string;
  confidence: number;
}

export async function processAssistantChat(payload: AssistantRequest): Promise<AssistantResponse> {
  const { message, userId } = payload;

  // 1. Classify Intent & Confidence
  const { intent, confidence } = classifyIntent(message);

  // Natural Language Order Tracking Interceptor
  const isOrderQuery = message.match(/NL-\d{5,6}/i) || message.toLowerCase().includes("track my order") || message.toLowerCase().includes("order status") || message.toLowerCase().includes("where is my package");
  if (isOrderQuery) {
    const orderIdMatch = message.match(/NL-\d{5,6}/i);
    const orderId = orderIdMatch ? orderIdMatch[0].toUpperCase() : "NL-89210";
    const orderReply = `Package Tracking Update for ${orderId}: Your order is currently IN TRANSIT via DHL Express (Tracking #DHL-9842109482). Estimated delivery is Aug 04, 2026. You can also view live package updates anytime in your /account portal.`;
    return {
      reply: orderReply,
      products: [],
      intent: "order_tracking",
      confidence: 0.98,
    };
  }

  // 2. Fetch Sourced Catalog Products
  let matchingProducts: CatalogProduct[] = [];
  if (intent !== "unsupported") {
    matchingProducts = await searchProducts(message);
  }

  // 3. Fallback check for Unsupported Intent
  if (intent === "unsupported") {
    const fallbackReply = "I am the Northlane Studio Concierge. I am only programmed to assist with Northlane workspace essentials, catalog products, and store policies. How can I help you find keyboards, standing desks, ergonomic chairs, or studio monitors today?";
    
    // Log the failed search query
    logSearchQuery({
      query: message,
      intent,
      matched: false,
      matchedProducts: [],
      userId
    });

    // Log the conversation
    logConversationMessage({
      sessionId: payload.sessionId,
      userId,
      userMessage: message,
      aiMessage: fallbackReply,
      intent
    });

    return {
      reply: fallbackReply,
      products: [],
      intent,
      confidence
    };
  }

  // 4. Prompt Builder RAG Assembly
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(message, matchingProducts);

  let rawLlmReply = "";
  try {
    // 5. Call Groq Completion
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3
    });

    rawLlmReply = completion.choices[0]?.message?.content || "";
  } catch (err: any) {
    console.error("[ShoppingAssistant] Groq API call failed. Using offline simulation backup. Error:", err.message);
    
    // Offline simulation backup responder if API key is invalid or offline
    if (matchingProducts.length > 0) {
      rawLlmReply = `I highly recommend looking at our premium workspace collection. The ${matchingProducts[0].name} (₱${matchingProducts[0].price.toLocaleString()}) would be an excellent fit for your needs because it is carefully engineered for active focus and premium ergonomics.`;
    } else {
      rawLlmReply = "We don't currently carry that specific item. I've recorded your inquiry so our sourcing team can better understand what workspace items customers are looking for. In the meantime, I can help you find mechanical keyboards, audio monitors, desks, or ergonomic chairs!";
    }
  }

  // 6. Validate Response (Remove hallucinations)
  const { reply, products } = validateResponse(rawLlmReply, matchingProducts);

  // 7. Sourcing Analytics Log Insertion
  logSearchQuery({
    query: message,
    intent,
    matched: products.length > 0,
    matchedProducts: products.map(p => ({ id: p.id, name: p.name, price: p.price })),
    userId
  });

  // 8. Log the conversation message
  logConversationMessage({
    sessionId: payload.sessionId,
    userId,
    userMessage: message,
    aiMessage: reply,
    intent
  });

  return {
    reply,
    products,
    intent,
    confidence
  };
}
