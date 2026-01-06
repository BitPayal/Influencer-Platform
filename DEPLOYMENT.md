# Deployment Guide - Cehpoint Marketing Partners

This guide will help you deploy the platform to Vercel with Supabase backend.

## Prerequisites

1. A Vercel account (free tier is fine)
2. A Supabase account (free tier is fine)
3. Git repository for your code

## Step 1: Set Up Supabase

### 1.1 Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and sign in
2. Create a new project
3. Note down your:
   - Project URL (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
   - Anon/Public Key (found in Settings > API)

### 1.2 Create Database Tables

1. Go to the SQL Editor in your Supabase dashboard
2. Copy the entire content of `database-schema.sql` from this project
3. Paste and run it in the SQL Editor
4. Verify all tables were created successfully

### 1.3 Create Storage Bucket

1. Go to Storage in your Supabase dashboard
2. Create a new bucket named `documents`
3. Set it as public or configure RLS policies as needed
4. This will store influencer ID proofs and other documents

### 1.4 Create Admin User

1. Go to Authentication > Users in Supabase
2. Create a new user with your admin email
3. Copy the user UUID
4. Go to SQL Editor and run:
   ```sql
   INSERT INTO users (id, email, role) 
   VALUES ('your-user-uuid-here', 'your-admin-email@example.com', 'admin');
   ```

## Step 2: Configure Environment Variables

### 2.1 For Replit (Development)

1. In Replit, go to Secrets (lock icon in sidebar)
2. Add the following secrets:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key

### 2.2 For Vercel (Production)

You'll add these during deployment (see Step 3).

## Step 3: Deploy to Vercel

### 3.1 Prepare Your Code

1. Make sure all your code is committed to a Git repository (GitHub, GitLab, or Bitbucket)
2. Ensure `.env.local` is in your `.gitignore` (it already is)

### 3.2 Deploy

1. Go to [Vercel](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your Git repository
4. Configure the project:
   - Framework Preset: **Next.js**
   - Root Directory: `./` (leave as is)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

5. Add Environment Variables:
   - Click "Environment Variables"
   - Add:
     - Name: `NEXT_PUBLIC_SUPABASE_URL`
     - Value: Your Supabase project URL
     - Environment: Production, Preview, and Development
   - Add:
     - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - Value: Your Supabase anon key
     - Environment: Production, Preview, and Development

6. Click "Deploy"

### 3.3 Configure Domain (Optional)

1. Once deployed, Vercel will give you a `.vercel.app` domain
2. To use a custom domain:
   - Go to your project settings
   - Click "Domains"
   - Add your custom domain
   - Follow the DNS configuration instructions

## Step 4: Post-Deployment Configuration

### 4.1 Update Supabase Authentication

1. In Supabase, go to Authentication > URL Configuration
2. Add your Vercel deployment URL to:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: Add your Vercel URL

### 4.2 Test the Platform

1. Visit your deployed URL
2. Try creating an influencer account
3. Log in as admin and approve the influencer
4. Test video submissions and other features

## Step 5: Maintenance & Updates

### 5.1 Updating the Code

1. Make changes in your development environment (Replit)
2. Test thoroughly
3. Commit and push to your Git repository
4. Vercel will automatically redeploy

### 5.2 Database Migrations

If you need to update the database schema:

1. Write migration SQL
2. Test in development first
3. Apply to production via Supabase SQL Editor
4. Document the changes

### 5.3 Monitoring

- Monitor usage in Vercel dashboard
- Check Supabase database usage
- Set up alerts for errors (Vercel Integrations)

## Troubleshooting

### Issue: Environment variables not working

- Make sure they're prefixed with `NEXT_PUBLIC_`
- Redeploy after adding new environment variables
- Check they're set for all environments

### Issue: Authentication not working

- Verify Supabase URL configuration
- Check redirect URLs in Supabase settings
- Ensure RLS policies are correctly set

### Issue: File uploads failing

- Verify storage bucket is created
- Check bucket is public or has correct RLS policies
- Ensure bucket name matches code (`documents`)

### Issue: 404 errors on pages

- Clear cache and rebuild
- Check that all pages are committed to Git
- Verify build succeeded in Vercel dashboard

## Security Best Practices

1. **Never commit secrets** - Use environment variables only
2. **Use RLS policies** - Already configured in schema
3. **Validate input** - Frontend and backend validation in place
4. **HTTPS only** - Enforced by Vercel automatically
5. **Regular updates** - Keep dependencies updated
6. **Monitor logs** - Check Vercel and Supabase logs regularly

## Cost Estimates

### Free Tier Limits

**Vercel Free Tier:**
- 100 GB bandwidth/month
- Unlimited deployments
- Serverless function executions

**Supabase Free Tier:**
- 500 MB database
- 1 GB file storage
- 50,000 monthly active users

For a small to medium influencer network (up to 100 influencers), the free tiers should be sufficient initially.

## Support

For platform-specific issues:
- **Vercel**: [Vercel Documentation](https://vercel.com/docs)
- **Supabase**: [Supabase Documentation](https://supabase.com/docs)
- **Next.js**: [Next.js Documentation](https://nextjs.org/docs)

## Next Steps After Deployment

1. Create admin accounts for your marketing team
2. Set up payment tracking workflows
3. Customize promotion guidelines
4. Add your brand assets and styling
5. Test the complete influencer journey
6. Launch and onboard your first influencers!
