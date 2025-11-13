From a product strategy lens, I’d frame Casaora like this: you’re **very well engineered and beautifully branded**, but you’re in danger of being **over-featured for your stage**.

Below is how I’d tighten the strategy, value props, and roadmap so every sprint ladders to customer outcomes and proof of PMF.

---

## 1. Product strategy snapshot

### What Casaora is (product POV)

From your README + site:

* **Vision:** “Concierge-style marketplace connecting expats in Colombia with verified domestic service providers.” ([GitHub][1])
* **Today’s promise to customers:**

  * Vetted, background-checked staff.
  * Bilingual (EN/ES) experience.
  * Marketplace *and* concierge options with transparent pricing. ([Casaora][2])
* **Today’s promise to professionals:**

  * Keep 100% of their rate, Casaora takes a platform fee from customers.
  * Verified, higher-quality clients and repeat bookings. ([Casaora][3])

### Where you are (likely stage)

Clues:

* 0 stars, 0 forks on the repo → early-stage / pre-scale. ([GitHub][1])
* Very rich feature list (real-time booking, dashboards, AI matching, analytics, etc.), many of which are probably partially built. ([GitHub][1])
* Public roadmap page exists but currently empty; roadmap is mainly in the README. ([Casaora][4])

So I’d assume: **pre- or just-post launch, pre-PMF, with a lot of infra in place.**

At this stage the job is *not* “build all the features we can,” it’s:

> Prove we can repeatedly create **safe, high-quality matches** between expat households and professionals in one or two cities, with strong satisfaction and rebooking.

Everything in the roadmap should serve that.

---

## 2. Clarify value props by persona (and prune promises)

Let’s articulate the outcomes **customers, pros, and you** care about, then map features to those.

### 2.1. Households / expats – main ICP

**Jobs-to-be-done**

* “I’m in Colombia, I don’t fully understand the norms, and I need someone I can **trust in my home**.”
* “I want this to be **handled in English**, without awkwardness or miscommunication.”
* “I don’t want to screen 100 people – just **3–5 excellent options** fast.”

**Core value props**

You already hint at these in content: ([Casaora][2])

1. **Trust and safety** – background checks, verification, insurance, escrow via Stripe, dispute support.
2. **Bilingual, concierge-style experience** – platform + support in English, with coordinators who handpick matches.
3. **Curated, not overwhelming** – smaller pool of vetted pros rather than huge classified-style list.
4. **Clear, transparent pricing** – customer pays platform fee; pros keep 100% of their rate. ([Casaora][3])

Everything else (real-time booking, fancy matching, dashboards) is secondary until you’ve nailed these outcomes.

### 2.2. Professionals

**Jobs-to-be-done**

* “I want **reliable, better-paying clients**.”
* “I want **predictable work**, not sporadic gigs.”
* “I want a simple way to manage my time and payments.”

**Core value props**

1. Access to **higher-quality, often international clients** who pay on time. ([Casaora][3])
2. Simple schedule + payout view (even if you run half of it manually at first).
3. Reputation → more jobs (ratings + rebookings).

### 2.3. Casaora (internal)

Your internal value prop is about **operational leverage**:

* Be able to **manually guarantee great matches now**, while building just enough tooling that you can scale and gradually automate.

That framing lets you **de-scope** a lot of “nice tech” until it clearly moves a core outcome.

---

## 3. Feature triage: what’s core vs nice-to-have?

From your README features list & marketing pages: ([GitHub][1])

### Must-have *right now* (pre-PMF)

These are essential to repeatedly generating happy matches:

**Customer-side**

* Simple **brief/intake flow** (service, city, language, schedule, budget, preferences).
* Ability to **review a curated set of candidates** (profiles with photo, experience, language, references).
* A way to **accept a candidate & confirm a booking** (even if ops triggers it).
* Confirmation + reminders (email / WhatsApp).
* Basic **review + rating** after service (even 1–5 stars + free text).

**Professional-side**

* Simple onboarding: profile, documents, background checks flagged **done/not done**.
* Ability to **accept/decline jobs and see schedule**.
* Visibility into earnings (summary view, past jobs).

