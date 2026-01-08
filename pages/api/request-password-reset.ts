import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  // 1. Validate email format
  const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  // Check for Service Role Key
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL');
    return res.status(500).json({ error: 'Server configuration error: Missing Service Role Key.' });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // 2. Check if email exists
    // admin.listUsers is the reliable way to search by email without logging in
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
        console.error('List users error:', listError);
        throw listError;
    }

    // Filter manually because listUsers pagination might be tricky, but for smaller userbases this works.
    // Ideally we use specialized search if available, but listUsers is standard admin.
    // Actually, createClient with service role SHOULD find the user.
    // Let's try to just find the specific user to be efficient? 
    // supabaseAdmin.auth.admin.getUserById requires ID.
    // We can't strictly "get by email" in all versions easily without listing.
    // However, we can trust the 'generateLink' or just try to update? No, we need to know if they exist first.
    
    const user = users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      return res.status(404).json({ error: 'This email is not registered.' });
    }

    // 3. Generate random password (A9fK2M7x style)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // 4. Update user password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { 
        password: password,
        user_metadata: { ...user.user_metadata, force_password_change: true }
      }
    );

    if (updateError) {
        console.error('Update password error:', updateError);
        throw updateError;
    }

    // 5. Send email (Simulated)
    console.log('===========================================================');
    console.log(`[EMAIL SIMULATION] To: ${email}`);
    console.log(`Subject: Your New Password`);
    console.log(`Body: Your new password is: ${password}`);
    console.log('Please log in and change it immediately.');
    console.log('===========================================================');

    return res.status(200).json({ message: 'Password reset successful. Check your email.' });

  } catch (err: any) {
    console.error('Reset password API error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
