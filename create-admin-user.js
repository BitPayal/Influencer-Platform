
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminUser() {
  const email = 'admin@cehpoint.com';
  const password = 'AdminPassword123!';

  console.log(`Attempting to sign up user: ${email}`);

  // 1. Sign Up User
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error("Error creating user:", error.message);
    return;
  }

  const userId = data.user?.id;
  
  if (!userId) {
      console.error("Signup succeeded but no user ID returned.");
      return;
  }

  console.log(`User created successfully! ID: ${userId}`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log("\nNext Step: Updates to 'role' = 'admin' must be done via SQL as this client is anonymous.");
}

createAdminUser();