**Admin / ops**

* **Matching & pipeline tools**:

  * View all incoming briefs.
  * Attach candidate(s) to a brief with statuses (proposed, selected, completed).
* **Verification queue:** track which pros are pending docs / checks.
* Ability to **manually override bookings & payments**.
* Access to **basic analytics** from PostHog: traffic → brief → booking. ([GitHub][1])

### Differentiating later (PMF → scale)

* **AI Matching V2** (beyond simple rules). ([GitHub][1])
* **Real-time availability calendars for every pro.**
* **In-app secure messaging** (if WhatsApp covers early needs, keep it simple).
* **Analytics dashboards for pros & admins** (beyond a few internal charts). ([GitHub][1])
* **React Native mobile apps** for iOS & Android. ([GitHub][1])

### Probably too early *right now*

Given your stage, I’d be cautious about:

* Full **mobile apps** before you know which flows matter most (concierge vs self-serve). ([GitHub][1])
* Aggressive **city expansion** (Medellín, Cartagena, Cali) until you have strong retention and supply/demand balance in 1 city (likely Bogotá). ([GitHub][1])
* Heavy **AI efforts** beyond rules + maybe some assistance for ops (e.g., generating candidate summaries).

Those are fantastic later bets, but they pull focus away from “get 50+ households to love this and rebook.”

---

## 4. Outcome-driven roadmap (0–12 months)

Let’s translate this into a simple, outcome-aligned roadmap.

### Phase 1 (0–3 months): Nail the concierge match

**Primary outcome:**

> X households in 1–2 cities complete ≥2 bookings within 60 days, with CSAT or NPS above target.

**Focus: Concierge as the core product.**

Even though your marketing mentions a marketplace, all roads should lead to **“Tell us what you need; we’ll handle the rest.”** ([Casaora][2])

**Feature priorities**

1. **Concierge intake & pipeline**

   * Robust intake form for customers (already conceptually in your “Brief” step). ([Casaora][2])
   * Internal tool to track each brief by stage: *new → in review → candidates sent → hired → completed → follow-up*.
2. **Professional onboarding & vetting**

   * Minimal, solid flow for pros to apply, upload docs, and be flagged as verified. ([Casaora][5])
   * Internal checklist for background checks and references.
3. **Booking creation & confirmation**

   * Ops can create bookings linking **customer, pro, date/time, rate, and fee**.
   * Notification emails/WhatsApp to both sides; clear expectations and contact details.
4. **Basic ratings & rebooking**

   * Post-service review request; ability for customer to “favorite” and rebook a pro (even if rebook triggers ops manually). ([Casaora][5])
5. **Analytics instrumentation**

   * PostHog events covering:

     * `brief_started`, `brief_submitted`
     * `concierge_match_sent`, `booking_created`, `booking_completed`
     * `review_submitted`, `rebooked` ([GitHub][1])

**De-prioritize in this phase**

* Self-serve browsing as a primary path (can stay live but secondary).
* Any heavy AI work beyond simple heuristic ranking for candidate lists.
* New cities or verticals (stick to e.g. housekeeping in Bogotá).

---

### Phase 2 (3–6 months): Reduce ops load & drive retention

**Primary outcome:**

> Increase 90-day retention (repeat bookings) and cut manual ops time per booking.

**Feature priorities**

1. **“One-click rebook”**

   * From customer dashboard or link in email → rebook same pro, same hours, with editable date.
   * This directly supports the “year after year” retention storyline you already show on the homepage. ([Casaora][2])
2. **Customer dashboard v1**

   * List of upcoming & past bookings, statuses, and receipts.
   * Basic “issue report” button that alerts ops instead of a full-blown dispute system.
3. **Professional app (web) v1**

   * “Today / this week’s jobs.”
   * Ability to confirm/decline jobs, mark as complete.
   * Simple earnings summary.
4. **Internal workflow automation**

   * Templates for messages (confirmations, reminders).
   * Simple triaging of issues (e.g., tag “no-show”, “quality issue”).
5. **Simple marketplace mode (optional)**

   * For segments with enough supply, let users browse a **small, curated set** of profiles and request bookings – but keep concierge support as a safety net.

