# Mobile Notifications Architecture

This document explains how MaidConnect mobile handles push notifications end to end.

## High-Level Flow

1. **Permission Prompt** – Expo Notifications requests foreground/background permissions on app launch.
2. **Token Registration** – When granted, the app registers the Expo push token with Supabase (`mobile_push_tokens` table).
3. **Preference Sync** – Operators toggle per-event alerts (customer vs professional) stored in their Supabase profile.
4. **Server Trigger** – When business events occur (e.g., booking confirmed), backend services resolve the recipient’s token(s) and call Expo’s push API.
5. **Delivery & Feedback** – Expo notifies devices; undeliverable tokens are removed or retried.

## Tables & Policies

- `public.mobile_push_tokens`
  - Columns: `user_id`, `expo_push_token`, `platform`, `device_name`, `app_version`, `last_seen_at`
  - RLS: users can insert/update/delete their own records.
- `public.customer_profiles.notification_preferences`
- `public.professional_profiles.notification_preferences`

Migrations live in `supabase/migrations/20251102090000_create_mobile_push_tokens.sql`.

## Client Responsibilities

| File | Purpose |
| --- | --- |
| `mobile/providers/NotificationsProvider.tsx` | Requests permissions, registers/removes Expo tokens, exposes context state. |
| `mobile/features/notifications/api.ts` | Supabase upsert/delete helpers for `mobile_push_tokens`. |
| `mobile/features/notifications/preferences.ts` | Fetches and updates JSON preference blobs per role. |
| `mobile/app/(app)/account.tsx` | Displays permission status, Expo token, and role-specific toggle switches. |

## Server Responsibilities

- Listen to booking/status changes (via Supabase triggers, cron jobs, or backend services).
- Determine eligible recipients (respecting `notification_preferences` and user role).
- Fetch device tokens: `select expo_push_token from mobile_push_tokens where user_id = ?`.
- Call Expo Push API (consider using the `expo-server-sdk` library).
- Handle stale tokens: remove entries if Expo responds with `DeviceNotRegistered`.

## Outstanding Work

- Webhook/service to sync Supabase events with Expo push API.
- Background task for pruning expired tokens (`last_seen_at` older than 30 days).
- Unified logging/metrics for notification delivery success rates.
- Foreground handlers to navigate users directly to relevant screens.
