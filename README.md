# 🎯 Cehpoint Influence Partners - Complete Platform Guide

**India's #1 Influencer Marketing Platform for West Bengal & All India**

---

## 🚀 QUICK START - TEST CREDENTIALS

### 👨‍💼 Admin Login
```
Email:    admin@cehpoint.com
Password: Cehpoint@2025
```
**Access:** Full admin dashboard, influencer management, payment processing

### 🎯 Influencer Login
```
Email:    influencer@cehpoint.com
Password: Influencer@2025
```
**Access:** Task board, video submission, earnings tracking

**Login URL:** `/login`

---

## 💰 PAYMENT MODEL - QUALITY BASED

### ⚠️ IMPORTANT: Dynamic Pricing System

**We do NOT pay fixed amounts!** Payment is determined by:

1. **First Video Submission Analysis**
   - We review your first submitted video
   - Analyze video quality, editing, presentation
   - Evaluate your profile, engagement rate, audience demographics
   - Assess content authenticity and promotional effectiveness

2. **Custom Rate Assignment**
   - Based on analysis, we assign YOUR personalized rate
   - Rates typically range: ₹2,000 - ₹10,000 per video
   - Higher quality = Higher earnings
   - Better engagement = Better rates

3. **Performance Bonus**
   - 5% revenue share on all leads you generate
   - Paid monthly via UPI
   - No cap on performance earnings

**How It Works:**
1. Register → Get approved
2. Submit your FIRST video (following our guidelines)
3. We analyze quality + profile → Assign your custom rate
4. All future videos earn at YOUR assigned rate
5. Plus 5% of all revenue from your leads

---

## 📋 PROJECT OVERVIEW

A professional web platform for managing influencer collaborations across India. Influencers promote EdTech, AgriTech, and HealthTech solutions, earn based on quality, and receive performance bonuses.

### Technology Stack
- **Frontend:** Next.js 15 (React 19, TypeScript)
- **Styling:** Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Deployment:** Vercel (serverless)
- **Forms:** React Hook Form + Zod validation

---

## 🎨 KEY FEATURES

### For Influencers
- ✅ Quality-based earnings (₹2K-₹10K per video)
- ✅ 5% revenue share from generated leads
- ✅ Monthly task assignments (2 curated tasks)
- ✅ Pre-approval video workflow
- ✅ Comprehensive guidelines & sample scripts
- ✅ UPI payment processing
- ✅ Earnings dashboard

### For Admins
- ✅ Influencer approval & management
- ✅ Marketing project creation
- ✅ Task assignment system
- ✅ Video review & approval
- ✅ Custom rate assignment per influencer
- ✅ Payment processing
- ✅ Analytics dashboard

---

## ⚙️ FIRST-TIME SETUP

### Step 1: Environment Variables (Replit Secrets)

Add to Replit Secrets:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 2: Database Setup (Supabase)

1. Create Supabase project
2. Go to SQL Editor
3. Run `database-schema.sql` (full schema)
4. Create storage buckets:
   - Name: `documents` (public)
   - Name: `guidebooks` (public)

### Step 3: Disable Email Confirmation

1. Supabase → Authentication → Settings
2. Turn OFF "Enable email confirmations"
3. Save

### Step 4: Create Test Accounts

```bash
node scripts/setup-complete-platform.js
```

Wait for success message.

### Step 5: Run Development Server

```bash
npm run dev
```

Platform runs on port 5000 (configured for Replit webview).

---

## 🗂️ PROJECT STRUCTURE

