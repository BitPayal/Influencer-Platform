import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials are missing. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables.');
} else {
  console.log('Supabase initialized with URL:', supabaseUrl);
}

const globalForSupabase = global as unknown as { supabase: ReturnType<typeof createClient> }

export const supabase = globalForSupabase.supabase || createClient(supabaseUrl, supabaseAnonKey)

if (process.env.NODE_ENV !== 'production') globalForSupabase.supabase = supabase
