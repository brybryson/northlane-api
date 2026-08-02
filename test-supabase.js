require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  console.log("Using key:", process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + "...");
  const { data, error } = await supabase.from('ai_search_logs').insert({
    query: 'test query',
    intent: 'test',
    matched: true,
    matched_products: []
  });
  console.log("Result:", { data, error });
}
test();
