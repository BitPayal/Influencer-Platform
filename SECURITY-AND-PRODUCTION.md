# 🔐 Security & Production Deployment Guide

## ⚠️ IMPORTANT SECURITY NOTICE

The current setup creates **demo accounts with publicly documented passwords**. This is **ONLY suitable for testing and development**. 

**DO NOT use these credentials in production without following the security hardening steps below.**

## 🎯 Current Setup (Development/Testing)

The quick setup creates these accounts for immediate testing:

```
Admin: admin@cehpoint.com / Cehpoint@2025
Influencer: influencer@cehpoint.com / Influencer@2025
```

**This is designed for:**
- ✓ Quick platform testing
- ✓ Demo and development
- ✓ Learning the platform features
- ✗ **NOT for production use**

## 🛡️ Production Hardening Steps

Before launching to real users, **YOU MUST** complete these security steps:

### 1. Change All Default Passwords

#### Method A: Through Supabase Dashboard
1. Go to Supabase Dashboard → Authentication → Users
2. Find `admin@cehpoint.com`
3. Click the user → "Send password reset email"
4. Use a strong, unique password (minimum 16 characters)
5. Repeat for `influencer@cehpoint.com`

#### Method B: Delete and Recreate with Secure Passwords
1. Delete the demo accounts from Supabase Authentication
2. Modify `scripts/setup-complete-platform.js`:
   ```javascript
   // Replace these with secure passwords or use environment variables
   const adminPassword = process.env.ADMIN_PASSWORD || 'YOUR_SECURE_PASSWORD_HERE';
   const influencerPassword = process.env.INFLUENCER_PASSWORD || 'YOUR_SECURE_PASSWORD_HERE';
   ```
3. Run the script again with secure passwords

### 2. Enable Email Confirmation

1. Go to Supabase Dashboard → Authentication → Settings
2. **Enable "Email confirmations"**
3. Configure email templates
4. This prevents unauthorized account creation

### 3. Set Up Row Level Security (RLS)

Your database schema should include RLS policies. Verify in Supabase:

1. Go to Supabase → Database → Policies
2. Ensure each table has appropriate RLS rules:
   - Users can only read their own data
   - Admins have elevated permissions
   - Influencers can only modify their own submissions

Example RLS policy for `influencers` table:
```sql
-- Enable RLS
ALTER TABLE influencers ENABLE ROW LEVEL SECURITY;

-- Influencers can read their own data
CREATE POLICY "Influencers can view own profile"
  ON influencers FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all
CREATE POLICY "Admins can view all influencers"
  ON influencers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### 4. Implement Password Policies

1. Go to Supabase → Authentication → Settings
2. Set minimum password length: **12+ characters**
3. Consider requiring:
   - Uppercase letters
   - Lowercase letters  
   - Numbers
   - Special characters

### 5. Add Two-Factor Authentication (Optional but Recommended)

Supabase supports 2FA out of the box:

1. Enable in Authentication → Settings
2. Users can enable via their profile
3. Strongly recommend for admin accounts

### 6. Environment Variable Security

Never commit sensitive data to version control:

```bash
# Add to .gitignore
.env
.env.local
*.secret
```

Use Replit Secrets for sensitive values:
- Database connection strings
- API keys
- Service account credentials

### 7. API Rate Limiting

Protect against brute force attacks:

1. Go to Supabase → Settings → API
2. Set rate limits for authentication endpoints
3. Monitor failed login attempts

### 8. Audit Logging

Enable comprehensive logging:

1. Track all admin actions
2. Log payment transactions
3. Monitor influencer submissions
4. Regular security audits

## 🚀 Production Deployment Checklist

Before going live:

- [ ] Changed all default passwords to secure values
- [ ] Enabled email confirmation in Supabase
- [ ] Verified Row Level Security policies on all tables
- [ ] Set minimum password requirements (12+ chars)
- [ ] Enabled 2FA for admin accounts
- [ ] Configured proper error handling (no sensitive data in errors)
- [ ] Set up monitoring and alerting
- [ ] Configured backup strategy
- [ ] Set up SSL/HTTPS (auto on Vercel/Replit)
- [ ] Reviewed and updated privacy policy
- [ ] Conducted security audit/penetration testing
- [ ] Set up rate limiting
- [ ] Configured CORS properly
- [ ] Enabled audit logging

## 🔍 Security Best Practices

### For Admin Users
1. Use unique, strong passwords (password manager recommended)
2. Enable 2FA immediately
3. Never share admin credentials
4. Regularly review user permissions
5. Monitor suspicious activity
6. Keep all dependencies updated

### For Influencer Users  
1. Use strong, unique passwords
2. Enable 2FA if available
3. Never share account credentials
4. Report suspicious activity
5. Keep contact information updated

### For Platform Operators
1. Regular security audits
2. Keep dependencies updated (`npm audit`)
3. Monitor Supabase dashboard for anomalies
4. Regular database backups
5. Incident response plan
6. Security awareness training

## ⚙️ Recommended Production Setup

### 1. Use Environment-Based Configuration

Create different configurations for dev/staging/prod:

```javascript
// config/security.js
const securityConfig = {
  development: {
    emailConfirmation: false,
    minPasswordLength: 8,
    requireMfa: false,
  },
  production: {
    emailConfirmation: true,
    minPasswordLength: 16,
    requireMfa: true,
    rateLimit: {
      login: '5 attempts per 15 minutes',
      api: '100 requests per minute'
    }
  }
};
```

### 2. Implement Secure Account Creation

For production influencer registration:

1. Require email verification
2. Manual admin approval before activation
3. ID proof verification
4. Phone number verification (OTP)

### 3. Payment Security

Since this platform handles payments:

1. Use secure UPI transaction IDs
2. Never store UPI PINs or passwords
3. Log all payment transactions
4. Regular audit of payment records
5. Implement payment reconciliation

## 📊 Monitoring & Alerts

Set up alerts for:

- Multiple failed login attempts
- Unusual admin activity
- Large payment transactions
- New user registrations
- Database errors
- API errors

## 🆘 Incident Response

If a security breach occurs:

1. **Immediately** disable compromised accounts
2. Force password reset for all users
3. Review audit logs
4. Identify breach scope
5. Notify affected users
6. Fix vulnerability
7. Document incident
8. Update security procedures

## 📚 Additional Resources

- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)

## ⏭️ Next Steps

1. **Development/Testing**: Use the current setup as-is to test features
2. **Before Real Users**: Complete the production hardening checklist above
3. **Ongoing**: Regular security audits and updates

---

**Remember:** Security is not a one-time task. It's an ongoing process.  
**Start secure, stay secure. 🔐**
