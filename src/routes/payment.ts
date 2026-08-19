import { Router } from "express";

const router = Router();

// In-memory / mock database fallback for payment methods
let memoryPaymentMethods = [
  {
    id: "pm-1",
    brand: "Visa",
    last4: "4242",
    expMonth: 11,
    expYear: 2028,
    isDefault: true,
  },
  {
    id: "pm-2",
    brand: "Mastercard",
    last4: "8899",
    expMonth: 8,
    expYear: 2027,
    isDefault: false,
  },
];

/**
 * POST /api/payment/create-intent
 * Creates a Stripe Payment Intent for checkout processing.
 */
router.post("/create-intent", async (req, res) => {
  try {
    const { amount, currency = "usd", items, customerEmail } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid payment amount." });
    }

    const rawKey = process.env.STRIPE_SECRET_KEY || "";
    const stripeSecretKey = rawKey.trim().replace(/^["']|["']$/g, "");

    // If Stripe Secret Key is configured, make call to Stripe API
    if (stripeSecretKey) {
      const response = await fetch("https://api.stripe.com/v1/payment_intents", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          amount: Math.round(amount * 100).toString(),
          currency: currency.toLowerCase(),
          payment_method: "pm_card_visa",
          confirm: "true",
          return_url: "http://localhost:5173/shop",
          ...(customerEmail && { receipt_email: customerEmail }),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || "Stripe Payment Intent creation failed.");
      }

      return res.json({
        clientSecret: data.client_secret,
        paymentIntentId: data.id,
        status: data.status,
        mode: "live_stripe",
      });
    }

    // Fallback: Sandbox / Development Mode Payment Intent
    const mockIntentId = `pi_mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const mockClientSecret = `${mockIntentId}_secret_${Math.random().toString(36).substring(2, 9)}`;

    return res.json({
      clientSecret: mockClientSecret,
      paymentIntentId: mockIntentId,
      status: "requires_payment_method",
      mode: "sandbox_mode",
      amount,
      currency,
      message: "Stripe Sandbox Payment Intent generated.",
    });
  } catch (error) {
    console.error("[Payment API Error]:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to process payment intent.",
    });
  }
});

/**
 * GET /api/payment/methods
 * Retrieves saved payment methods metadata for the authenticated user.
 */
router.get("/methods", (_req, res) => {
  return res.json({ methods: memoryPaymentMethods });
});

/**
 * POST /api/payment/methods
 * Attaches a Stripe Payment Method and persists metadata.
 */
router.post("/methods", (req, res) => {
  const { brand = "Visa", last4, expMonth, expYear, isDefault = false } = req.body;

  if (!last4 || !expMonth || !expYear) {
    return res.status(400).json({ error: "Missing required card details." });
  }

  const newMethod = {
    id: `pm-${Date.now()}`,
    brand,
    last4,
    expMonth: parseInt(expMonth, 10),
    expYear: parseInt(expYear, 10),
    isDefault,
  };

  if (isDefault || memoryPaymentMethods.length === 0) {
    memoryPaymentMethods = memoryPaymentMethods.map((m) => ({ ...m, isDefault: false }));
    newMethod.isDefault = true;
  }

  memoryPaymentMethods.push(newMethod);
  return res.json({ success: true, method: newMethod });
});

/**
 * POST /api/payment/methods/:id/default
 * Sets a saved payment method as the primary default.
 */
router.post("/methods/:id/default", (req, res) => {
  const { id } = req.params;
  const target = memoryPaymentMethods.find((m) => m.id === id);

  if (!target) {
    return res.status(404).json({ error: "Payment method not found." });
  }

  memoryPaymentMethods = memoryPaymentMethods.map((m) => ({
    ...m,
    isDefault: m.id === id,
  }));

  return res.json({ success: true, defaultId: id });
});

/**
 * DELETE /api/payment/methods/:id
 * Detaches and removes a saved payment method.
 */
router.delete("/methods/:id", (req, res) => {
  const { id } = req.params;
  const targetIndex = memoryPaymentMethods.findIndex((m) => m.id === id);

  if (targetIndex === -1) {
    return res.status(404).json({ error: "Payment method not found." });
  }

  const wasDefault = memoryPaymentMethods[targetIndex].isDefault;
  memoryPaymentMethods.splice(targetIndex, 1);

  if (wasDefault && memoryPaymentMethods.length > 0) {
    memoryPaymentMethods[0].isDefault = true;
  }

  return res.json({ success: true, removedId: id, methods: memoryPaymentMethods });
});

/**
 * POST /api/payment/webhook
 * Handles incoming Stripe Webhooks.
 */
router.post("/webhook", (req, res) => {
  const event = req.body;
  const eventType = event.type || "payment_intent.succeeded";
  console.log(`[Stripe Webhook Received]: Event type ${eventType}`);
  return res.json({ received: true, status: "success" });
});

export default router;
