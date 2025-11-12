# Supabase Authentication Configuration Guide

This guide walks you through enabling additional security features for Casaora's authentication system.

## 🔐 Enable Leaked Password Protection

Prevent users from using compromised passwords by integrating with HaveIBeenPwned.org.

### Steps:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your Casaora project
3. Navigate to **Authentication** → **Providers** (left sidebar)
4. Scroll to "Advanced Settings"
5. Find **"Leaked Password Protection"**
6. Toggle it **ON**
7. Click **Save**

### What This Does:

- Checks passwords against HaveIBeenPwned's database of 600M+ compromised passwords
- Prevents users from using passwords that have been leaked in data breaches
- Improves overall account security

### Documentation:
[Supabase Password Security Guide](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)

---

## 🔢 Enable Multi-Factor Authentication (MFA)

Add additional layers of security with multiple MFA options.

### Current Status:
- ✅ One MFA method enabled

### Recommended Additional Methods:

#### 1. Enable TOTP (Time-Based One-Time Password)

**Steps:**
1. Go to **Authentication** → **Settings**
2. Scroll to "Multi-Factor Authentication"
3. Find **"TOTP (Authenticator App)"**
4. Toggle it **ON**
5. Configure time window (default: 30 seconds)
6. Click **Save**

**User Experience:**
- Users can use apps like Google Authenticator, Authy, or 1Password
- Generates 6-digit codes that change every 30 seconds
- Most secure and reliable MFA method

#### 2. Enable SMS-Based MFA (Optional)

**Steps:**
1. Configure Twilio or another SMS provider
2. Go to **Authentication** → **Settings** → **Phone**
3. Add your SMS provider credentials
4. Enable "Phone Sign-In"
5. Enable "SMS MFA"
6. Click **Save**

**Considerations:**
- Requires SMS provider setup (cost per SMS)
- Less secure than TOTP (SIM swapping attacks)
- Better user experience for non-technical users

### Documentation:
[Supabase MFA Guide](https://supabase.com/docs/guides/auth/auth-mfa)

---

## 🔑 Password Strength Requirements

Ensure passwords meet security standards.

### Current Settings:

**Minimum Requirements:**
- At least 8 characters
- Case-sensitive validation

### Recommended Settings:

1. Go to **Authentication** → **Settings**
2. Find "Password Requirements"
3. Configure:
   - **Minimum Length:** 12 characters (recommended)
   - **Require Uppercase:** Yes
   - **Require Lowercase:** Yes
   - **Require Numbers:** Yes
   - **Require Special Characters:** Yes (optional)
4. Click **Save**

---

## 🛡️ Session Management

Configure session timeouts and refresh tokens.

### Recommended Settings:

1. Go to **Authentication** → **Settings**
2. Find "Session Settings"
3. Configure:
   - **Access Token Lifetime:** 3600 seconds (1 hour) - default
   - **Refresh Token Lifetime:** 2592000 seconds (30 days) - default
   - **Refresh Token Rotation:** Enabled (recommended)
4. Click **Save**

---

## 🔒 Email Verification

Ensure all users verify their email addresses.

### Steps:

1. Go to **Authentication** → **Settings**
2. Find "Email Verification"
3. Toggle **"Require Email Verification"** to **ON**
4. Configure:
   - **Verification Email Template** (customize if needed)
   - **Redirect URL:** `https://casaora.com/auth/sign-in`
5. Click **Save**

---

## 🚫 Rate Limiting (Already Implemented)

Casaora already implements rate limiting in code. No additional configuration needed.

**Current Implementation:**
- Sign-up: Limited per IP address
- Sign-in: Limited per IP address
- Password reset: Limited per email

**Location:** [src/lib/rate-limit.ts](../../src/lib/rate-limit.ts)

---

## 📧 Email Provider Configuration

Ensure emails are delivered reliably.

### Current Setup:
- Using Supabase's default email provider

### Recommended: Use Custom SMTP Provider

**Benefits:**
- Better deliverability
- Custom branding
- Higher sending limits

**Recommended Providers:**
- Resend (modern, developer-friendly)
- SendGrid
- AWS SES
- Postmark

**Steps:**
1. Go to **Authentication** → **Settings** → **Email**
2. Toggle "Enable Custom SMTP"
3. Add your SMTP credentials
4. Customize email templates
5. Click **Save**

---

## 🔍 Audit Logging

Enable audit logs to track authentication events.

### Steps:

1. Go to **Settings** → **Audit Logs**
2. Toggle **"Enable Audit Logs"** to **ON**
3. Configure retention period (default: 7 days)
4. Click **Save**

**What Gets Logged:**
- User sign-ups
- Login attempts (successful and failed)
- Password resets
- Email changes
- MFA enrollments
- Session refreshes

---

## ✅ Security Checklist

After completing this guide, verify:

- [ ] Leaked password protection enabled
- [ ] At least 2 MFA methods enabled (TOTP recommended)
- [ ] Password requirements strengthened (12+ characters)
- [ ] Email verification required
- [ ] Session timeouts configured
- [ ] Custom SMTP provider configured (recommended)
- [ ] Audit logging enabled
- [ ] Rate limiting verified (already implemented in code)

---

## 🧪 Testing Authentication

### Test Sign-Up Flow:

1. Try signing up with a weak password → Should be rejected
2. Try signing up with a compromised password (e.g., "password123") → Should be rejected
3. Sign up with a strong password → Should succeed
4. Check email for verification → Should receive email
5. Verify email → Should redirect to sign-in page

### Test MFA Enrollment:

1. Sign in to a test account
2. Go to Account Settings
3. Enable MFA
4. Scan QR code with authenticator app
5. Enter 6-digit code → Should succeed
6. Sign out
7. Sign in again → Should prompt for MFA code

### Test Rate Limiting:

1. Attempt multiple failed sign-ins (5+ attempts)
2. Should see rate limit error
3. Wait 5 minutes
4. Try again → Should work

---

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [NIST Password Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)

---

**Last Updated:** January 11, 2025
**Maintained By:** Casaora Security Team
