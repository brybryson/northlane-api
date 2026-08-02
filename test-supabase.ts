import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();
const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

async function test() {
  console.log("Using key:", (process.env.SUPABASE_SERVICE_ROLE_KEY || '').substring(0, 20) + "...");
  const { data, error } = await supabase.from('ai_search_logs').insert({
    query: 'test query',
    intent: 'test',
    matched: true,
    matched_products: []
  });
  console.log("Result error:", error);
}
test();
