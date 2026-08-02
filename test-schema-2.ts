import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();
const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

async function test() {
  const { data, error } = await supabase
    .from("ai_search_logs")
    .insert({ query: "test", user_id: "test-user-456" });
  console.log("searchLogs Error:", error);
}
test();
