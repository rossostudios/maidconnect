NEXT_PUBLIC_DIRECT_HIRE_FEE_AMOUNT=29900  # $299.00 USD
NEXT_PUBLIC_ENABLE_DIRECT_HIRE=true
``` :contentReference[oaicite:17]{index=17}  

For a single market (Medellín / Colombia) that’s fine. For **multi‑country**:

- $299 might make sense for US → Colombia, but for Paraguay or Uruguay you might want different pricing.
- You’ll likely need **per-country price books** in your database or config, not a single global `NEXT_PUBLIC_DIRECT_HIRE_FEE_AMOUNT`.

**Suggestion:**

- Introduce a `markets` table or static config: `(country_code, currency_code, direct_hire_fee_cents, hourly_fee_markups, tax_rules, …)`.
- Frontend: fetch market config based on the customer’s selected country and show the correct fee in local currency + USD equivalent.

---

## 2. Multi‑country expansion: technical & product checklist

Here’s a practical punchlist tuned to “Colombia → Paraguay & Uruguay” using your current stack.

### 2.1 Data model & RLS

Based on the README and Supabase usage, you’re already heavy on RLS and canonical tables.   

For multi-country:

- **Ensure every location-bound table has `country_code` and (preferably) `city_id`**:  
  - `profiles` / `professional_profiles`  
  - `bookings`  
  - `addresses`  
  - `availability` / `shifts`

- **RLS policies** should:
  - Limit professionals to seeing only their own bookings across all markets.
  - Allow operations/admin to filter by country/city easily (e.g. `role = 'ops' AND country_code IN (...)`).
  - Prevent any cross-market data leakage if you later bring in partners country-by-country.

### 2.2 Time zones & scheduling

In multi-country mode:

- Normalize all booking times to UTC in the DB.  
- Store `customer_tz` and `professional_tz` explicitly.  
- Your “Smart Calendar” feature will need reliable timezone handling for each country; Uruguay/Paraguay have different daylight savings histories than Colombia.

This is a place where E2E tests like your `booking-flow.spec.ts` can be extended with timezone cases. :contentReference[oaicite:19]{index=19}  

### 2.3 Pricing & currencies

Even without seeing your pricing code, you’ll need:

- A `currencies` abstraction (COP, PYG, UYU, plus USD for US-located payers).  
- Clear rules:
  - Does the **customer pay in local currency or USD**?  
  - Does the **professional always receive local currency**?  
  - Are you acting as **employer-of-record** or marketplace (impacts fee structure and legal disclaimers per country)?

Use your `NEXT_PUBLIC_DIRECT_HIRE_FEE_AMOUNT` as the first piece to refactor into per-country config rather than an app-wide constant. :contentReference[oaicite:20]{index=20}  

### 2.4 Frontend flows: city & country selection

On the front end:

- Make **country selection a first-class part of the booking flow** (and ideally the hero UI), not buried.
  - Step 1: Choose country (CO, PY, UY).
  - Step 2: Choose city (Medellín, Bogotá, Asunción, Montevideo, etc).
  - Step 3: Choose service type (cleaning, nanny, etc).

- Use `next-intl` to keep **global structure the same** while swapping local copy (“Top 5% in Medellín” vs “Top 5% in Asunción”).   

- If you’re using Sanity CMS for help center/marketing copy, create **market-specific content** (category/slug per country) so ops and marketing can change messaging without touching code. :contentReference[oaicite:22]{index=22}  

---

## 3. Persona‑based feedback

### 3.1 Venture Capitalist view

**What’s attractive:**

- Clear vertical: expats hiring domestic help in LATAM with legal & trust layer.  
- Strong technical foundation: modern stack (Next 16, React 19, Supabase, Stripe, PostHog) and layered architecture with services & repos.   
- Good dev discipline: weekly release schedule, semantic versioning, Biome, tests, CI/CD, and explicit security posture.   

**Questions / concerns I’d raise:**

1. **Market size & expansion logic:**  
   - Why Paraguay and Uruguay as the next two? Are they data-driven (user leads, early traction) or opportunistic?  
   - What’s the TAM of “expats needing household staff” per country?

2. **Moat vs open source:**  
   - The entire platform is MIT-licensed. Great for credibility, but: what prevents a local competitor in Asunción from cloning the repo and undercutting you? :contentReference[oaicite:25]{index=25}  
   - I’d want to hear your “moat story”: brand, supply network, trust & safety data, operations playbooks, and Amara intents/knowledge base that aren’t easily copyable.

3. **Compliance & legal entity footprint:**  
   - For each new country: what’s the legal structure? Are you a marketplace, agency, or employer-of-record?  
   - How are labor laws handled for domestic workers in PY/UY? (This is a *big* diligence topic.)

4. **Data & product analytics:**  
   - You’ve integrated PostHog for feature flags and funnels – good.   
   - I’d want a crisp dashboard with:
     - Funnel: visitor → chat → booking → repeat booking  
     - Supply-side funnel: applicant → vetted → active → retained  
     - Per-country unit economics.

**VC-side suggestion:** Build a small internal “Markets” dashboard where I can see *per country*: GMV, jobs filled, churn, and NPS. That makes your multi-country story tangible.

---

### 3.2 Customer view (US/EU expat hiring in LATAM)

From a customer’s perspective landing on your site & app:

**Strengths:**

- “Hybrid staffing” + “Amara Instant Book”: sounds like I can do both quick gigs and formal hires. :contentReference[oaicite:27]{index=27}  
- Verification, zero-commission for pros, legal contract, and 30-day guarantee all build trust. :contentReference[oaicite:28]{index=28}  
- English-first support and bilingual platform matter a *lot* if I don’t speak Spanish.   

**What I’d want improved for multi-country:**

1. **Clarity: where are you actually operating?**  
   - Have a prominent “Where we operate” section that lists **countries and cities** (Colombia, Paraguay, Uruguay + cities), and what services are available in each.  
   - Avoid text that still reads as “Colombia-only”.

2. **Currency & pricing transparency:**  
   - Show me prices *in local currency* and also a small USD equivalent.  
   - Make the $299 placement fee extremely clear about what it covers and in which countries that specific amount applies.

3. **Trust & safety across countries:**  
   - Make it obvious that background checks and vetting standards are consistent across CO/PY/UY, or explain if they differ (e.g. Paraguay lacks a certain database, so you use alternative methods).

4. **Onboarding friction:**  
   - Ensure your booking and payment flows are equally smooth across countries—no weird “Colombia-only” dropdowns or copy.

---

### 3.3 Professional view (household worker)

Your README already sells a strong value prop for professionals: zero commission, career ladder, vetted clients, dashboard. :contentReference[oaicite:30]{index=30}  

For someone in Paraguay/Uruguay:

- Make sure **registration flows actually allow selecting their country and city** and that they’re not forced to pick a Colombian city.

- Very clearly explain:
  - How they get paid (currency, frequency, bank vs cash alternatives).  
  - What protections they have (contract, minimum wage compliance, anti-harassment policies).

- UX wise, for pros:
  - Keep **availability & scheduling** as simple as possible; timezone issues get trickier with multi-country.
  - Localize legal copy and worker protections in Spanish for each country (and be careful about copy-pasting Colombian legal language into Uruguay without adaptation).

---

### 3.4 Internal team lenses

#### Growth & Marketing

- **Messaging:** Shift from “expats in Colombia” to a LATAM narrative with specific country pages for SEO:  
  - `/en/colombia/medellin-household-staff`  
  - `/en/paraguay/asuncion-household-staff`  
  - `/en/uruguay/montevideo-nanny-cleaner-service`  

- **Content per market:** use Sanity to spin up:
  - City guides (“Hiring a nanny in Asunción as an expat: what you need to know”).  
  - “Pay & benefits” explainers to build trust.

- **Analytics:** define a canonical event taxonomy in PostHog (e.g. `booking_started`, `booking_completed`, `amara_intent_resolved`) with `country_code` and `city` properties to quickly compare markets.   

#### Sales

Even if you’re mostly B2C, there’s a B2B-ish angle:

- Larger expat communities (companies relocating teams, co-living spaces) in each country can be “accounts”.
- Build light tooling for:
  - Tracking intro calls and special corporate rate plans.  
  - Managing multi-household contracts (e.g., a co-living operator needing cleaners in multiple apartments).

#### Operations

- You already emphasize RLS and admin dashboards.   

For multi-country ops:

- Build an **Ops Console** filtered by `country_code`:
  - Queue of pending professional applications per country.  
  - Today’s bookings by city.  
  - “At risk” bookings requiring manual intervention.

- Give ops powers to:
  - Manually reassign professionals across cities or within country.  
  - Temporarily pause supply in a city (e.g. if PY/UY supply is thin this week).

#### IT / Platform Engineering

- You’re doing a lot right: modern stack, good layering, strong security posture, tests, Storybook, Biome, etc.   

Key things to keep an eye on:

1. **Multi-environment secrets management** as you add more services/partners per country.  
2. **Rate limiting and abuse detection** per IP/country (Upstash is already there; just ensure per-country dashboards).   
3. **Error logging:** tag logs/error traces by `market` to spot country-specific issues quickly (e.g. Paraguay-specific Stripe failures or SMS provider quirks).

#### Product

- Unify **two core flows** into one mental model:
  - Instant hourly bookings.  
  - Direct hires with contracts & placement fee.

- Build a single “Hire help” funnel that lets the user choose:
  - Country & City  
  - Service type  
  - Engagement type: “Try for a day” vs “Hire permanently”

- For multi-country, prioritize:
  - Getting one or two *flagship* use cases 10/10 in each country (e.g., cleaners in Asunción, nannies in Montevideo) before spreading thin across many categories.

---

If you’d like, in a follow-up I can help you design:

- A concrete `markets` config/schema for Supabase (tables + RLS ideas).  
- Or a copy rewrite of your homepage to reflect the LATAM expansion while still leaning into your Colombia origin story.
::contentReference[oaicite:35]{index=35}
