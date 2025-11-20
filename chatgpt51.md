Got it — we’ll park skilled trades for *later you* and focus on making the **core domestic staffing product in LatAm absolutely lethal** first.

Here’s a concrete gameplan, assuming you’re a lean team and want a 60–90 day arc.

---

## Big picture: what to optimize *now*

Given where Casaora is today:

* You already have a strong **design system + dev workflow** (scripts, Lia patterns, CI, PostHog funnels script, etc.).
* The stack is modern and well-structured (Next 16, Supabase, Stripe, PostHog).
* You’re positioned as **“Airbnb + concierge” for expats**, but the *code/docs* still don’t fully lean into **multi-country LatAm** or rich **pro storytelling** (videos).

So the highest‑leverage focus *before* trades is:

> **Nail the core LatAm domestic vertical + trust UX, with solid multi‑country foundations and clear data on what’s working.**

I’d structure your next focus like this:

---

## Phase 1 (Next 30 days): Tighten core story + schema for growth

### 1.1 Lock in the narrative: “Domestic staffing for expats in LatAm”

**Why:** This is what you’re already doing; PCA (positioning, copy, architecture) should all agree.

**Actions:**

* Update any remaining **Colombia-only phrasing** in internal docs to “Latin America / starting in Colombia, Paraguay, Uruguay”.

  * Docs and README are still written assuming a Colombia-only focus.
* Document in `docs/architecture.md` or a short new doc:

  * What a “market” is (country + city).
  * What “concierge” means operationally (SLAs, who answers, what they can do).

This is mostly copy + clarity, but it guides all product decisions.

---

### 1.2 Design the **intro video** data model & permissions

You don’t need to ship the UI in this phase; just get the structure right.

**Actions:**

1. **DB changes (Supabase):** add to your professional profile table:

   * `intro_video_path text`
   * `intro_video_status text` (`none | pending_review | approved | rejected`)
   * `intro_video_duration_seconds int`
   * `intro_video_thumbnail_path text`
   * (Optional later) `intro_video_transcript text`

2. **Storage plan:**

   * Create a private bucket, e.g. `intro-videos`.
   * Decide: public URL vs signed URL (I’d start with **signed URLs** so only logged‑in customers can view).

3. **Security headers:**

   * Right now your middleware sets `Permissions-Policy` to **block camera/mic** completely. 
   * Decide the new rule (e.g. `camera=(self), microphone=(self)`), or plan to override this header only on pro-dashboard routes.

If you do just this in Phase 1, Phase 2 UI work will be smooth.

---

### 1.3 Introduce a simple **Markets config**

Before you add more countries or categories, encode markets *once* and reuse.

**Actions:**

* Create a small `markets` config (could be TS file first, then a DB table later):

  ```ts
  // src/config/markets.ts
  export const MARKETS = {
    CO: { label: "Colombia", currency: "COP", defaultLocale: "es" },
    PY: { label: "Paraguay", currency: "PYG", defaultLocale: "es" },
    UY: { label: "Uruguay", currency: "UYU", defaultLocale: "es" },
  } as const;
  ```

* Make sure **customers and professionals** have a `country_code` field in profiles / households so you can:

  * Filter search results by market.
  * Later: adjust pricing/fees per country.

You already have a very structured dev workflow and clear migration process, so this is a small, well-contained change.

---

### 1.4 Set up the *minimum viable analytics* you’ll care about

You’ve got PostHog plus a helper script for funnels. 

In this phase, decide on **3–5 core metrics**:

* `signup_started` → `signup_completed`
* `booking_started` → `booking_completed`
* `% of bookings via concierge vs self-service`
* Later: `intro_video_viewed` → `booking_completed` (for Phase 2)

Just make sure events include:

* `role` (customer / professional)
* `country_code`
* `service_type` (nanny, cleaning, etc.)

This will drive decisions in later phases.

---

## Phase 2 (Days 30–60): Ship the 60s intro video feature end‑to‑end

Now you use the schema from Phase 1 to make the UX real.

### 2.1 Pro dashboard: “Intro video” flow

**Goal:** any active professional can record or upload a 60-second intro.

**Actions:**

* Add a **“Intro Video” card** in the professional profile section:

  * Explains what to say.
  * Shows “No video yet / Pending review / Approved”.

