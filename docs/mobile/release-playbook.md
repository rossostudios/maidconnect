# Mobile Release Playbook

Use this guide to plan, build, and ship MaidConnect mobile releases with Expo Application Services (EAS).

## 1. Pre-flight Checklist

- [ ] All critical bugs on the release board resolved.
- [ ] Lint and typecheck pass (`npm run lint`, `npm run typecheck`).
- [ ] Manual regression verified on target devices (iOS + Android) for:
  - Authentication flows
  - Professionals list (load, pull-to-refresh, metrics)
  - Bookings tab (status counts, detail cards, refresh)
  - Account tab (push toggles, notification preferences)
- [ ] Supabase migrations deployed (see `/supabase/migrations`).
- [ ] Changelog updated (`docs/changelog-feedback-system.md` or relevant doc).

## 2. Configure Build Profiles

`mobile/eas.json` defines three build profiles:

| Profile | Purpose | Command |
| --- | --- | --- |
| `development` | Expo dev client for rapid QA. | `eas build --profile development --platform all` |
| `preview` | Internal distribution (TestFlight / Play internal testing). | `eas build --profile preview --platform all` |
| `production` | Store-ready release binaries. | `eas build --profile production --platform all` |

Ensure the project is linked (`eas init`) and the Expo account is authenticated (`eas login`).

## 3. Credentials

Run once per project (or when rotating credentials):

```bash
eas credentials --platform ios
eas credentials --platform android
```

Provide:

- Apple Developer Team ID, App Store Connect API key (P8) and issuer.
- Android keystore (JKS), alias, and secure passwords.

Store outputs in the shared credential vault—**do not** commit them.

## 4. Start a Build

Example preview build:

```bash
eas build --profile preview --platform all
```

Track progress in the Expo dashboard. When complete:

- iOS: download `.ipa` or distribute via TestFlight.
- Android: use `.apk` for testers or `.aab` for Play Console.

## 5. Submit to Stores

After validating the production build:

```bash
eas submit --profile production --platform ios
eas submit --profile production --platform android
```

Ensure App Store screenshots, descriptions, and version metadata are ready. For Google Play, update release notes and review Play Console pre-launch reports.

## 6. Post-Release

- Monitor Supabase logs, Expo push delivery metrics, and crash analytics (coming soon).
- Update `docs/changelog-feedback-system.md` with release highlights.
- Create a retro ticket capturing support feedback and follow-up tasks.

## Helpful References

- Expo build docs: https://docs.expo.dev/build/introduction/
- Expo notifications guide: https://docs.expo.dev/push-notifications/overview/
- Supabase client docs: https://supabase.com/docs
