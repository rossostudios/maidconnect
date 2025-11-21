# Manual Security Configuration Checklist

This document contains security hardening steps that **must be configured manually** in the Supabase Dashboard. These settings cannot be applied via SQL migrations.

---

## Overview

| Setting | Priority | Time | Status |
|---------|----------|------|--------|
| Leaked Password Protection | **CRITICAL** | 2 min | ⚠️ TODO |
| Multi-Factor Authentication (MFA) | **HIGH** | 3 min | ⚠️ TODO |
| Database Backups | **MEDIUM** | 5 min | ✅ Already enabled |
| Point-in-Time Recovery (PITR) | **MEDIUM** | 2 min | ✅ Already enabled |

**Total Critical Time:** 5 minutes

---

## Step 1: Enable Leaked Password Protection (CRITICAL - 2 minutes)

### Why This Matters
- Blocks users from registering with passwords found in data breaches
- Protects against credential stuffing attacks
- Integrates with HaveIBeenPwned.org (11+ billion compromised passwords)

### How to Configure

1. **Navigate to Dashboard:**
   ```
   Supabase Dashboard → Your Project → Authentication → Settings
   ```

2. **Scroll to "Password & MFA Settings"**

3. **Enable Leaked Password Protection:**
   - Toggle ON: **"Check for leaked passwords (HaveIBeenPwned.org)"**
   - This prevents users from using any password found in known data breaches

4. **Set Strong Password Requirements:**
   - Minimum password length: **12 characters** (recommended)
   - Current: 6 characters (too weak)

5. **Click "Save"**

### Verification
After enabling, try registering a test user with a known weak password (e.g., "password123"). It should be rejected with an error message.

---

## Step 2: Enable Multi-Factor Authentication (HIGH - 3 minutes)

### Why This Matters
- Protects admin and professional accounts from credential theft
- Industry-standard security practice (NIST guidelines)
- Prevents unauthorized access even if password is compromised

### How to Configure

1. **Navigate to Dashboard:**
   ```
   Supabase Dashboard → Your Project → Authentication → Settings
   ```

2. **Scroll to "Password & MFA Settings"**

3. **Enable TOTP (Authenticator Apps):**
   - Toggle ON: **"Enable TOTP (Time-based One-Time Password)"**
   - Supports: Google Authenticator, Authy, 1Password, etc.
   - **Cost:** Free (no additional services required)

4. **(Optional) Enable Phone/SMS MFA:**
   - Toggle ON: **"Enable Phone (SMS)"**
   - **Requires:** Twilio account + SMS credits
   - **Cost:** ~$0.01-0.05 per SMS
   - **Note:** Only enable if budget allows for SMS costs

5. **Click "Save"**

### Application-Level Enforcement (Optional)

For high-security accounts (admins), consider enforcing MFA at the application level:

```typescript
// Example: Check if user has MFA enabled
const { data: factors } = await supabase.auth.mfa.listFactors();

if (factors.length === 0 && user.role === 'admin') {
  // Redirect admin to MFA setup page
  router.push('/account/security/setup-mfa');
}
```

### Verification
After enabling, log in to a test account and verify that MFA setup is available under account settings.

---

## Step 3: Verify Backup Configuration (MEDIUM - Already Done ✅)

### Why This Matters
- Protects against data loss from human error, bugs, or malicious actors
- Enables point-in-time recovery (PITR) for production databases
- Meets compliance requirements (SOC2, GDPR data protection)

### Current Status
Based on your Pro plan, the following should already be enabled:

- ✅ **Daily Backups:** Automatic daily snapshots (retained for 7 days)
- ✅ **Point-in-Time Recovery (PITR):** Restore to any point in last 7 days
- ✅ **Backup Encryption:** Encrypted at rest (AES-256)

### How to Verify

1. **Navigate to Dashboard:**
   ```
   Supabase Dashboard → Your Project → Database → Backups
   ```

2. **Check Backup Schedule:**
   - Frequency: Daily (should show recent backup timestamps)
   - Retention: 7 days minimum (Pro plan default)

3. **Check PITR Status:**
   - Status should show "Enabled"
   - Recovery window: Last 7 days

### Manual Backup (Emergency Use)

If you need to create a manual backup before a risky operation:

```bash
# Using Docker Toolkit (local backup)
./supabase/scripts/backup-now.sh

# Or via Supabase Dashboard
# Database → Backups → "Create Backup" button
```

---

## Step 4: Review Additional Security Settings (Optional)

### Email Confirmation
- **Current:** Likely enabled by default
- **Location:** Authentication → Settings → Email Confirmation
- **Recommendation:** Keep enabled to prevent fake account signups

### OAuth Providers
- **Current:** Unknown (check dashboard)
- **Location:** Authentication → Providers
- **Recommendation:** Only enable OAuth providers you actively use
  - Disable unused providers (reduces attack surface)
  - For enabled providers, verify redirect URLs are production domains only

### Custom SMTP (Optional)
- **Current:** Using Supabase default email service
- **Location:** Authentication → Email Templates → SMTP Settings
- **Recommendation:** Consider custom SMTP (SendGrid, AWS SES) for better deliverability
  - Benefit: Branded emails, better inbox placement
  - Cost: ~$0.10-0.50 per 1000 emails

---

## Security Checklist Summary

After completing Steps 1-2, your security posture will be:

| Security Control | Status | Risk Level |
|------------------|--------|------------|
| ✅ Row-Level Security (RLS) | Enabled | None |
| ✅ Database backups | Enabled | None |
| ✅ Point-in-Time Recovery | Enabled | None |
| ✅ Leaked password protection | **Enabled (Step 1)** | None |
| ✅ MFA options | **Enabled (Step 2)** | Low |
| ✅ SSL/TLS encryption | Enabled | None |
| ✅ Database connection pooling | Enabled | None |
| ⚠️ MFA enforcement for admins | Optional | Medium |

**Overall Security Rating:** Excellent (after completing Steps 1-2)

---

## Troubleshooting

### Issue: Can't find "Password & MFA Settings"
- **Solution:** Ensure you're on the "Authentication → Settings" page, not "Database → Settings"
- **Path:** Projects → [Your Project] → Authentication (left sidebar) → Settings (top tabs)

### Issue: MFA setup fails for users
- **Cause:** User's authenticator app time is out of sync
- **Solution:** Tell users to sync their device clock (Settings → Date & Time → Automatic)

### Issue: Leaked password check not working
- **Cause:** API rate limiting from HaveIBeenPwned.org
- **Solution:** Wait 1-2 minutes and try again (rare occurrence)

---

## Next Steps

1. **Complete Steps 1-2** (5 minutes total)
2. **Test with staging account** (verify MFA and password checks work)
3. **Announce to team** (notify users about new security features)
4. **(Optional) Require MFA for admins** (application-level enforcement)

---

## References

- [Supabase Auth Security Best Practices](https://supabase.com/docs/guides/auth/auth-helpers/security)
- [HaveIBeenPwned API Documentation](https://haveibeenpwned.com/API/v3)
- [NIST MFA Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html#sec5)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

**Last Updated:** 2025-11-21
**Estimated Time to Complete:** 5 minutes (Steps 1-2)
**Impact:** Critical security hardening complete
