# MaidConnect Mobile

This Expo app extends the MaidConnect platform to iOS and Android. It reuses the Supabase backend powering the web dashboard so staff can review professionals, track bookings, and manage their account from a phone.

## Quick Start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Provide environment variables. Create a `.env` file in this directory (or configure them in Expo Application Services) with:

   ```bash
   EXPO_PUBLIC_SUPABASE_URL=...
   EXPO_PUBLIC_SUPABASE_ANON_KEY=...
   ```

   These should match the values already used by the Next.js app (`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

3. Launch the development server:

   ```bash
   npx expo start
   ```

   Press `i` for iOS Simulator, `a` for Android, or scan the QR code with Expo Go.

## Features Implemented

### ✅ Phase 1 Complete
- **Authentication** — Email/password login backed by Supabase auth with secure session storage on device.
- **Professional Discovery** —
  - Mobile-optimized list powered by the `list_active_professionals` RPC
  - **Full professional detail view** with services, rates, availability, and stats
  - Tap-to-view functionality from list
- **Booking Management** —
  - **Complete 5-step booking wizard** (service, date/time, duration, address, review)
  - **Booking detail screen** with full information display
  - **Booking actions**: Cancel, reschedule, extend time
  - **Professional actions**: Accept, decline, check-in, check-out
  - Real-time mutations with optimistic updates
- **Account** — View profile details and sign out; surfaces onboarding status to ensure operators stay compliant.
- **Push-ready** — Expo Notifications scaffolding handles permission prompts, token registration, and simulator fallbacks.
- **Offline-first data** — React Query caches Supabase responses to AsyncStorage with automatic refetch when connectivity returns.

### 🚧 Coming in Phase 2
- Messaging system with real-time chat
- Payment integration with Stripe
- Address management (CRUD)
- Favorites system
- Reviews and ratings

The file-based router in `app/` mirrors the product areas on the web dashboard:

- `app/(auth)` contains screens for unauthenticated users (currently sign-in).
- `app/(app)` hosts the authenticated tab experience (Professionals, Bookings, Account).

## Project Structure Highlights

- `lib/` — Supabase client and environment helpers shared across screens.
- `providers/AuthProvider.tsx` — Session management and context that gates routes.
- `providers/NotificationsProvider.tsx` & `providers/QueryProvider.tsx` — Cross-cutting concerns for push alerts and offline caching.
- `features/` — Domain-oriented hooks, APIs, and UI components (e.g., professionals, bookings).

## Building with EAS

1. Install the Expo Application Services CLI if you haven’t already:

   ```bash
   npm install -g eas-cli
   ```

2. Log in with the shared Expo account and link the project:

   ```bash
   eas login
   eas whoami
   eas init --id <maidconnect-project-id>
   ```

   The `eas.json` file defines three profiles:

   - `development` → development client builds for QA with live reload.
   - `preview` → installable ad-hoc/internal builds (APK & simulator IPA by default).
   - `production` → store-ready artifacts (AAB / App Store IPA).

3. Configure credentials:

   ```bash
   eas credentials --platform ios
   eas credentials --platform android
   ```

   Provide the Apple Team ID and Android keystore values generated for the MaidConnect org. (If they don’t exist yet, EAS can create managed credentials—store the secrets in your password vault.)

4. Kick off a build:

   ```bash
   eas build --profile preview --platform all
   ```

   Use `development` while iterating locally with the Expo Go replacement, and switch to `production` when shipping to the App Store / Play Store.

5. After a production build succeeds, submit to the stores:

   ```bash
   eas submit --profile production --platform ios
   eas submit --profile production --platform android
   ```

   Store API keys (App Store Connect / Google Play Service Account) should be configured once and stored as EAS secrets.

## Next Steps

### Phase 2 Priorities
1. **Messaging System** — Real-time chat with professionals, auto-translation
2. **Payment Integration** — Stripe SDK, payment methods, authorization flow
3. **Address Management** — Save, edit, delete addresses
4. **Favorites** — Save and manage favorite professionals
5. **Reviews & Ratings** — Leave reviews after service completion

### Phase 3 (Advanced)
- Professional onboarding flow
- Portfolio management
- Availability calendar management
- Earnings dashboard
- Push notifications
- Referral program
- AI assistant integration

## Testing

To test Phase 1 features:

1. **Start the dev server:**
   ```bash
   npm start
   ```

2. **Test Professional Flow:**
   - Navigate to Professionals tab
   - Tap any professional card → View detailed profile
   - Tap "Book Now" → Complete 5-step booking wizard
   - Review booking summary and submit

3. **Test Booking Management:**
   - Navigate to Bookings tab
   - Tap any booking → View detailed information
   - Tap the 3-dot menu to access actions
   - Try cancelling, rescheduling, or extending (based on status)

See [PHASE1_IMPLEMENTATION_SUMMARY.md](./PHASE1_IMPLEMENTATION_SUMMARY.md) for complete documentation.
