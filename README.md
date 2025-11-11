# Casaora (MaidConnect)

Casaora is a concierge-style marketplace connecting foreigners in Colombia with trusted domestic service professionals. “MaidConnect” refers to this codebase and internal project name.

## Quick Start

```bash
# Install dependencies
bun install

# Run development server
bun run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Documentation

- Start here: `docs/00-start/documentation-index.md`
- Feature docs: `docs/04-features/`
- Help Center docs: `docs/04-features/help-center.md`

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS
- Supabase (Database & Auth)
- Stripe (Payments)

## Environment Setup

Copy `.env.example` to `.env.local` (recommended for Next.js) or `.env` and add your credentials:

```bash
cp .env.example .env.local
```

Minimum required to run locally:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

See `.env.example` for all optional integrations (Logtail, Upstash, VAPID, Amara, etc.) and `docs/05-deployment/deployment-guide.md` for production notes.

## Help Center

- User-facing route: `/{locale}/help`
- Developer guide: `docs/04-features/help-center.md`
