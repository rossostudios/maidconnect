From a UX lens, Casaora already *looks* like a premium product. The main work now is tightening flows, removing friction, and making it more inclusive.

I’ll group this into:

1. Strengths
2. Top UX issues (prioritized)
3. Flow-specific notes (new, returning, and professionals)
4. Accessibility & inclusivity checklist

---

## 1. UX strengths

**Visual & brand**

* Hero layout is clean, with strong typography and lots of white space (from your screenshot + live page).
* Imagery has descriptive alt text like “Premium household professionals – Casaora,” which is great for screen readers. ([Casaora][1])
* The “Art of Home” tagline + calm aesthetic support the premium positioning.

**Information structure**

* Home → “How It Works” → “Pricing” → “How Casaora Works” is logical and uses familiar labels. ([Casaora][1])
* Pricing page does an excellent job explaining marketplace vs concierge, and even has a cost calculator with a fee breakdown and currency conversion. ([Casaora][2])

**Copy supporting UX**

* Bilingual support is consistently highlighted (pricing, FAQ, concierge description), which reassures expats. ([Casaora][2])
* The “For Customers / For Professionals” split on the How It Works page makes mental models clear. ([Casaora][3])

You’re starting from a really solid foundation.

---

## 2. Top UX issues (with concrete fixes)

### A. Confusing repetition & cognitive load on the homepage

**Issue**

The homepage has *two* “How It Works” sections with similar 3-step flows, plus a more detailed “How It Works” page. ([Casaora][1])

* First: 01 BRIEF → 02 CURATE → 04 SUPPORT with AI matching, 5 matched, 5 days. ([Casaora][1])
* Later: 01 Brief → 02 Curate → 03 Place with almost identical copy. ([Casaora][1])

For a new user, this feels like “wait, how many steps and what’s the difference?”

**Fix**

* On the **home page**, keep a single, tight 3-step strip:

  1. Brief → 2. Curate → 3. Hire (or Place/Support).
* Move the more detailed “trigger/action/AI matching” diagram to the **How It Works** page, framed as “Behind the scenes.”
* Use consistent labels (don’t alternate between “Place” and “Support” for the last step).

This reduces scanning fatigue and makes the core journey easier to grok.

---

### B. Empty “Professionals” page is a UX dead end

**Issue**

The Professionals page currently says:

> “Every specialist here has passed Casaora's four-step vetting…” → **“No professionals match these filters yet.”** ([Casaora][4])

So a primary nav item + important hero CTA can lead to a fully empty result. That feels broken and erodes trust.

**Fix (short-term)**

* **Always show something**:

  * If you have real profiles, load a default city/service and show a few featured pros.
  * If you’re still pre-supply in production, replace the grid with:

    * An explainer of how matching works.
    * A short form or email capture: “We’re onboarding professionals in your area — tell us what you need and we’ll notify you.”

* Adjust the Professionals CTA to match the reality:

  * Instead of “Browse Professionals” everywhere, use “Tell us what you need” as primary and “Browse sample professionals” as secondary.

**Fix (UX polish)**

* Add skeleton loading states for list + filters so users see “working” rather than a jarring empty state.
* When filters hit 0 results, show:

  * “No professionals match all of these filters yet. Try clearing rating or availability, or request concierge matching.”

---

### C. Primary CTA doesn’t match core flow

**Issue**

Hero CTA is “Find Professionals” which implies a classic marketplace grid. But strategically, your core flow is actually a **brief / concierge-style match** (especially for expats). ([Casaora][1])

This mismatch creates UX friction: user intent = “get this handled,” UI = “go browse a catalogue that might be empty.”

**Fix**

* Make the hero primary CTA something like **“Start your brief”** that opens a simple intake flow (service, city, language, dates).
* Use “Browse professionals” as a secondary/ghost button that either:

  * Goes to a curated sample listing, or
  * Stays disabled/coming soon if supply is not ready.

Aligning CTA text with the actual experience reduces surprises and confusion.

---

