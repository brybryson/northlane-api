import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), "northlane-api/.env") });

function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (supabaseUrl && supabaseServiceKey) {
    return createClient(supabaseUrl, supabaseServiceKey);
  }
  return null;
}

const supabase = getSupabaseClient();

// Helper to validate if a string is a valid UUID
function isValidUUID(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
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
        user_id: payload.userId && isValidUUID(payload.userId) ? payload.userId : null
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

export async function logConversationMessage(payload: {
  sessionId: string;
  userId?: string | null;
  userMessage: string;
  aiMessage: string;
  intent: string;
}): Promise<void> {
  if (!supabase) return;

  try {
    let { data: convData } = await supabase
      .from("ai_conversations")
      .select("id")
      .eq("session_id", payload.sessionId)
      .limit(1)
      .maybeSingle();

    let conversationId = convData?.id;

    if (!conversationId) {
      const { data: newConv, error: createError } = await supabase
        .from("ai_conversations")
        .insert({ session_id: payload.sessionId, user_id: payload.userId && isValidUUID(payload.userId) ? payload.userId : null })
        .select()
        .single();
      
      if (createError) {
        console.error("[SearchLogger] Error creating conversation:", createError.message);
        return;
      }
      conversationId = newConv.id;
    }

    if (conversationId) {
      await supabase.from("ai_messages").insert([
        {
          conversation_id: conversationId,
          role: "user",
          content: payload.userMessage,
          intent: payload.intent
        },
        {
          conversation_id: conversationId,
          role: "assistant",
          content: payload.aiMessage,
          intent: payload.intent
        }
      ]);
      console.log(`[SearchLogger] Logged conversation messages for session: ${payload.sessionId}`);
    }
  } catch (err: any) {
    console.error("[SearchLogger] Exception during conversation logging:", err.message);
  }
}
