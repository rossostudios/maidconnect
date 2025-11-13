Here’s a teardown + concrete improvement plan 👇

---

## 1. Quick read on Casaora

From your repo + site, Casaora is:

> “Connecting expats in Colombia with trusted domestic service professionals” ([GitHub][1])

and the live homepage leads with:

> “Premium Domestic Staffing — Your home deserves exceptional care… connects Colombia’s most qualified household professionals with families who demand excellence.” ([Casaora][2])

You’ve already nailed: premium feel, trust/safety, and a clean product story (marketplace + concierge, vetted staff, bilingual, transparent pricing). ([Casaora][3])

Biggest opportunities:

* Make the “for expats/foreigners” angle explicit above the fold.
* Tighten funnels (hero → action) so people don’t land on empty states.
* Fully leverage the tech you’ve wired up (PostHog, feature flags) for experiments and analytics. ([GitHub][1])

---

## 2. Positioning

### Current implicit positioning

* **Who:** Families (and some estate-level households) in Colombia; later locals + expats.
* **What:** Premium domestic staffing marketplace + concierge.
* **Why different:** Deep vetting, bilingual support, transparent platform fee, concierge matching. ([Casaora][3])

### Recommended sharpened positioning

Right now, the hero sounds like any high-end domestic staffing brand anywhere in the world. If your main wedge is *expats in Colombia*, I’d make that the tip of the spear:

**One-liner options**

1. **“Vetted household staff for expats in Colombia.”**
   *Hire trusted, background-checked professionals in English or Spanish — all payments, contracts, and vetting handled for you.*

2. **“Premium domestic staff for expats in Colombia — vetted, bilingual, and ready in 5 days.”**
   This mirrors your “5 business days” promise lower on the page. ([Casaora][2])

3. **“Your home in Colombia, professionally cared for.”**
   *Concierge domestic staffing built for expats and high-end local families.*

### Positioning frame

**Category:** Premium domestic staffing & concierge for Colombia
**Who it’s for (primary):** Foreigners / expats / high-end locals who care about trust, language, and service quality. ([Casaora][3])
**Core promises:**

1. Every professional is vetted (ID, references, background, interviews). ([Casaora][3])
2. You can operate entirely in English (site + support). ([Casaora][3])
3. Transparent pricing & insurance; pros keep 100% of their rate, you see platform fee clearly. ([Casaora][3])
4. Concierge option so “I don’t know the market” customers don’t need to browse endlessly.

Use those 3–4 promises everywhere: hero, About, sales decks, ad copy.

---

## 3. Messaging & Landing Page

### Hero section

**What you have now** ([Casaora][2])

* “Premium Domestic Staffing” (eyebrow)
* “Your home deserves exceptional care” (headline)
* Subhead about connecting “Colombia’s most qualified household professionals with families who demand excellence.”
* CTAs: **Find Professionals** (primary), **Learn More** (secondary).

**Issues & upgrades**

1. **Too general for your wedge.** Nothing about expats, language, or Colombia risk.
2. **“Find Professionals” goes to a mostly empty professionals page**, which currently says “No professionals match these filters yet.” That’s a conversion killer. ([Casaora][4])
3. “Trusted by 500+ companies worldwide” feels B2B (and your product is B2C households). ([Casaora][2])

**Suggested hero structure**

* Eyebrow: **Domestic staffing for expats in Colombia**
* Headline: **“Hire vetted household staff in Colombia, entirely in English.”**
* Subhead:
  “Casaora finds, vets, and insures housekeepers, nannies, and estate staff so expats and local families can hire with confidence — usually within 5 business days.” ([Casaora][2])
* Primary CTA: **“Tell us what you need”** → opens a 2–3 question intake flow (service type, city, dates, language).
* Secondary CTA: **“Browse professionals”** (for self-serve users).

**Important:** Fix the professionals page so it never looks empty:

* If you have real supply: default to a popular city + service and show some profiles.
* If you’re still building supply: make `/professionals` an **email capture + waitlist** with an explainer, not an empty grid.

### Social proof

You show “Trusted by 500+ companies worldwide” and “Trusted by 2,000+ expats & locals in Colombia.” ([Casaora][2])

* If these figures are *already true*, make them more specific and aligned with your ICP, like:
  “Trusted by 2,000+ expats & local families across Bogotá, Medellín and Cartagena.”
* If they’re **aspirational**, don’t use them yet. Instead, use:

  * Real testimonials (you already have good ones) ([Casaora][2])
  * “Pilot customers in Bogotá & Medellín” or “Currently onboarding families in [cities].”

Also consider swapping “companies” for “households & family offices” to match your category.

### “How it works” and services

You effectively explain the flow, but there’s some duplication and visual noise:

* On the home page, “How It Works” appears twice, with steps numbered 01–02–04 in the first instance. ([Casaora][2])
* You have a separate, quite detailed “How It Works” page with customer + professional flows. ([Casaora][5])

