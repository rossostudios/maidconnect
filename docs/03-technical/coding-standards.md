# Coding Standards

Concise coding conventions to keep the codebase consistent and maintainable.

## TypeScript
- Strict mode enabled; prefer explicit types on public surfaces.
- Use `zod` for input validation at boundaries.
- Avoid `any` and broad `unknown`—narrow via refinement.

## React & Next.js
- Use React Server Components by default; add `"use client"` only when needed.
- Co-locate UI state and side-effects in client components; keep logic small and focused.
- Prefer composition and hooks over prop drilling; reuse shared hooks in `src/hooks/`.
- Pages and routes live under `src/app` (App Router); avoid legacy Pages Router patterns.

## Tailwind & Styling
- Tailwind-first; avoid custom CSS variables unless necessary.
- Use `flex/grid` with `gap-*`; avoid `space-y-*` where layout grouping is clearer.
- Follow spacing patterns documented in the design system.

## API & Errors
- Use middleware helpers from `@/lib/api` (`withAuth`, `withProfessional`, `ok`, `created`).
- Throw typed errors (`AuthenticationError`, `UnauthorizedError`, etc.); middleware formats responses.
- Use `useApiMutation` on the client for safe mutations with loading/error states.

## Supabase
- Create clients from helpers only: server (`createSupabaseServerClient`) and client (`createSupabaseBrowserClient`).
- Never expose service role keys to the client.
- Keep RLS policies enforced and validated in tests where applicable.

## i18n
- Use `next-intl`; store strings in `messages/*.json` and prefer keys over literals in components.
- Ensure new features supply both English and Spanish strings.

## Utilities
- Use centralized formatting utilities from `src/lib/utils/formatting` (currency, date, phone).
- Keep utils pure and tested; avoid side effects.