### D. Slight IA overload in footer & nav

**Issue**

Nav + footer repeat a lot of items and expose future-facing elements like “Booking Platform,” “Professional Profiles,” “Secure Messaging,” “Admin Dashboard,” “AGUAORA Coming Soon,” “iOS/Android App Coming Soon.” ([Casaora][1])

For a first-time visitor this:

* Adds noise without adding clarity.
* Promises features they can’t actually reach yet.

**Fix**

* **Collapse marketing-only “platform feature” links** into a single page (e.g., “Platform features”) instead of showing each as a separate nav item in the mega-menu.
* Move “coming soon” links (mobile apps, AGUAORA) into an “Upcoming” section in your roadmap or “What’s New” page instead of the main nav & footer.
* Keep top nav lean: **Professionals | How It Works | Pricing | Contact | Login / Sign Up**.

Cleaner IA = faster wayfinding, especially for users with cognitive load.

---

### E. Pricing calculator clarity for both locals & expats

**Issue**

The pricing page uses COP amounts with thousand separators, a platform fee breakdown, optional insurance, and a USD approximation. ([Casaora][2])

This is *great*, but cognitive load is a bit high:

* Local users may not care about USD.
* Foreigners might not recognize COP formatting (e.g., `100.000` vs `100,000`).

**Fix**

* Add short inline labels:

  * “Service Cost – set by professional (in COP)”
  * “Platform Fee – Casaora’s fee (in COP)”
* Make currency formatting consistent and locale-aware:

  * For English: `COP $100,000` / `US$30`.
* Consider letting people toggle “show USD estimate” on/off, or infer based on locale.

Also, ensure the slider/controls for “Hours of Service” have proper labels for screen readers (more in accessibility section). ([Casaora][2])

---

### F. Emotional tone: warmth vs “SaaS-y”

**Issue**

Some pieces feel like a SaaS landing (logos of fictional companies, “Booking Platform / Secure Messaging / Admin Dashboard”) while the testimonials and copy clearly sell a *human, at-home* service. ([Casaora][1])

This can slightly distance the emotional connection for families picturing someone in their home.

**Fix**

* Swap generic logos for **location-based or persona-based proof**:

  * “Families in Bogotá, Medellín, Cartagena…” with icons or map slices.
* Add **1–2 small photos of real or realistic scenarios** (e.g., a housekeeper at work, a family greeting a nanny) with inclusive representation.
* Use microcopy that feels hospitality-first:

  * “We’ll introduce you to 3–5 trusted professionals” instead of “AI matching & curation”.

---

## 3. Flow notes by audience

### 3.1. New customers (expats & locals)

**Current path**

Home → How It Works section → Pricing → “Browse Professionals” or “Request Concierge.” ([Casaora][1])

**UX wins**

* Linear narrative: what it is → how it works → what it costs → call to action.
* FAQ on How It Works answers anxieties about verification, dissatisfaction, payments, and language. ([Casaora][3])

**Improvements**

* Add a **clear “Start here” strip** near the top:
  “Foreigners / First-time users → Concierge” vs “Locals / Repeat users → Marketplace.”
* Show **one short “example journey”**:
  “Maria, new expat in Bogotá → filled the brief → saw 3 candidates → hired within 5 days.”

This supports users who think in stories rather than abstract steps.

---

### 3.2. Returning customers

We don’t see the logged-in dashboard in public HTML, but the marketing surfaces already influence their experience.

**UX suggestions**

* Make **Login** visually distinct (e.g., outline button in header) so returning users don’t have to search. It’s already there but visually secondary. ([Casaora][1])
* Consider a **context-aware hero**:

  * If a user is logged in and lands on `/en` again, show a variant:

    > “Welcome back, Christopher – ready to rebook?” [View upcoming bookings] [Rebook past professional]

Even if you don’t fully implement personalization yet, design the states so it’s obvious where returning users go.

---

### 3.3. Professionals

**Current public journey**

