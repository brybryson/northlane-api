import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();
const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

async function test() {
  const c = await supabase.from('ai_conversations').select('*').limit(1);
  console.log('ai_conversations:', c.error || 'exists');
  const m = await supabase.from('ai_messages').select('*').limit(1);
  console.log('ai_messages:', m.error || 'exists');
}
test();
