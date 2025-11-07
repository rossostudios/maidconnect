# Cookie Policy

**Last Updated:** 2025-11-06
**Effective Date:** [TO BE DETERMINED]
**Version:** 1.0.0

---

> **⚖️ LEGAL DISCLAIMER**
> This document is a template and MUST be reviewed and approved by a qualified Colombian attorney before publication. It complies with GDPR (ePrivacy Directive) and Colombian Law 1581 cookie disclosure requirements.

---

## Table of Contents

1. [What Are Cookies?](#what-are-cookies)
2. [Why We Use Cookies](#why-we-use-cookies)
3. [Types of Cookies We Use](#types-of-cookies-we-use)
4. [Third-Party Cookies](#third-party-cookies)
5. [Cookie Consent](#cookie-consent)
6. [How to Manage Cookies](#how-to-manage-cookies)
7. [Cookie Retention Periods](#cookie-retention-periods)
8. [Impact of Disabling Cookies](#impact-of-disabling-cookies)
9. [Updates to This Policy](#updates-to-this-policy)
10. [Contact Information](#contact-information)

---

## What Are Cookies?

**Definition:** Cookies are small text files stored on your device (computer, smartphone, tablet) when you visit a website. They help websites remember information about your visit, such as your preferences and login status.

**Cookie Components:**
- **Name** - Identifies the cookie
- **Value** - Data stored (e.g., session ID, preference setting)
- **Domain** - Website that set the cookie
- **Expiration** - When the cookie expires (session or persistent)
- **Secure/HttpOnly flags** - Security settings

**Types of Storage Technologies:**
In addition to cookies, we may use:
- **Local Storage** - Stores data in your browser (no expiration)
- **Session Storage** - Stores data for the current session only
- **IndexedDB** - Browser database for structured data

For simplicity, this policy refers to all these technologies collectively as "cookies."

---

## Why We Use Cookies

We use cookies for the following purposes:

1. **Authentication** - Keep you logged in securely
2. **Security** - Protect against cross-site request forgery (CSRF) attacks
3. **Preferences** - Remember your language and settings
4. **Performance** - Monitor website speed and user experience
5. **Analytics** - Understand how users interact with our platform (with consent)
6. **Error Tracking** - Diagnose and fix bugs (with consent)

**We Do NOT Use Cookies For:**
- Third-party advertising
- Tracking you across other websites
- Selling your data to advertisers

---

## Types of Cookies We Use

### 1. Essential Cookies (Strictly Necessary)

**Purpose:** Required for the Platform to function. You cannot opt out of these cookies.

| Cookie Name | Purpose | Duration | Type |
|-------------|---------|----------|------|
| `sb-access-token` | Supabase authentication token | 1 hour | First-party, HTTP-only |
| `sb-refresh-token` | Supabase session refresh | 30 days | First-party, HTTP-only |
| `csrf-token` | CSRF protection for forms | Session | First-party, HTTP-only |
| `NEXT_LOCALE` | Language preference (en/es) | 1 year | First-party |

**Legal Basis:**
- **GDPR:** Legitimate interest (contractual necessity)
- **Colombian Law 1581:** Technical necessity (no consent required per Decree 1377)

**Technical Implementation:** See [proxy.ts](../../proxy.ts) for session management details.

### 2. Performance Cookies (Opt-In Required)

**Purpose:** Monitor website performance and user experience. **Requires your consent.**

| Cookie Name | Purpose | Duration | Type |
|-------------|---------|----------|------|
| `web-vitals-consent` | Tracks if you consented to Web Vitals | 1 year | First-party |
| `_lttk` | Better Stack (Logtail) session tracking | Session | First-party |

**Data Collected:**
- Page load times (LCP, FCP, TTFB)
- Interactivity metrics (FID, INP)
- Layout stability (CLS)
- Error messages and stack traces
- Browser and device information (anonymized)

**Third-Party Processor:** Better Stack (Logtail) - See [Better Stack Privacy](https://betterstack.com/privacy)

**Legal Basis:**
- **GDPR:** Consent (opt-in via cookie banner)
- **Colombian Law 1581:** Express consent

**How to Opt Out:** Decline on cookie consent banner or disable in Settings → Privacy.

### 3. Functional Cookies (Opt-In Required)

**Purpose:** Enhance your experience with personalized features. **Requires your consent.**

| Cookie Name | Purpose | Duration | Type |
|-------------|---------|----------|------|
| `amara-chat-history` | Remember AI assistant conversation context | 7 days | First-party (LocalStorage) |
| `ui-preferences` | Remember UI customization (dark mode, etc.) | 1 year | First-party (LocalStorage) |
| `push-notifications-consent` | Track push notification permission | 1 year | First-party |

**Legal Basis:**
- **GDPR:** Consent (opt-in via feature settings)
- **Colombian Law 1581:** Express consent

**How to Opt Out:** Disable in Settings → Privacy & Notifications.

### 4. Analytics Cookies (NOT CURRENTLY USED)

**Purpose:** We do NOT currently use third-party analytics (Google Analytics, etc.). If implemented in the future, we will:
- Update this Cookie Policy
- Obtain explicit consent via cookie banner
- Anonymize IP addresses
- Provide opt-out mechanism

---

## Third-Party Cookies

### Cookies Set by Third Parties

When you use MaidConnect, the following third-party services may set cookies:

#### 1. Stripe (Payment Processing)

**Cookies Used:**
- `__stripe_mid` - Fraud detection (1 year)
- `__stripe_sid` - Session identifier (30 minutes)

**Purpose:** Secure payment processing and fraud prevention

**Privacy Policy:** [Stripe Privacy Policy](https://stripe.com/privacy)

**Legal Basis:** Contractual necessity (no consent required)

**Control:** These cookies are essential for payment processing and cannot be disabled if you use payment features.

#### 2. Supabase (Database & Authentication)

**Cookies Used:**
- `sb-access-token` - User authentication
- `sb-refresh-token` - Session management

**Purpose:** Secure authentication and database access

**Privacy Policy:** [Supabase Privacy Policy](https://supabase.com/privacy)

**Legal Basis:** Contractual necessity (no consent required)

#### 3. Better Stack (Logtail) - Performance Monitoring

**Cookies Used:**
- `_lttk` - Session tracking for error correlation

**Purpose:** Error tracking and performance monitoring

**Privacy Policy:** [Better Stack Privacy Policy](https://betterstack.com/privacy)

**Legal Basis:** Consent (opt-in required)

**Control:** Opt out via cookie banner or Settings → Privacy.

### No Advertising Cookies

**We Do NOT Use:**
- Google Ads cookies
- Facebook Pixel
- Advertising retargeting cookies
- Cross-site tracking cookies

---

## Cookie Consent

### GDPR Compliance (EU/International Users)

**Consent Banner:** On your first visit, you'll see a cookie consent banner with:
- Description of cookie types
- Option to accept all cookies
- Option to reject non-essential cookies
- Link to this Cookie Policy

**Granular Consent:** You can customize cookie preferences by clicking "Cookie Settings" in the banner.

**Consent Storage:** Your cookie preferences are stored in the `cookie-consent` cookie (1 year expiration).

**Withdrawing Consent:** You can change your preferences anytime via:
- Footer link: "Cookie Settings"
- Settings → Privacy → Manage Cookies

### Colombian Law 1581 Compliance

**Information Notice:** We provide clear information about cookies in this Policy and in the consent banner (available in Spanish).

**Consent Mechanism:**
- **Essential Cookies:** No consent required (technical necessity per Decree 1377, Article 4)
- **Non-Essential Cookies:** Explicit opt-in consent required

**Language:** Consent banner available in Spanish for Colombian users.

---

## How to Manage Cookies

### Option 1: Cookie Consent Banner

**Accept All:** Allows all cookies (essential, performance, functional).

**Reject Non-Essential:** Only essential cookies allowed.

**Customize:** Choose specific cookie categories.

### Option 2: Account Settings (Logged-In Users)

1. Go to **Settings → Privacy & Data**
2. Click **Manage Cookies**
3. Toggle cookie categories on/off
4. Click **Save Preferences**

### Option 3: Browser Settings

**Disable All Cookies (Not Recommended):**

**Chrome:**
1. Settings → Privacy and security → Cookies and other site data
2. Select "Block all cookies"

**Firefox:**
1. Settings → Privacy & Security → Cookies and Site Data
2. Select "Block cookies"

**Safari:**
1. Preferences → Privacy
2. Check "Block all cookies"

**Edge:**
1. Settings → Cookies and site permissions
2. Toggle "Block all cookies"

**⚠️ Warning:** Blocking all cookies will prevent you from logging in and using core features.

### Option 4: Browser Extensions

**Privacy-Focused Extensions:**
- Privacy Badger (blocks third-party trackers)
- uBlock Origin (blocks ads and trackers)
- Ghostery (shows and blocks trackers)

**Note:** These may block essential cookies and break functionality.

---

## Cookie Retention Periods

### Session Cookies

**Duration:** Deleted when you close your browser.

**Examples:**
- CSRF tokens
- Temporary session data

### Persistent Cookies

**Duration:** Remain until expiration date or manual deletion.

| Cookie | Retention Period | Reason |
|--------|------------------|--------|
| `sb-refresh-token` | 30 days | Maintain login session |
| `NEXT_LOCALE` | 1 year | Remember language preference |
| `web-vitals-consent` | 1 year | Remember performance monitoring consent |
| `cookie-consent` | 1 year | Remember cookie preferences |

### Data Retention After Cookie Deletion

**Server-Side Data:**
- Deleting cookies does NOT delete your account data
- Account data retention governed by [Privacy Policy](./privacy-policy.md)
- To delete account data, go to Settings → Privacy → Delete Account

---

## Impact of Disabling Cookies

### Essential Cookies (Cannot Disable)

**If you block essential cookies:**
- ❌ Cannot log in to your account
- ❌ Cannot make bookings
- ❌ Cannot process payments
- ❌ Forms may not submit (CSRF protection disabled)
- ❌ Language preference not saved

### Performance Cookies (Can Disable)

**If you opt out of performance cookies:**
- ✅ Platform functions normally
- ❌ We cannot monitor performance issues affecting you
- ❌ Bugs you encounter may not be detected
- ❌ Your feedback on performance not captured

**Impact on Us:**
- Harder to diagnose issues
- Longer time to fix bugs
- Cannot measure performance improvements

### Functional Cookies (Can Disable)

**If you opt out of functional cookies:**
- ✅ Platform functions normally
- ❌ AI assistant (Amara) does not remember conversation context
- ❌ UI preferences reset each visit
- ❌ Push notifications not available

---

## Updates to This Policy

### Notification of Changes

**Material Changes:** If we add new cookie types or change purposes, we will:
1. Update this Cookie Policy with new "Last Updated" date
2. Notify you via email (if you have an account)
3. Request new consent via updated cookie banner

**Non-Material Changes:** Minor updates posted without re-consent.

### Version History

- **v1.0.0 (2025-11-06):** Initial Cookie Policy

---

## Contact Information

### Cookie Questions

**Email:** privacy@casaora.co
**Subject:** "Cookie Policy Inquiry"

### Complaints

**Colombian Users:**
- Superintendencia de Industria y Comercio (SIC)
- Website: [https://www.sic.gov.co](https://www.sic.gov.co)
- Email: contactenos@sic.gov.co

**EU Users:**
- Contact your local Data Protection Authority
- List: [https://edpb.europa.eu/about-edpb/board/members_en](https://edpb.europa.eu/about-edpb/board/members_en)

---

## Technical Details for Developers

### Cookie Implementation

**See Technical Documentation:**
- [proxy.ts](../../proxy.ts) - Session cookie management
- [Performance Monitoring Guide](../06-operations/performance-monitoring.md) - Web Vitals cookies

### Cookie Security

**Security Measures:**
- `HttpOnly` flag on authentication cookies (prevents XSS attacks)
- `Secure` flag on all cookies in production (HTTPS only)
- `SameSite=Lax` to prevent CSRF attacks
- Signed cookies for critical data (prevents tampering)

**Example Cookie Attributes (Supabase Session):**
```
sb-access-token=xxx;
Path=/;
Secure;
HttpOnly;
SameSite=Lax;
Max-Age=3600
```

---

## Definitions

**First-Party Cookie:** Cookie set by MaidConnect (casaora.co domain).

**Third-Party Cookie:** Cookie set by a different domain (e.g., stripe.com).

**Session Cookie:** Deleted when you close your browser.

**Persistent Cookie:** Remains until expiration date or manual deletion.

**HttpOnly Cookie:** Cannot be accessed by JavaScript (more secure).

**Secure Cookie:** Only sent over HTTPS (encrypted connection).

**SameSite Cookie:** Restricts when cookies are sent (CSRF protection).

---

## Your Rights Summary

**You have the right to:**
1. ✅ Know what cookies we use and why
2. ✅ Accept or reject non-essential cookies
3. ✅ Withdraw consent at any time
4. ✅ Delete cookies from your browser
5. ✅ File a complaint with supervisory authority

**See [Privacy Policy](./privacy-policy.md) for full data protection rights.**

---

**Acknowledgment:**

**By using MaidConnect, you acknowledge:**
1. You have been informed about our use of cookies
2. You understand your right to accept or reject non-essential cookies
3. Essential cookies are necessary for the Platform to function

**Questions?** Contact us at privacy@casaora.co

---

**Document Control:**
- **Created:** 2025-11-06
- **Last Reviewed:** 2025-11-06
- **Next Review:** [3 months after publication, then annually]
- **Owner:** Privacy Officer / Legal Team
- **Approval Required:** Colombian attorney, Privacy Officer
