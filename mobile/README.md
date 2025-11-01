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

- **Authentication** — Email/password login backed by Supabase auth with secure session storage on device.
- **Professionals** — Mobile-optimized list powered by the `list_active_professionals` RPC with verification, availability, and performance metrics.
- **Bookings** — Agenda view with status summaries, scheduling metadata, and payment indicators for upcoming jobs.
- **Account** — View profile details and sign out; surfaces onboarding status to ensure operators stay compliant.
- **Push-ready** — Expo Notifications scaffolding handles permission prompts, token registration, and simulator fallbacks.
- **Offline-first data** — React Query caches Supabase responses to AsyncStorage with automatic refetch when connectivity returns.

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

- Mirror more desktop flows (booking creation, dispute management, payout review).
- Sync Expo push tokens to Supabase and wire message triggers.
- Add end-to-end tests around offline-first flows and background refresh.