**Simplify:**

1. Keep a **tight 3-step summary** on the home page (Brief → Curate → Hire).
2. Link to the full **How it Works** page for detail.
3. In the 3 bullets, reinforce your differentiators (vetting, bilingual support, concierge).

**Services section**

The “Professional Housekeeping” block is strong, but you might:

* Highlight **3 priority categories** (e.g. Housekeeping, Childcare, Estate Management) with short bullets.
* Add 1-line “tailored for expats” hook to at least one, e.g. childcare with English-speaking nannies for bicultural families.

### Supply-side messaging

Most of your home page targets customers. For professionals, the messaging is tucked into /how-it-works and footer links (“Join Our Network”). ([Casaora][5])

I’d add a **“For Professionals” strip** on the homepage:

> “Earn more with trusted families — keep 100% of your rate, get paid on time, and grow your business with repeat bookings and concierge support.”
> [Apply to Join Casaora]

This helps bootstrap the marketplace side.

---

## 4. Acquisition Funnels

Let’s define 3 core funnels and then refine.

### 4.1. Customer – Marketplace funnel

**Intended path**

Ad / SEO / referral → Landing page → Browse Professionals → View profile → Sign up → Booking → Review.

**Current issues**

* Hero CTA goes directly to a listing that may be empty. ([Casaora][4])
* There’s no obvious “start with your needs” flow; browsing is the first step, which is harder when supply is thin.

**Improvements**

1. **Primary CTA = “Start your brief”**, not “Find Professionals.”

   * Step 1: Choose service, city, language, date range.
   * Step 2: Contact + any special notes.
   * Confirmation: “We’ll send your first 3 candidates in X days.”

2. **Use the brief as your main conversion event** when supply is thin:

   * You can manually match behind the scenes.
   * It’s easier to grow supply around real briefs.

3. **Listing page upgrades**

   * Always show a default set of sample profiles or “featured professionals” instead of empty state.
   * If you truly have no live supply in a city, swap to:
     “We’re onboarding vetted professionals in [city]. Join the waitlist and we’ll notify you when placements open.”

### 4.2. Customer – Concierge funnel

This is likely your high-value wedge for foreigners.

**Intended path**

Landing page → Pricing / Concierge explainer → “Get Concierge Service” → Intake form → Call / WhatsApp → Matches sent → Hire.

Your pricing page already does a good job drawing this distinction and clearly states that Concierge is “Best for foreigners, expats, first-timers, busy professionals.” ([Casaora][3])

**Upgrades**

* Add **a thin banner on the hero**:
  “New to Colombia? Try our Concierge service — English-speaking coordinator, curated matches in 5 days.”
* Make the Concierge CTA on pricing more urgent:
  “Request concierge matching – reply within 2 hours” (you already mention response time lower on that page; pull it up). ([Casaora][3])
* Use a simple flow:

  * Step 1: Short form on the site.
  * Step 2: Automated WhatsApp / email follow-up with scheduling link.
  * Step 3: PDF or microsite with 2–3 candidate profiles.

This is the funnel you can push hardest in ads initially (higher LTV, higher AOV, less price sensitivity).

### 4.3. Professional acquisition funnel

**Intended path**

Referral / WhatsApp / social / community → “Join Our Network” / “Apply as a Professional” → Application → Verification → First booking.

The “How it Works – For Professionals” section is solid. ([Casaora][5])

**Improvements**

* Dedicated landing like `/pros` with:

  * Headline: “Earn more with trusted international families in Colombia.”
  * Bullets: keep 100% of your rate, bilingual support, safe payment, flexible hours. ([Casaora][3])
  * Social proof: “Professionals rated 4.9★ by clients” etc. ([Casaora][2])
* Very low-friction application: short form + WhatsApp follow up.
* Referral program: “Bring a friend who passes vetting and completes 3 jobs — both of you get a bonus.”

---

## 5. Acquisition Channels & Growth Loops

Short list to focus on:

### Demand (families / expats)

1. **Expat communities & relocation partners**

   * Partnerships with relocation agencies, international schools, serviced apartments, coworking spaces.
   * Add a simple partner page: “White-glove domestic staffing for your clients.”

2. **Expat Facebook & WhatsApp groups**

   * “Expats in Bogotá”, “Gringos in Medellín”, digital nomad groups.
   * Offer a guide: “How to hire domestic help in Colombia safely (in English).”
   * Competitors publish “ultimate guides” and job description resources for domestic staffing; you can do a localized version focused on Colombia. ([Household Staffing Agency][6])

3. **SEO around key queries**

   * “[city] English-speaking nanny”
   * “Housekeeper in Medellín for expats”
   * “Domestic worker background check Colombia”
     Long-term play, but your content (FAQs, guides, pricing transparency) helps here.

