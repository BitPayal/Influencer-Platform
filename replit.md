# Cehpoint Influence Partners - Influencer Platform

## Project Overview

A professional web platform for managing influencer collaborations and local marketing campaigns across India. The platform enables influencers to register, submit promotional videos, and receive payments while providing admin tools for approval workflows and analytics.

## Technology Stack

- **Frontend**: Next.js 15 (React 19, TypeScript)
- **Styling**: Tailwind CSS with custom design system
- **Backend**: Supabase (PostgreSQL + Authentication + Storage)
- **Deployment**: Designed for Vercel (serverless)
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

## Project Structure

```
├── components/
│   ├── ui/               # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   └── Table.tsx
│   ├── Layout.tsx        # Main layout with navigation
│   └── FileUpload.tsx    # File upload component
├── contexts/
│   └── AuthContext.tsx   # Authentication state management
├── lib/
│   ├── supabase.ts       # Supabase client configuration
│   └── utils.ts          # Utility functions
├── pages/
│   ├── index.tsx         # Landing page
│   ├── login.tsx         # Login page
│   ├── register/
│   │   └── influencer.tsx # Influencer registration
│   ├── influencer/       # Influencer dashboard pages
│   │   ├── dashboard.tsx
│   │   ├── videos.tsx
│   │   ├── payments.tsx
│   │   └── guidelines.tsx
│   └── admin/            # Admin dashboard pages
│       ├── dashboard.tsx
│       ├── influencers.tsx
│       ├── videos.tsx
│       └── payments.tsx
├── types/
│   └── index.ts          # TypeScript type definitions
└── database-schema.sql   # Complete database schema for Supabase
```

## Key Features

### For Influencers

1. **Registration & Onboarding**
   - Complete profile with social media handles
   - ID proof upload (Aadhaar/PAN)
   - UPI ID for payments
   - District-wise tagging
   - Follower count tracking for revenue tier assignment

2. **Monthly Task Assignments**
   - Receive 2 curated tasks per month
   - Focus on IT services, EdTech, AgriTech, HealthTech promotion
   - Complete guidelines and sample scripts provided
   - Task progress tracking and completion status

3. **Innovation Playbook Access**
   - Access Cehpoint Innovation Movement guidebook
   - Marketing strategies for IT service promotion
   - Industry-specific content ideas (6 sectors)
   - Sample post templates and scripts

4. **Video Management**
   - Submit videos linked to assigned tasks
   - Pre-approval before posting
   - Track approval status
   - Upload proof of posting

5. **Enhanced Payment Tracking**
   - Follower-based payout tiers: ₹2K-₹10K per video
   - 5% revenue share from generated leads
   - View earnings breakdown (fixed + performance)
   - Monthly revenue calculations
   - UPI transaction tracking

6. **Guidelines & Support**
   - Comprehensive promotion guidelines for IT services
   - Do's and don'ts
   - Content creation best practices
   - 30-day no-delete policy

### For Admins

1. **Dashboard & Analytics**
   - Overview of all influencers
   - Pending approvals count
   - District-wise coverage map
   - Payment statistics
   - Active tasks and completion rates

2. **Marketing Project Management**
   - Create IT service promotion campaigns
   - Define objectives and target audiences
   - Set guidelines and sample scripts
   - Manage multiple projects simultaneously

3. **Task Assignment System**
   - Create monthly promotional tasks
   - Assign 2 tasks per influencer automatically
   - Define topics (EdTech, AgriTech, HealthTech, Tourism, Finance, Retail)
   - Set deliverables and guidelines
   - Track task completion across influencers

4. **Influencer Management**
   - Review applications
   - Approve/reject influencers
   - View complete profiles
   - Track performance and follower bands

5. **Video Approval System**
   - Review task-linked video submissions
   - Approve/reject with reasons
   - Track submission history
   - Monitor compliance with guidelines

6. **Revenue Share Management**
   - Automatic calculation by follower band
   - Track fixed payouts (₹2K-₹10K per video)
   - Monitor 5% performance share
   - Lead revenue tracking
   - Monthly revenue distribution reports
   - Export payment reports

7. **Guidebook Management**
   - Upload training materials and resources
   - Manage Innovation Playbook
   - Set access levels (all/influencer/admin)
   - Track resource usage

## Environment Setup

### Required Environment Variables

Add these to Replit Secrets:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development Setup

1. Ensure environment variables are set in Replit Secrets
2. Install dependencies: `npm install` (already done)
3. Run development server: `npm run dev`
4. Server runs on port 5000

## Database Schema

The complete database schema is in `database-schema.sql`. Key tables:

- **users**: Authentication and role management
- **influencers**: Influencer profiles and status
- **video_submissions**: Video submissions and approvals
- **post_proofs**: Proof of posting with links/screenshots
- **payments**: Payment tracking and history
- **promotion_guidelines**: Content guidelines

## Authentication & Authorization

- **Role-based access control**: Influencer, Admin, Marketing
- **Supabase Auth**: Email/password authentication
- **Row Level Security (RLS)**: Database-level access control
- **Protected routes**: Automatic redirection based on role

## UI/UX Design

### Design System

