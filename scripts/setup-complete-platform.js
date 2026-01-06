#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv/config');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Supabase credentials not found in environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Replit Secrets');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ⚠️ WARNING: These are DEFAULT DEMO CREDENTIALS for testing only
// For production use, either:
// 1. Set environment variables: ADMIN_PASSWORD and INFLUENCER_PASSWORD
// 2. Modify these values before running
// 3. Change passwords immediately after creation via Supabase dashboard
const adminEmail = 'admin@cehpoint.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'Cehpoint@2025';
const influencerEmail = 'influencer@cehpoint.com';
const influencerPassword = process.env.INFLUENCER_PASSWORD || 'Influencer@2025';

async function setupPlatform() {
  console.log('\n🚀 CEHPOINT INFLUENCE PARTNERS - PLATFORM SETUP');
  console.log('=' .repeat(70));
  console.log('\n📊 This script will set up your complete platform:\n');
  console.log('  ✓ Verify database connection');
  console.log('  ✓ Create admin account');
  console.log('  ✓ Create influencer account with demo profile');
  console.log('  ✓ Provide login credentials\n');
  console.log('=' .repeat(70) + '\n');

  try {
    // Step 1: Verify connection
    console.log('🔍 Step 1/3: Verifying Supabase connection...');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.log('⚠️  Database tables might not exist yet.');
      console.log('\n📝 IMPORTANT: You need to run the SQL schema in Supabase first!');
      console.log('\nSteps to set up database:');
      console.log('  1. Go to your Supabase Dashboard → SQL Editor');
      console.log('  2. Copy content from database-schema.sql');
      console.log('  3. Paste and run in SQL Editor');
      console.log('  4. Copy content from scripts/enhanced-schema-migration.sql');
      console.log('  5. Paste and run in SQL Editor');
      console.log('  6. Create storage bucket named "documents" (public access)');
      console.log('  7. Create storage bucket named "guidebooks" (public access)');
      console.log('  8. Run this script again\n');
      process.exit(1);
    }
    console.log('✅ Database connection successful!\n');

    // Step 2: Create Admin Account
    console.log('🔧 Step 2/3: Creating admin account...');
    const { data: adminAuthData, error: adminAuthError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        emailRedirectTo: `${supabaseUrl}/login`,
      },
    });

    if (adminAuthError) {
      if (adminAuthError.message.includes('already registered')) {
        console.log('ℹ️  Admin account already exists, fetching user...');
        const { data: existingAdmin } = await supabase
          .from('users')
          .select('*')
          .eq('email', adminEmail)
          .single();
        console.log('✅ Admin account found');
      } else {
        throw adminAuthError;
      }
    } else if (adminAuthData.user) {
      console.log('✅ Admin account created in auth system');
      
      // Insert admin user metadata
      const { error: userInsertError } = await supabase.from('users').upsert({
        id: adminAuthData.user.id,
        email: adminEmail,
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (userInsertError && !userInsertError.message.includes('duplicate')) {
        console.error('⚠️  Warning: Could not insert admin user metadata:', userInsertError.message);
      } else {
        console.log('✅ Admin profile created');
      }
    }

    // Step 3: Create Influencer Account
    console.log('\n🔧 Step 3/3: Creating influencer account...');
    const { data: influencerAuthData, error: influencerAuthError } = await supabase.auth.signUp({
      email: influencerEmail,
      password: influencerPassword,
      options: {
        emailRedirectTo: `${supabaseUrl}/login`,
      },
    });

    if (influencerAuthError) {
      if (influencerAuthError.message.includes('already registered')) {
        console.log('ℹ️  Influencer account already exists');
        const { data: existingInfluencer } = await supabase
          .from('users')
          .select('*')
          .eq('email', influencerEmail)
          .single();
        console.log('✅ Influencer account found');
      } else {
        throw influencerAuthError;
      }
    } else if (influencerAuthData.user) {
      console.log('✅ Influencer account created in auth system');
      
      // Insert influencer user metadata
      const { error: userInsertError } = await supabase.from('users').upsert({
        id: influencerAuthData.user.id,
        email: influencerEmail,
        role: 'influencer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (userInsertError && !userInsertError.message.includes('duplicate')) {
        console.error('⚠️  Warning: Could not insert influencer user metadata:', userInsertError.message);
      } else {
        console.log('✅ Influencer user profile created');
      }

      // Create detailed influencer profile
      const { error: profileError } = await supabase.from('influencers').upsert({
        user_id: influencerAuthData.user.id,
        full_name: 'Rajesh Kumar',
        phone_number: '+91-9876543210',
        email: influencerEmail,
        district: 'Bangalore Urban',
        state: 'Karnataka',
        social_media_handles: {
          instagram: '@rajesh_tech_influencer',
          youtube: 'RajeshTechChannel',
          facebook: 'rajeshtechfb',
        },
        follower_count: 35000,
        id_proof_url: 'https://example.com/demo-id.pdf',
        id_proof_type: 'aadhaar',
        upi_id: 'rajesh@paytm',
        approval_status: 'approved',
        approved_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (profileError && !profileError.message.includes('duplicate')) {
        console.error('⚠️  Warning: Could not create influencer profile:', profileError.message);
      } else {
        console.log('✅ Influencer profile created with demo data');
      }
    }

    // Success Message
    console.log('\n' + '='.repeat(70));
    console.log('🎉 SUCCESS! Your Cehpoint Influence Platform is ready!');
    console.log('='.repeat(70));
    console.log('\n📋 LOGIN CREDENTIALS:\n');
    
    console.log('👨‍💼 ADMIN ACCOUNT:');
    console.log('   Email:    ' + adminEmail);
    console.log('   Password: ' + adminPassword);
    console.log('   Access:   ✓ Manage influencers');
    console.log('             ✓ Create marketing projects');
    console.log('             ✓ Assign monthly tasks');
    console.log('             ✓ Approve videos');
    console.log('             ✓ Process payments');
    console.log('             ✓ View analytics\n');
    
    console.log('🎯 INFLUENCER ACCOUNT:');
    console.log('   Email:    ' + influencerEmail);
    console.log('   Password: ' + influencerPassword);
    console.log('   Access:   ✓ View assigned tasks');
    console.log('             ✓ Submit promotional videos');
    console.log('             ✓ Track earnings (₹2K-₹10K per video)');
    console.log('             ✓ Monitor 5% revenue share');
    console.log('             ✓ Access guidebook resources\n');
    
    console.log('='.repeat(70));
    console.log('\n🌐 Login URL: http://localhost:5000/login');
    console.log('📱 Platform: Cehpoint Innovation Movement');
    console.log('💰 Revenue Model: Fixed payouts + 5% performance share');
    console.log('📚 Mission: Building a Self-Reliant Digital India\n');

  } catch (error) {
    console.error('\n❌ Error during setup:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

setupPlatform();
