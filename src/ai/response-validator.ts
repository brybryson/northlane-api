import { BACKEND_PRODUCTS, CatalogProduct } from "../integrations/woocommerce.js";

export interface ValidationResult {
  reply: string;
  products: CatalogProduct[];
}

export function validateResponse(llmText: string, searchResult: CatalogProduct[]): ValidationResult {
  const products: CatalogProduct[] = [];
  const lowerText = llmText.toLowerCase();

  // 1. Extract real catalog products mentioned in the text
  BACKEND_PRODUCTS.forEach(p => {
    // If the product name or key identifier is mentioned in the response text, add it
    const nameWords = p.name.toLowerCase().split(" ");
    const keyword = nameWords[0]; // e.g. "aster" or "flow" or "glide" or "solid" or "fit"

    if (lowerText.includes(p.id.toLowerCase()) || lowerText.includes(p.name.toLowerCase()) || lowerText.includes(keyword)) {
      if (!products.some(existing => existing.id === p.id)) {
        products.push(p);
      }
    }
  });

  // 2. If no products were explicitly mentioned in the text, but the WooCommerce search returned items,
  // we can append them as recommended attachment cards
  if (products.length === 0 && searchResult.length > 0) {
    products.push(...searchResult.slice(0, 2));
  }

  // 3. Prevent unsupported answer check. If LLM tries to write python code or answer general knowledge
  // despite system prompts, replace with a safe concierge fallback response
  const isCode = lowerText.includes("def ") || lowerText.includes("import ") || lowerText.includes("const ") || 
                 lowerText.includes("function()") || lowerText.includes("class ") || lowerText.includes("<html>");
  
  let reply = llmText;
  if (isCode) {
    reply = "I apologize, but I am only programmed to assist with Northlane workspace essentials, catalog products, and store policies. If you need coding assistance, I recommend using a general-purpose coding assistant. How can I help craft your physical workspace setup today?";
    return { reply, products: [] };
  }

  return { reply, products };
}