4. **Referral & rebooking loop**

   * After a great service: email/WhatsApp with 1-click “Rebook Ana for next week”.
   * Simple referral: “Invite a friend and both get your next platform fee waived.”

### Supply (professionals)

1. **Referrals from existing professionals** (with bonuses).
2. **Local community centers, churches, vocational programs** with flyers + QR to a simple mobile page.
3. **WhatsApp at the center of onboarding**: it’s already the default channel for many workers.

---

## 6. Analytics & Experimentation

You already list **PostHog** for product analytics and **Better Stack** for logging and monitoring. ([GitHub][1])

Here’s how I’d use them.

### 6.1. Core metrics

**North Star (for now):**

* **Number of completed bookings per month from new households.**

Supporting metrics:

* Website → brief/concierge request conversion rate.
* Brief → match delivered → booking → completed booking.
* Time to first booking for new customer.
* For professionals: application → verified → first booking → 3+ bookings.

### 6.2. Event schema (PostHog)

Demand-side key events (with properties like `city`, `service_type`, `language_preference`, `channel`, `device`):

* `page_view` (with `page` property, e.g. `home`, `pricing`, `how_it_works`, `professionals`)
* `hero_cta_clicked` (values: `start_brief`, `browse_professionals`, `learn_more`)
* `brief_started`, `brief_completed`
* `concierge_request_started`, `concierge_request_submitted`
* `professionals_list_viewed`
* `professional_profile_viewed`
* `signup_started`, `signup_completed`
* `booking_created`, `booking_completed`
* `review_submitted`

Supply-side:

* `pro_apply_started`, `pro_apply_completed`
* `pro_verified`
* `pro_first_booking`, `pro_third_booking`
* `pro_referral_sent`, `pro_referral_converted`

### 6.3. Dashboards

Create:

1. **Acquisition & conversion dashboard**

   * Visits by source → brief/concierge requests.
2. **Funnel dashboard**

   * Home → brief start → brief complete → booking → completion.
3. **Cohort dashboard**

   * Retention: % of households doing 2+ bookings within 60 days.
4. **Supply health**

   * Active professionals per city, utilization (% available hours booked), retention.

### 6.4. Experiments (using feature flags / A/B testing)

Given your tech stack explicitly mentions PostHog feature flags and experiments, lean on that. ([GitHub][1])

Initial experiments:

1. **Hero copy & CTA test**

   * Variant A: current hero.
   * Variant B: expat-focused copy + “Start your brief” CTA.
   * Metric: brief/concierge requests per unique visitor.

2. **Concierge emphasis**

   * Variant A: pricing as-is.
   * Variant B: concierge card emphasized visually, + banner on homepage.
   * Metric: concierge request rate and average revenue per customer.

3. **Professionals page empty-state**

   * Variant A: current listing.
   * Variant B: pre-populated sample profiles or “Join waitlist” version.
   * Metric: email captures / signups from `/professionals`.

4. **Language preference**

   * Track English vs Spanish usage; if expats drive most early demand, consider defaulting to EN for known geos/IPs.

---

## 7. 30-day action plan (prioritized)

**Week 1 – Positioning & Messaging**

* Rewrite hero section (headline, subhead, CTAs).
* Fix /professionals empty state.
* Add homepage “For Professionals” section + link to Apply page.

**Week 2 – Funnels & Content**

* Implement “Start your brief” intake as primary CTA.
* Tighten home page (remove duplicate How It Works, clarify steps).
* Draft one flagship content piece: “How to hire domestic staff in Colombia safely as an expat.”

**Week 3 – Analytics**

* Implement PostHog events & basic dashboards.
* Define and track North Star + key funnels.
* Set up first A/B test on hero copy + CTAs.

**Week 4 – Channels & Loops**

* Launch in 2–3 expat groups + one small paid test (e.g., Meta ads targeting expats in Bogotá/Medellín).
* Stand up a simple referral mechanic for early households and professionals.
* Review analytics → double down on whichever funnel is working best (marketplace vs concierge).

---

If you’d like, next step I can:

* Draft specific hero variants + a brief intake flow, or
* Design your PostHog event schema as a JSON you can drop straight into code.

[1]: https://github.com/rossostudios/casaora "GitHub - rossostudios/casaora"
[2]: https://casaora.vercel.app/ "Casaora · The Art of Home"
[3]: https://casaora.vercel.app/en/pricing "Transparent Pricing - No Hidden Fees | Casaora · Casaora"
[4]: https://casaora.vercel.app/en/professionals "Casaora · The Art of Home"
[5]: https://casaora.vercel.app/en/how-it-works "Casaora · The Art of Home"
[6]: https://householdstaffing.com/ultimate-guide-to-domestic-staffing/?utm_source=chatgpt.com "The Ultimate Guide to Domestic Staffing - Household Staffing Agency"
