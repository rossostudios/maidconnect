# Maidconnect

A concierge-style marketplace connecting foreigners in Colombia with trusted domestic service professionals.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Documentation

Full documentation: [docs/00-start/documentation-index.md](docs/00-start/documentation-index.md)

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS
- Supabase (Database & Auth)
- Stripe (Payments)

## Environment Setup

Copy `.env.example` to `.env.local` and add your credentials:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

See [docs/00-start/readme.md](docs/00-start/readme.md) for detailed setup.
