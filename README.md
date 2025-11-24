<div align="center">
  <img src="public/casaora-platform.png" alt="Casaora Platform" width="600" />

  # Casaora

  **Premium Home Services Marketplace for Latin America**

  [![Next.js 16](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
  [![React 19](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
  [![Tailwind CSS 4](https://img.shields.io/badge/Tailwind-4.1-38bdf8)](https://tailwindcss.com/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

  [Live Demo](https://casaora.com) · [Report Bug](https://github.com/casaora/casaora/issues) · [Request Feature](https://github.com/casaora/casaora/issues)

</div>

---

## About Casaora

Casaora is a **boutique marketplace** connecting families with verified, background-checked home service professionals across Latin America. We focus on quality over quantity—every professional on our platform undergoes comprehensive vetting including identity verification, background checks, and skills assessment.

### Our Mission

To dignify domestic work and make it simple, safe, and fair for families in Latin America to work with professional home helpers.

### Our Vision

A Latin America where every home professional has access to decent work, and every household can rely on trusted support at home.

### Core Values

- **Dignidad primero (Dignity First):** We treat every professional with the respect they deserve
- **Transparencia total (Total Transparency):** No hidden fees, clear pricing
- **Seguridad y confianza (Safety & Trust):** Rigorous vetting for peace of mind
- **Simplicidad radical (Radical Simplicity):** Booking help should be as easy as ordering a ride
- **Latam en el corazón (Latam at Heart):** Built for the unique needs of our region

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Verified Professionals** | Background checks, document verification, and skills assessment for every professional |
| **Professional Directory** | Browse by city, service type, rating, and availability |
| **Smart Booking** | One-time bookings or recurring weekly/biweekly plans |
| **Secure Payments** | Multi-currency support with Stripe and PayPal |
| **Real-time Messaging** | Secure chat with read receipts and typing indicators |
| **Reviews & Ratings** | Transparent feedback system with verified reviews |
| **Referral Program** | Earn credits by referring friends and professionals |
| **Multi-Country** | Localized for Colombia, Paraguay, Uruguay, Argentina |
| **Dispute Resolution** | Built-in dispute handling with admin mediation |

---

## Service Categories

- **Housekeeping & Cleaning** — Regular cleaning, deep cleaning, move-in/move-out
- **Childcare & Nanny** — Babysitting, full-time nanny, tutoring
- **Elder Care** — Companion care, medical assistance, mobility support
- **Pet Care** — Dog walking, pet sitting, grooming coordination
- **Relocation & Move-in** — Packing, unpacking, organization
- **Lifestyle & Personal** — Personal assistants, errand running

---

## Supported Markets

| Country | Cities | Currency | Payment |
|---------|--------|----------|---------|
| Colombia | Bogotá, Medellín, Cali, Barranquilla, Cartagena, Bucaramanga, Santa Marta | COP | Stripe |
| Paraguay | Asunción, Ciudad del Este, Encarnación | PYG | PayPal |
| Uruguay | Montevideo, Punta del Este, Maldonado | UYU | PayPal |
| Argentina | Buenos Aires, Mendoza, Córdoba, Rosario | ARS | PayPal |

---

## Built With

### Frontend
- **[Next.js 16](https://nextjs.org/)** — React framework with App Router & Turbopack
- **[React 19](https://react.dev/)** — UI library with React Server Components
- **[TypeScript 5.7](https://www.typescriptlang.org/)** — Type safety
- **[Tailwind CSS 4.1](https://tailwindcss.com/)** — Utility-first CSS
- **[React Aria](https://react-spectrum.adobe.com/react-aria/)** — Accessible UI primitives

### Backend & Database
- **[Supabase](https://supabase.com/)** — PostgreSQL, Auth, Storage, Realtime
- **[Bun](https://bun.sh/)** — JavaScript runtime & package manager

### Caching & Performance
- **Next.js `unstable_cache`** — Server-side data caching with tag-based invalidation
- **CDN Headers** — Vercel Edge caching with `stale-while-revalidate`
- **Upstash Redis** — Rate limiting

### Payments
- **[Stripe](https://stripe.com/)** — Primary processor (Colombia)
- **[PayPal](https://www.paypal.com/)** — Secondary processor (PY, UY, AR)

### Integrations
- **[PostHog](https://posthog.com/)** — Product analytics & feature flags
- **[Sanity CMS](https://sanity.io/)** — Blog, help center, roadmap content
- **[Resend](https://resend.com/)** — Transactional email
- **[Checkr](https://checkr.com/)** + **[Truora](https://truora.com/)** — Background checks
- **[Vercel](https://vercel.com/)** — Deployment & hosting

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) v1.0+
- [Docker](https://www.docker.com/) (for local Supabase)

### Installation

```bash
# Clone the repository
git clone https://github.com/casaora/casaora.git
cd casaora

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local

# Start local Supabase
supabase start

# Run development server
bun dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous key
- `STRIPE_SECRET_KEY` — Stripe API key
- `POSTHOG_KEY` — PostHog project key

See `.env.example` for the complete list.

---

## Project Structure

```
casaora/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── [locale]/           # Internationalized routes (en/es)
│   │   │   ├── dashboard/      # Customer & Pro dashboards
│   │   │   ├── admin/          # Admin dashboard
│   │   │   └── professionals/  # Professional directory
│   │   └── api/                # API routes (95+ endpoints)
│   ├── components/             # React components
│   │   └── ui/                 # Design system components
│   ├── lib/                    # Utilities & services
│   │   ├── services/           # Business logic layer
│   │   ├── repositories/       # Data access layer
│   │   └── integrations/       # External service clients
│   └── hooks/                  # Custom React hooks
├── supabase/
│   └── migrations/             # Database migrations
├── public/                     # Static assets
└── docs/                       # Documentation
```

---

## Development

### Available Scripts

```bash
# Development
bun dev                 # Start dev server with Turbopack
bun build              # Build for production

# Code Quality
bun run check          # Run Biome linter
bun run check:fix      # Auto-fix linting issues

# Database
supabase start         # Start local Supabase
supabase db push       # Push migrations
supabase db reset      # Reset database

# Testing
bun test               # Run Playwright E2E tests
```

---

## Roadmap

- [x] Multi-country expansion (CO, PY, UY, AR)
- [x] Recurring booking plans
- [x] Background check integration
- [x] Dispute resolution system
- [x] Referral program
- [x] Service add-ons & pricing
- [x] Product analytics (PostHog)
- [ ] Mobile app (iOS & Android)
- [ ] Additional Latin American markets
- [ ] Professional certification badges

See the [open issues](https://github.com/casaora/casaora/issues) for proposed features.

---

## Contributing

Contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- **Linting:** Biome (`bun run check:fix`)
- **TypeScript:** Strict mode enabled
- **Components:** Tailwind CSS only (no CSS-in-JS)

---

## Security

### Reporting Vulnerabilities

Please report security vulnerabilities to: **security@casaora.co**

Do not create public GitHub issues for security vulnerabilities.

### Security Measures

- XSS Prevention with DOMPurify sanitization
- Row Level Security (RLS) on all database tables
- Rate limiting with Upstash Redis
- Input validation with Zod schemas
- PCI compliant payments via Stripe
- Continuous security scanning with Snyk

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

## Contact

**Casaora Team** — [hello@casaora.com](mailto:hello@casaora.com)

- **Website:** [casaora.com](https://casaora.com)
- **Documentation:** [docs/](docs/)
- **Issues:** [GitHub Issues](https://github.com/casaora/casaora/issues)

---

<div align="center">

**Built with love for Latin American families**

[Back to Top](#casaora)

</div>
