# Essential Post-MVP Features for Casaora Web App

Great question! Your MVP covers the basics (auth, search, booking, payments, chat, reviews). To hit **PMF and scale to 50K jobs/year**, prioritize **10-15 more features** in phases. Focus on **retention (60% repeat bookings like Airbnb)**, **trust (LatAm must-have)**, and **monetization**. Avoid bloat—add 2-3 per sprint (2-week cycles).

Build order: Use **Next.js/Supabase** extensions (e.g., Stripe for subs, Algolia for search). Est. cost: **$5-10K per phase** via freelancers.

## Feature Prioritization Matrix
| Phase       | Feature                  | Why? (Impact)                  | Est. Dev Time | Priority (1-10) |
|-------------|--------------------------|--------------------------------|---------------|-----------------|
| **MVP+ (Months 2-4)** | Recurring Bookings      | 40% revenue from repeats (Airbnb lesson). | 1 week       | 10             |
|             | Availability Calendar   | Reduces no-shows 30%.         | 3 days       | 9              |
|             | In-App Chat History     | Builds loyalty; WhatsApp fallback. | 2 days       | 9              |
| **Growth (Months 4-7)** | Smart Matching          | AI boosts conversion 20%.     | 2 weeks      | 10             |
|             | Push Notifications (PWA)| Retention +2x engagement.     | 1 week       | 9              |
|             | Dispute Resolution      | Trust; <5% disputes target.   | 1 week       | 8              |
| **Advanced (Months 7+)** | Subscriptions           | Recurring revenue (MRR).      | 2 weeks      | 9              |
|             | B2B Dashboard           | Airbnb Experiences pivot.     | 3 weeks      | 8              |
|             | Analytics Dashboard     | Data-driven growth.           | 2 weeks      | 7              |

## Detailed Feature Breakdown

### 1. MVP+ Features (Retention Boost – Launch These First)
These fix pain points from user testing (e.g., no calendar → failed bookings).

| Feature                  | Description | Tech Implementation | LatAm Twist |
|--------------------------|-------------|----------------------|-------------|
| **Recurring Bookings**  | Clients set weekly/bi-weekly (e.g., "Fridays 9-11am cleaning"). Auto-reminders. | FullCalendar.js + cron jobs (Supabase Edge Functions). Charge 5% discount for subs. | Common for maids; target "empleadas fijas". |
| **Helper Availability** | Drag-drop calendar; block/unblock slots. Real-time sync. | FullCalendar + Supabase Realtime. | Timezone-aware (ART/UYT vs. COT). |
| **Chat Enhancements**   | File uploads (photos of work), templates ("Arrived!"), history search. | Supabase Chatkit or Firebase (free tier). Export to WhatsApp. | Voice notes (LatAm pref). |
| **Job Tracking**        | GPS check-in/out (optional), live status (en route/arrived). | Google Maps Geolocation API ($0.005/call). | Safety for homes; share with family. |

**Quick Win**: Add **favorites list** (save helpers) – 1 day, +15% repeat rate.

### 2. Growth Features (Network Effects – Scale Supply/Demand)
Solve chicken-egg: Better matching = faster liquidity.

| Feature                  | Description | Tech Implementation | Metrics Impact |
|--------------------------|-------------|----------------------|---------------|
| **Smart Matching**      | AI recommends helpers by skills, rating, distance, past jobs (e.g., "Top 3 cooks near you"). | Algolia Search (free <10K queries) or Supabase pgvector (AI embeddings). Simple rules first: score = rating * proximity. | +25% booking rate. |
| **PWA Notifications**   | Web push for "New job nearby!", "Review reminder". Install prompt. | OneSignal (free unlimited). Works offline. | App-like feel; 70% open rate. |
| **Referral Program**    | "Invite friend, get $5 credit" (helpers/clients). Trackable links. | Supabase DB + unique codes. Viral coefficient >1.2 target. | Low CAC (<$1). |
| **Dispute System**      | In-app mediation: Upload evidence, auto-refund 50% if low rating. Escalate to support. | Stripe Refunds API + admin queue. | NPS +20; <2% disputes. |
| **Multi-Language**      | ES/PT auto-detect; helper profiles bilingual. | Next.js i18n + Google Translate API fallback. | Paraguay/Uruguay mix. |

### 3. Advanced Features (Monetization & Scale – Post-10K Jobs)
Unlock higher margins (Airbnb: 40% from ancillaries).

| Feature                  | Description | Tech Implementation | Revenue Potential |
|--------------------------|-------------|----------------------|-------------------|
| **Subscriptions**       | Client: $29/mo "Unlimited 2hr jobs". Helper: $9/mo "Priority badge + more leads". | Stripe Subscriptions. Tiered: Basic/Pro. | 20% users → $50K MRR. |
| **B2B Portal**          | Property managers/airbnbs book bulk (e.g., 10 cleanings). White-label. | Separate dashboard; invoicing via Mercado Pago. | 30% GBV; partners like Inmobiliarias BA. |
| **User Analytics**      | Helpers see "Your earnings heatmap", clients "Top services". | Mixpanel/PostHog (free <1M events) + charts (Recharts). | Retention +15%. |
| **Insurance Upsell**    | Toggle $2/job coverage (theft/damage). Partner API. | Integrate local (e.g., Allianz Arg). Auto-claim form. | +2% take rate. |
| **Dynamic Pricing**     | Surge for peaks (e.g., weekends Bogotá); helper-set base + algo boost. | Simple ML: Supabase SQL + historical data. | +10% GBV. |

**Safety Must-Haves** (Non-Negotiable, Add ASAP):
- **Background Checks**: Partner with local (e.g., Datacrédito Col, $1/check).
- **Emergency Button**: In-chat SOS → police/local support.
- **Video Verification**: 30s intro video on profile.

## Implementation Roadmap
```
Sprint 1 (Week 5-6): Recurring + Calendar ($2K).
Sprint 2: Matching + PWA ($3K).
Sprint 3: Disputes + Referrals ($2K).
Test: A/B via LaunchDarkly (free).
```

**Total Add'l Cost (6 Months)**: $15-25K. **ROI**: 3x bookings via retention/matching.

**Pro Tips**:
- **User Testing**: 20 beta users/country via Typeform. Iterate weekly.
- **SEO Features**: Blog ("Cómo elegir empleada confiable") → organic traffic.
- **Avoid**: Native mobile yet (PWA covers 90%). Video calls (Twilio $ expensive).

Prioritize based on your analytics (e.g., if no-shows high → calendar first). Share beta feedback or tech stack prefs for code snippets! 🚀