```
├── components/
│   ├── ui/               # Reusable UI components
│   ├── Layout.tsx        # Main layout with navigation
│   └── FileUpload.tsx    # File upload component
├── contexts/
│   └── AuthContext.tsx   # Authentication state
├── lib/
│   ├── supabase.ts       # Supabase client
│   └── utils.ts          # Utility functions
├── pages/
│   ├── index.tsx         # Landing page
│   ├── login.tsx         # Login
│   ├── privacy.tsx       # Privacy Policy
│   ├── terms.tsx         # Terms of Service
│   ├── contact.tsx       # Contact page
│   ├── register/
│   │   └── influencer.tsx
│   ├── influencer/       # Influencer dashboard
│   └── admin/            # Admin dashboard
├── types/
│   └── index.ts          # TypeScript types
├── database-schema.sql   # Complete database schema
└── public/
    ├── sitemap.xml       # SEO sitemap
    └── robots.txt        # Search engine instructions
```

---

## 🎯 HOW THE PLATFORM WORKS

### Influencer Journey

1. **Registration**
   - Sign up with social media handles
   - Upload ID proof (Aadhaar/PAN)
   - Provide UPI ID for payments
   - Admin reviews & approves

2. **First Video Submission**
   - Receive task assignment
   - Follow guidelines & sample scripts
   - Submit first video for review
   - **Admin analyzes quality → Assigns your custom rate**

3. **Ongoing Work**
   - Receive 2 tasks per month
   - Create promotional videos
   - Get pre-approval before posting
   - Submit proof of posting
   - Earn at YOUR assigned rate + 5% revenue share

4. **Payment**
   - Fixed payment within 7 days (at your assigned rate)
   - Revenue share paid monthly (5% of leads)
   - All payments via UPI

### Admin Workflow

1. **Influencer Management**
   - Review applications
   - Approve/reject profiles
   - Analyze first video submission
   - **Assign custom payment rate per influencer**

2. **Task Assignment**
   - Create marketing projects
   - Assign 2 tasks per influencer/month
   - Provide guidelines & scripts

3. **Video Approval**
   - Review submissions (24-48 hours)
   - Approve/reject with feedback
   - Track posting proof

4. **Payment Processing**
   - Process fixed payouts (custom rates)
   - Calculate 5% revenue share
   - Track payment history

---

## 🔒 AUTHENTICATION & SECURITY

- Role-based access control (Influencer, Admin, Marketing)
- Supabase Auth with email/password
- Row Level Security (RLS) on all tables
- Protected routes with automatic redirection
- HTTPS enforced
- Environment variable secrets management

---

## 🚀 DEPLOYMENT TO VERCEL

### Prerequisites
- GitHub account
- Vercel account (free tier works)
- Supabase project setup

### Deployment Steps

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Production ready"
git branch -M main
git remote add origin https://github.com/yourusername/cehpoint-platform.git
git push -u origin main
```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Framework: Next.js (auto-detected)
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Click "Deploy"

3. **Configure Supabase**
   - Supabase → Authentication → URL Configuration
   - Add your Vercel URL: `https://your-app.vercel.app`

4. **Update SEO Files**
   - Update `public/sitemap.xml` with your domain
   - Update `public/robots.txt` with your domain

---

## 📊 DATABASE SCHEMA

Key tables:
- **users** - Authentication & role management
- **influencers** - Influencer profiles, custom payment rates
- **video_submissions** - Video submissions & approvals
- **post_proofs** - Proof of posting
- **payments** - Payment tracking
- **marketing_projects** - Campaign management
- **task_assignments** - Monthly task tracking

Complete schema in `database-schema.sql`

---

## 🎨 UI/UX DESIGN

