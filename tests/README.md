# Testing guide

All automated tests live inside the `tests` directory so they stay clustered away from application code and build outputs.

```
tests/
├── jest/
│   ├── integration/            # API route contract and business logic sketches
│   └── unit/                   # Subscription, currency, and formatting helpers
└── playwright/
    ├── e2e/                    # Playwright end-to-end specs
    │   ├── accessibility.spec.ts
    │   ├── authentication.spec.ts
    │   ├── booking-flow.spec.ts
    │   ├── homepage.spec.ts
    │   └── professional-onboarding.spec.ts
    └── utils/
        └── test-helpers.ts     # Shared page helpers and auth helpers
```

## Playwright end-to-end suite

- Tests are configured through `playwright.config.ts` (`testDir` now points to `./tests/playwright/e2e`).
- Spec files share helpers for navigation, auth, and reusable assertions (`tests/playwright/utils/test-helpers.ts`).
- Artifacts land under the ignored `test-results/` and `playwright-report/` folders at the repository root.

### Run Playwright tests

The `test` script (run via `bun run test` or `npm test`) is a thin wrapper around `bun playwright test`. Add Playwright-specific flags after `--`.

```bash
# Run headless (default)
bun run test

# Switch to the interactive UI, headed mode, or pinned browser
bun run test -- --ui
bun run test -- --headed
bun run test -- --project=chromium

# Debug mode and trace inspection
bun run test -- --debug
bun run playwright show-trace test-results/*.zip
```

Browser support covers Chromium, Firefox, Mobile Chrome, and Mobile Safari with retries enabled on CI.

## Jest placeholders & sketch docs

`tests/jest/unit` and `tests/jest/integration` document the expected behavior around subscription pricing, API contracts, referrals, Stripe flows, and professional management. These rely on `@jest/globals` and remain lightweight so we can add a hosted Jest/Vitest runner before making them actionable.

## Coverage focus (high-value flows)

1. **Payment & Stripe flows** – success cards, 3D Secure, declines, intent lifecycle, referral credits.
2. **Booking lifecycle** – search filters, profile viewing, booking creation/management, reschedules, recurring discounts.
3. **Professional onboarding** – signup, document uploads, dashboard gating, permissions.
4. **Authentication & auth guards** – signup/login validation, user tier selection, protected routes, sessions.
5. **Business logic** – subscription pricing/discounts, referral generation, localization helpers.

## Test artifacts

- `test-results/` stores Playwright traces, videos, and result summaries.
- `playwright-report/` hosts the HTML report created by `bun run test:report`.
- These folders stay at the repository root so CI tooling can keep working without path hacks.

## Maintenance notes

1. Favor accessible selectors (`role`, `label`, `text`) over brittle DOM paths; fall back to `data-testid` only when necessary.
2. Keep tests focused on user journeys instead of implementation details.
3. Reuse helpers from `tests/playwright/utils/test-helpers.ts` for navigation, login, and toast capture.
4. When expanding Jest coverage, mock Supabase, Stripe, and other network dependencies before wiring real handlers.
5. Keep `storybook-static/` and `.storybook/` at the repository root because Storybook tooling expects those paths.
