# MaidConnect Mobile Overview

The mobile app gives operations and field teams a portable view of bookings, professionals, and account data. It is built with Expo/React Native and shares Supabase as the backend with the Next.js dashboard.

## Current Scope

- Authenticated operator experience using Supabase auth.
- Professionals list powered by the `list_active_professionals` RPC (safety metrics, availability, distance).
- Bookings agenda with status summaries, payment and scheduling metadata.
- Account screen that surfaces onboarding status, push-notification enrollment, and notification preferences.
- Offline caching via React Query with AsyncStorage persistence.
- Push notification scaffolding (Expo Notifications) that stores tokens in Supabase and allows per-role preference toggles.

## Active Initiatives

| Theme | Description | Status |
| --- | --- | --- |
| Notifications | Deliver real-time alerts for bookings, messaging, and payouts. | In progress |
| Offline UX | Expand caching to support booking creation and message drafts. | Planned |
| Feature parity | Mirror key desktop flows (disputes, payouts, messaging). | Planned |
| QA & Releases | EAS build automation, smoke tests, and store submission. | In progress |

See the other documents in this folder for deeper guidance on setup, notifications, and release readiness.
