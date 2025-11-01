# Mobile Development Setup

Follow this checklist to get the MaidConnect mobile app running locally.

## Prerequisites

- Node.js 18+
- npm 10+
- Expo CLI (`npm install -g expo-cli`) and EAS CLI (`npm install -g eas-cli`)
- Xcode (for iOS) and/or Android Studio (for Android)
- Access to the shared Supabase project environment variables

## 1. Install dependencies

```bash
cd mobile
npm install
```

## 2. Configure environment variables

Duplicate `.env.example` inside `mobile/` and fill in the Supabase values that match the web app:

```bash
cp .env.example .env
```

Required variables:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

These are non-secret and can be committed to Expo projects, but avoid exposing higher-privilege keys.

## 3. Run the app

```bash
cd mobile
npx expo start
```

Use the Expo CLI prompts:

- `i` to launch the iOS simulator
- `a` to launch the Android emulator
- Scan the QR code with Expo Go on a physical device (iOS requires a dev client build)

## 4. Optional tooling

- `npm run lint` – Expo’s ESLint config
- `npm run typecheck` – TypeScript project check
- `npm run test` – _not yet wired_; add when Jest/E2E coverage is added

## 5. Linking to EAS

To build native binaries:

```bash
eas login
eas whoami
eas init --id <maidconnect-project-id>
```

The `eas.json` file defines profiles for development, preview, and production releases. See `docs/mobile/release-playbook.md` for details.