### Design System
- **Primary Color:** Orange (#f97316)
- **Accent:** Red gradient
- **Typography:** Inter font
- **Style:** Corporate, professional, minimal icons
- **Responsive:** Mobile-first design

### Key Features
- Clean, professional layouts
- High-contrast CTAs (100% visible)
- Reduced icon usage (corporate aesthetic)
- Professional stock imagery
- Fast loading times

---

## 📱 POLICY PAGES

### Available Legal Pages
- ✅ `/privacy` - Privacy Policy (IT Act 2000 compliant)
- ✅ `/terms` - Terms of Service (India jurisdiction)
- ✅ `/contact` - Contact & FAQ

All pages accessible via footer links.

---

## 🔧 TROUBLESHOOTING

### "Invalid login credentials"
→ Run setup script: `node scripts/setup-complete-platform.js`

### "Cannot connect to database"
→ Check Supabase credentials in Replit Secrets

### "User not found"
→ Disable email confirmation in Supabase Auth settings

### "Tables do not exist"
→ Run `database-schema.sql` in Supabase SQL Editor

### Changes not visible on website
→ Restart workflow: Use Replit workflows panel or run `npm run dev`

---

## 📈 SEO OPTIMIZATION

✅ Complete Next.js SEO with meta tags  
✅ JSON-LD structured data  
✅ Sitemap.xml for search engines  
✅ Robots.txt configuration  
✅ West Bengal & India geo-targeting  
✅ Professional OG images for social sharing  
✅ Canonical URLs  

Optimized for: "influencer marketing West Bengal", "earn money influencer India", "EdTech promotion"

---

## 🔐 SECURITY CHECKLIST (Production)

Before going live:
- [ ] Change admin password
- [ ] Change influencer test password
- [ ] Enable email confirmation in Supabase
- [ ] Rotate Supabase keys
- [ ] Add real company email addresses
- [ ] Set up RLS policies (already in schema)
- [ ] Review privacy policy with lawyer
- [ ] Set up real UPI payment system
- [ ] Configure domain SSL certificate

---

## 📞 SUPPORT & CONTACT

**Email Addresses (Set up before production):**
- support@cehpoint.com - General support
- influencers@cehpoint.com - Influencer help
- partnerships@cehpoint.com - Business partnerships
- privacy@cehpoint.com - Privacy inquiries
- legal@cehpoint.com - Legal matters

**Location:** Kolkata, West Bengal, India

---

## 🎯 PLATFORM STATUS

**Version:** 2.0.0  
**Status:** ✅ Production Ready  
**Last Updated:** October 31, 2025

### What's Working
✅ Authentication system  
✅ Role-based access control  
✅ Influencer registration & approval  
✅ Video submission & review workflow  
✅ Quality-based payment system  
✅ Admin dashboard (full management)  
✅ Influencer dashboard (task & earnings)  
✅ UPI payment tracking  
✅ Policy pages (Privacy, Terms, Contact)  
✅ SEO optimization  
✅ Vercel deployment-ready  

### Before Production Launch
⚠️ Set up business email addresses  
⚠️ Change test passwords  
⚠️ Update policy pages with real company details  
⚠️ Legal review of terms & privacy policy  
⚠️ Configure payment gateway (Razorpay/Stripe)  

---

## 💡 DEVELOPER NOTES

### Making Changes
- **UI Updates:** Modify `components/ui/`
- **New Pages:** Add to `pages/` directory
- **Database Changes:** Update schema, run migration
- **Styling:** Use Tailwind classes
- **Types:** Update `types/index.ts`

### Code Style
- TypeScript for type safety
- Functional React components
- Tailwind CSS for styling
- No mock data - all from Supabase
- Error handling on all async operations

---

## 📄 LICENSE

Proprietary - Cehpoint Influence Partners

---

## ✅ QUICK VERIFICATION CHECKLIST

- [ ] Test credentials work (admin & influencer)
- [ ] Homepage loads with corporate design
- [ ] Privacy Policy accessible at `/privacy`
- [ ] Terms of Service accessible at `/terms`
- [ ] Contact page accessible at `/contact`
- [ ] Login redirects to correct dashboard
- [ ] Video submission workflow functional
- [ ] Payment model clearly explains quality-based pricing
- [ ] All buttons visible (no white-on-white issues)
- [ ] Mobile responsive design works

---

**Need Help?** Check the code comments or contact the development team.

**Platform built with ❤️ for West Bengal & India's digital economy.**
