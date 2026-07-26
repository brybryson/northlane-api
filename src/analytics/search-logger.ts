import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

let supabase: any = null;
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
} else {
  console.warn("[Supabase] Warning: Missing Supabase credentials. Sourcing and logging will be offline.");
}

export interface SearchLogPayload {
  query: string;
  intent: string;
  matched: boolean;
  matchedProducts: any[];
  userId?: string | null;
}

export async function logSearchQuery(payload: SearchLogPayload): Promise<void> {
  if (!supabase) {
    console.log("[SearchLogger] Supabase client offline. Simulated log payload:", JSON.stringify(payload, null, 2));
    return;
  }

  try {
    const { error } = await supabase
      .from("ai_search_logs")
      .insert({
        query: payload.query,
        intent: payload.intent,
        matched: payload.matched,
        matched_products: payload.matchedProducts,
        user_id: payload.userId || null
      });

    if (error) {
      console.error("[SearchLogger] Error logging query to Supabase:", error.message);
    } else {
      console.log(`[SearchLogger] Logged query: "${payload.query}" (Matched: ${payload.matched})`);
    }
  } catch (err: any) {
    console.error("[SearchLogger] Exception during database log insert:", err.message);
  }
}
