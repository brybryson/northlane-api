import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();
const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

async function test() {
  const { data, error } = await supabase.from('ai_search_logs').select('*').order('created_at', { ascending: false }).limit(5);
  console.log("Recent logs:", data);
}
test();