* Implement:

  * Record via browser (`getUserMedia` + `MediaRecorder`), plus
  * Upload from gallery (`<input type="file" accept="video/*">`).

* Enforce:

  * Max length 60s (timer in UI + server-side check).
  * Max size (e.g. 50–100MB).

* On upload:

  * Save to Supabase Storage.
  * Set `intro_video_status = 'pending_review'`.

---

### 2.2 Admin / concierge: video review queue

Because you’re “Airbnb with concierge”, this should feel very human.

**Actions:**

* In your **admin panel**, add a tab:

  * “Intro Videos”
  * Columns: Pro, market, role (nanny/cleaner/etc.), submitted_at, status, actions.

* Actions:

  * **Approve**: sets `status = 'approved'`.
  * **Reject**: sets `status = 'rejected'` + optional note (visible to pro: “Too noisy background, please re‑record indoors.”).

This also becomes part of your **vetting script** for the remote ops team.

---

### 2.3 Customer side: use the video where it moves the needle

Don’t overdo it; start with the highest-leverage surfaces:

* **Professional detail page:**

  * Prominent video at the top (“Meet [Name]”).
* **Search / list view:**

  * Small “▶ Intro video” chip on cards that have one.
  * You can later A/B test boosting profiles with videos.

**Analytics instrumentation:**

* `intro_video_viewed` event with:

  * `pro_id`
  * `country_code`
  * `role` (nanny/cleaner/etc.)
* Tie to `booking_completed` to see if it improves conversion.

---

## Phase 3 (Days 60–90): Multi-country & concierge excellence

Once intro videos work, focus on being undeniably good at domestic staffing across your initial countries.

### 3.1 Per-market pricing & terms (still **domestic only**)

**Actions:**

* Move away from a single global env var like `NEXT_PUBLIC_DIRECT_HIRE_FEE_AMOUNT` to a **per-market config**, e.g.:

  ```ts
  export const MARKET_PRICING = {
    CO: { directHireFeeUsd: 299 },
    PY: { directHireFeeUsd: 249 },
    UY: { directHireFeeUsd: 279 },
  };
  ```

* Show customers:

  * Local currency price if appropriate.
  * A clear statement: “All fees are billed in USD” (if that’s your model).

* Have a simple way to **turn a country on/off** in UI via config (your remote ops team will love this when you test a new city).

---

### 3.2 Concierge ops as a “product”

You’re remote, which means the **concierge is your presence** in LatAm.

**Actions:**

* Define what concierge can do from the product:

  * Create bookings on behalf of customers.
  * Reassign professionals if something goes wrong.
  * Nudge pros to upload intro videos.

* Ensure the admin tools & dashboards support this:

  * A “Today’s bookings by market” view.
  * A “Professionals with no video yet” list so the team can reach out.

You already have strong design tokens and patterns for admin/dashboards; leverage those to keep ops screens consistent.

---

### 3.3 Feedback loops before adding anything new

Before revisiting trades, use your data to answer:

* Which **service types** (e.g. nanny vs cleaning) have:

  * Best conversion?
  * Best repeat rate?
* Which **markets** show the best unit economics?

Based on the dev & analytics setup you already have, you should be able to answer these quickly once events are flowing.

Only *after* you can clearly say “here’s what’s working for domestic staffing in CO/PY/UY” does it make sense to:

* Deepen domestic offerings (e.g. elder care) **or**
* Re-open the “skilled trades” thread.

---

## TL;DR priority stack

If you want the ultra‑compact checklist:

1. **Clarify narrative + markets**

   * Update internal docs to “LatAm domestic staffing + concierge”.
   * Add a `markets` config and ensure profiles are market-aware.

2. **Lay the foundation for intro videos**

   * DB columns, storage bucket, and updated Permissions-Policy.

3. **Ship intro videos for pros**

   * Pro dashboard upload/record.
   * Admin review queue.
   * Customer playback on profile + list.

4. **Strengthen multi-country & concierge ops**

   * Per-market pricing config.
   * Simple ops dashboards for bookings & pro quality (incl. who has videos).

5. **Use data to decide the *next* vertical**

   * Once domestic in CO/PY/UY is humming, revisit trades with real signal.

If you want, next we can zoom in on **just Phase 2** and sketch the exact screens and API endpoints for the intro-video feature so you or your team can start building immediately.