**Analytics updates**

* Funnel: **first booking → second booking**.
* Time from brief to candidates; from candidates to hire.
* Ops-time per booking (even if manually tracked).

---

### Phase 3 (6–12 months): Scale & differentiate with product

**Primary outcome:**

> Extend a proven model to new cities/segments while keeping unit economics healthy and ops scalable.

**Now these roadmap items make sense**

1. **AI Matching v2**

   * Use historical PostHog data to improve candidate ranking and reduce ops time. ([GitHub][1])
   * More for **ops & pro experience** than for a flashy “AI” label.
2. **Analytics dashboards**

   * For admins: supply vs demand per city, utilization, retention, NPS. ([GitHub][1])
   * For pros: bookings, earnings trends, top clients.
3. **Mobile apps**

   * Once you know the critical flows (likely: confirm job, navigate, message, mark complete, rebook), ship **thin, focused mobile** versions of those. ([GitHub][1])
4. **City expansion**

   * Codify “how to launch a new city”: supply playbook + minimal landing updates + internal tools for localized pricing and tax/legal differences.
5. **Richer messaging & dispute flows**

   * In-app messaging if WhatsApp becomes a bottleneck.
   * Tiered dispute resolution with clear SLAs.

---

## 5. Align existing roadmap focus with this view

Your README lists current focus items like: product analytics (done), React Aria migration, mobile app, city expansion, AI matching V2, analytics dashboards. ([GitHub][1])

How I’d align:

* **Keep / double-down now**

  * Product analytics (PostHog) – already foundational. ([GitHub][1])
  * Accessibility improvements via React Aria – good ongoing investment; don’t let it crowd out core funnel work.
* **Move to later phase**

  * Mobile apps → Phase 3 (once core flows + retention are clear). ([GitHub][1])
  * City expansion → after strong supply/demand + ops playbook in one city. ([GitHub][1])
  * AI Matching V2 → after you have enough data and manual learnings to know what “better” means.
  * Full analytics dashboards → build internal, scrappy dashboards first; “productized dashboards for pros/admins” later.

---

## 6. Concrete “next 10 tasks” from a PM

If I were dropped in as product strategist tomorrow, my immediate backlog would be:

1. **Define PMF target:** e.g., “50+ households with ≥2 bookings in 90 days, NPS ≥ 60 in Bogotá housekeeping segment.”
2. **Turn “Find Professionals” into “Start Your Brief” as primary CTA** and wire that brief into an internal pipeline. ([Casaora][2])
3. **Review all live copy vs reality** and remove any promises for features that aren’t actually working end-to-end (e.g., “real-time booking” if it’s still mostly manual). ([GitHub][1])
4. **Instrument the concierge funnel in PostHog** with the events mentioned above.
5. **Add a very simple rebooking mechanism** (favorite → rebook).
6. **Stand up an internal lead & booking board** (even in Notion/Airtable initially, but ideally in your admin dashboard) showing briefs and statuses.
7. **Tighten pro onboarding & verification UX** to reduce drop-off and make vetting more predictable.
8. **Codify service scope for a single “beachhead”** (e.g., expat housekeeping in Bogotá) and route marketing + product flows toward that.
9. **Add a satisfaction / NPS step post-service** and log it with the booking.
10. **Review Q1 “big bets” and re-sequence them** around the phases above.

---

If you want, I can next help you turn this into:

* A **one-page product strategy doc** (Vision → ICP → Problems → Principles → Roadmap), or
* A **prioritized product backlog** (with user stories and acceptance criteria) for the next 4–6 weeks, based on the concierge-first focus.

[1]: https://github.com/rossostudios/casaora "GitHub - rossostudios/casaora"
[2]: https://casaora.vercel.app/ "Casaora · The Art of Home"
[3]: https://casaora.vercel.app/en/pricing "Transparent Pricing - No Hidden Fees | Casaora · Casaora"
[4]: https://casaora.vercel.app/en/roadmap "Product Roadmap - What We're Building | Casaora · Casaora"
[5]: https://casaora.vercel.app/en/how-it-works "Casaora · The Art of Home"
