export type IntentType =
  | "product_recommendation"
  | "product_comparison"
  | "workspace_builder"
  | "product_availability"
  | "store_policy"
  | "unsupported";

export interface ClassificationResult {
  intent: IntentType;
  confidence: number;
}

export function classifyIntent(query: string): ClassificationResult {
  const lower = query.toLowerCase();
  
  // Baselines
  let intent: IntentType = "product_recommendation"; // Default baseline
  let score = 0.10;

  // Direct Keyword Matches
  const hasProduct = lower.includes("keyboard") || lower.includes("mouse") || lower.includes("audio") || 
                     lower.includes("speaker") || lower.includes("headphone") || lower.includes("desk") || 
                     lower.includes("chair") || lower.includes("aster") || lower.includes("flow") || 
                     lower.includes("glide") || lower.includes("ergo") || lower.includes("monitor");

  const hasCompare = lower.includes("compare") || lower.includes("versus") || lower.includes(" vs ") || 
                      lower.includes("better than") || lower.includes("difference between");

  const hasPolicy = lower.includes("policy") || lower.includes("return") || lower.includes("refund") || 
                     lower.includes("trial") || lower.includes("shipping") || lower.includes("delivery") || 
                     lower.includes("warranty");

  const hasWorkspace = lower.includes("setup") || lower.includes("workspace") || lower.includes("builder") || 
                       lower.includes("room") || lower.includes("coding setup") || lower.includes("office");

  const hasAvailability = lower.includes("in stock") || lower.includes("available") || lower.includes("buy") || 
                           lower.includes("carry") || lower.includes("have it") || lower.includes("stock");

  // Weights Accumulation
  if (hasProduct) score += 0.40;
  if (hasCompare) score += 0.30;
  if (hasPolicy) score += 0.30;
  if (hasWorkspace) score += 0.25;
  if (hasAvailability) score += 0.20;

  // Modifiers
  if (lower.includes("under") || lower.includes("budget") || lower.includes("cheap") || lower.includes("$") || lower.includes("₱")) {
    score += 0.15;
  }
  if (lower.includes("silent") || lower.includes("quiet") || lower.includes("noise")) {
    score += 0.15;
  }

  // Cap confidence at 0.99
  const confidence = Math.min(0.99, score);

  // Intent classification logic
  if (hasCompare && hasProduct) {
    intent = "product_comparison";
  } else if (hasWorkspace) {
    intent = "workspace_builder";
  } else if (hasPolicy) {
    intent = "store_policy";
  } else if (hasAvailability && hasProduct) {
    intent = "product_availability";
  } else if (hasProduct) {
    intent = "product_recommendation";
  } else {
    // If it has no commerce keywords, classify as unsupported
    const hasGeneralKnowledge = lower.includes("code") || lower.includes("python") || lower.includes("javascript") ||
                                lower.includes("weather") || lower.includes("president") || lower.includes("how to") ||
                                lower.includes("write a") || lower.includes("joke") || lower.includes("recipe");

    if (hasGeneralKnowledge || (!hasProduct && !hasPolicy && !hasWorkspace && !hasAvailability)) {
      intent = "unsupported";
      return { intent: "unsupported", confidence: 0.99 };
    }
  }

  return { intent, confidence };
}