* Learn mostly via the How It Works page’s “For Professionals” section → “Apply as a Professional.” ([Casaora][3])
* The Professionals nav item is currently customer-facing (listing pros), not a clear entry point for pros.

**UX suggestions**

* Add a dedicated **“For Professionals” link** in the main nav or footer, pointing to a landing at `/en/pros` or `/en/join`.
* On that page:

  * Mirror the stepper: Apply → Get Verified → Get Matched → Earn & Grow (you already use this language). ([Casaora][3])
  * Include 1–2 stats like “Professionals keep 100% of their rate” and “English/Spanish support.” ([Casaora][2])
* On mobile, ensure the “Join Our Network” call-to-action is reachable without scrolling through a massive footer. ([Casaora][1])

This makes the professional experience feel just as intentional as the customer’s.

---

## 4. Accessibility & inclusivity checklist

You’re already doing some good things (alt text, clear headings). Here’s a focused punchlist to make Casaora more accessible:

### A. Structure & semantics

* Ensure each page has a single `<h1>` (e.g., “Your home deserves exceptional care,” “Transparent Pricing – No Hidden Fees,” “How Casaora Works”). ([Casaora][1])
* Use logical heading levels (`h2` for sections like “How It Works”, “Our Services”, “For Customers”).
* Confirm that **buttons vs links** are used accurately:

  * CTAs like “Browse Professionals,” “Get Concierge Service,” “Apply as a Professional” should be `<button>` or `<a role="button">` with proper ARIA where needed. ([Casaora][2])

### B. Keyboard navigation

* Test that all interactive elements (nav, CTAs, language toggle, cost calculator slider, forms, filters on Professionals page) are reachable and operable with **Tab/Shift+Tab/Enter/Space** only. ([Casaora][2])
* Ensure focus outlines are **visible and high-contrast** against background according to WCAG (don’t remove default focus rings without replacing them).

### C. Forms & controls

* For all form fields (intake/brief, contact, pricing calculator, filters), provide:

  * `<label>` elements properly associated with inputs via `for`/`id`.
  * Helpful placeholder examples that *complement* labels, not replace them.
* For the **hours slider** and toggles on the pricing calculator, ensure:

  * They have ARIA attributes like `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, and clear text description (“Hours of service”). ([Casaora][2])

### D. Color & contrast

I can’t see your actual hex values here, but common pitfalls:

* Orange on white or light gray can fail contrast for small text.
* Light grays for secondary text can be too low contrast.

Run a quick audit with a contrast checker for:

* Body text vs background.
* Button text vs button background.
* Focus states (e.g., blue or dark outline around elements).

Aim for WCAG AA: contrast ratio ≥ 4.5:1 for normal text.

### E. Language & localization

* You already have EN/ES toggle at the top. ([Casaora][1])

  * Ensure that when users switch language:

    * The page’s `lang` attribute updates (`lang="en"` / `lang="es"`).
    * Screen readers announce the change.
    * The preference persists across pages & sessions (cookie or localStorage).
* Avoid mixing languages in copy (e.g., “Art of Home” while everything else is Spanish) for the ES version.

### F. Motion & cognitive load

If you use any subtle animations (hero image, card hovers, sliders):

* Respect `prefers-reduced-motion` in CSS so users with motion sensitivity can opt out.
* Keep animations **slow and small**; avoid large parallax or auto-scrolling sections.

---

If you want to go the next level, I can:

* Draft **wireframes for an ideal “Start your brief” flow** with accessibility notes baked in, or
* Create a **UX checklist specific to your Next.js/Tailwind implementation** (naming conventions, component-level accessibility patterns) so every new feature stays consistent.

[1]: https://casaora.vercel.app/ "Casaora · The Art of Home"
[2]: https://casaora.vercel.app/en/pricing "Transparent Pricing - No Hidden Fees | Casaora · Casaora"
[3]: https://casaora.vercel.app/en/how-it-works "Casaora · The Art of Home"
[4]: https://casaora.vercel.app/en/professionals "Casaora · The Art of Home"
