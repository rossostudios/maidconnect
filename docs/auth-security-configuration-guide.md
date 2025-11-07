# Auth Security Configuration Guide

**Status:** 🔧 Action Required
**Priority:** High (Security)
**Owner:** DevOps / Security Team
**Created:** 2025-11-07

## Executive Summary

Supabase security advisor identified **2 auth configuration warnings** that require manual configuration in the Supabase dashboard. These settings cannot be changed via database migrations and must be configured through the Supabase Auth settings.

## Required Configuration Changes

### 1. Enable Password Leak Detection (HaveIBeenPwned Integration)

**Issue:** Leaked password protection is currently disabled
**Impact:** Users can set passwords that have been compromised in data breaches
**Severity:** 🔴 High

#### What is HaveIBeenPwned (HIBP)?

[HaveIBeenPwned](https://haveibeenpwned.com/) is a free service that maintains a database of billions of leaked passwords from data breaches. When enabled, Supabase checks user passwords against this database and rejects passwords that have been compromised.

**How it works:**
1. User attempts to set password "password123"
2. Supabase hashes the password using SHA-1
3. Sends first 5 characters of hash to HIBP API (k-anonymity model)
4. HIBP returns list of leaked password hashes with matching prefix
5. Supabase checks if full hash is in the list
6. If found: Reject password with error message
7. If not found: Allow password

**Privacy:** Only the first 5 characters of the password hash are sent to HIBP, ensuring your users' actual passwords are never transmitted.

#### How to Enable

**Option 1: Supabase Dashboard (Recommended)**

1. Go to https://supabase.com/dashboard/project/[YOUR_PROJECT_ID]/auth/policies
2. Navigate to **Authentication** → **Policies**
3. Find **Password Policy** section
4. Enable **"Check passwords against HaveIBeenPwned"**
5. Click **Save**

**Option 2: Management API**

```bash
# Using Supabase Management API
curl -X PATCH \
  https://api.supabase.com/v1/projects/[PROJECT_REF]/config/auth \
  -H "Authorization: Bearer [SUPABASE_MANAGEMENT_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "password_policy": {
      "hibp_enabled": true
    }
  }'
```

#### User Impact

**Sign-up flow:**
```typescript
// Before: Any password accepted
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123' // ❌ Common leaked password, but accepted
});

// After: Leaked passwords rejected
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123' // ❌ Rejected with error
});

// Error message:
// {
//   message: "Password has been found in a data breach. Please use a different password.",
//   status: 422
// }
```

**Error Handling in Application:**

Update your sign-up/password-change forms to handle this error:

```typescript
// src/app/[locale]/auth/sign-up/page.tsx
try {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    if (error.message.includes('data breach')) {
      // Show user-friendly message
      setError('This password has been compromised in a data breach. Please choose a different password for your security.');
    } else {
      setError(error.message);
    }
  }
} catch (err) {
  // Handle error
}
```

#### Testing

After enabling, test with known leaked passwords:
- ✅ Should reject: "password123", "123456", "qwerty"
- ✅ Should accept: Strong unique passwords like "Tr0ub4dor&3.!"

---

### 2. Configure Additional MFA Options

**Issue:** Insufficient MFA options enabled
**Impact:** Users have limited choices for two-factor authentication
**Severity:** 🟡 Medium

#### Available MFA Methods in Supabase

1. **Time-based One-Time Password (TOTP)** ✅ Recommended
   - Apps: Google Authenticator, Authy, 1Password, etc.
   - Works offline
   - Industry standard

2. **Phone MFA (SMS)** ⚠️ Not Recommended
   - Vulnerable to SIM swapping attacks
   - Costs money (Twilio integration required)
   - Less secure than TOTP

3. **WebAuthn (Passkeys)** ✅ Highly Recommended
   - Biometric authentication (Face ID, Touch ID, Windows Hello)
   - Hardware security keys (YubiKey, etc.)
   - Most secure option
   - Best user experience

#### Current Configuration

Check current MFA status:
```bash
# Query via Supabase dashboard:
# Settings → Authentication → Multi-Factor Authentication
```

#### Recommended Configuration

**Enable TOTP (Time-based OTP):**

1. Go to **Authentication** → **Multi-Factor Authentication** in Supabase dashboard
2. Enable **TOTP (Authenticator Apps)**
3. Configure settings:
   - Issuer name: "MaidConnect" (appears in authenticator apps)
   - Enable for: "All users" or "Optional"
   - QR code size: 200px (default)

**Enable WebAuthn (Passkeys):**

1. In same MFA settings section
2. Enable **WebAuthn/Passkeys**
3. Configure:
   - Relying Party Name: "MaidConnect"
   - Relying Party ID: "maidconnect.com" (your production domain)
   - Allow cross-origin: false (more secure)

#### Implementation in Application

**1. Add MFA Enrollment Flow**

```typescript
// src/app/[locale]/dashboard/settings/security/page.tsx
async function enrollMFA() {
  // Enroll TOTP
  const { data: { id, totp } } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    issuer: 'MaidConnect',
    friendlyName: 'Authenticator App',
  });

  // Show QR code to user
  const qrCodeUrl = totp.qr_code;
  const secret = totp.secret;

  // Display QR code and secret for manual entry
  // User scans with authenticator app
  // User enters 6-digit code to verify

  // Verify enrollment
  const code = getUserInputCode(); // Get 6-digit code from user
  const { data, error } = await supabase.auth.mfa.verify({
    factorId: id,
    code,
  });

  if (!error) {
    // MFA enrolled successfully!
    // Show backup codes to user
  }
}
```

**2. Add MFA Challenge During Sign-In**

```typescript
// src/app/[locale]/auth/sign-in/page.tsx
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

if (data?.user && !error) {
  // Check if user has MFA enabled
  const { data: { factors } } = await supabase.auth.mfa.listFactors();

  if (factors && factors.length > 0) {
    // Redirect to MFA challenge page
    router.push('/auth/mfa-challenge');
  } else {
    // No MFA, proceed to dashboard
    router.push('/dashboard');
  }
}
```

**3. MFA Challenge Page**

```typescript
// src/app/[locale]/auth/mfa-challenge/page.tsx
async function verifyMFA(code: string) {
  const { data: { factors } } = await supabase.auth.mfa.listFactors();
  const totpFactor = factors?.find(f => f.factor_type === 'totp');

  if (!totpFactor) return;

  const { data, error } = await supabase.auth.mfa.challengeAndVerify({
    factorId: totpFactor.id,
    code,
  });

  if (!error) {
    // MFA verified, user is fully authenticated
    router.push('/dashboard');
  } else {
    setError('Invalid code. Please try again.');
  }
}
```

#### User Flow

**Enrollment:**
1. User goes to Settings → Security
2. Clicks "Enable Two-Factor Authentication"
3. Chooses TOTP or WebAuthn
4. For TOTP: Scans QR code with authenticator app
5. Enters 6-digit verification code
6. Saves backup codes (10 single-use codes)
7. MFA is now active

**Sign-in with MFA:**
1. User enters email + password
2. After password validation, prompted for 6-digit code
3. User opens authenticator app, enters code
4. If correct: Signed in
5. If incorrect: Retry (max 3 attempts before lockout)

#### Testing

After enabling, test MFA flows:

```bash
# Test enrollment
bun test tests/auth/mfa-enrollment.spec.ts

# Test sign-in with MFA
bun test tests/auth/mfa-signin.spec.ts

# Test backup code recovery
bun test tests/auth/mfa-recovery.spec.ts
```

---

## Configuration Checklist

### Pre-Deployment

- [ ] Review current password policy in Supabase dashboard
- [ ] Document current auth settings (backup)
- [ ] Review HIBP privacy policy with legal team
- [ ] Plan user communication (email about new security features)
- [ ] Update error messages in sign-up/sign-in forms
- [ ] Test with leaked passwords (password123, etc.)

### Deployment

- [ ] Enable HIBP password checking in Supabase dashboard
- [ ] Enable TOTP MFA in Supabase dashboard
- [ ] Enable WebAuthn/Passkeys in Supabase dashboard
- [ ] Update environment variables (if needed)
- [ ] Deploy frontend changes for MFA UI
- [ ] Test all auth flows (sign-up, sign-in, password reset)

### Post-Deployment

- [ ] Monitor auth error rates (watch for HIBP rejections)
- [ ] Send email to users about MFA availability
- [ ] Create help center article about MFA setup
- [ ] Track MFA adoption rate
- [ ] Review auth logs for any issues

### User Communication

**Email Template: New Security Features**

```
Subject: New Security Features: Stronger Password Protection

Hi [User Name],

We've added new security features to protect your MaidConnect account:

🔒 Enhanced Password Security
We now check passwords against a database of compromised passwords to keep your account safe. If you're using a common or leaked password, you'll be prompted to choose a stronger one.

🛡️ Two-Factor Authentication (Optional)
You can now enable two-factor authentication (2FA) for an extra layer of security. Go to Settings → Security to set it up.

No action required - these features are active now.

Thanks,
The MaidConnect Security Team
```

---

## Success Metrics

### Security Improvements

- [ ] HIBP enabled: ✅
- [ ] TOTP MFA enabled: ✅
- [ ] WebAuthn enabled: ✅
- [ ] Zero auth configuration warnings in Supabase advisor
- [ ] Password rejection rate < 5% (indicates good security without UX friction)

### Adoption Metrics

Track over time:
- % users with MFA enabled (target: 20% within 3 months)
- % passwords rejected by HIBP (baseline security posture)
- MFA usage by user role (expect higher adoption for professionals)
- Support tickets related to MFA (should decrease after first week)

---

## Rollback Plan

If issues arise:

1. **Disable HIBP:** Uncheck box in Supabase dashboard → Authentication → Policies
2. **Disable MFA:** Uncheck TOTP/WebAuthn in Multi-Factor Authentication settings
3. **Remove MFA UI:** Deploy frontend without MFA enrollment pages
4. **Communicate:** Email users about temporary auth changes

---

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase MFA Setup Guide](https://supabase.com/docs/guides/auth/auth-mfa)
- [HaveIBeenPwned k-Anonymity Model](https://haveibeenpwned.com/API/v3#PwnedPasswords)
- [WebAuthn Guide](https://webauthn.guide/)
- [NIST Password Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)

---

**Last Updated:** 2025-11-07
**Action Required By:** DevOps Team
**Estimated Time:** 2-3 hours (configuration + testing)
**Deployment Window:** Low-traffic hours (recommended)
