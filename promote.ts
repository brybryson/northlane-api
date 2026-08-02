import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function promote() {
  const email = 'bryantiversonmelliza03@gmail.com';
  
  // 1. Get user id from auth.users (via admin API)
  const { data: users, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) throw listError;
  
  const user = users.users.find(u => u.email === email);
  if (!user) {
    console.log("User not found!");
    return;
  }
  
  console.log(`Found user: ${user.id}`);
  
  // 2. Insert into user_roles
  const { error: insertError } = await supabase
    .from('user_roles')
    .upsert({ user_id: user.id, role: 'admin' });
    
  if (insertError) throw insertError;
  
  console.log("Successfully promoted to admin!");
}

promote().catch(console.error);
