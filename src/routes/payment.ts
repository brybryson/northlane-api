import { Router } from "express";

const router = Router();

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

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    // If Stripe Secret Key is configured, make call to Stripe API
    if (stripeSecretKey) {
      // Direct call or SDK integration
      const response = await fetch("https://api.stripe.com/v1/payment_intents", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          amount: Math.round(amount * 100).toString(),
          currency: currency.toLowerCase(),
          "payment_method_types[]": "card",
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
      message: "Stripe Sandbox Payment Intent generated. Set STRIPE_SECRET_KEY in .env for live mode.",
    });
  } catch (error) {
    console.error("[Payment API Error]:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to process payment intent.",
    });
  }
});

/**
 * POST /api/payment/webhook
 * Handles incoming Stripe Webhooks (e.g., checkout.session.completed, payment_intent.succeeded).
 */
router.post("/webhook", (req, res) => {
  const event = req.body;
  const eventType = event.type || "payment_intent.succeeded";

  console.log(`[Stripe Webhook Received]: Event type ${eventType}`);

  switch (eventType) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data?.object;
      console.log(`[Stripe Webhook]: Payment succeeded for ${paymentIntent?.id || "mock_id"}`);
      break;
    case "checkout.session.completed":
      console.log(`[Stripe Webhook]: Checkout session completed.`);
      break;
    default:
      console.log(`[Stripe Webhook]: Unhandled event type ${eventType}`);
  }

  return res.json({ received: true, status: "success" });
});

export default router;
