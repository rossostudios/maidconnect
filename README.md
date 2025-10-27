# Maidconnect

A concierge-style marketplace that connects foreigners living in or relocating to Colombia with trusted domestic service professionals. Built with Next.js (App Router) and Tailwind CSS inspired by premium SaaS landing pages.

## Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

The site is available at [http://localhost:3000](http://localhost:3000).

### Available scripts

- `npm run dev` – start the local dev server.
- `npm run build` – create a production build.
- `npm run start` – run the production build locally.
- `npm run lint` – run ESLint with the project configuration.

## Project highlights

- Hero, services, process, testimonials, and concierge CTA sections tailored to Maidconnect.
- Soft gradient backgrounds and frosted glass surfaces implemented purely with Tailwind CSS.
- Metadata configured for search engines and social previews.
- Iconography powered by `lucide-react`.

## Tech stack

- [Next.js](https://nextjs.org/) App Router
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [lucide-react](https://lucide.dev/) for clean icons
- [Supabase](https://supabase.com/) for database and auth integration

## Environment variables

Copy `.env.example` to `.env.local` and provide your Supabase project credentials:

```
cp .env.example .env.local
```

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (`https://*.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon API key |
| `SUPABASE_SERVICE_ROLE_KEY` | (optional) service role key for secure server actions |

> Never commit real keys to source control. The provided sample values are placeholders only.
