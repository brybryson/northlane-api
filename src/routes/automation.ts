import { Router } from "express";

const router = Router();

export interface N8NWorkflow {
  id: string;
  name: string;
  triggerEvent: string;
  status: "active" | "paused";
  lastRun: string;
  totalRuns: number;
  successRate: number;
  description: string;
}

const WORKFLOWS: N8NWorkflow[] = [
  {
    id: "wf-order-processing",
    name: "Customer Order Processing & Invoice Email",
    triggerEvent: "order.created",
    status: "active",
    lastRun: "2026-08-02 15:45",
    totalRuns: 342,
    successRate: 99.4,
    description: "Order Webhook ──► Invoice Generation ──► Email Receipt ──► Slack Notification ──► Google Sheet Update",
  },
  {
    id: "wf-inventory-alert",
    name: "Low Stock Supplier Reorder Alert",
    triggerEvent: "inventory.low_stock",
    status: "active",
    lastRun: "2026-08-01 09:12",
    totalRuns: 48,
    successRate: 100.0,
    description: "Stock Threshold Trigger ──► Email Supplier Reorder ──► Slack Alert ──► ClickUp Purchasing Task",
  },
  {
    id: "wf-abandoned-cart",
    name: "AI Abandoned Cart Recovery Sequence",
    triggerEvent: "cart.abandoned",
    status: "active",
    lastRun: "2026-08-02 11:30",
    totalRuns: 189,
    successRate: 97.8,
    description: "Cart Abandoned Trigger ──► 2h Delay ──► AI Personalized Email + Discount Code ──► SMS Follow-up",
  },
  {
    id: "wf-content-publish",
    name: "Automated Product Launch & SEO Meta Generation",
    triggerEvent: "product.created",
    status: "paused",
    lastRun: "2026-07-25 14:00",
    totalRuns: 12,
    successRate: 91.6,
    description: "Admin Product Create ──► AI Meta Generation ──► Storefront Auto-Publish ──► Scheduled Social Promo",
  },
];

/**
 * GET /api/automation/status
 */
router.get("/status", (req, res) => {
  return res.json({
    n8nHost: process.env.N8N_WEBHOOK_URL || "https://n8n.northlane.studio/webhook/",
    status: "online",
    workflows: WORKFLOWS,
  });
});

/**
 * POST /api/automation/trigger
 */
router.post("/trigger", async (req, res) => {
  try {
    const { workflowId, payload } = req.body;
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

    console.log(`[n8n Automation Trigger]: Executing workflow ${workflowId}`);

    if (n8nWebhookUrl) {
      const response = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowId, payload, timestamp: new Date() }),
      });
      const data = await response.json();
      return res.json({ success: true, mode: "live_n8n", result: data });
    }

    // Simulation response
    return res.json({
      success: true,
      mode: "simulation_mode",
      workflowId,
      executionId: `exec_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
      message: `n8n Workflow "${workflowId}" triggered successfully in test mode. Set N8N_WEBHOOK_URL in .env to call live n8n host.`,
    });
  } catch (err) {
    console.error("[n8n Trigger Error]:", err);
    return res.status(500).json({ error: "Failed to trigger n8n workflow." });
  }
});

export default router;
