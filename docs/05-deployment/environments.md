# Environments

Short reference for local, preview, and production environments.

## Local (Development)
- URL: `http://localhost:3000`
- Env file: `.env.local` (preferred) or `.env`
- Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, Stripe keys
- Optional: Logtail, Upstash, VAPID, Anthropic, Google Translate

## Preview (Vercel)
- PRs deploy to preview automatically (Vercel)
- Uses Vercel environment variables and secrets per project/branch
- Treat as staging; data may be ephemeral

## Production
- Deployed on Vercel; Supabase hosts Postgres/Auth
- Set environment variables via Vercel; rotate secrets regularly
- Monitor via Better Stack; incident process in `../06-operations/incident-response.md`

## Domains & Links
- App base URL: set `NEXT_PUBLIC_BASE_URL` and `NEXT_PUBLIC_APP_URL`
- Site URL for email templates: `SITE_URL`

