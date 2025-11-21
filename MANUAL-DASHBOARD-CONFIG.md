# Manual Supabase Dashboard Configuration Steps

**Date:** November 20, 2025
**Database:** hvnetxfsrtplextvtwfx.supabase.co (PRODUCTION)
**Status:** AWAITING MANUAL CONFIGURATION

---

## Overview

All database migration work is complete (Priorities 1-4). The remaining security enhancements require **manual configuration** through the Supabase Dashboard UI, as these settings are not accessible via SQL migrations.

**Estimated Time:** 10-15 minutes
**Dashboard Location:** Authentication → Settings

---

## Configuration Steps

### Step 1: Enable Leaked Password Protection

**Purpose:** Prevent users from using passwords that have been compromised in known data breaches.

**Location:** Supabase Dashboard → Authentication → Settings → Password & MFA Settings

**Steps:**
1. Log into [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `hvnetxfsrtplextvtwfx`
3. Navigate to **Authentication** (left sidebar)
4. Click **Settings** tab
5. Scroll to **Password & MFA Settings** section
6. Find **"Leaked Password Protection"**
7. Toggle **ON** the setting: "Enable leaked password protection (powered by HaveIBeenPwned.org)"

**Impact:**
- ✅ Prevents users from creating accounts with passwords found in data breach databases
- ✅ Uses HaveIBeenPwned.org's k-anonymity API (privacy-preserving)
- ✅ Returns error message: "This password has been found in a data breach. Please choose a different password."

**Verification:**
- Try registering with a known leaked password (e.g., "password123")
- Registration should fail with leaked password error message

---

### Step 2: Set Minimum Password Length

**Purpose:** Enforce stronger password requirements beyond the default 6 characters.

**Location:** Supabase Dashboard → Authentication → Settings → Password & MFA Settings

**Steps:**
1. In the same **Password & MFA Settings** section
2. Find **"Minimum Password Length"** field
3. Change value from `6` to `12`
4. Click **"Save"** button at bottom of section

**Impact:**
- ✅ Prevents weak passwords shorter than 12 characters
- ✅ Aligns with OWASP password guidelines (12+ characters)
- ✅ Applies to new user registrations and password resets

**Verification:**
- Try registering with an 11-character password
- Registration should fail with "Password must be at least 12 characters" error

---

### Step 3: Enable MFA Options

**Purpose:** Allow users to protect their accounts with multi-factor authentication.

**Location:** Supabase Dashboard → Authentication → Settings → Password & MFA Settings

**Steps:**
1. In the same **Password & MFA Settings** section
2. Find **"Multi-Factor Authentication (MFA)"** subsection
3. Enable the following MFA methods:
   - ✅ **TOTP (Time-based One-Time Password)** - Toggle ON
     - Supports Google Authenticator, Authy, 1Password, etc.
   - ✅ **Phone/SMS** - Toggle ON (if available in your plan)
     - Requires SMS provider configuration (Twilio)

**Impact:**
- ✅ Users can enable 2FA on their accounts via Account Settings
- ✅ TOTP is the recommended method (no SMS costs, more secure)
- ✅ Optional for regular users, can be enforced for admins

**Note:** SMS-based MFA requires additional Twilio configuration and may incur costs. If budget is constrained, enable TOTP only.

**Verification:**
- Log into a user account
- Navigate to Account Settings
- Verify "Enable Two-Factor Authentication" option is visible
- Complete TOTP enrollment with authenticator app

---

### Step 4: Require MFA for Admin Users (Optional - Advanced)

**Purpose:** Enforce mandatory MFA for users with admin privileges.

**Location:** Requires custom RLS policy or application-level enforcement

**Implementation Options:**

#### Option A: Application-Level Enforcement (Recommended)
Add MFA check to admin dashboard routes:

```typescript
// src/middleware.ts or admin layout
import { createServerClient } from '@/lib/integrations/supabase/server';

export async function adminAuthCheck() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/unauthorized');
  }

  // Check MFA enrollment for admins
  const { data: { factors } } = await supabase.auth.mfa.listFactors();
  const hasMFA = factors && factors.length > 0;

  if (!hasMFA) {
    redirect('/admin/setup-mfa'); // Force MFA enrollment
  }

  return user;
}
```

#### Option B: Database Policy (Advanced)
Create RLS policy requiring MFA for admin actions:

```sql
-- Example: Require MFA verification for admin operations
CREATE POLICY "admins_must_have_mfa" ON admin_audit_logs
FOR INSERT
TO authenticated
USING (
  -- Check if user is admin
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  AND
  -- Check if user has MFA enrolled (requires auth schema access)
  EXISTS (
    SELECT 1 FROM auth.mfa_factors
    WHERE user_id = auth.uid()
    AND status = 'verified'
  )
);
```

**Note:** Option B requires `auth` schema access and may need additional permissions configuration.

**Impact:**
- ✅ Prevents unauthorized admin access even with stolen credentials
- ✅ Protects high-privilege operations (user management, financial data)
- ✅ Compliance with security best practices for admin accounts

**Verification:**
- Log into admin account without MFA enabled
- Attempt to access admin dashboard
- Should be redirected to MFA enrollment page

---

## Configuration Checklist

After completing all steps, verify the following:

- [ ] **Step 1:** Leaked password protection enabled
  - [ ] Tested with known leaked password (registration fails)
  - [ ] Error message displays correctly

- [ ] **Step 2:** Minimum password length set to 12
  - [ ] Tested with 11-character password (registration fails)
  - [ ] Error message displays correctly

- [ ] **Step 3:** MFA options enabled
  - [ ] TOTP option visible in user account settings
  - [ ] Successfully enrolled TOTP with test account
  - [ ] Phone/SMS option enabled (if using)

- [ ] **Step 4 (Optional):** Admin MFA enforcement configured
  - [ ] Application-level check implemented OR
  - [ ] Database policy created
  - [ ] Tested with non-MFA admin account (access blocked)

---

## Rollback Instructions

If you need to revert these changes:

### Revert Step 1 (Leaked Password Protection):
1. Navigate to Authentication → Settings → Password & MFA Settings
2. Toggle **OFF**: "Enable leaked password protection"
3. Click **Save**

### Revert Step 2 (Password Length):
1. Navigate to Authentication → Settings → Password & MFA Settings
2. Change **Minimum Password Length** back to `6`
3. Click **Save**

### Revert Step 3 (MFA Options):
1. Navigate to Authentication → Settings → Password & MFA Settings
2. Toggle **OFF**: TOTP and Phone/SMS options
3. Click **Save**

### Revert Step 4 (Admin MFA Enforcement):
- **Option A:** Remove middleware/application-level checks from code
- **Option B:** Drop RLS policy: `DROP POLICY admins_must_have_mfa ON admin_audit_logs;`

---

## Security Impact

### Before Manual Configuration:
- **Weak Passwords:** Users could register with 6-character passwords
- **Leaked Passwords:** No protection against compromised passwords
- **No MFA:** Accounts rely solely on password security
- **Admin Risk:** Admin accounts vulnerable to credential theft

### After Manual Configuration:
- ✅ **Strong Passwords:** 12-character minimum enforced
- ✅ **Breach Protection:** Leaked passwords blocked automatically
- ✅ **MFA Available:** Users can enable 2FA for account protection
- ✅ **Admin Hardening:** (Optional) Admins required to use MFA

---

## Additional Recommendations

### Password Policies (Future Enhancements):
Consider adding these additional password requirements (requires custom validation):
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- Prohibit common patterns (e.g., "Password123!")

**Implementation:** Add validation in registration form or use Supabase Auth Hooks (if available).

### Rate Limiting:
Supabase provides built-in rate limiting for authentication endpoints. Verify current settings:
- **Location:** Authentication → Settings → Rate Limits
- **Recommended:** 5 failed login attempts per hour per IP

### Session Management:
Review session timeout settings:
- **Location:** Authentication → Settings → Session Management
- **Recommended:**
  - Session timeout: 24 hours
  - Refresh token rotation: Enabled

---

## Support & Troubleshooting

### Common Issues:

**Issue 1: TOTP enrollment fails**
- **Cause:** Clock skew between server and user device
- **Solution:** Ensure user device clock is synchronized (Settings → Date & Time → Automatic)

**Issue 2: SMS MFA not sending codes**
- **Cause:** Twilio not configured or invalid phone number
- **Solution:**
  1. Verify Twilio integration in Supabase Dashboard
  2. Check phone number format (E.164 format: +[country code][number])

**Issue 3: Users locked out after enabling MFA**
- **Cause:** Users not enrolled in MFA before enforcement
- **Solution:**
  1. Disable MFA requirement temporarily
  2. Send email notification about MFA enrollment
  3. Re-enable MFA requirement after grace period

**Issue 4: Leaked password protection blocking valid passwords**
- **Cause:** Password matches pattern in HaveIBeenPwned database
- **Solution:** This is expected behavior - user should choose a different password

---

## Documentation References

**Supabase Auth Documentation:**
- [Password Policies](https://supabase.com/docs/guides/auth/passwords)
- [Multi-Factor Authentication](https://supabase.com/docs/guides/auth/auth-mfa)
- [Auth Hooks](https://supabase.com/docs/guides/auth/auth-hooks)

**HaveIBeenPwned:**
- [API Documentation](https://haveibeenpwned.com/API/v3)
- [k-Anonymity Model](https://www.troyhunt.com/ive-just-launched-pwned-passwords-version-2/)

**OWASP Guidelines:**
- [Password Guidelines](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#password-complexity)
- [Multi-Factor Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html)

---

## Contact & Support

For questions or issues with manual configuration:
- **All Priorities Summary:** [DATABASE-OPTIMIZATION-COMPLETE.md](DATABASE-OPTIMIZATION-COMPLETE.md)
- **Priority 4 Details:** [PRIORITY-4-COMPLETE.md](PRIORITY-4-COMPLETE.md)
- **Security Audit:** [docs/security-audit-2025-11-20.md](docs/security-audit-2025-11-20.md)

---

**Configuration Steps Created By:** Claude Code (Anthropic)
**Database:** hvnetxfsrtplextvtwfx.supabase.co (PRODUCTION)
**Environment:** Production
**Date:** November 20, 2025

---

## Next Steps

1. **Schedule configuration session** - Set aside 15 minutes for manual configuration
2. **Follow steps 1-3 immediately** - Enable password protection and MFA options
3. **Test configuration** - Verify each setting with test accounts
4. **Plan Step 4 implementation** - Decide on admin MFA enforcement strategy
5. **Document completion** - Update this file with completion dates

**Priority:** These manual steps should be completed within 1 week to fully harden authentication security.
