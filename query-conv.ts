import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();
const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

async function test() {
  const { data: newConv, error: createError } = await supabase
    .from("ai_conversations")
    .insert({ session_id: "test-session-123", user_id: "test-user-456" })
    .select()
    .single();
  console.log("createError:", createError);
}
test();
