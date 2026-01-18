
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  const inputTaskValue = '5'; // The integer ID that was causing issues
  const influencerId = 1; // Assuming influencer with ID 1 exists, or we might need to find one. 
  // NOTE: If FK logic was strict, we might need a real influencer ID.
  // For now we test if type validation lets '5' through.
  
  console.log(`Testing INSERT with task_assignment_id = '${inputTaskValue}' (BigInt)...`);

  const payload = {
    title: 'Test Submission',
    description: 'Test Description',
    video_url: 'http://test.com',
    approval_status: 'pending',
    submitted_at: new Date().toISOString(),
    task_assignment_id: inputTaskValue, // Passing '5'
    // influencer_id: influencerId // omit or use real one if FK enforces it. 
    // video_submissions doesn't always strictly enforce influencer_id FK in loose schemas, but let's try.
  };

  try {
    // Attempt insert. Even if FK fails, we want to know if TYPE fails.
    // Invalid input syntax for uuid comes before FK check usually.
    const { data, error } = await supabase
      .from('video_submissions')
      .insert(payload)
      .select();

    if (error) {
      console.error('Supabase Insert Error:', error);
      if (error.message.includes('invalid input syntax for type uuid')) {
          console.error("FAIL: Still expecting UUID!");
      } else if (error.message.includes('foreign key constraint')) {
          console.log("PASS (Type check): Type accepted, but FK failed (expected).");
      } else {
          console.log("PASS (Type check): Error is not about UUID syntax.");
      }
    } else {
      console.log('Insert Successful!', data);
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

testInsert();