- **Primary Color**: Blue (#0ea5e9)
- **Typography**: Inter font family
- **Components**: Professional, corporate aesthetic
- **Responsive**: Mobile-first design
- **Accessibility**: WCAG compliant

### Key Design Features

- Clean, professional layouts
- Consistent spacing and typography
- Clear visual hierarchy
- Intuitive navigation
- Loading states and error handling
- Modal dialogs for actions
- Badge system for status indicators

## Deployment

### To Vercel

1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy with default Next.js settings
4. See `DEPLOYMENT.md` for detailed instructions

### Database Migration

1. Create Supabase project
2. Run `database-schema.sql` in SQL Editor
3. Create storage bucket named `documents`
4. Configure authentication settings

## Developer Guidelines

### Code Style

- TypeScript for type safety
- Functional React components
- Custom hooks for reusable logic
- Tailwind CSS for styling
- Component composition

### Best Practices

- No mock data - all data from Supabase
- Error handling on all async operations
- Loading states for better UX
- Input validation with Zod
- Secure file uploads
- RLS policies for data security

## Workflow Configuration

**Current Workflow**: `dev-server`
- Command: `npm run dev`
- Port: 5000
- Type: webview
- Status: Active

## Recent Changes

**October 31, 2025 - Final Corporate Refinement**
- **Corporate UI/UX**: Transformed to professional corporate design with reduced icon usage, cleaner layout, better visual hierarchy
- **Icon Optimization**: Reduced from 6+ icon boxes to 4 essential features with checkmarks for corporate aesthetic
- **CTA Button Fix**: Fixed "Ready to Start Earning?" section - changed white-on-gradient button to dark gray for 100% visibility
- **Professional Layout**: Streamlined design with proper spacing, organized sections, genuine business appearance
- **Test Credentials**: Created TEST-CREDENTIALS.md with clear admin and influencer login details
- **Professional Images**: Integrated stock images (influencer hero, West Bengal background) for authentic business look
- **Comprehensive SEO**: Complete Next.js SEO with meta tags, JSON-LD, sitemap.xml, robots.txt, West Bengal & India geo-targeting
- **SEO Assets**: Generated professional logo.png and og-image.jpg for social media previews
- **Business Enhancement**: Clear value proposition with earnings transparency (₹2K-₹10K + 5% revenue share), social proof
- Platform now has polished, corporate appearance optimized for West Bengal and India rankings

**Earlier - October 31, 2025 - Innovation Movement Enhancement**
- Rebranded to "Cehpoint Innovation Movement" platform
- Enhanced database schema with task management system
- Added monthly task assignments (2 tasks per influencer/month)
- Implemented revenue sharing with follower bands (₹2K-₹10K per video)
- Created marketing projects and promotional topics for IT services
- Added guidebook resource management for training materials
- Comprehensive setup documentation and seed data scripts
- Enhanced TypeScript types for all new features
- Fixed security issues and type safety improvements

**October 30, 2025**
- Initial platform development
- Complete influencer and admin workflows
- Professional UI component library
- Supabase integration
- Authentication system
- Video submission system
- Payment tracking
- Deployment documentation

## Maintainability

### For Future Developers

1. **Code Organization**: Clear folder structure with separation of concerns
2. **Type Safety**: Full TypeScript coverage
3. **Reusability**: Component library for consistent UI
4. **Documentation**: Inline comments and this README
5. **Scalability**: Serverless architecture, can handle growth
6. **Easy Deployment**: One-click Vercel deployment

### Making Changes

1. **UI Updates**: Modify components in `components/ui/`
2. **New Pages**: Add to `pages/` directory
3. **Database Changes**: Update schema and run migrations
4. **Styling**: Use Tailwind classes or update `globals.css`
5. **Types**: Update `types/index.ts` for new data structures

## Support & Maintenance

### Common Tasks

- **Add Admin User**: Run SQL in Supabase to insert admin user
- **Update Guidelines**: Edit content in `pages/influencer/guidelines.tsx`
- **Change Colors**: Update `tailwind.config.js`
- **Add Features**: Follow existing patterns in respective directories

### Monitoring

- Vercel Analytics for performance
- Supabase Dashboard for database metrics
- Browser console for frontend errors
- Server logs for backend issues

## Security Considerations

✓ Environment variables for secrets  
✓ RLS policies on all tables  
✓ Input validation on forms  
✓ Secure file uploads  
✓ HTTPS enforced  
✓ CSRF protection (Next.js built-in)  
✓ SQL injection prevention (Supabase)  
✓ XSS prevention (React built-in)

## Future Enhancements

Potential improvements for future versions:

1. Automated payment processing (Razorpay/Stripe)
2. SMS notifications for approvals
3. Advanced analytics dashboard
4. Bulk video approval
5. Performance-based influencer tiers
6. Mobile app (React Native)
7. Referral program
8. Automated revenue calculation
9. Multi-language support
10. District coverage map visualization

## Demo Accounts

After running the setup script, you can login with these credentials:

### Admin Account
- Email: `admin@cehpoint.com`
- Password: `Cehpoint@2025`
- Access: Full platform management

### Influencer Account  
- Email: `influencer@cehpoint.com`
- Password: `Influencer@2025`
- Access: Task board, revenue tracking, guidebook

## License

Proprietary - Cehpoint Influence Partners

---

**Platform Status**: Production Ready  
**Last Updated**: October 31, 2025  
**Version**: 2.0.0
