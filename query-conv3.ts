import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();
const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

async function test() {
  const c = await supabase.from('ai_conversations').select('*').order('created_at', { ascending: false }).limit(2);
  console.log("Conversations:", c.data);
  const m = await supabase.from('ai_messages').select('*').order('created_at', { ascending: false }).limit(4);
  console.log("Messages:", m.data);
}
test();
