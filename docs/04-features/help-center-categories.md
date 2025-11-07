# Help Center Categories & Article Structure

**Complete mapping of all help center categories and articles for MaidConnect**

**Last Updated:** November 2025
**Owner:** Content Team
**Status:** Implementation Plan

---

## Table of Contents

1. [Category Overview](#category-overview)
2. [Category 1: Getting Started](#category-1-getting-started-rocket)
3. [Category 2: Bookings & Scheduling](#category-2-bookings--scheduling-calendar)
4. [Category 3: Payments & Refunds](#category-3-payments--refunds-credit-card)
5. [Category 4: Communication](#category-4-communication-book-open)
6. [Category 5: Reviews & Ratings](#category-5-reviews--ratings-book-open)
7. [Category 6: Safety & Trust](#category-6-safety--trust-shield)
8. [Category 7: Account & Settings](#category-7-account--settings-wrench)
9. [Implementation Summary](#implementation-summary)

---

## Category Overview

### Category Statistics

| Category | Customer Articles | Professional Articles | Total | Priority P0 | Status |
|----------|------------------|---------------------|-------|-------------|--------|
| 🚀 Getting Started | 5 | 5 | 10 | 5 | Phase 1 |
| 📅 Bookings & Scheduling | 6 | 7 | 13 | 5 | Phase 1 |
| 💳 Payments & Refunds | 7 | 7 | 14 | 5 | Phase 1 |
| 💬 Communication | 4 | 4 | 8 | 0 | Phase 2 |
| ⭐ Reviews & Ratings | 5 | 6 | 11 | 0 | Phase 2 |
| 🛡️ Safety & Trust | 6 | 5 | 11 | 5 | Phase 1 |
| ⚙️ Account & Settings | 5 | 5 | 10 | 0 | Phase 2 |
| **TOTAL** | **38** | **39** | **77** | **20** | — |

### Database Schema

```sql
-- Categories table structure
CREATE TABLE help_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  icon text NOT NULL, -- book-open, calendar, credit-card, shield-check, wrench, rocket
  name_en text NOT NULL,
  name_es text NOT NULL,
  description_en text NOT NULL,
  description_es text NOT NULL,
  display_order integer NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

---

## Category 1: Getting Started 🚀

### Category Details

| Field | Value |
|-------|-------|
| **Slug** | `getting-started` |
| **Icon** | `rocket` |
| **Name (EN)** | Getting Started |
| **Name (ES)** | Primeros Pasos |
| **Display Order** | 1 |

**Description (EN):**
"New to MaidConnect? Start here to learn how the platform works, create your account, and get ready for your first booking or service."

**Description (ES):**
"¿Nuevo en MaidConnect? Comience aquí para aprender cómo funciona la plataforma, crear su cuenta y prepararse para su primera reserva o servicio."

---

### Customer Articles (5)

#### Article 1.1: Welcome to MaidConnect: How It Works
- **Priority:** P0 (Launch-critical)
- **Phase:** 1
- **Word Count:** 400-500
- **Audience:** New customers
- **Keywords:** how maidconnect works, platform overview, cleaning service platform

**Content Outline:**
1. What is MaidConnect? (2-sided marketplace for home cleaning)
2. How it works (3 simple steps: Find, Book, Enjoy)
3. Safety & trust (background checks, insurance, ratings)
4. Pricing transparency (upfront pricing, no hidden fees)
5. Next steps (Create account, browse professionals)

**Key Points:**
- Emphasize safety (background-checked professionals)
- Highlight convenience (book in minutes, service in days)
- Build trust (secure payments, refund protection)

---

#### Article 1.2: Creating Your Customer Account
- **Priority:** P1 (Important)
- **Phase:** 1
- **Word Count:** 300-400
- **Audience:** New customers
- **Keywords:** sign up, create account, register

**Content Outline:**
1. Account creation methods (email, Google, phone)
2. Required information (name, email, phone, address)
3. Email verification process
4. Setting up your profile
5. Next steps (Browse professionals)

**Screenshots Needed:**
- Sign-up form
- Email verification screen

---

#### Article 1.3: Understanding Verification Tiers
- **Priority:** P2 (Nice-to-have)
- **Phase:** 3
- **Word Count:** 400-500
- **Audience:** All customers
- **Keywords:** verification, identity verification, account security

**Content Outline:**
1. Why verification matters (trust, safety)
2. Verification tiers explained:
   - Basic (email + phone)
   - Standard (+ ID document)
   - Premium (+ video selfie)
3. Benefits of each tier
4. How to verify your account
5. Privacy & security assurances

---

#### Article 1.4: Your First Booking: Step-by-Step Guide
- **Priority:** P0 (Launch-critical)
- **Phase:** 1
- **Word Count:** 500-600
- **Audience:** New customers
- **Keywords:** first booking, how to book, booking guide

**Content Outline:**
1. Finding professionals (browse, search, filters)
2. Reviewing professional profiles
3. Selecting date and time
4. Adding service details and add-ons
5. Reviewing total price
6. Confirming booking
7. What happens next (professional acceptance, payment)

**Screenshots Needed:**
- Professional search results
- Profile page with "Book Service" button
- Booking form
- Confirmation screen

**GIF Needed:**
- Full booking flow (10-15 seconds)

---

#### Article 1.5: Payment Methods Accepted in Colombia
- **Priority:** P0 (Launch-critical)
- **Phase:** 1
- **Word Count:** 300-400
- **Audience:** All customers
- **Keywords:** payment methods, credit card, PSE, Nequi

**Content Outline:**
1. Accepted payment methods:
   - Credit/debit cards (Visa, Mastercard, Amex)
   - PSE (bank transfer)
   - Nequi (mobile wallet)
2. Payment security (PCI compliance, Stripe)
3. When you're charged (48h after service)
4. Setting up payment method
5. Changing payment methods

---

### Professional Articles (5)

#### Article 1.6: How to Apply to Join MaidConnect
- **Priority:** P0 (Launch-critical)
- **Phase:** 1
- **Word Count:** 500-600
- **Audience:** Prospective professionals
- **Keywords:** apply, join, become professional, application

**Content Outline:**
1. Who can apply (requirements: 18+, Colombian resident, cleaning experience)
2. Application process (4 steps)
3. Required documents checklist
4. Timeline expectations (3-5 days review)
5. What happens after approval
6. Rejection reasons and reapplication

**Key Points:**
- Emphasize earnings potential (82% net)
- Highlight flexibility (set your own schedule)
- Build excitement (join successful professionals)

---

#### Article 1.7: Required Documents Checklist
- **Priority:** P0 (Launch-critical)
- **Phase:** 1
- **Word Count:** 400-500
- **Audience:** Prospective professionals
- **Keywords:** documents, requirements, application documents

**Content Outline:**
1. Identity documents:
   - Colombian ID (cédula) or passport
   - Proof of address (utility bill, bank statement)
2. Professional documents:
   - Work experience reference letters (2 minimum)
   - Background check authorization
3. Banking documents:
   - Bank account for payouts
   - Tax ID (RUT if applicable)
4. Photo requirements:
   - Professional headshot
   - Example of cleaned space (portfolio)
5. How to upload documents

**Checklist Format:**
- [ ] Colombian ID or passport (clear photo, not expired)
- [ ] Proof of address (dated within 3 months)
- [ ] Reference letters (2 minimum, with contact info)
- [ ] Background check authorization (signed)
- [ ] Bank account details
- [ ] Professional headshot
- [ ] Portfolio photos (2-3 examples)

---

#### Article 1.8: What to Expect in Your Interview
- **Priority:** P1 (Important)
- **Phase:** 2
- **Word Count:** 500-600
- **Audience:** Prospective professionals
- **Keywords:** interview, video interview, application interview

**Content Outline:**
1. Interview format (video call, 15-20 minutes)
2. What we'll ask:
   - Your cleaning experience
   - Availability and service areas
   - Customer service approach
   - Handling difficult situations
3. Questions to ask us
4. Tips for success (professional setting, good lighting, quiet space)
5. What happens after the interview
6. Timeline to decision (1-2 business days)

---

#### Article 1.9: Setting Up Your Professional Profile
- **Priority:** P0 (Launch-critical)
- **Phase:** 1
- **Word Count:** 600-700
- **Audience:** New professionals
- **Keywords:** profile setup, professional profile, profile optimization

**Content Outline:**
1. Profile photo guidelines (professional, friendly, clear background)
2. Writing your bio (showcase experience, specialties)
3. Adding services and pricing
4. Setting your availability
5. Service areas (neighborhoods you serve)
6. Portfolio photos (before/after examples)
7. Profile optimization tips (complete profile = 3x more bookings)

**Screenshots Needed:**
- Profile editing form
- Example of great professional profile

**Key Stat:**
"Professionals with complete profiles get 3x more booking requests."

---

#### Article 1.10: Your First Booking: What to Expect
- **Priority:** P0 (Launch-critical)
- **Phase:** 1
- **Word Count:** 500-600
- **Audience:** New professionals
- **Keywords:** first booking, new professional, getting started

**Content Outline:**
1. Receiving booking notifications
2. Reviewing customer profile and booking details
3. Accepting the booking (24-hour response window)
4. Preparing for the service
5. GPS check-in process
6. During the service
7. Completing and checking out
8. Getting paid (48h + 1-3 business days)

**Key Points:**
- Emphasize professionalism
- Explain payment timeline clearly
- Set expectations for first booking experience

---

## Category 2: Bookings & Scheduling 📅

### Category Details

| Field | Value |
|-------|-------|
| **Slug** | `bookings-scheduling` |
| **Icon** | `calendar` |
| **Name (EN)** | Bookings & Scheduling |
| **Name (ES)** | Reservas y Programación |
| **Display Order** | 2 |

**Description (EN):**
"Learn how to create, manage, and modify bookings. Understand cancellation policies, rescheduling options, and what to do if issues arise."

**Description (ES):**
"Aprenda cómo crear, administrar y modificar reservas. Comprenda las políticas de cancelación, opciones de reprogramación y qué hacer si surgen problemas."

---

### Customer Articles (6)

#### Article 2.1: How to Book a Cleaning Service
- **Priority:** P0 (Launch-critical)
- **Phase:** 1
- **Word Count:** 500-600
- **Audience:** All customers
- **Keywords:** book service, make booking, schedule cleaning

**Content Outline:**
1. Finding the right professional
2. Selecting date and time
3. Choosing service type and add-ons
4. Reviewing price breakdown
5. Confirming booking
6. What happens next (professional acceptance timeline)
7. Booking confirmation details

**Screenshots Needed:**
- Booking form with date/time picker
- Price breakdown
- Confirmation screen

---

#### Article 2.2: How to Reschedule or Cancel a Booking
- **Priority:** P0 (Launch-critical)
- **Phase:** 1
- **Word Count:** 400-500
- **Audience:** All customers
- **Keywords:** cancel booking, reschedule, change booking

**Content Outline:**
1. When you can reschedule or cancel
2. How to reschedule:
   - Step-by-step instructions
   - Professional must re-accept
3. How to cancel:
   - Step-by-step instructions
   - Cancellation confirmation
4. Refund timeline based on cancellation timing
5. What happens to your payment
6. Rebooking after cancellation

---

#### Article 2.3: Cancellation Policy Explained
- **Priority:** P0 (Launch-critical)
- **Phase:** 1
- **Word Count:** 500-600
- **Audience:** All customers
- **Keywords:** cancellation policy, refund policy, cancel fee

**Content Outline:**
1. Cancellation policy overview
2. Refund tiers:
   - **>48 hours before:** 100% refund
   - **24-48 hours before:** 50% refund
   - **<24 hours before:** No refund
3. Why this policy? (Professional income protection)
4. Exceptions (emergencies, professional no-show)
5. How to request policy exception
6. Best practices (book with confidence, communicate early)

**Visual Needed:**
Table showing cancellation timeline and refund percentage

---

#### Article 2.4: What Happens If the Professional Doesn't Show Up?
- **Priority:** P0 (Launch-critical)
- **Phase:** 1
- **Word Count:** 300-400
- **Audience:** All customers
- **Keywords:** no show, professional didn't come, missed booking

**Content Outline:**
1. What to do immediately (wait 15 minutes, message professional, contact support)
2. Automatic full refund (within 24 hours)
3. Rebooking options (priority support for rebooking)
4. Professional consequences (account review, potential suspension)
5. How we prevent no-shows (GPS verification, rating system)

**Key Point:**
"You're fully protected. If a professional doesn't show up, you get an immediate 100% refund—no questions asked."

---

#### Article 2.5: Approving Time Extensions During Service
- **Priority:** P1 (Important)
- **Phase:** 2
- **Word Count:** 300-400
- **Audience:** All customers
- **Keywords:** time extension, additional time, service longer

**Content Outline:**
1. Why time extensions happen (larger space, extra tasks)
2. How you'll be notified (in-app notification, SMS)
3. Reviewing the extension request
4. Approving or declining
5. How extension pricing works (hourly rate × additional time)
6. Payment for extensions

---

#### Article 2.6: Understanding Booking Statuses
- **Priority:** P2 (Nice-to-have)
- **Phase:** 3
- **Word Count:** 300-400
- **Audience:** All customers
- **Keywords:** booking status, pending, confirmed, completed

**Content Outline:**
1. Booking status lifecycle:
   - **Pending:** Awaiting professional acceptance
   - **Confirmed:** Professional accepted, scheduled
   - **In Progress:** Service is happening now
   - **Completed:** Service finished, awaiting review
   - **Cancelled:** Booking cancelled
   - **Disputed:** Issue reported, under review
2. What each status means
3. Actions available in each status
4. Notifications for status changes

---

### Professional Articles (7)

#### Article 2.7: Receiving and Reviewing Booking Requests
- **Priority:** P0 (Launch-critical)
- **Phase:** 1
- **Word Count:** 400-500
- **Audience:** All professionals
- **Keywords:** booking request, new booking, accept booking

**Content Outline:**
1. How you'll be notified (push, SMS, email)
2. Reviewing booking details:
   - Customer profile and ratings
   - Service type and add-ons
   - Date, time, location
   - Total earnings
3. 24-hour response window
4. What happens if you don't respond (auto-declined)
5. Acceptance vs decline decision factors

---

#### Article 2.8: Accepting or Declining Bookings Wisely
- **Priority:** P0 (Launch-critical)
- **Phase:** 1
- **Word Count:** 500-600
- **Audience:** All professionals
- **Keywords:** accept booking, decline booking, booking strategy

**Content Outline:**
1. When to accept:
   - Fits your schedule
   - Service within your area
   - Customer has good ratings
   - You have necessary supplies
2. When to decline (politely):
   - Outside service area
   - Time conflict
   - Request beyond your skills
   - Customer red flags (low rating, concerning messages)
3. Decline rate tracking (>50% = warning)
4. How declines affect your ranking
5. Best practices (respond quickly, communicate professionally)

**Key Stat:**
"Professionals who respond within 2 hours get 60% more bookings."

---

#### Article 2.9: GPS Check-In: How It Works and Troubleshooting
- **Priority:** P0 (Launch-critical)
- **Phase:** 1
- **Word Count:** 500-600
- **Audience:** All professionals
- **Keywords:** GPS check-in, location verification, check in troubleshooting

**Content Outline:**
1. Why GPS check-in is required (fraud prevention, customer trust)
2. How it works:
   - Arrive at customer location
   - Open MaidConnect app
   - Tap "Check In"
   - GPS verifies you're within 150m
   - Service starts
3. Troubleshooting:
   - Enable location permissions
   - Try moving outdoors
   - Check GPS signal strength
   - Wait 30 seconds and retry
4. Manual override (contact support if GPS fails)
5. GPS checkout process

**Screenshots Needed:**
- Check-in button
- Location permissions screen
- Successful check-in confirmation

**GIF Needed:**
- GPS check-in flow

---

#### Article 2.10: Requesting Additional Time During Service
- **Priority:** P1 (Important)
- **Phase:** 2
- **Word Count:** 400-500
- **Audience:** All professionals
- **Keywords:** time extension, additional time, request more time

**Content Outline:**
1. When to request additional time (more work than expected, customer adds tasks)
2. How to request extension:
   - Tap "Request Time Extension"
   - Enter additional hours needed
   - Provide reason (optional but recommended)
   - Send request to customer
3. Customer has 5 minutes to respond
4. If approved (continue working, earnings updated)
5. If declined (complete original booking scope)
6. Best practices (communicate early, explain clearly)

---

#### Article 2.11: Checking Out and Completing Service
- **Priority:** P0 (Launch-critical)
- **Phase:** 1
- **Word Count:** 400-500
- **Audience:** All professionals
- **Keywords:** check out, complete booking, finish service

**Content Outline:**
1. Before checking out:
   - Ensure all tasks completed
   - Walk-through with customer (if present)
   - Address any concerns
2. GPS checkout process
3. Marking booking as complete
4. Asking customer for review (polite reminder)
5. What happens next:
   - 48-hour hold period
   - Earnings deposited to account
   - Booking appears in history

**Key Point:**
"You get paid 48 hours after checking out, once the customer confirms service was delivered."

---

#### Article 2.12: Managing Your Availability Calendar
- **Priority:** P1 (Important)
- **Phase:** 2
- **Word Count:** 500-600
- **Audience:** All professionals
- **Keywords:** availability, calendar, set schedule, manage schedule

**Content Outline:**
1. Setting regular availability (weekly schedule)
2. Blocking off dates (vacations, personal time)
3. Adjusting hours (morning, afternoon, evening slots)
4. Last-minute availability changes
5. Buffer time between bookings (travel time)
6. Availability best practices:
   - More availability = more bookings
   - Consistent schedule = better rankings
   - Update calendar proactively

**Screenshots Needed:**
- Calendar settings page
- Weekly availability editor

---

#### Article 2.13: Cancellation Policy for Professionals
- **Priority:** P0 (Launch-critical)
- **Phase:** 1
- **Word Count:** 500-600
- **Audience:** All professionals
- **Keywords:** professional cancellation, cancel booking, cancellation consequences

**Content Outline:**
1. Professional cancellation policy (more strict than customer)
2. Consequences by timing:
   - **>48 hours before:** Warning (OK occasionally)
   - **24-48 hours before:** Account review
   - **<24 hours before:** Account suspension risk
   - **After check-in:** Immediate account suspension
3. Valid cancellation reasons (emergency, illness)
4. How to cancel properly (early notice, offer alternative dates)
5. Cancellation rate tracking
6. Customer always receives full refund
7. Impact on your reputation and earnings

**Key Point:**
"Your reliability is your reputation. Cancellations hurt your rankings and customer trust."

---

## Category 3: Payments & Refunds 💳

### Category Details

| Field | Value |
|-------|-------|
| **Slug** | `payments-refunds` |
| **Icon** | `credit-card` |
| **Name (EN)** | Payments & Refunds |
| **Name (ES)** | Pagos y Reembolsos |
| **Display Order** | 3 |

**Description (EN):**
"Understand how payments work, when you'll be charged, refund policies, and how to manage your payment methods securely."

**Description (ES):**
"Comprenda cómo funcionan los pagos, cuándo se le cobrará, las políticas de reembolso y cómo administrar sus métodos de pago de forma segura."

---

### Customer Articles (7)

#### Article 3.1: How Payments Work: Authorization vs Charge
- **Priority:** P0 (Launch-critical)
- **Phase:** 1
- **Word Count:** 500-600
- **Audience:** All customers
- **Keywords:** payment process, how payments work, when charged

**Content Outline:**
1. Two-step payment process:
   - **Step 1:** Authorization (hold) at booking
   - **Step 2:** Charge 48 hours after service completion
2. Why the hold? (ensures payment available, protects professionals)
3. What authorization looks like on your statement
4. When the hold becomes a charge
5. 48-hour dispute window
6. What if booking is cancelled (hold released immediately)

**Visual Needed:**
Timeline diagram showing authorization → service → 48h hold → charge

**Key Point:**
"Your card is authorized at booking, but you're not charged until 48 hours after service—giving you time to report any issues."

---

#### Article 3.2: When Will I Be Charged?
- **Priority:** P0 (Launch-critical)
- **Phase:** 1
- **Word Count:** 300-400
- **Audience:** All customers
- **Keywords:** when charged, payment timing, billing

**Content Outline:**
1. Payment timeline:
   - At booking: Authorization hold
   - During service: Still on hold
   - Service completed: 48-hour countdown starts
   - 48 hours after completion: Charge processed
   - Receipt sent via email
2. Why 48 hours? (Dispute window)
3. What if you have an issue? (File dispute within 48h)
4. Bank processing time (may take 1-2 days to show on statement)

---

#### Article 3.3: Payment Security and PCI Compliance
- **Priority:** P1 (Important)
- **Phase:** 2
- **Word Count:** 400-500
- **Audience:** All customers
- **Keywords:** payment security, secure payments, PCI compliance

**Content Outline:**
1. How we protect your payment information
2. Stripe payment processing (never store card numbers)
3. PCI DSS Level 1 compliance
4. Encryption (SSL/TLS)
5. No one at MaidConnect can see your card details
6. Two-factor authentication for accounts
7. Fraud monitoring and prevention
8. What to do if you suspect fraud

**Trust Signals:**
- "Powered by Stripe (used by Amazon, Google, Shopify)"
- "Bank-level encryption"
- "PCI compliant"

---

#### Article 3.4: Refund Policy and Timeline
- **Priority:** P0 (Launch-critical)
- **Phase:** 1
- **Word Count:** 500-600
- **Audience:** All customers
- **Keywords:** refund policy, refunds, get refund

**Content Outline:**
1. When you get a refund:
   - Cancellation (based on timing)
   - Professional no-show (100%)
   - Service issue (partial or full, case-by-case)
2. Refund timeline:
   - Request processed: Within 24 hours
   - Refund issued: 5-10 business days (bank processing)
3. Partial vs full refunds
4. Refund to original payment method
5. Dispute process (if refund denied)
6. How to track refund status

**Key Point:**
"Refunds are issued within 24 hours, but may take 5-10 business days to appear in your account depending on your bank."

---

#### Article 3.5: How to Tip Your Professional
- **Priority:** P1 (Important)
- **Phase:** 2
- **Word Count:** 300-400
- **Audience:** All customers
- **Keywords:** tipping, tip, gratuity

**Content Outline:**
1. Tipping on MaidConnect (optional but appreciated)
2. How to tip:
   - After service completion
   - Enter tip amount or percentage
   - Tip goes 100% to professional
3. Recommended tipping:
   - Good service: 10-15%
   - Exceptional service: 20%+
4. When tip is charged (immediately, separate transaction)
5. Tip appears on professional's earnings same day

**Cultural Note:**
"Tipping is becoming more common in Colombia's service industry. It's a great way to show appreciation for exceptional service."

---

#### Article 3.6: Disputing a Charge
- **Priority:** P1 (Important)
- **Phase:** 2
- **Word Count:** 400-500
- **Audience:** All customers
- **Keywords:** dispute charge, unauthorized charge, payment dispute

**Content Outline:**
1. When to dispute a charge:
   - Service not delivered as booked
   - Professional didn't show up (didn't get auto-refund)
   - Charged incorrect amount
   - Unauthorized charge
2. How to file a dispute (within 48 hours for best results)
3. What information to provide (details, photos, evidence)
4. Investigation timeline (3-5 business days)
5. Dispute resolution outcomes
6. What if dispute is denied (appeal process)

---

#### Article 3.7: Downloading Payment Receipts
- **Priority:** P2 (Nice-to-have)
- **Phase:** 3
- **Word Count:** 300-400
- **Audience:** All customers
- **Keywords:** receipt, invoice, download receipt

**Content Outline:**
1. Where to find receipts (Dashboard → Bookings → Receipt)
2. Receipt details included
3. How to download (PDF format)
4. Receipts sent via email automatically
5. Requesting duplicate receipts
6. Tax purposes (if applicable)

---

### Professional Articles (7)

#### Article 3.8: When and How You Get Paid
- **Priority:** P0 (Launch-critical)
- **Phase:** 1
- **Word Count:** 500-600
- **Audience:** All professionals
- **Keywords:** get paid, payout, earnings, when paid

**Content Outline:**
1. Payout timeline:
   - Service completed and checked out
   - 48-hour hold period (dispute window)
   - Earnings added to balance
   - Automatic payout (twice weekly: Tuesdays & Fridays)
   - Bank deposit (1-3 business days)
2. Total timeline: Service → 4-10 days → Bank account
3. Minimum payout: $50,000 COP
4. Early payout options (if available)
5. Tracking your earnings and payouts

**Visual Needed:**
Timeline diagram showing payout process

**Key Point:**
"You get paid twice weekly. After the 48-hour hold, earnings are automatically deposited to your bank account on Tuesday or Friday."

---

#### Article 3.9: Understanding Your Earnings Breakdown (82% Net)
- **Priority:** P0 (Launch-critical)
- **Phase:** 1
- **Word Count:** 500-600
- **Audience:** All professionals
- **Keywords:** earnings, commission, how much I make, 82 percent

**Content Outline:**
1. Earnings structure:
   - Your rate: What customer pays
   - Platform commission: 18%
   - Your net: 82%
2. What the 18% covers:
   - Payment processing (Stripe fees)
   - Insurance and trust & safety
   - Customer support
   - Marketing and bookings
   - Platform development
3. Example calculation
4. Tips (100% goes to you, no commission)
5. How to maximize earnings (higher rates, more bookings, great reviews)

**Example:**
"Customer pays COP 100,000 → You earn COP 82,000 (COP 18,000 platform commission)"

**Key Point:**
"82% is among the highest in the industry. Other platforms take 25-40%."

---

#### Article 3.10: Setting Up Your Stripe Bank Account
- **Priority:** P0 (Launch-critical)
- **Phase:** 1
- **Word Count:** 400-500
- **Audience:** New professionals
- **Keywords:** bank account, payout setup, Stripe setup

**Content Outline:**
1. Why Stripe? (secure, fast, used by major companies)
2. Required information:
   - Full name (matches ID)
   - Bank name
   - Account type (savings or checking)
   - Account number
   - Tax ID (if applicable)
3. Step-by-step setup process
4. Verification (small test deposit)
5. Updating bank account information
6. Troubleshooting failed payouts

**Screenshots Needed:**
- Bank account setup form
- Verification screen

---

#### Article 3.11: Payout Schedule Explained
- **Priority:** P1 (Important)
- **Phase:** 2
- **Word Count:** 400-500
- **Audience:** All professionals
- **Keywords:** payout schedule, when get paid, payment schedule

**Content Outline:**
1. Twice-weekly payout schedule:
   - **Tuesday:** Payouts for earnings from previous Wednesday-Tuesday
   - **Friday:** Payouts for earnings from previous Wednesday-Tuesday
2. Cutoff times (midnight Colombia time)
3. Bank processing time (1-3 business days after payout initiated)
4. Minimum balance requirement ($50,000 COP)
5. What if balance is under minimum (carries over to next payout)
6. Holiday delays (Colombian bank holidays)

**Calendar Visual:**
Example week showing cutoff dates and payout dates

---

#### Article 3.12: Minimum Payout Requirements
- **Priority:** P1 (Important)
- **Phase:** 2
- **Word Count:** 300-400
- **Audience:** All professionals
- **Keywords:** minimum payout, $50000 cop minimum, payout threshold

**Content Outline:**
1. Minimum payout: $50,000 COP
2. Why minimum payouts? (Reduces bank fees, administrative costs)
3. What happens if below minimum:
   - Earnings accumulate
   - Payout when threshold reached
   - No expiration on balance
4. Checking your current balance
5. Strategies to reach minimum faster (accept more bookings, offer add-ons)

---

#### Article 3.13: What If I Don't Receive My Payout?
- **Priority:** P1 (Important)
- **Phase:** 2
- **Word Count:** 400-500
- **Audience:** All professionals
- **Keywords:** missing payout, payout not received, payout troubleshooting

**Content Outline:**
1. Check payout status in dashboard
2. Common reasons for delayed payouts:
   - Below minimum threshold
   - Bank account verification pending
   - Incorrect bank details
   - Bank processing delays
   - Colombian bank holiday
3. How long to wait (up to 5 business days)
4. Contacting support with:
   - Payout ID
   - Expected payout date
   - Bank account details (last 4 digits)
5. Updating bank information
6. Payout reissue process

---

#### Article 3.14: Tips and How They Work
- **Priority:** P2 (Nice-to-have)
- **Phase:** 3
- **Word Count:** 300-400
- **Audience:** All professionals
- **Keywords:** tips, gratuity, extra earnings

**Content Outline:**
1. How tips work on MaidConnect
2. Customers can tip after service completion
3. Tips are 100% yours (no commission)
4. Tips deposited with regular payouts
5. Encouraging tips (without asking directly):
   - Exceptional service
   - Going above and beyond
   - Professional communication
6. Thank customers who tip (builds loyalty)

**Key Point:**
"Tips are a great way to boost earnings. Professionals with 4.8+ ratings average 30% more in tips."

---

## Category 4: Communication 💬

### Category Details

| Field | Value |
|-------|-------|
| **Slug** | `communication` |
| **Icon** | `book-open` |
| **Name (EN)** | Communication |
| **Name (ES)** | Comunicación |
| **Display Order** | 4 |

**Description (EN):**
"Learn how to use in-app messaging, automatic translation, and best practices for professional communication between customers and professionals."

**Description (ES):**
"Aprenda a usar la mensajería en la aplicación, la traducción automática y las mejores prácticas para la comunicación profesional entre clientes y profesionales."

---

### Customer Articles (4)

#### Article 4.1: How to Message Your Professional
- **Priority:** P1 (Important)
- **Phase:** 2
- **Word Count:** 300-400
- **Audience:** All customers
- **Keywords:** messaging, send message, contact professional

**Content Outline:**
1. Finding the messaging feature (Dashboard → Booking → Messages)
2. Before booking accepted (limited messaging for safety)
3. After booking confirmed (full messaging)
4. Message notifications (push, SMS, email)
5. Message etiquette (be clear, polite, timely)
6. What to message about (questions, special instructions, changes)
7. Emergency during service (call support if urgent)

---

#### Article 4.2: Automatic EN↔ES Translation
- **Priority:** P1 (Important)
- **Phase:** 2
- **Word Count:** 400-500
- **Audience:** All customers
- **Keywords:** translation, automatic translation, spanish english

**Content Outline:**
1. How automatic translation works
2. Languages supported (English ↔ Spanish)
3. Both parties see messages in their language
4. Original message always available (toggle view)
5. Translation accuracy (powered by Google Translate or similar)
6. What to do if translation seems wrong (simplify message, use clearer language)
7. Benefits (communicate easily, no language barrier)

**Key Point:**
"Speak your language, they see theirs. MaidConnect automatically translates every message so you can communicate effortlessly."

---

#### Article 4.3: Why Keep Communication In-App
- **Priority:** P1 (Important)
- **Phase:** 2
- **Word Count:** 400-500
- **Audience:** All customers
- **Keywords:** in-app messaging, off-platform communication, safety

**Content Outline:**
1. Benefits of in-app communication:
   - Payment protection (disputes require message history)
   - Safety (tracked and monitored)
   - Support can review messages if issues arise
   - Automatic translation
   - Permanent record
2. Risks of off-platform communication:
   - No payment protection
   - No dispute resolution
   - Safety concerns
   - Platform policy violation
3. What to do if professional asks for WhatsApp/phone (politely decline, report if pushy)

**Key Point:**
"Keep all communication in-app to stay protected. If something goes wrong, we can only help if we have a record of your conversation."

---

#### Article 4.4: Understanding Message Notifications
- **Priority:** P2 (Nice-to-have)
- **Phase:** 3
- **Word Count:** 300-400
- **Audience:** All customers
- **Keywords:** notifications, message alerts, manage notifications

**Content Outline:**
1. Types of notifications (push, SMS, email)
2. When you'll be notified (new message, professional response)
3. Managing notification preferences
4. Turning notifications on/off
5. Quiet hours (if available)
6. Troubleshooting notifications not working

---

### Professional Articles (4)

#### Article 4.5: Best Practices for Customer Communication
- **Priority:** P1 (Important)
- **Phase:** 2
- **Word Count:** 500-600
- **Audience:** All professionals
- **Keywords:** communication, professional communication, customer service

**Content Outline:**
1. Why communication matters (builds trust, reduces cancellations, improves ratings)
2. Response time (respond within 2 hours for best results)
3. Professional tone (friendly but professional, correct grammar)
4. What to communicate:
   - Confirm booking details
   - Ask clarifying questions
   - Confirm arrival time
   - Notify if running late
   - Share updates during service
5. What NOT to say (complaints, personal problems, inappropriate topics)
6. Handling difficult customers (stay calm, professional, escalate if needed)

**Key Stats:**
- "Professionals who respond within 2 hours get 60% more bookings"
- "Good communication improves ratings by 0.3 stars on average"

---

#### Article 4.6: Using Quick Reply Templates
- **Priority:** P2 (Nice-to-have)
- **Phase:** 3
- **Word Count:** 400-500
- **Audience:** All professionals
- **Keywords:** quick replies, templates, message templates

**Content Outline:**
1. What are quick replies (pre-written message templates)
2. How to use quick replies
3. Available templates:
   - Booking confirmation
   - Running late
   - Arrived at location
   - Service completed
   - Thank you for booking
   - Follow-up after service
4. Customizing templates
5. Creating your own templates
6. When to use templates vs personalized messages

---

#### Article 4.7: Automatic Translation: How It Helps You
- **Priority:** P1 (Important)
- **Phase:** 2
- **Word Count:** 400-500
- **Audience:** All professionals
- **Keywords:** translation, english customers, language barrier

**Content Outline:**
1. Expanding your customer base (serve English-speaking customers)
2. How automatic translation works
3. You write in Spanish, they see English (and vice versa)
4. Tips for clear communication:
   - Use simple sentences
   - Avoid slang or regional expressions
   - Be specific and clear
5. Review original message if needed
6. Translation accuracy tips

**Key Point:**
"Don't let language limit your earnings. Serve both Spanish and English customers with automatic translation."

---

#### Article 4.8: Why Not Share Your WhatsApp Number
- **Priority:** P1 (Important)
- **Phase:** 2
- **Word Count:** 400-500
- **Audience:** All professionals
- **Keywords:** whatsapp, off-platform, phone number, policy violation

**Content Outline:**
1. Platform policy (all communication must be in-app)
2. Why this policy exists:
   - Payment protection (disputes require message history)
   - Safety monitoring
   - Customer trust
   - Platform support can't help with off-platform issues
3. Consequences of sharing contact info:
   - First offense: Warning
   - Second offense: Account suspension
   - Third offense: Permanent ban
4. What customers might request off-platform communication (politely decline)
5. Reporting customers who insist on off-platform contact

**Key Point:**
"Keep communication in-app to protect your earnings and account standing. If a customer requests off-platform contact, politely decline and report to support."

---

## Category 5: Reviews & Ratings ⭐

### Category Details

| Field | Value |
|-------|-------|
| **Slug** | `reviews-ratings` |
| **Icon** | `book-open` |
| **Name (EN)** | Reviews & Ratings |
| **Name (ES)** | Reseñas y Calificaciones |
| **Display Order** | 5 |

**Description (EN):**
"Learn how the review system works, how to leave and receive reviews, and understand how ratings impact success on the platform."

**Description (ES):**
"Aprenda cómo funciona el sistema de reseñas, cómo dejar y recibir reseñas y comprenda cómo las calificaciones impactan el éxito en la plataforma."

---

### Customer Articles (5)

#### Article 5.1: How to Review a Professional
- **Priority:** P1 (Important)
- **Phase:** 2
- **Word Count:** 400-500
- **Audience:** All customers
- **Keywords:** leave review, rate professional, write review

**Content Outline:**
1. When to review (after service completion)
2. Review window (30 days after service)
3. How to leave a review:
   - Star rating (1-5 stars)
   - Written review (optional but encouraged)
   - Rating categories (punctuality, quality, communication, professionalism)
4. Review guidelines (be honest, specific, constructive)
5. What happens after you submit (professional can see and respond)
6. Why reviews matter (help other customers, improve platform)

---

#### Article 5.2: Can I Edit or Delete My Review?
- **Priority:** P1 (Important)
- **Phase:** 2
- **Word Count:** 300-400
- **Audience:** All customers
- **Keywords:** edit review, delete review, change review

**Content Outline:**
1. Review permanence (reviews are permanent after posting)
2. Why reviews can't be edited (protects integrity, prevents manipulation)
3. Before posting (double-check rating and comments)
4. Exceptional circumstances (factual errors, inappropriate response from professional)
5. Contacting support for review disputes
6. Professional response to reviews (professionals can respond but not remove)

**Key Point:**
"Reviews are permanent to maintain integrity. Please review carefully before posting—you won't be able to edit it later."

---

#### Article 5.3: Understanding the 5-Star Rating System
- **Priority:** P2 (Nice-to-have)
- **Phase:** 3
- **Word Count:** 300-400
- **Audience:** All customers
- **Keywords:** star rating, 5 stars, rating scale

**Content Outline:**
1. What each star rating means:
   - 5 stars: Exceptional, exceeded expectations
   - 4 stars: Good, met expectations
   - 3 stars: Okay, some issues but acceptable
   - 2 stars: Below expectations, significant issues
   - 1 star: Unacceptable service, major problems
2. Rating categories breakdown
3. How ratings affect professionals (visibility, earnings potential)
4. Be fair and honest (but not overly critical for minor issues)

---

#### Article 5.4: Leaving Anonymous Reviews
- **Priority:** P2 (Nice-to-have)
- **Phase:** 3
- **Word Count:** 300-400
- **Audience:** All customers
- **Keywords:** anonymous review, privacy, hidden identity

**Content Outline:**
1. Reviews are **not** anonymous (professional can see your name)
2. Why reviews aren't anonymous (accountability, prevents abuse)
3. Your review is public (other customers can see)
4. Privacy protection (last name initial only, no contact info shown)
5. Safety concerns (report inappropriate professional responses)

---

#### Article 5.5: What If a Professional Pressures Me to Change a Review?
- **Priority:** P1 (Important)
- **Phase:** 2
- **Word Count:** 400-500
- **Audience:** All customers
- **Keywords:** review pressure, forced review, review harassment

**Content Outline:**
1. Platform policy (pressuring for reviews is prohibited)
2. What constitutes pressure:
   - Repeated requests to change review
   - Threats or intimidation
   - Offering refund in exchange for review change
   - Harassing messages
3. What to do:
   - Do not engage
   - Screenshot evidence
   - Report to support immediately
4. Consequences for professionals (account suspension)
5. Your protection (reviews are protected, cannot be forced to change)

**Key Point:**
"Reviews are protected. If a professional pressures you to change a review, report them immediately. They risk account suspension."

---

### Professional Articles (6)

#### Article 5.6: How Reviews Affect Your Success
- **Priority:** P0 (Launch-critical)
- **Phase:** 1
- **Word Count:** 600-700
- **Audience:** All professionals
- **Keywords:** reviews impact, rating importance, review strategy

**Content Outline:**
1. Why reviews matter:
   - Visibility (higher ratings = higher search rankings)
   - Booking conversion (great reviews = more bookings)
   - Earnings potential (top-rated professionals charge 15-20% more)
2. Rating benchmarks:
   - 4.5+: Competitive
   - 4.7+: Excellent
   - 4.8+: Top-tier professional
3. Review statistics:
   - 0 reviews: 2% booking conversion
   - 5-10 reviews (4.5+): 6% conversion
   - 20+ reviews (4.8+): 12% conversion (6x increase!)
4. How to get more reviews (ask politely, deliver exceptional service)
5. Responding to reviews (professional, gracious, solution-oriented)

**Key Stats:**
- "Professionals with 4.8+ ratings earn 25% more per booking"
- "20+ reviews increases bookings by 6x compared to 0 reviews"

---

#### Article 5.7: How to Ask Customers for Reviews (The Right Way)
- **Priority:** P0 (Launch-critical)
- **Phase:** 1
- **Word Count:** 500-600
- **Audience:** All professionals
- **Keywords:** ask for review, request review, get more reviews

**Content Outline:**
1. When to ask (after service, when checking out)
2. How to ask politely:
   - "If you're happy with my work, I'd really appreciate a review!"
   - Mention it naturally, don't pressure
   - One polite reminder via message (optional)
3. What NOT to do:
   - ❌ Pressure or guilt-trip
   - ❌ Offer incentives for reviews
   - ❌ Ask multiple times
   - ❌ Request only 5-star reviews
4. Automated review request (platform sends reminder)
5. Best practices (great service = great reviews naturally)

**Key Point:**
"The best way to get great reviews is to deliver great service. A polite ask at the end helps, but never pressure customers."

---

#### Article 5.8: Rating Customers: Two-Way Review System
- **Priority:** P2 (Nice-to-have)
- **Phase:** 3
- **Word Count:** 400-500
- **Audience:** All professionals
- **Keywords:** rate customers, two-way reviews, customer rating

**Content Outline:**
1. Professionals can rate customers too
2. What to rate:
   - Communication (clear, responsive)
   - Respect (treated professionally)
   - Property access (easy to access, clean working conditions)
   - Payment (no disputes, tips appreciated)
3. When customer ratings matter (future professionals can see)
4. Be fair and honest (helps other professionals)
5. Low ratings for genuinely difficult customers only

---

#### Article 5.9: Improving Your Rating: Tips and Strategies
- **Priority:** P0 (Launch-critical)
- **Phase:** 1
- **Word Count:** 600-700
- **Audience:** All professionals
- **Keywords:** improve rating, get better reviews, rating strategy

**Content Outline:**
1. Deliver exceptional service:
   - Arrive on time (or early)
   - Communicate proactively
   - Go above and beyond (small extras)
   - Leave space spotless
   - Follow special instructions carefully
2. Professional appearance (clean uniform, organized supplies)
3. Communication best practices (respond quickly, friendly tone)
4. Ask for reviews (politely, after great service)
5. Learn from negative reviews (identify patterns, improve)
6. Consistency over time (one bad review won't destroy your rating)
7. Time-based recovery (newer reviews weighted more heavily)

**Action Plan:**
- Current rating <4.5: Focus on service quality fundamentals
- Current rating 4.5-4.7: Add exceptional touches, improve communication
- Current rating 4.7+: Maintain consistency, small improvements

---

#### Article 5.10: Disputing Unfair Negative Reviews
- **Priority:** P1 (Important)
- **Phase:** 2
- **Word Count:** 500-600
- **Audience:** All professionals
- **Keywords:** dispute review, unfair review, remove bad review

**Content Outline:**
1. When you can dispute a review:
   - Contains false information
   - Violates review guidelines (profanity, threats, discrimination)
   - Customer never received service
   - Review is about something outside your control
2. When you CANNOT dispute:
   - Customer just didn't like your work (subjective opinion)
   - Rating is low but review is factual
   - Customer had legitimate complaint
3. How to file a dispute:
   - Professional dashboard → Reviews → Dispute
   - Provide evidence (messages, photos, booking details)
   - Explain why review is unfair
4. Review investigation process (3-5 business days)
5. Possible outcomes:
   - Review removed (rare, only for policy violations)
   - Review flagged as disputed (shown to future customers)
   - Review stands (most common)
6. Best response: Professional public reply addressing concerns

**Key Point:**
"Most negative reviews will not be removed. Your best strategy is a professional public response showing future customers how you handle feedback."

---

#### Article 5.11: Understanding Your Rating Analytics
- **Priority:** P2 (Nice-to-have)
- **Phase:** 3
- **Word Count:** 400-500
- **Audience:** All professionals
- **Keywords:** rating analytics, review stats, performance metrics

**Content Outline:**
1. Accessing rating analytics (Dashboard → Performance)
2. Metrics to track:
   - Overall rating (star average)
   - Total reviews
   - Rating distribution (5, 4, 3, 2, 1 stars)
   - Category ratings (punctuality, quality, communication)
   - Response rate to reviews
3. How your rating compares to platform average
4. Rating trends over time
5. Using analytics to improve (identify weak areas)

---

## Category 6: Safety & Trust 🛡️

### Category Details

| Field | Value |
|-------|-------|
| **Slug** | `safety-trust` |
| **Icon** | `shield-check` |
| **Name (EN)** | Safety & Trust |
| **Name (ES)** | Seguridad y Confianza |
| **Display Order** | 6 |

**Description (EN):**
"Learn about verification processes, safety measures, background checks, and how MaidConnect ensures a safe experience for everyone."

**Description (ES):**
"Conozca los procesos de verificación, medidas de seguridad, verificación de antecedentes y cómo MaidConnect garantiza una experiencia segura para todos."

---

### Customer Articles (6)

#### Article 6.1: How Professionals Are Vetted and Verified
- **Priority:** P0 (Launch-critical)
- **Phase:** 1
- **Word Count:** 600-700
- **Audience:** All customers
- **Keywords:** background check, verification, vetting process, safety

**Content Outline:**
1. Multi-step verification process:
   - Identity verification (Colombian ID)
   - Background check (criminal record)
   - Work experience verification (references)
   - In-person or video interview
   - Ongoing performance monitoring
2. What we check:
   - Criminal history
   - Identity authenticity
   - Work references
   - Professional skills assessment
3. Continuous monitoring (ratings, customer feedback, compliance)
4. Verification badges explained
5. What happens if issues are reported (immediate investigation)

**Trust Signals:**
- "Every professional is background-checked before joining"
- "Less than 5% of applicants are approved"
- "Continuous monitoring for your safety"

---

#### Article 6.2: Understanding Verification Badges
- **Priority:** P1 (Important)
- **Phase:** 2
- **Word Count:** 400-500
- **Audience:** All customers
- **Keywords:** verification badges, trust badges, verified professional

**Content Outline:**
1. Types of verification badges:
   - **Identity Verified:** ID document verified
   - **Background Checked:** Criminal background check passed
   - **Top Rated:** 4.8+ rating with 20+ reviews
   - **Experienced:** 100+ completed bookings
   - **Featured Professional:** Selected by MaidConnect team
2. What each badge means
3. How professionals earn badges
4. Badges and booking priority (badge = higher visibility)

---

#### Article 6.3: Reporting Safety Concerns
- **Priority:** P0 (Launch-critical)
- **Phase:** 1
- **Word Count:** 500-600
- **Audience:** All customers
- **Keywords:** report safety issue, safety concern, dangerous situation

**Content Outline:**
1. When to report:
   - Inappropriate behavior
   - Theft or property damage
   - Physical threats or violence
   - Requests for off-platform payment
   - Professional arrives intoxicated
   - Any behavior making you feel unsafe
2. How to report:
   - **During emergency:** Call 123 (Colombia emergency), then contact support
   - **After service:** Dashboard → Booking → Report Issue
   - **Anonymous tip:** Help Center contact form
3. What information to provide (details, evidence, timeline)
4. Investigation process
5. Your safety is priority (immediate action for serious concerns)
6. Consequences for professionals (suspension pending investigation)

**Key Point:**
"Your safety is our top priority. Report any concerning behavior immediately—we investigate all reports seriously and confidentially."

---

#### Article 6.4: What If Something Gets Damaged?
- **Priority:** P1 (Important)
- **Phase:** 2
- **Word Count:** 500-600
- **Audience:** All customers
- **Keywords:** property damage, damage claim, broken item, insurance

**Content Outline:**
1. Professionals are insured (liability coverage for accidental damage)
2. What to do if damage occurs:
   - **During service:** Notify professional immediately, take photos
   - **After service (noticed later):** Report within 48 hours with photos
3. Filing damage claim:
   - Dashboard → Booking → Report Issue → Property Damage
   - Photos of damage
   - Estimated repair/replacement cost
   - Any communication with professional about incident
4. Investigation process (3-5 business days)
5. Claim outcomes:
   - Approved: Reimbursement or repair cost covered
   - Denied: Explanation provided, dispute process available
6. Coverage limits (check insurance details)

**Key Point:**
"Accidental damage happens. Professionals are insured, and you're protected. Report damage within 48 hours for fastest resolution."

---

#### Article 6.5: What If Professional Doesn't Show Up?
- **Priority:** P0 (Launch-critical) (duplicate from bookings, can reference)
- **Phase:** 1
- **Word Count:** 300-400
- **Audience:** All customers
- **Keywords:** no show, didn't show up, missed appointment

**Content Outline:**
(See Article 2.4—can be shorter here with reference to full article in Bookings category)

---

#### Article 6.6: Emergency Support Contact
- **Priority:** P0 (Launch-critical)
- **Phase:** 1
- **Word Count:** 300-400
- **Audience:** All customers
- **Keywords:** emergency contact, urgent help, immediate support

**Content Outline:**
1. Emergency vs non-emergency:
   - **Emergency:** Immediate safety threat, call 123 (Colombia police)
   - **Urgent support:** In-app support chat (fastest response)
   - **Non-urgent:** Help Center articles, email support
2. Support contact methods:
   - In-app chat (available 7am-10pm daily)
   - Emergency hotline (if available)
   - Email: support@maidconnect.com
3. What to do in true emergencies (call local authorities first)
4. After-hours support (automated responses, next-day follow-up)

---

### Professional Articles (5)

#### Article 6.7: Background Check Process Explained
- **Priority:** P1 (Important)
- **Phase:** 2
- **Word Count:** 500-600
- **Audience:** Prospective & current professionals
- **Keywords:** background check, criminal record check, verification

**Content Outline:**
1. Why background checks (customer safety, platform trust)
2. What's included in check:
   - Criminal record (Colombia national database)
   - Identity verification
   - Work history verification
3. Process timeline (3-5 business days after application)
4. What disqualifies applicants:
   - Violent crimes
   - Theft or fraud convictions
   - Sexual offenses
   - Recent drug-related offenses
5. Privacy protection (results confidential)
6. Ongoing monitoring (periodic re-checks)

---

#### Article 6.8: Account Suspension: Causes and Prevention
- **Priority:** P1 (Important)
- **Phase:** 2
- **Word Count:** 600-700
- **Audience:** All professionals
- **Keywords:** account suspension, banned, suspended account

**Content Outline:**
1. Why accounts get suspended:
   - Safety violations (customer complaints, inappropriate behavior)
   - Policy violations (off-platform payments, sharing contact info)
   - Performance issues (excessive cancellations, no-shows, low ratings)
   - Fraud or manipulation (fake reviews, gaming system)
2. Warning system:
   - Minor violation: Written warning
   - Second violation: Temporary suspension (7-30 days)
   - Major violation: Immediate permanent ban
3. How to avoid suspension:
   - Follow all platform policies
   - Maintain professional behavior
   - Communicate issues proactively
   - Deliver consistent quality service
4. What to do if suspended:
   - Review suspension notice
   - Submit appeal with evidence (if applicable)
   - Wait for investigation outcome
5. Permanent bans (no appeal for serious safety violations)

**Key Point:**
"Suspension is rare for professionals who follow policies and treat customers professionally. Most issues can be resolved with clear communication."

---

#### Article 6.9: Handling Difficult Customers Professionally
- **Priority:** P2 (Nice-to-have)
- **Phase:** 3
- **Word Count:** 600-700
- **Audience:** All professionals
- **Keywords:** difficult customers, problem customers, customer issues

**Content Outline:**
1. Types of difficult situations:
   - Unrealistic expectations
   - Rude or disrespectful behavior
   - Additional tasks not in booking
   - Payment disputes
   - Property access issues
2. De-escalation strategies:
   - Stay calm and professional
   - Listen actively
   - Acknowledge concerns
   - Offer solutions
   - Document everything
3. When to walk away (safety first):
   - Physical threats
   - Sexual harassment
   - Unsafe working conditions
   - Customer intoxicated or threatening
4. Documenting issues (messages, photos, notes)
5. Reporting to support (for protection and records)
6. Learning from difficult situations

---

#### Article 6.10: Safety Guidelines for In-Home Services
- **Priority:** P1 (Important)
- **Phase:** 2
- **Word Count:** 600-700
- **Audience:** All professionals
- **Keywords:** safety guidelines, professional safety, stay safe

**Content Outline:**
1. Before the service:
   - Review customer profile and ratings
   - Share booking details with trusted contact
   - Ensure fully charged phone
   - Arrive during daylight if possible
2. Upon arrival:
   - GPS check-in (creates record of location)
   - Introduce yourself professionally
   - Assess working environment
   - Trust your instincts (if uncomfortable, leave)
3. During service:
   - Keep phone accessible
   - Maintain professional boundaries
   - Work in well-lit areas
   - Keep exit routes in mind
4. Red flags to watch for:
   - Customer acts inappropriately
   - Requests to turn off GPS or cameras
   - Multiple people present (not disclosed)
   - Unsafe property conditions
5. What to do if you feel unsafe (prioritize safety, leave immediately, report)

**Key Point:**
"Your safety comes first, always. If something doesn't feel right, trust your instincts and leave. You won't be penalized for prioritizing your safety."

---

#### Article 6.11: What to Do If a Customer Is Unsafe
- **Priority:** P1 (Important)
- **Phase:** 2
- **Word Count:** 400-500
- **Audience:** All professionals
- **Keywords:** unsafe customer, dangerous situation, report customer

**Content Outline:**
1. Types of unsafe behavior:
   - Physical threats or violence
   - Sexual harassment or inappropriate advances
   - Intoxication or substance use
   - Weapon display or threats
2. Immediate actions:
   - **Prioritize your safety:** Leave immediately if threatened
   - Call 123 (Colombia emergency) if imminent danger
   - Contact MaidConnect support immediately
   - Do not complete service if unsafe
3. After leaving:
   - File detailed report with support
   - Provide evidence (messages, photos, recordings if safe to capture)
   - Support will investigate and take action
4. Platform protection:
   - You will not be penalized for leaving unsafe situation
   - Customer will be banned if behavior confirmed
   - Full payment for time on-site

**Key Point:**
"Leave immediately if you feel unsafe. Your safety is more important than any booking. Report unsafe customers so we can protect other professionals."

---

## Category 7: Account & Settings ⚙️

### Category Details

| Field | Value |
|-------|-------|
| **Slug** | `account-settings` |
| **Icon** | `wrench` |
| **Name (EN)** | Account & Settings |
| **Name (ES)** | Cuenta y Configuración |
| **Display Order** | 7 |

**Description (EN):**
"Manage your account, update your profile, change settings, and control your privacy preferences on MaidConnect."

**Description (ES):**
"Administre su cuenta, actualice su perfil, cambie la configuración y controle sus preferencias de privacidad en MaidConnect."

---

### Customer Articles (5)

#### Article 7.1: Updating Your Profile Information
- **Priority:** P2 (Nice-to-have)
- **Phase:** 3
- **Word Count:** 300-400
- **Audience:** All customers
- **Keywords:** update profile, edit profile, change profile

**Content Outline:**
1. What you can update:
   - Name
   - Profile photo
   - Phone number
   - Email address (requires verification)
   - Service address
2. How to update (Dashboard → Settings → Profile)
3. Email/phone changes (verification required for security)
4. Profile visibility (what professionals can see)

---

#### Article 7.2: Changing Your Password
- **Priority:** P2 (Nice-to-have)
- **Phase:** 3
- **Word Count:** 300-400
- **Audience:** All customers
- **Keywords:** change password, reset password, forgot password

**Content Outline:**
1. When to change password (security best practice every 6 months)
2. How to change password (Dashboard → Settings → Security)
3. Password requirements (8+ characters, mix of letters/numbers/symbols)
4. Forgot password (reset via email)
5. Two-factor authentication (if available)

---

#### Article 7.3: Managing Notification Preferences
- **Priority:** P2 (Nice-to-have)
- **Phase:** 3
- **Word Count:** 400-500
- **Audience:** All customers
- **Keywords:** notifications, manage alerts, turn off notifications

**Content Outline:**
1. Types of notifications:
   - Booking updates (confirmation, professional on the way, completed)
   - Messages
   - Reviews
   - Promotions (optional)
2. Notification channels (push, SMS, email)
3. How to customize (Dashboard → Settings → Notifications)
4. Turning off specific notifications
5. Quiet hours (if available)

---

#### Article 7.4: Deleting Your Account
- **Priority:** P2 (Nice-to-have)
- **Phase:** 3
- **Word Count:** 400-500
- **Audience:** All customers
- **Keywords:** delete account, close account, remove account

**Content Outline:**
1. Before deleting:
   - Cancel all upcoming bookings
   - Download booking history/receipts (if needed)
   - Understand it's permanent (cannot be undone)
2. What happens when you delete:
   - Profile and data removed
   - Booking history deleted
   - Reviews remain (anonymized)
   - Payment methods removed
3. How to delete account (Dashboard → Settings → Delete Account)
4. Verification required (email confirmation, password)
5. Data retention (legal requirements for financial records)

---

#### Article 7.5: Privacy Settings Explained
- **Priority:** P2 (Nice-to-have)
- **Phase:** 3
- **Word Count:** 400-500
- **Audience:** All customers
- **Keywords:** privacy settings, data privacy, account privacy

**Content Outline:**
1. What professionals can see:
   - Name and profile photo
   - Service address (after booking accepted)
   - Booking history (number of bookings)
   - Reviews you've left
2. What professionals CANNOT see:
   - Payment information
   - Other bookings with different professionals
   - Personal contact info (until you share)
3. Privacy controls available
4. GDPR and Colombian Law 1581 compliance
5. Data download and portability rights

---

### Professional Articles (5)

#### Article 7.6: Updating Your Professional Profile
- **Priority:** P1 (Important)
- **Phase:** 2
- **Word Count:** 500-600
- **Audience:** All professionals
- **Keywords:** update profile, edit profile, professional profile

**Content Outline:**
1. Profile elements you can update:
   - Profile photo
   - Bio and description
   - Services offered
   - Service areas
   - Availability
   - Pricing
   - Portfolio photos
2. How profile completeness affects bookings (complete = more visibility)
3. Profile optimization tips (use keywords, showcase specialties)
4. Updating profile after gaining new skills
5. Seasonal profile updates (holiday specials, summer availability)

---

#### Article 7.7: Changing Your Service Rates
- **Priority:** P1 (Important)
- **Phase:** 2
- **Word Count:** 400-500
- **Audience:** All professionals
- **Keywords:** change rates, pricing, service rates, update prices

**Content Outline:**
1. When to adjust rates:
   - After building reputation (more reviews)
   - Increased demand
   - Added skills or certifications
   - Seasonal adjustments
2. How to change rates (Dashboard → Settings → Pricing)
3. Rate changes apply to new bookings only (existing bookings locked)
4. Competitive pricing strategies
5. Testing rate changes (monitor booking rate after adjustment)

**Tip:**
"Professionals with 4.8+ ratings can charge 15-20% more and still get consistent bookings."

---

#### Article 7.8: Adding or Removing Services
- **Priority:** P2 (Nice-to-have)
- **Phase:** 3
- **Word Count:** 400-500
- **Audience:** All professionals
- **Keywords:** add services, remove services, service offerings

**Content Outline:**
1. Available service types (standard cleaning, deep cleaning, move-in/out, etc.)
2. How to add new services (Dashboard → Services → Add Service)
3. Setting rates for each service
4. Service descriptions and what's included
5. Removing services (make inactive, doesn't delete booking history)
6. Seasonal services (spring cleaning, holiday prep)

---

#### Article 7.9: Managing Your Availability
- **Priority:** P1 (Important)
- **Phase:** 2
- **Word Count:** 500-600
- **Audience:** All professionals
- **Keywords:** availability, schedule, manage calendar

**Content Outline:**
(See Article 2.12—can reference detailed article in Bookings category, shorter summary here)

---

#### Article 7.10: Account Suspension: What to Do
- **Priority:** P2 (Nice-to-have)
- **Phase:** 3
- **Word Count:** 400-500
- **Audience:** Suspended professionals
- **Keywords:** suspended account, banned, account locked

**Content Outline:**
1. Understanding your suspension notice
2. Suspension reasons (review notice for specifics)
3. Temporary vs permanent suspension
4. Appeal process:
   - Review suspension reason
   - Gather evidence supporting your case
   - Submit appeal via support
   - Wait for investigation (3-7 business days)
5. What happens during suspension (no access to platform, no earnings)
6. Reinstatement (if appeal successful)
7. If permanently banned (no appeal process for serious violations)

---

## Implementation Summary

### Phase 1: Foundation (Week 1-2)
**Goal:** Launch-ready minimum viable documentation

**Articles to Create: 20 P0 Articles**

| Category | P0 Articles | Word Count Est. | Translation |
|----------|-------------|-----------------|-------------|
| Getting Started | 5 | 2,000-2,500 | EN + ES |
| Bookings & Scheduling | 5 | 2,000-2,500 | EN + ES |
| Payments & Refunds | 5 | 2,000-2,500 | EN + ES |
| Safety & Trust | 5 | 2,000-2,500 | EN + ES |
| **TOTAL** | **20** | **8,000-10,000** | **40 articles** |

**Effort Estimate:**
- Writing: 40 hours (20 articles × 2 hrs/article)
- Screenshots: 15 hours (20 articles, not all need screenshots)
- Translation: 20 hours (professional Spanish translation)
- Review/QA: 10 hours
- **Total: 85 hours (~2 weeks)**

---

### Phase 2: Expansion (Week 3-4)
**Goal:** Cover 80% of common support questions

**Articles to Create: 30 P1 Articles**

| Category | P1 Articles | Word Count Est. | Translation |
|----------|-------------|-----------------|-------------|
| Communication | 8 | 3,000-4,000 | EN + ES |
| Reviews & Ratings | 11 | 4,500-6,000 | EN + ES |
| Account & Settings | 11 | 4,000-5,000 | EN + ES |
| **TOTAL** | **30** | **11,500-15,000** | **60 articles** |

**Effort Estimate:**
- Writing: 60 hours (30 articles × 2 hrs/article)
- Screenshots/GIFs: 25 hours
- Translation: 30 hours
- Review/QA: 15 hours
- **Total: 130 hours (~3-4 weeks)**

---

### Phase 3: Completion (Week 5-6)
**Goal:** Comprehensive self-service documentation

**Articles to Create: 27 P2 Articles + 7 Category Pages**

| Category | P2 Articles | Word Count Est. | Translation |
|----------|-------------|-----------------|-------------|
| All Categories | 27 | 8,000-11,000 | EN + ES |
| Category Pages | 7 | 1,500-2,000 | EN + ES |
| **TOTAL** | **34** | **9,500-13,000** | **68 articles** |

**Effort Estimate:**
- Writing: 55 hours (34 articles × 1.5 hrs/article, shorter articles)
- Visuals: 20 hours
- Translation: 25 hours
- Review/QA: 15 hours
- **Total: 115 hours (~3 weeks)**

---

### Total Project Summary

| Metric | Count/Estimate |
|--------|----------------|
| **Total Categories** | 7 |
| **Total Customer Articles** | 38 |
| **Total Professional Articles** | 39 |
| **Total Articles** | 77 |
| **Total Words (EN)** | ~29,000-39,000 |
| **Total Bilingual Articles** | 154 (77 EN + 77 ES) |
| **Total Project Hours** | ~330 hours |
| **Timeline** | 8-10 weeks (1 technical writer full-time) |

---

**Last Updated:** November 2025
**Next Review:** After Phase 1 completion
**Maintained By:** Content Team
