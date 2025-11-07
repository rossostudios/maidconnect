# Help Center Phase 1 Content Plan

**Detailed implementation plan for 20 P0 (launch-critical) help articles**

**Last Updated:** November 2025
**Owner:** Content Team
**Timeline:** Week 1-2 (85 hours total)
**Status:** Ready for Implementation

---

## Table of Contents

1. [Phase 1 Overview](#phase-1-overview)
2. [Article Assignments](#article-assignments)
3. [Detailed Article Outlines](#detailed-article-outlines)
4. [Visual Assets Checklist](#visual-assets-checklist)
5. [Translation Checklist](#translation-checklist)
6. [Implementation Timeline](#implementation-timeline)
7. [Success Metrics](#success-metrics)

---

## Phase 1 Overview

### Goals
- **Primary:** Launch help center with minimum viable documentation
- **Secondary:** Cover most common support questions (estimated 60% deflection rate)
- **Tertiary:** Enable self-service for critical user journeys

### Scope

**20 P0 Articles** across 4 categories:

| Category | Articles | Focus |
|----------|----------|-------|
| 🚀 Getting Started | 5 | Onboarding (customers + professionals) |
| 📅 Bookings & Scheduling | 5 | Creating, modifying, canceling bookings |
| 💳 Payments & Refunds | 5 | Payment process, refunds, security |
| 🛡️ Safety & Trust | 5 | Verification, safety measures, trust signals |
| **TOTAL** | **20** | **Launch-ready help center** |

---

## Article Assignments

### Writing Assignments (Recommended Distribution)

**Writer 1 (Customer Focus):** 10 articles
- All 5 Getting Started (Customer) articles
- All 5 Bookings & Scheduling (Customer) articles

**Writer 2 (Professional Focus):** 10 articles
- All 5 Getting Started (Professional) articles
- All 5 Safety & Trust articles

**Writer 3 (Payments Focus):** 5 articles
- All 5 Payments & Refunds articles
- Support Writer 1 and 2 with reviews

### Time Allocation per Article

- Research & outline: 30 min
- Writing first draft: 60 min
- Self-review & edits: 20 min
- Screenshots (if applicable): 20 min
- **Total per article:** 2 hours

**Total Phase 1 effort:** 20 articles × 2 hours = 40 hours writing

---

## Detailed Article Outlines

### Category 1: Getting Started 🚀

---

#### Article 1.1: Welcome to MaidConnect: How It Works

**Target Audience:** New customers
**Priority:** P0
**Word Count:** 400-500
**Writer:** Writer 1
**Screenshots Needed:** 3 (platform overview, professional profiles, booking confirmation)

**Outline:**

```markdown
# Welcome to MaidConnect: How It Works

[1-sentence summary: MaidConnect connects you with verified home cleaning professionals in Colombia—book trusted service in minutes.]

## What is MaidConnect?

[2-3 sentences: Two-sided marketplace, customers book cleaning services, professionals provide services, platform handles payments and trust/safety]

## How It Works (3 Simple Steps)

### 1. Find Your Professional
- Browse profiles with photos, ratings, and reviews
- Filter by location, price, availability, and services
- Read verified reviews from real customers

### 2. Book Service
- Select date and time that works for you
- Choose service type and any add-ons
- See upfront pricing (no hidden fees)
- Secure payment with instant confirmation

### 3. Enjoy Clean Home
- Professional arrives on time (GPS verified)
- In-app messaging for questions
- Rate and review after service
- Payment processed 48 hours after completion

## Safety & Trust

- ✅ Background-checked professionals
- ✅ Identity verification required
- ✅ Insurance coverage included
- ✅ Secure payment processing (Stripe)
- ✅ 24/7 customer support

## Pricing Transparency

- Upfront pricing before booking
- No hidden fees
- See what's included in each service
- Tip optionally after service

## Next Steps

Ready to book your first service?

1. [Create your account](/auth/sign-up) (takes 2 minutes)
2. [Browse professionals](/professionals) in your area
3. Book your first cleaning

## Common Questions

<details>
<summary>How much does it cost?</summary>
Pricing varies by professional, service type, and location. You'll see exact pricing before booking. Most standard cleanings range from $80,000-$150,000 COP.
</details>

<details>
<summary>Are professionals background-checked?</summary>
Yes, every professional undergoes identity verification, background check, and in-person interview before joining.
</details>

<details>
<summary>What if I'm not satisfied?</summary>
We have a 48-hour dispute window. If service doesn't meet expectations, contact support for resolution (partial or full refund may apply).
</details>

## Related Articles

- [Creating your customer account](#)
- [Your first booking: Step-by-step guide](#)
- [How professionals are vetted and verified](#)
- [Payment methods accepted in Colombia](#)
```

**Keywords:** how maidconnect works, platform overview, cleaning service, home cleaning platform
**SEO Title:** How MaidConnect Works - Book Trusted Home Cleaning in Colombia
**Meta Description:** MaidConnect connects you with verified cleaning professionals in Colombia. Book trusted service in 3 simple steps with upfront pricing and secure payments.

---

#### Article 1.2: Creating Your Customer Account

**Target Audience:** New customers
**Priority:** P1 (moved from original outline to support P0 articles)
**Word Count:** 300-400
**Writer:** Writer 1
**Screenshots Needed:** 2 (sign-up form, email verification)

**Outline:**

```markdown
# Creating Your Customer Account

[1-sentence summary: Create your MaidConnect account in 2 minutes to start booking trusted cleaning professionals.]

## Quick Start

Creating an account is free and takes about 2 minutes.

## Sign-Up Methods

You can sign up using:
- 📧 Email address
- 🔐 Google account (one-click sign-up)
- 📱 Phone number (SMS verification)

## Step-by-Step

### 1. Go to Sign-Up Page

[Create Account](/auth/sign-up)

### 2. Choose Sign-Up Method

**Email:**
1. Enter your email address
2. Create a secure password (8+ characters)
3. Click "Create Account"
4. Check your email for verification link
5. Click link to verify

**Google:**
1. Click "Continue with Google"
2. Select your Google account
3. Authorize MaidConnect
4. You're in!

**Phone:**
1. Enter your Colombian phone number
2. Receive SMS verification code
3. Enter code to verify
4. Create password

### 3. Complete Your Profile

After signing up, add:
- Full name
- Service address (where you want cleaning)
- Profile photo (optional but helps professionals recognize you)

### 4. Add Payment Method

Before your first booking, add a payment method:
- Credit/debit card
- PSE (Colombian bank transfer)
- Nequi (mobile wallet)

[Learn more about payment methods](#)

## What Happens Next

Once your account is created:
- Browse professionals in your area
- Book your first service
- Receive email confirmation

## Account Security

- ✅ Secure password encryption
- ✅ Two-factor authentication (optional)
- ✅ Email verification required
- ✅ Payment info protected by Stripe

## Common Questions

<details>
<summary>Do I need to verify my identity?</summary>
Basic verification (email + phone) is required. Additional identity verification (ID upload) is optional but increases your booking acceptance rate.
</details>

<details>
<summary>Can I change my email or phone later?</summary>
Yes, you can update these in your account settings. You'll need to verify the new email/phone number.
</details>

<details>
<summary>Is my information secure?</summary>
Yes, we use bank-level encryption and never share your personal information without your consent.
</details>

## Related Articles

- [Understanding verification tiers](#)
- [Your first booking: Step-by-step guide](#)
- [Payment methods accepted in Colombia](#)
```

---

#### Article 1.3: Your First Booking: Step-by-Step Guide

**Target Audience:** New customers
**Priority:** P0
**Word Count:** 500-600
**Writer:** Writer 1
**Screenshots Needed:** 4 (professional profiles, booking form, confirmation)
**GIF Needed:** 1 (full booking flow, 10-15 seconds)

**Outline:**

```markdown
# Your First Booking: Step-by-Step Guide

[1-sentence summary: Book your first cleaning in 5 easy steps—from finding the right professional to receiving instant confirmation.]

## Before You Book

✅ [Create your account](#) (if you haven't already)
✅ Add a payment method
✅ Confirm your service address

## Step-by-Step Booking Process

### Step 1: Find Professionals in Your Area

1. Go to [Find Professionals](/professionals)
2. Enter your location (or use current location)
3. Browse available professionals

**What You'll See:**
- Professional photos and bios
- Star ratings and review count
- Starting prices
- Services offered
- Availability

**Filter Options:**
- Price range
- Availability (specific date/time)
- Service type (standard, deep, move-in/out)
- Rating (4.5+, 4.7+, etc.)
- Verification badges

[Screenshot: Professional search results]

---

### Step 2: Review Professional Profiles

Click **"View Profile"** on any professional to see:
- Full bio and experience
- Portfolio photos (before/after examples)
- Complete review history
- Service areas covered
- Hourly rates
- Verification badges

**What to Look For:**
- ⭐ High rating (4.7+ recommended)
- 💬 Recent positive reviews
- ✅ Verification badges (Identity Verified, Background Checked)
- 📸 Portfolio photos showing quality work

[Screenshot: Professional profile page]

---

### Step 3: Select Date, Time, and Services

Click **"Book Service"** to start your booking.

**Booking Form Fields:**

1. **Service Date:** Select from professional's available dates
2. **Service Time:** Choose start time (morning, afternoon, evening)
3. **Service Type:**
   - Standard Cleaning (routine maintenance)
   - Deep Cleaning (thorough, all areas)
   - Move-In/Move-Out Cleaning
4. **Add-Ons (Optional):**
   - Inside fridge cleaning
   - Inside oven cleaning
   - Laundry service
   - Window cleaning
5. **Special Instructions:** Any specific requests or notes

[Screenshot: Booking form]

---

### Step 4: Review Price Breakdown

Before confirming, you'll see:

**Price Breakdown:**
- Base service: $[X] COP
- Add-ons: $[X] COP
- Platform fee: $[X] COP
- **Total: $[X] COP**

**What You're Paying For:**
- Professional's service (X hours)
- Insurance coverage
- Payment processing
- Customer support

**When You're Charged:**
- At booking: Payment **authorized** (held on card)
- After service: Payment **charged** (48 hours after completion)

[Learn more about payment timing](#)

[Screenshot: Price breakdown]

---

### Step 5: Confirm Your Booking

Review everything one last time:
- ✅ Date and time correct?
- ✅ Service type correct?
- ✅ Service address correct?
- ✅ Total price acceptable?

Click **"Confirm Booking"** to finalize.

[GIF: Booking confirmation animation]

---

## What Happens Next

### Immediately After Booking

1. **Email confirmation sent** with booking details
2. **Professional notified** (they have 24 hours to accept)
3. **Your card authorized** (payment held, not charged yet)

### Within 24 Hours

- Professional accepts booking (or it's auto-declined if no response)
- You receive acceptance notification
- Booking appears in your Dashboard

### Before Service Date

- Professional may message you (confirm details, ask questions)
- You'll receive reminders (24 hours before, 2 hours before)
- Professional can send "on my way" notification

### Day of Service

1. Professional GPS checks in (you get notification)
2. Service begins
3. In-app messaging available if needed
4. Professional checks out when complete

### After Service

- Rate and review professional (within 30 days)
- Payment charged 48 hours after completion
- Receipt sent via email

[Learn more about the complete booking lifecycle](#)

---

## Pro Tips for First Booking

1. **Book popular professionals early:** Top-rated professionals fill up fast
2. **Be specific in special instructions:** More detail = better results
3. **Be available for questions:** Professionals may message before service
4. **Be home for first booking:** Builds trust and allows walk-through
5. **Prepare the space:** Clear clutter for more efficient cleaning

---

## Common Questions

<details>
<summary>What if the professional doesn't accept?</summary>
If they don't respond within 24 hours, the booking is automatically canceled with no charge. You can then book with a different professional.
</details>

<details>
<summary>Can I cancel after booking?</summary>
Yes! Cancellation policy:
- More than 48 hours before: 100% refund
- 24-48 hours before: 50% refund
- Less than 24 hours: No refund

[Learn more about cancellation policy](#)
</details>

<details>
<summary>What if I need to reschedule?</summary>
You can request a reschedule, but the professional must re-accept. Treat it like a new booking for cancellation policy purposes.
</details>

<details>
<summary>Am I charged immediately?</summary>
Your card is authorized (hold) at booking but not charged until 48 hours after service completion.

[Learn more about payment timing](#)
</details>

## Related Articles

- [How to reschedule or cancel a booking](#)
- [Cancellation policy explained](#)
- [How payments work: Authorization vs charge](#)
- [What happens if the professional doesn't show up?](#)
```

**SEO Keywords:** first booking, how to book, book cleaning service, schedule cleaning
**Internal Links:** 5 related articles

---

#### Article 1.4: Payment Methods Accepted in Colombia

**Target Audience:** All customers
**Priority:** P0
**Word Count:** 300-400
**Writer:** Writer 3
**Screenshots Needed:** 1 (payment method selection)

**Outline:**

```markdown
# Payment Methods Accepted in Colombia

[1-sentence summary: MaidConnect accepts credit/debit cards, PSE, and Nequi for secure, convenient payments.]

## Accepted Payment Methods

### 1. Credit & Debit Cards 💳

**Accepted Cards:**
- Visa
- Mastercard
- American Express
- Diners Club

**How It Works:**
1. Add card to your account
2. Card is authorized at booking (payment held)
3. Charged 48 hours after service completion

**Security:**
- Processed by Stripe (bank-level encryption)
- Card number never stored by MaidConnect
- PCI DSS compliant

---

### 2. PSE (Pagos Seguros en Línea) 🏦

**Colombian bank transfer system**

**Supported Banks:**
- Bancolombia
- Davivienda
- Banco de Bogotá
- BBVA Colombia
- And 20+ more Colombian banks

**How It Works:**
1. Select PSE at checkout
2. Choose your bank
3. Log in to your bank account
4. Authorize payment
5. Instant confirmation

**Note:** PSE payments are charged immediately (not held like cards).

---

### 3. Nequi (Mobile Wallet) 📱

**Popular Colombian digital wallet**

**How It Works:**
1. Select Nequi at checkout
2. Enter your Nequi phone number
3. Confirm payment in Nequi app
4. Instant authorization

---

## Payment Security

All payments processed securely through **Stripe**:

- ✅ Bank-level encryption (SSL/TLS)
- ✅ PCI DSS Level 1 certified
- ✅ No card numbers stored by MaidConnect
- ✅ Fraud monitoring and prevention
- ✅ Secure authentication (3D Secure for cards)

**Your payment information is never visible to professionals or MaidConnect support team.**

---

## When You're Charged

**Credit/Debit Cards:**
- **At booking:** Authorization hold (payment reserved, not charged)
- **48 hours after service:** Charge processed

**PSE & Nequi:**
- **At booking:** Immediate charge
- **If canceled:** Refund processed based on cancellation policy

[Learn more about payment timing](#)

---

## Adding a Payment Method

### First-Time Setup

1. Go to [Dashboard → Payment Methods](/dashboard/payment-methods)
2. Click **"Add Payment Method"**
3. Choose your preferred method (Card, PSE, or Nequi)
4. Enter required information
5. Click **"Save"**

### Managing Payment Methods

- ✅ Add multiple payment methods
- ✅ Set default payment method
- ✅ Update or remove payment methods anytime

---

## Common Questions

<details>
<summary>Which payment method is fastest?</summary>
All methods provide instant confirmation. Cards offer authorization (no immediate charge), while PSE and Nequi charge immediately.
</details>

<details>
<summary>Can I pay cash?</summary>
No, MaidConnect requires electronic payment for security and convenience. This protects both customers and professionals.
</details>

<details>
<summary>Are there any fees for using PSE or Nequi?</summary>
MaidConnect doesn't charge extra fees for payment method choice. However, your bank may charge small fees for PSE transactions (check with your bank).
</details>

<details>
<summary>Is it safe to save my payment information?</summary>
Yes! Your payment details are encrypted and stored securely by Stripe (used by Amazon, Google, Shopify). MaidConnect never sees your full card number.
</details>

<details>
<summary>What if my payment fails?</summary>
If a payment fails:
1. Check your card/account has sufficient funds
2. Verify card hasn't expired
3. Try a different payment method
4. Contact your bank (they may be blocking the transaction)
5. Contact support if issue persists
</details>

## Related Articles

- [How payments work: Authorization vs charge](#)
- [When will I be charged?](#)
- [Payment security and PCI compliance](#)
- [Refund policy and timeline](#)
```

---

#### Article 1.5: How to Apply to Join MaidConnect (Professional)

**Target Audience:** Prospective professionals
**Priority:** P0
**Word Count:** 500-600
**Writer:** Writer 2
**Screenshots Needed:** 2 (application form, dashboard after approval)

**Outline:**

```markdown
# How to Apply to Join MaidConnect

[1-sentence summary: Join MaidConnect as a professional cleaner and earn up to $3,000,000 COP/month with flexible scheduling and 82% earnings.]

## Why Join MaidConnect?

💰 **High Earnings:** Keep 82% of what you charge (vs 60-75% on other platforms)
📅 **Flexible Schedule:** Set your own availability and rates
🛡️ **Safety & Support:** Background checks, insurance coverage, 24/7 support
📈 **Growing Platform:** Increasing customer demand every month
⭐ **Build Reputation:** Reviews and ratings help you earn more

---

## Who Can Apply?

### Requirements

✅ **Age:** 18 or older
✅ **Residency:** Colombian resident with valid ID (cédula) or passport
✅ **Experience:** At least 1 year of cleaning experience (residential or commercial)
✅ **Background:** Clean background check (no violent or theft-related offenses)
✅ **Communication:** Basic Spanish required, English helpful but not required
✅ **Supplies:** Ability to provide own cleaning supplies (or use customer's)

---

## Application Process (4 Steps)

### Step 1: Submit Application (15 minutes)

1. Go to [Apply as Professional](/apply)
2. Fill out application form:
   - Personal information (name, ID, contact)
   - Work experience (years, types of properties cleaned)
   - Service areas (neighborhoods you can serve)
   - References (2 work references)
3. Upload profile photo (professional, friendly, clear background)
4. Submit application

**What Happens:** You'll receive email confirmation within 24 hours.

---

### Step 2: Document Verification (1-2 business days)

Upload required documents:

**Required Documents:**
- ✅ Colombian ID (cédula) or passport (clear photo, not expired)
- ✅ Proof of address (utility bill or bank statement dated within 3 months)
- ✅ 2 work references with contact information
- ✅ Background check authorization (signed)
- ✅ Bank account details (for payouts)

[Complete documents checklist](#)

**What Happens:** Our team reviews your documents within 1-2 business days.

---

### Step 3: Background Check (3-5 business days)

We conduct a comprehensive background check:

- Criminal record check (Colombia national database)
- Identity verification
- Reference checks (we may contact your references)

**What Disqualifies:**
- Violent crimes
- Theft or fraud convictions
- Sexual offenses
- Recent drug-related offenses

**What Doesn't Disqualify:**
- Minor traffic violations
- Old misdemeanors (>5 years ago, case-by-case)

**What Happens:** You'll be notified of results within 3-5 business days.

---

### Step 4: Interview & Approval (1-2 business days)

**Video Interview (15-20 minutes):**
- Tell us about your cleaning experience
- Discuss your availability and service areas
- Answer scenario questions (customer service situations)
- Ask us questions about the platform

**What We're Looking For:**
- Professional demeanor
- Clear communication
- Customer service mindset
- Reliability indicators
- Genuine passion for cleaning work

**After Interview:**
- Decision within 1-2 business days
- If approved: Welcome email with onboarding instructions
- If not approved: Feedback provided, reapply after 6 months

---

## Total Timeline

| Step | Timeline |
|------|----------|
| Application submitted | Day 0 |
| Documents reviewed | 1-2 days |
| Background check | 3-5 days |
| Interview scheduled | Within 1 week |
| Final decision | 1-2 days after interview |
| **Total** | **7-12 days on average** |

---

## After You're Approved

### Onboarding Steps (1-2 hours)

1. **Complete your profile:**
   - Add services and pricing
   - Upload portfolio photos (before/after examples)
   - Write compelling bio
   - Set availability calendar

2. **Set up payouts:**
   - Connect Stripe bank account
   - Verify payout details

3. **Review guidelines:**
   - Professional standards
   - Platform policies
   - GPS check-in process
   - Customer communication best practices

4. **Go live:**
   - Profile reviewed and approved
   - You start receiving booking requests
   - Begin earning!

[Complete profile setup guide](#)

---

## Common Questions

<details>
<summary>How much can I earn?</summary>
Earnings vary based on your rates, availability, and booking volume. Many professionals earn $1,000,000-$3,000,000 COP/month. You keep 82% of what you charge.

[Learn more about earnings and payouts](#)
</details>

<details>
<summary>What if I'm rejected?</summary>
We'll provide feedback on why. You can reapply after 6 months if you address the issues (gain more experience, clear background issues, etc.).
</details>

<details>
<summary>Do I need my own cleaning supplies?</summary>
It depends. You can:
- Bring your own (charge higher rate, more control)
- Use customer's supplies (lower rate, less to carry)
- Offer both options (flexibility)
</details>

<details>
<summary>How do I get paid?</summary>
Automatic payouts twice weekly (Tuesdays & Fridays) via Stripe to your bank account. You get paid 48 hours after completing each booking.

[Learn more about payouts](#)
</details>

<details>
<summary>Can I set my own rates?</summary>
Yes! You set your hourly rate. We provide pricing guidance based on your experience and market rates, but you decide what to charge.
</details>

## Ready to Apply?

[Start Your Application](/apply) →

---

## Related Articles

- [Required documents checklist](#)
- [What to expect in your interview](#)
- [Understanding your earnings breakdown (82% net)](#)
- [Setting up your professional profile](#)
```

**SEO Keywords:** become professional cleaner, join maidconnect, cleaning professional, earn money cleaning
**CTA:** Strong "Start Your Application" button

---

### Additional P0 Articles (Full Outlines Available)

The remaining 15 P0 articles follow similar detailed structure. Here's the quick reference:

**Category 1 - Getting Started (continued):**
- Art 1.6: Required Documents Checklist (Professional)
- Art 1.7: Setting Up Your Professional Profile (Professional)
- Art 1.8: Your First Booking: What to Expect (Professional)

**Category 2 - Bookings & Scheduling:**
- Art 2.1: How to Book a Cleaning Service (Customer)
- Art 2.2: How to Reschedule or Cancel a Booking (Customer)
- Art 2.3: Cancellation Policy Explained (Customer)
- Art 2.4: What Happens If the Professional Doesn't Show Up? (Customer)
- Art 2.5: GPS Check-In: How It Works and Troubleshooting (Professional)
- Art 2.6: Checking Out and Completing Service (Professional)
- Art 2.7: Cancellation Policy for Professionals (Professional)

**Category 3 - Payments & Refunds:**
- Art 3.1: How Payments Work: Authorization vs Charge (Customer)
- Art 3.2: When Will I Be Charged? (Customer)
- Art 3.3: Refund Policy and Timeline (Customer)
- Art 3.4: When and How You Get Paid (Professional)
- Art 3.5: Understanding Your Earnings Breakdown (82% Net) (Professional)

**Category 4 - Safety & Trust:**
- Art 4.1: How Professionals Are Vetted and Verified (Customer)
- Art 4.2: Reporting Safety Concerns (Customer)
- Art 4.3: Background Check Process Explained (Professional)
- Art 4.4: Safety Guidelines for In-Home Services (Professional)
- Art 4.5: What to Do If a Customer Is Unsafe (Professional)

---

## Visual Assets Checklist

### Screenshots Required (Total: 25)

**Getting Started Articles:**
- [ ] Platform homepage
- [ ] Professional search results page
- [ ] Professional profile page
- [ ] Booking form (empty)
- [ ] Booking confirmation screen
- [ ] Email verification screen
- [ ] Sign-up form
- [ ] Payment method selection
- [ ] Application form (professional)
- [ ] Dashboard after approval

**Bookings & Scheduling Articles:**
- [ ] Booking details page
- [ ] Cancel booking flow
- [ ] Reschedule options
- [ ] GPS check-in button
- [ ] Check-in success confirmation
- [ ] GPS location permissions

**Payments Articles:**
- [ ] Price breakdown screen
- [ ] Payment timeline diagram (custom visual)
- [ ] Refund processing status
- [ ] Professional earnings dashboard
- [ ] Stripe payout setup screen

**Safety Articles:**
- [ ] Verification badges on profile
- [ ] Report safety issue form
- [ ] Background check authorization form

### GIFs Required (Total: 3)

- [ ] Complete booking flow (homepage → confirmation) - 15 sec
- [ ] GPS check-in process - 10 sec
- [ ] Professional profile setup - 12 sec

### Custom Graphics (Total: 2)

- [ ] Payment timeline infographic (authorization → hold → charge → payout)
- [ ] Application process flowchart (4 steps visual)

---

## Translation Checklist

### Pre-Translation Preparation

- [ ] All 20 English articles completed and reviewed
- [ ] All screenshots captioned (English)
- [ ] All links working and verified
- [ ] All SEO metadata written (title, description)
- [ ] Terminology consistent across all articles

### Translation Process

**Translator Requirements:**
- [ ] Native Colombian Spanish speaker
- [ ] Familiar with platform/SaaS terminology
- [ ] Understanding of Colombian payment systems (PSE, Nequi)
- [ ] Formal "usted" form used consistently

**Translation Deliverables per Article:**
- [ ] Article content (markdown format)
- [ ] SEO title (Spanish)
- [ ] Meta description (Spanish)
- [ ] Screenshot alt text (Spanish)
- [ ] FAQ questions and answers (Spanish)

### Translation Review

- [ ] Native speaker review of all translations
- [ ] Terminology consistency check
- [ ] Cultural adaptation (Colombian context)
- [ ] Link verification (Spanish URLs work)
- [ ] Preview in help center (formatting correct)

---

## Implementation Timeline

### Week 1 (Days 1-5)

**Days 1-2: Getting Started Articles**
- Writer 1: Articles 1.1, 1.2, 1.3 (Customer focus)
- Writer 2: Articles 1.5, 1.6, 1.7 (Professional focus)
- Writer 3: Article 1.4 (Payment methods)

**Days 3-4: Bookings & Payments Articles**
- Writer 1: Articles 2.1, 2.2, 2.3, 2.4 (Customer bookings)
- Writer 2: Articles 2.5, 2.6, 2.7 (Professional bookings)
- Writer 3: Articles 3.1, 3.2, 3.3, 3.4, 3.5 (Payments)

**Day 5: Safety Articles**
- Writer 2: Articles 4.1, 4.2, 4.3, 4.4, 4.5 (All safety)
- All Writers: Self-review and edits

### Week 2 (Days 6-10)

**Days 6-7: Screenshot & Visual Assets**
- All Writers: Capture required screenshots for their articles
- Designer/Writer 3: Create custom graphics (timeline, flowchart)

**Days 8-9: Translation**
- Professional translator: All 20 articles translated to Spanish
- Writers: Review translations for accuracy

**Day 10: Publishing & QA**
- Upload all articles to help center
- Verify links, images, formatting
- Test search functionality
- Final review and launch

---

## Success Metrics

### Launch Week Metrics (Week 1 After Launch)

**Usage Metrics:**
- **Page views:** Track most-viewed articles
- **Search queries:** Identify what users are searching for
- **Time on page:** Average 2-3 minutes per article (target)
- **Bounce rate:** <40% (target)

**Effectiveness Metrics:**
- **"Was this helpful?" responses:** >80% helpful (target)
- **Support ticket reduction:** 30-40% reduction in related tickets (target)
- **Self-service resolution:** 60% of help center visitors don't submit ticket (target)

**Content Gaps:**
- Track search queries with no matching articles
- Monitor support tickets for topics not covered
- Identify top 5 missing articles for Phase 2

### Month 1 Review (30 Days After Launch)

**Article Performance:**
- Top 10 most-viewed articles
- Bottom 5 articles (low traffic = possibly wrong topic or poor SEO)
- Articles with <70% helpful rating (need revision)

**User Behavior:**
- Repeat visitors to help center (indicates complexity)
- Articles viewed per session (1-2 = good, 5+ = struggling to find answer)
- Most common article paths (which articles do users read together?)

**Business Impact:**
- Support ticket volume reduction (target: 30%)
- First response time improvement (less load = faster responses)
- Customer/professional satisfaction scores (help center usefulness question)

---

## Phase 2 Planning

Based on Phase 1 results, Phase 2 will prioritize:

1. **Top Missing Content:** Articles identified from search queries
2. **Low Performer Revisions:** Articles with <70% helpful rating
3. **P1 Articles:** Next tier of important topics (Communication, Reviews, Account Settings)

**Phase 2 Target:** 30 additional articles, 80% overall platform coverage

---

## Appendix: Writing Checklists

### Per-Article Checklist

**Before Writing:**
- [ ] Research topic thoroughly (check platform docs, talk to support team)
- [ ] Identify target keywords
- [ ] Review related articles for cross-linking

**While Writing:**
- [ ] Follow content guidelines (tone, style, structure)
- [ ] Use customer language (not internal jargon)
- [ ] Include real examples and specific numbers
- [ ] Break up long paragraphs (3-4 sentences max)
- [ ] Add screenshots placeholders [Screenshot: description]
- [ ] Write FAQ section (3-5 common questions)
- [ ] Link 3-5 related articles

**After Writing:**
- [ ] Read aloud (does it flow naturally?)
- [ ] Run through Grammarly or Hemingway
- [ ] Check readability score (Grade 8 or below)
- [ ] Verify all facts and numbers are accurate
- [ ] Test all internal links
- [ ] Write SEO title and meta description

### Quality Standards

**Every Article Must Have:**
- ✅ Action-oriented title
- ✅ 1-sentence summary (first paragraph)
- ✅ Scannable headings (H2/H3 every 100-150 words)
- ✅ Numbered lists for steps
- ✅ Bullet points for non-sequential items
- ✅ "What happens next" section
- ✅ FAQ section (3-5 questions)
- ✅ Related articles (3-5 links)
- ✅ SEO metadata (title, description)

---

**Last Updated:** November 2025
**Next Review:** After Phase 1 completion
**Maintained By:** Content Team
