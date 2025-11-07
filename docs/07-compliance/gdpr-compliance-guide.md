# GDPR Compliance Guide

**For Internal Use Only**
**Last Updated:** 2025-11-06
**Version:** 1.0.0

---

> **📋 INTERNAL DOCUMENTATION**
> This guide is for MaidConnect team members to understand and maintain GDPR (General Data Protection Regulation) compliance. This is NOT a user-facing document. For user-facing policies, see [Privacy Policy](./privacy-policy.md).

---

## Table of Contents

1. [Overview](#overview)
2. [GDPR Principles](#gdpr-principles)
3. [Lawful Basis for Processing](#lawful-basis-for-processing)
4. [Data Subject Rights](#data-subject-rights)
5. [Technical Implementation](#technical-implementation)
6. [Data Protection by Design and Default](#data-protection-by-design-and-default)
7. [International Data Transfers](#international-data-transfers)
8. [Data Breaches](#data-breaches)
9. [Third-Party Processors](#third-party-processors)
10. [Compliance Checklist](#compliance-checklist)
11. [Common Pitfalls](#common-pitfalls)
12. [Resources](#resources)
13. [Contact Information](#contact-information)

---

## Overview

### What is GDPR?

**General Data Protection Regulation (GDPR)** is the European Union's data protection law that came into effect on May 25, 2018. It regulates how organizations collect, process, and protect personal data of individuals in the EU/EEA.

**Territorial Scope:**
- **EU/EEA Residents:** GDPR applies to processing personal data of individuals in the EU/EEA, regardless of where MaidConnect is located
- **Extraterritorial Effect:** Even though MaidConnect operates primarily in Colombia, GDPR applies if we have users from EU countries

**Key Point:** GDPR applies to MaidConnect if we have **any** users from the EU/EEA, even a single user.

### Why MaidConnect Must Comply

**Reasons:**
1. **International Expansion** - We may have users traveling to Colombia from EU countries or European expats living in Colombia
2. **Third-Party Services** - Our processors (Supabase, Stripe, Vercel) are subject to GDPR and require our compliance
3. **Best Practices** - GDPR represents global best practices for data protection
4. **Penalties** - Non-compliance can result in fines up to €20 million or 4% of global annual revenue (whichever is higher)

### Regulatory Authority

**European Data Protection Board (EDPB):**
- Coordinates GDPR enforcement across EU member states
- Issues guidelines and opinions
- Website: [https://edpb.europa.eu](https://edpb.europa.eu)

**National Data Protection Authorities (DPAs):**
- Each EU member state has a DPA (e.g., ICO in UK, CNIL in France)
- Handle complaints and enforcement in their country
- List: [https://edpb.europa.eu/about-edpb/board/members_en](https://edpb.europa.eu/about-edpb/board/members_en)

---

## GDPR Principles

### Article 5: Principles Relating to Processing

**GDPR requires that personal data be:**

#### 1. Lawfulness, Fairness, and Transparency

**Requirements:**
- **Lawful:** Processing based on valid legal basis (see below)
- **Fair:** Data used only for stated purposes; no hidden processing
- **Transparent:** Users informed about data processing via Privacy Policy

**MaidConnect Implementation:**
- ✅ Privacy Policy clearly explains data processing
- ✅ Cookie consent banner for optional tracking
- ✅ No hidden data collection or dark patterns

#### 2. Purpose Limitation

**Requirements:**
- Collect data for specific, explicit, and legitimate purposes
- Do NOT use data for incompatible purposes without new consent

**MaidConnect Implementation:**
- ✅ Data collected only for booking services, payments, trust & safety
- ✅ No secondary use (e.g., selling data to third parties)
- ✅ Marketing emails require separate opt-in

**Example - CORRECT:**
```
Customer provides address → Used for service delivery ✅
```

**Example - WRONG:**
```
Customer provides address → Used for marketing unrelated products ❌
```

#### 3. Data Minimization

**Requirements:**
- Collect only data necessary for the stated purpose
- Avoid "nice to have" data that isn't strictly needed

**MaidConnect Implementation:**
- ✅ Profile photos are optional (not required for service)
- ✅ Government ID only collected for Professionals (not Customers)
- ✅ No unnecessary demographic data (race, religion, etc.)

**Developer Guidance:**
- Before adding a new data field, ask: "Is this absolutely necessary?"
- If "nice to have" but not required, make it optional or don't collect it

#### 4. Accuracy

**Requirements:**
- Ensure personal data is accurate and up to date
- Provide mechanisms for users to correct inaccurate data

**MaidConnect Implementation:**
- ✅ Users can update their profile information anytime
- ✅ Email verification during signup
- ✅ Phone number verification via SMS
- ✅ Data validation on forms (e.g., valid email format)

**Developer Guidance:**
- Implement form validation for all user inputs
- Provide clear error messages if data format is incorrect
- Allow users to edit their data easily

#### 5. Storage Limitation

**Requirements:**
- Retain data only as long as necessary for the stated purpose
- Define retention periods for each data category

**MaidConnect Retention Policy:**

| Data Type | Retention Period | Reason |
|-----------|------------------|--------|
| Active account data | Duration of account | Service provision |
| Deleted account data | 6 months (then anonymized) | Dispute resolution |
| Transaction records | 5 years | Colombian tax law |
| Analytics (anonymized) | Indefinite | Statistical analysis |

**Developer Guidance:**
- Implement automated data deletion scripts (cron jobs)
- See [Database Migrations](../03-technical/database.md) for retention policy implementation

#### 6. Integrity and Confidentiality (Security)

**Requirements:**
- Implement appropriate technical and organizational measures to protect data
- Prevent unauthorized access, disclosure, alteration, or destruction

**MaidConnect Implementation:**
- ✅ Encryption in transit (TLS 1.3) and at rest (AES-256)
- ✅ Row-level security (RLS) in database
- ✅ Access controls and authentication
- ✅ Regular security audits

**See:** [Authentication Documentation](../03-technical/authentication.md) for security details.

#### 7. Accountability

**Requirements:**
- Be able to demonstrate compliance with GDPR
- Maintain records of processing activities
- Conduct Data Protection Impact Assessments (DPIAs) when required

**MaidConnect Implementation:**
- ✅ This compliance documentation
- ✅ Privacy Policy, Cookie Policy, DPAs with processors
- ✅ Security audit logs
- ✅ Incident response procedures

---

## Lawful Basis for Processing

### Article 6: Lawful Basis

**GDPR requires one of six lawful bases for processing. MaidConnect uses the following:**

#### 1. Consent (Article 6(1)(a))

**Definition:** Data subject gives clear, affirmative consent for specific processing.

**Requirements:**
- Must be freely given, specific, informed, and unambiguous
- Must be easy to withdraw
- Cannot be bundled (e.g., "accept all or no service" - except for essential data)

**MaidConnect Use Cases:**
- **Marketing Emails** - Opt-in checkbox during signup (pre-unchecked)
- **Push Notifications** - Explicit permission request
- **Analytics Cookies** - Cookie consent banner

**Implementation:**
```typescript
// ✅ CORRECT: Separate consent for marketing
<Checkbox id="marketing">
  I want to receive promotional emails (optional)
</Checkbox>

// ❌ WRONG: Bundled consent
<Checkbox id="terms" required>
  I agree to Terms, Privacy Policy, and receiving all emails
</Checkbox>
```

**Withdrawal:**
- Unsubscribe link in all marketing emails
- Settings → Notifications → Manage Preferences

#### 2. Contractual Necessity (Article 6(1)(b))

**Definition:** Processing necessary to perform a contract with the data subject.

**MaidConnect Use Cases:**
- **Account Information** - Name, email, phone (to provide service)
- **Booking Details** - Service address, date, time (to fulfill booking contract)
- **Payment Information** - To process payments
- **Customer-Professional Matching** - To connect users

**Key Point:** This is our primary legal basis for most core data processing.

#### 3. Legal Obligation (Article 6(1)(c))

**Definition:** Processing necessary to comply with legal obligations.

**MaidConnect Use Cases:**
- **Tax Records** - Retain transaction data for 5 years (Colombian DIAN requirement)
- **Identity Verification** - Government ID for Professionals (regulatory compliance)
- **Respond to Legal Requests** - Court orders, government requests

#### 4. Legitimate Interest (Article 6(1)(f))

**Definition:** Processing necessary for legitimate interests of the controller, unless overridden by data subject's rights.

**Balancing Test Required:**
- **Our Legitimate Interest:** Fraud prevention, security, product improvement
- **vs. Data Subject's Rights:** Privacy, freedom from tracking

**MaidConnect Use Cases:**
- **Fraud Detection** - Monitor for suspicious activity
- **Security Logs** - IP addresses, access logs (1-year retention)
- **Platform Analytics** - Anonymized usage data to improve service
- **AI Training** - We do NOT train AI models on user data (no legitimate interest established)

**Important:** Legitimate interest is the most complex and risky legal basis. Always conduct a Legitimate Interest Assessment (LIA) before relying on it.

### Special Categories of Data (Article 9)

**"Sensitive Data" Requires Explicit Consent:**
- Health data
- Biometric data
- Genetic data
- Religious or philosophical beliefs
- Political opinions
- Trade union membership
- Sexual orientation

**MaidConnect Policy:**
- ❌ We do NOT collect special categories of data as part of standard operations
- ⚠️ If user voluntarily provides sensitive data (e.g., in support message), treat with heightened security and limited retention

---

## Data Subject Rights

### Overview of Rights

**GDPR grants data subjects eight rights:**

| Right | Article | Description |
|-------|---------|-------------|
| **Right of Access** | 15 | Request copy of personal data |
| **Right to Rectification** | 16 | Correct inaccurate data |
| **Right to Erasure ("Right to be Forgotten")** | 17 | Delete data |
| **Right to Restriction** | 18 | Limit processing |
| **Right to Data Portability** | 20 | Receive data in machine-readable format |
| **Right to Object** | 21 | Object to processing (especially for legitimate interest) |
| **Rights Related to Automated Decision-Making** | 22 | Challenge automated decisions |
| **Right to Withdraw Consent** | 7(3) | Withdraw consent anytime |

### How to Handle Requests

#### General Process

**1. Verify Identity (Required)**
- Email confirmation to registered email address
- For sensitive requests (deletion, access to financial data), may require government ID
- Prevent unauthorized access to other users' data

**2. Respond Within 30 Days**
- GDPR requires response within 1 month (30 days)
- If complex, may extend by 2 months (with explanation to user)

**3. Free of Charge**
- First request is free
- May charge reasonable fee for subsequent identical requests or manifestly unfounded requests

#### Right of Access (Article 15)

**User Requests:**
- "I want a copy of all my personal data"
- "What data do you have about me?"

**How to Fulfill:**

**Option 1: Self-Service (Preferred)**
- User goes to **Settings → Privacy & Data → Download My Data**
- System generates JSON export of all user data
- Includes: Profile, bookings, messages, transaction history

**Technical Implementation:**
```typescript
// See src/app/api/user/export-data/route.ts
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Export all user data
  const exportData = {
    profile: await fetchProfile(user.id),
    bookings: await fetchBookings(user.id),
    messages: await fetchMessages(user.id),
    transactions: await fetchTransactions(user.id),
  };

  return NextResponse.json(exportData);
}
```

**Option 2: Email Request**
- User emails privacy@casaora.co
- We verify identity and manually generate export
- Send via secure download link (expires in 7 days)

**What to Include:**
- All personal data we hold
- Source of data (if not provided by user)
- Purpose of processing
- Categories of recipients (e.g., "Payment processor: Stripe")
- Retention period
- Rights information (rectification, erasure, etc.)

#### Right to Rectification (Article 16)

**User Requests:**
- "My phone number is incorrect"
- "Update my address"

**How to Fulfill:**

**Self-Service:**
- User goes to **Settings → Profile → Edit**
- Update fields and save

**Email Request:**
- Verify identity
- Update data in database
- Confirm update to user within 30 days

**Developer Note:**
- Ensure all editable fields have update endpoints
- Validate updated data (e.g., valid email format)

#### Right to Erasure (Article 17)

**User Requests:**
- "Delete my account"
- "I want to be forgotten"

**How to Fulfill:**

**Self-Service:**
- User goes to **Settings → Privacy & Data → Delete Account**
- Confirm deletion (warn about consequences)
- Account deleted immediately; data anonymized within 30 days

**Technical Implementation:**
```sql
-- Mark account for deletion
UPDATE profiles
SET deleted_at = now(), deletion_scheduled = now() + interval '30 days'
WHERE id = $1;

-- Anonymize after 30 days (cron job)
UPDATE profiles
SET
  email = 'deleted-' || id || '@example.com',
  phone = NULL,
  full_name = 'Deleted User',
  profile_photo = NULL
WHERE deletion_scheduled < now();
```

**Exceptions (We May Refuse Deletion):**
- **Legal Obligation:** Tax records must be retained for 5 years (Colombian law)
- **Legal Claims:** Data needed for ongoing disputes or legal defense
- **Public Interest:** Fraud prevention (rare, case-by-case)

**If Exception Applies:**
- Notify user within 30 days
- Explain specific reason (legal basis)
- Offer restriction instead (freeze data, no further processing)

#### Right to Restriction (Article 18)

**User Requests:**
- "Stop using my data while you investigate my complaint"
- "Don't delete my data yet, but don't process it"

**How to Fulfill:**
- Mark account as "restricted" in database
- Display data only to user (no processing, no sharing)
- Notify user when restriction can be lifted

**Use Cases:**
- User contests data accuracy (restrict while we verify)
- User objects to processing (restrict while we assess objection)

#### Right to Data Portability (Article 20)

**User Requests:**
- "Give me my data in a format I can use elsewhere"
- "Transfer my data to another service"

**How to Fulfill:**
- Same as Right of Access, but machine-readable format (JSON, CSV)
- Our implementation provides JSON export (meets requirement)

**What to Include:**
- Only data provided by user (not inferred or derived data)
- Common formats: JSON, CSV, XML

**Does NOT Apply To:**
- Data processed under legitimate interest (only contractual or consent-based data)

#### Right to Object (Article 21)

**User Requests:**
- "Stop using my data for marketing"
- "I object to profiling"

**How to Fulfill:**

**Direct Marketing (Absolute Right):**
- User clicks "Unsubscribe" in email
- OR: Settings → Notifications → Unsubscribe from marketing
- Must honor immediately (no questions asked)

**Legitimate Interest Processing:**
- User objects to processing based on legitimate interest
- We must stop UNLESS we can demonstrate compelling legitimate grounds that override user's interests

**Example:**
```
User: "Stop using my data for fraud detection"
Us: "We have compelling legitimate grounds (platform security, protecting other users)
     that override your individual interests. We will continue processing for fraud
     detection but have minimized data used."
```

#### Rights Related to Automated Decision-Making (Article 22)

**Definition:** Decisions made solely by automated means (no human involvement) with legal or significant effects.

**MaidConnect Position:**
- ❌ We do NOT make automated decisions with legal effects
- ✅ All significant decisions (account suspension, dispute resolution) involve human review
- ✅ AI assistant (Amara) is advisory only (does not make binding decisions)

**If We Did Use Automated Decisions:**
- Must inform users
- Provide right to human review
- Explain logic involved

---

## Technical Implementation

### Data Mapping

**Know What Data You Have:**

**User Data Inventory:**
- See [Database Schema](../03-technical/database.md) for complete data model

**Key Tables:**
- `profiles` - User account data
- `bookings` - Service bookings
- `messages` - In-app communications
- `transactions` - Payment records
- `reviews` - Ratings and feedback

**Data Flows:**
- User Registration → Supabase Auth → `profiles` table
- Booking Creation → `bookings` table → Stripe payment → `transactions` table
- Messages → `messages` table → (optionally) Google Translate API

### Privacy-Enhancing Technologies

#### 1. Encryption

**Data in Transit:**
```typescript
// Enforce HTTPS (TLS 1.3)
// See next.config.ts and Vercel settings
```

**Data at Rest:**
```sql
-- Encrypt sensitive columns (Supabase handles this automatically)
-- But we can add application-level encryption for extra sensitive data
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Example: Encrypt government ID
UPDATE profiles
SET government_id = pgp_sym_encrypt(government_id, 'encryption_key');
```

**Key Management:**
- Encryption keys stored in environment variables (never in code)
- Rotate keys annually
- Use different keys for different data types

#### 2. Pseudonymization

**For Analytics:**
```typescript
// Replace identifiable data with pseudonyms for analytics
const anonymizedUserId = hashUserId(user.id); // One-way hash

// Send to analytics
trackEvent({
  userId: anonymizedUserId, // NOT real user ID
  action: 'booking_created',
});
```

#### 3. Row-Level Security (RLS)

**Database Enforcement:**
```sql
-- Customers can only see their own bookings
CREATE POLICY "Customers view own bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

-- Professionals can only see their assigned bookings
CREATE POLICY "Professionals view assigned bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (professional_id = auth.uid());
```

**See:** [Database Documentation](../03-technical/database.md) for complete RLS policies.

#### 4. Access Controls

**Role-Based Access Control (RBAC):**
```typescript
// Only admins can access all user data
if (userRole !== 'admin') {
  throw new Error('Forbidden');
}

// Audit all admin access
await logAdminAccess({
  admin_id: adminUser.id,
  action: 'view_user_profile',
  target_user_id: userId,
  timestamp: new Date(),
});
```

### Audit Logging

**What to Log:**
- All access to personal data (who, what, when)
- Data exports (Right of Access)
- Data deletions
- Admin actions

**Retention:**
- Audit logs retained for 1 year
- Critical security events retained for 3 years

**Implementation:**
```typescript
// See src/lib/audit-log.ts
export async function logDataAccess({
  userId,
  action,
  dataType,
  ipAddress,
}: AuditLogEntry) {
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action,
    data_type: dataType,
    ip_address: ipAddress,
    timestamp: new Date(),
  });
}
```

---

## Data Protection by Design and Default

### Article 25: Data Protection by Design and Default

**Requirements:**
- Implement data protection measures at the design stage (not as an afterthought)
- Default to highest privacy settings

### MaidConnect Implementation

#### 1. Privacy by Design

**Before Building New Features, Ask:**
- [ ] What personal data does this feature require?
- [ ] Can we achieve the goal with less data? (Data minimization)
- [ ] What is the lawful basis for processing?
- [ ] How long will we retain this data?
- [ ] What security measures are needed?
- [ ] Does this involve automated decision-making?
- [ ] Do we need a DPIA? (See below)

#### 2. Privacy by Default

**Default Settings:**
- ❌ Marketing emails: Opt-in (unchecked by default)
- ❌ Push notifications: Ask permission first
- ✅ Analytics cookies: Require consent (not enabled by default)
- ✅ Profile visibility: Only visible to matched users (not public by default)

**Example - CORRECT:**
```typescript
// Default to most private setting
const defaultPreferences = {
  marketingEmails: false, // Opt-in required
  profilePublic: false,   // Private by default
  shareAnalytics: false,  // Consent required
};
```

### Data Protection Impact Assessment (DPIA)

**When Required (Article 35):**

A DPIA is required when processing is **"likely to result in high risk"** to data subjects, such as:
1. **Systematic and extensive automated processing** (e.g., large-scale profiling)
2. **Large-scale processing of special categories of data** (health, biometric, etc.)
3. **Systematic monitoring of public areas** (e.g., CCTV)

**MaidConnect Current Position:**
- ✅ No DPIA currently required (no high-risk processing)
- ✅ We do NOT use large-scale profiling or automated decision-making
- ✅ We do NOT process special categories of data at scale

**If We Introduce High-Risk Processing:**
- Conduct DPIA before implementation
- Consult with Privacy Officer or external DPO
- Document assessment and mitigation measures
- Consult with supervisory authority if high risk remains after mitigation

**DPIA Template:** [https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/accountability-and-governance/data-protection-impact-assessments/](https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/accountability-and-governance/data-protection-impact-assessments/)

---

## International Data Transfers

### Chapter V: Transfers to Third Countries

**When Does This Apply?**
- We transfer personal data to the United States (Supabase, Stripe, Vercel, Anthropic)
- The U.S. does NOT have an adequacy decision (as of 2025)
- Therefore, we must use alternative safeguards

### Transfer Mechanisms

**Our Approach: Standard Contractual Clauses (SCCs)**

**What Are SCCs?**
- Pre-approved contract templates from the European Commission
- Create contractual obligations for data importers (e.g., Supabase in the U.S.)
- Ensure data receives equivalent protection as in the EU

**Our SCCs:**
- ✅ Supabase: SCCs in place (Controller-to-Processor)
- ✅ Stripe: SCCs in place (Controller-to-Processor)
- ✅ Vercel: SCCs in place (Controller-to-Processor)
- ✅ Anthropic: SCCs in place (Controller-to-Processor)

**Documentation:**
- See [Data Processing Agreements](./data-processing-agreement.md)
- Copies of signed SCCs stored in Legal > Contracts > DPAs

### Transfer Impact Assessment (TIA)

**Required Since Schrems II Ruling:**

Before transferring to a third country, assess:
1. **Destination Country Laws** - Do they allow government access to data?
2. **Supplementary Measures** - What additional safeguards are needed?

**Our Assessment (United States):**

**Risks:**
- U.S. FISA Section 702 allows government surveillance
- CLOUD Act allows access to data for law enforcement

**Mitigations:**
- ✅ End-to-end encryption for sensitive data (government IDs, payment data)
- ✅ Data minimization (only transfer necessary data)
- ✅ Contractual commitments from processors to challenge unlawful requests
- ✅ Transparency reports from processors (Stripe, Supabase publish transparency reports)

**Conclusion:**
- Transfer is permissible with SCCs + supplementary measures
- Documented in TIA Report (Legal > Compliance > TIA-US-2025.pdf)

---

## Data Breaches

### Article 33-34: Data Breach Notification

**Definition:** Breach of security leading to accidental or unlawful destruction, loss, alteration, unauthorized disclosure of, or access to personal data.

### Notification Timeline

**1. Internal Detection:**
- Security team detects breach
- Immediately notify Privacy Officer (privacy@casaora.co)

**2. Supervisory Authority Notification (Within 72 Hours):**
- If breach likely to result in risk to data subjects
- Notify relevant Data Protection Authority (DPA)
- Use DPA's online breach notification form

**3. Data Subject Notification (Without Undue Delay):**
- If breach likely to result in **high risk** to data subjects
- Send individual email notifications
- Explain what happened, what data affected, what we're doing, what they should do

**See:** [Incident Response Playbook](../06-operations/incident-response.md) for detailed breach procedures.

### What to Include in Notification

**To Supervisory Authority:**
- Nature of breach (unauthorized access, data loss, etc.)
- Categories and approximate number of data subjects affected
- Categories and approximate number of records affected
- Contact point (Privacy Officer)
- Likely consequences
- Measures taken or proposed

**To Data Subjects:**
- Nature of breach (in plain language)
- Contact point for more information
- Likely consequences
- Measures taken to mitigate harm
- Recommendations (e.g., change password, monitor accounts)

### Example Scenarios

**Scenario 1: Supabase Database Breach**
- Unauthorized access to database
- Customer names, emails, phone numbers exposed
- **Action:** Notify DPA within 72 hours, notify affected users immediately

**Scenario 2: Lost Laptop (No Encryption)**
- Employee laptop stolen with unencrypted customer data
- **Action:** Notify DPA within 72 hours, notify affected users
- **Prevention:** Enforce full-disk encryption policy

**Scenario 3: Accidental Email Disclosure**
- Support agent accidentally CCs customer email to wrong recipient
- **Action:** May NOT require DPA notification (low risk, single individual), but document incident and notify affected user

---

## Third-Party Processors

### Article 28: Processor Requirements

**All Third-Party Processors Must:**
1. Execute a Data Processing Agreement (DPA)
2. Implement appropriate security measures
3. Only process data on our instructions
4. Assist us with data subject rights requests
5. Notify us of data breaches within 24 hours
6. Delete or return data upon termination

### Our Processors

| Processor | Purpose | DPA Signed | Location | Alternatives Considered |
|-----------|---------|------------|----------|------------------------|
| **Supabase** | Database, auth | ✅ Yes | United States | AWS RDS, Google Cloud SQL |
| **Stripe** | Payment processing | ✅ Yes | United States | Adyen, PayPal |
| **Vercel** | Hosting | ✅ Yes | United States | Netlify, AWS Amplify |
| **Anthropic** | AI assistant | ✅ Yes | United States | OpenAI, Google Gemini |
| **Resend** | Email delivery | ✅ Yes | United States | SendGrid, Amazon SES |
| **Better Stack** | Error monitoring | ✅ Yes | European Union | Sentry, Datadog |

**Documentation:**
- Signed DPAs stored in Legal > Contracts > DPAs
- Renewal dates tracked in Legal Calendar

### Processor Evaluation Checklist

**Before Engaging a New Processor:**
- [ ] Review processor's privacy policy and security measures
- [ ] Confirm GDPR compliance (if processing EU data)
- [ ] Obtain copy of relevant certifications (SOC 2, ISO 27001)
- [ ] Execute DPA (use our [DPA Template](./data-processing-agreement.md))
- [ ] Verify international data transfer mechanisms (SCCs if needed)
- [ ] Add to processor inventory
- [ ] Update Privacy Policy to disclose new processor

---

## Compliance Checklist

### Pre-Launch Checklist

**Before Going Live:**
- [ ] **Privacy Policy** published and accessible (footer link)
- [ ] **Cookie Policy** published (footer link)
- [ ] **Cookie Consent Banner** implemented (optional cookies require opt-in)
- [ ] **Data Processing Agreements** signed with all processors
- [ ] **Standard Contractual Clauses** in place for US transfers
- [ ] **Data Subject Rights** workflows implemented (access, deletion, etc.)
- [ ] **Security Measures** implemented (encryption, RLS, access controls)
- [ ] **Audit Logging** for admin access to personal data
- [ ] **Incident Response Plan** documented and tested
- [ ] **Privacy Officer** designated (privacy@casaora.co)
- [ ] **Data Retention Policies** implemented (automated deletion cron jobs)

### Ongoing Compliance

**Monthly:**
- [ ] Review audit logs for suspicious activity
- [ ] Check for data subject rights requests (respond within 30 days)
- [ ] Monitor security alerts (Better Stack)

**Quarterly:**
- [ ] Review and update processor inventory
- [ ] Test data export and deletion workflows
- [ ] Review data retention policies (ensure automated deletion is working)

**Annually:**
- [ ] Review and update Privacy Policy (if needed)
- [ ] Review DPAs with processors (ensure still valid and up-to-date)
- [ ] Conduct internal privacy audit
- [ ] Employee privacy training
- [ ] Review and test Incident Response Plan

**When Introducing New Features:**
- [ ] Conduct Privacy by Design review
- [ ] Determine if DPIA required
- [ ] Update Privacy Policy if new data processing introduced
- [ ] Update Cookie Policy if new cookies introduced

---

## Common Pitfalls

### Mistakes to Avoid

#### 1. Bundled Consent

**❌ WRONG:**
```
[ ] I agree to the Terms of Service, Privacy Policy, and receiving marketing emails
```

**Why It's Wrong:** Consent for non-essential processing (marketing) must be separate and optional.

**✅ CORRECT:**
```
[✓] I agree to the Terms of Service and Privacy Policy (required)
[ ] I want to receive promotional emails (optional)
```

#### 2. Pre-Checked Boxes

**❌ WRONG:**
```typescript
<Checkbox defaultChecked={true}>
  Subscribe to newsletter
</Checkbox>
```

**Why It's Wrong:** Consent must be affirmative action (user must actively check the box).

**✅ CORRECT:**
```typescript
<Checkbox defaultChecked={false}>
  Subscribe to newsletter
</Checkbox>
```

#### 3. Ignoring Data Subject Rights Requests

**❌ WRONG:**
- Ignoring deletion requests
- Responding after 30 days without explanation
- Charging fees for first request

**✅ CORRECT:**
- Respond within 30 days
- Free of charge (first request)
- Provide requested data in accessible format

#### 4. No Legal Basis for Processing

**❌ WRONG:**
```typescript
// Collecting data "just in case" without clear purpose
const userData = {
  name: user.name,
  favoriteColor: user.favoriteColor, // Why do we need this?
  mothersMaidenName: user.mothersMaidenName, // Definitely not needed!
};
```

**✅ CORRECT:**
- Only collect data necessary for service provision
- Document legal basis for each data field

#### 5. Using Legitimate Interest Incorrectly

**❌ WRONG:**
```
"We use legitimate interest to send you marketing emails."
```

**Why It's Wrong:** Marketing requires consent, not legitimate interest.

**✅ CORRECT:**
- Legitimate interest for fraud detection, security, product improvement (non-intrusive)
- Consent for marketing

#### 6. No DPA with Processors

**❌ WRONG:**
- Using third-party service without signed DPA
- Assuming their privacy policy is sufficient

**✅ CORRECT:**
- Execute DPA with every processor
- Verify processor's GDPR compliance

#### 7. Storing Data Indefinitely

**❌ WRONG:**
- Never deleting user data (even after account deletion)
- "We might need it someday"

**✅ CORRECT:**
- Define retention periods for each data type
- Automate deletion after retention period

#### 8. No Encryption for Sensitive Data

**❌ WRONG:**
- Storing passwords in plain text
- Unencrypted government IDs or payment data

**✅ CORRECT:**
- Hash passwords (bcrypt, Argon2)
- Encrypt sensitive fields (government IDs, bank accounts)
- TLS for all data in transit

---

## Resources

### Official GDPR Resources

**European Data Protection Board (EDPB):**
- Website: [https://edpb.europa.eu](https://edpb.europa.eu)
- Guidelines: [https://edpb.europa.eu/our-work-tools/general-guidance/gdpr-guidelines-recommendations-best-practices_en](https://edpb.europa.eu/our-work-tools/general-guidance/gdpr-guidelines-recommendations-best-practices_en)

**GDPR Full Text:**
- [https://gdpr-info.eu](https://gdpr-info.eu) (unofficial but user-friendly)
- [https://eur-lex.europa.eu/eli/reg/2016/679/oj](https://eur-lex.europa.eu/eli/reg/2016/679/oj) (official EUR-Lex)

**National DPAs:**
- ICO (UK): [https://ico.org.uk](https://ico.org.uk)
- CNIL (France): [https://www.cnil.fr](https://www.cnil.fr)
- List of all DPAs: [https://edpb.europa.eu/about-edpb/board/members_en](https://edpb.europa.eu/about-edpb/board/members_en)

### Practical Guides

**GDPR Checklists:**
- ICO GDPR Checklist: [https://ico.org.uk/for-organisations/sme-web-hub/checklists/gdpr-compliance-checklist/](https://ico.org.uk/for-organisations/sme-web-hub/checklists/gdpr-compliance-checklist/)

**Data Protection Impact Assessments (DPIA):**
- ICO DPIA Template: [https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/accountability-and-governance/data-protection-impact-assessments/](https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/accountability-and-governance/data-protection-impact-assessments/)

**International Transfers:**
- EC Standard Contractual Clauses: [https://ec.europa.eu/info/law/law-topic/data-protection/international-dimension-data-protection/standard-contractual-clauses-scc_en](https://ec.europa.eu/info/law/law-topic/data-protection/international-dimension-data-protection/standard-contractual-clauses-scc_en)
- EDPB TIA Guidance: [https://edpb.europa.eu/our-work-tools/our-documents/recommendations/recommendations-012020-measures-supplement-transfer_en](https://edpb.europa.eu/our-work-tools/our-documents/recommendations/recommendations-012020-measures-supplement-transfer_en)

### Books and Courses

**Recommended Reading:**
- *EU General Data Protection Regulation (GDPR): An Implementation and Compliance Guide* by IT Governance Privacy Team
- *Handbook on European Data Protection Law* by European Union Agency for Fundamental Rights

**Online Courses:**
- IAPP CIPP/E Certification (Certified Information Privacy Professional - Europe)
- Coursera: GDPR Compliance Course

---

## Contact Information

### Internal Contacts

**Privacy Officer:**
- Email: privacy@casaora.co
- Responsible for GDPR compliance, data subject rights, supervisory authority liaison

**Security Team:**
- Email: security@casaora.co
- Responsible for data breach response, security incidents

**Legal Team:**
- Email: legal@casaora.co
- Responsible for DPA negotiations, legal advice

### External Resources

**Legal Counsel:**
- [LAW FIRM NAME - TO BE DETERMINED]
- Specializes in data protection and technology law

**Data Protection Officer (DPO) - If Required:**
- GDPR Article 37 requires DPO for certain organizations
- MaidConnect may need DPO if we process large volumes of special category data
- Consider appointing external DPO service if needed

---

**Questions or Concerns?**

If you have questions about GDPR compliance or encounter a situation not covered in this guide:
1. **Email:** privacy@casaora.co
2. **Slack:** #privacy-compliance channel (internal)
3. **Escalate:** If urgent or high-risk, escalate to CEO and Legal Counsel

**Remember:** When in doubt, err on the side of protecting user privacy. It's better to over-comply than to violate GDPR.

---

**Document Control:**
- **Created:** 2025-11-06
- **Last Reviewed:** 2025-11-06
- **Next Review:** Quarterly or upon material change in GDPR law
- **Owner:** Privacy Officer / Legal Team
- **Intended Audience:** Internal - MaidConnect team members (developers, product, operations)
