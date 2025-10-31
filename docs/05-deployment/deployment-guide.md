# MaidConnect Deployment Guide

## Prerequisites

Before deploying to Vercel, ensure you have:

1. ✅ A [Vercel account](https://vercel.com/signup) (free tier works)
2. ✅ A [Supabase project](https://supabase.com) with your database set up
3. ✅ A [Stripe account](https://stripe.com) with API keys
4. ✅ A [Resend account](https://resend.com) with API key
5. ✅ Your repository pushed to GitHub/GitLab/Bitbucket

---

## Step 1: Prepare Environment Variables

You'll need the following environment variables. Keep them handy:

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (⚠️ Keep secret!)

**Where to find:** Supabase Dashboard → Project Settings → API

### Stripe
- `STRIPE_SECRET_KEY` - Your Stripe secret key (⚠️ Keep secret!)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook signing secret (we'll create this later)

**Where to find:** Stripe Dashboard → Developers → API Keys

### Resend
- `RESEND_API_KEY` - Your Resend API key (⚠️ Keep secret!)

**Where to find:** Resend Dashboard → API Keys

### App Configuration
- `NEXT_PUBLIC_BASE_URL` - Your production URL (e.g., `https://maidconnect.vercel.app`)
- `CRON_SECRET` - A random secret string for securing cron endpoints

**Generate random secret:**
```bash
openssl rand -base64 32
```

---

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Vercel will auto-detect Next.js - no build configuration needed
4. Click **"Environment Variables"** and add all variables from Step 1
5. Click **"Deploy"**

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

During deployment, the CLI will prompt you to add environment variables. Add all from Step 1.

---

## Step 3: Configure Stripe Webhooks

After your first deployment, you need to set up Stripe webhooks:

1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Enter your webhook URL: `https://YOUR-VERCEL-URL.vercel.app/api/webhooks/stripe`
4. Select events to listen to:
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.canceled`
   - ✅ `payment_intent.payment_failed`
   - ✅ `charge.refunded`
5. Click **"Add endpoint"**
6. Copy the **"Signing secret"** (starts with `whsec_...`)
7. Go to your Vercel project → Settings → Environment Variables
8. Add/update `STRIPE_WEBHOOK_SECRET` with the signing secret
9. Redeploy your app (Vercel Dashboard → Deployments → ... → Redeploy)

---

## Step 4: Configure Resend Domain (Recommended)

By default, Resend sends emails from a shared domain. For production, you should:

1. Go to [Resend Dashboard → Domains](https://resend.com/domains)
2. Click **"Add Domain"**
3. Enter your domain (e.g., `maidconnect.co`)
4. Add the DNS records Resend provides to your domain registrar
5. Wait for verification (usually < 24 hours)
6. Update email templates in `src/lib/email/templates.ts` to use your domain:
   ```typescript
   const FROM_EMAIL = 'MaidConnect <notifications@yourdomain.com>';
   ```

**For now:** The default `onboarding@resend.dev` will work for testing.

---

## Step 5: Set Up Supabase Cron Job (Hourly Auto-Decline)

**Important:** Vercel Hobby accounts only support daily cron jobs. We use Supabase's free pg_cron to run hourly checks.

### 5a. Apply the Migration

```bash
# Push the cron migration to Supabase
supabase db push
```

Or via Supabase Dashboard:
1. Go to https://supabase.com/dashboard → Your Project → SQL Editor
2. Run the migration from `supabase/migrations/20250102144000_setup_auto_decline_cron.sql`

### 5b. Configure Cron Settings

After deploying to Vercel (Step 2), configure the cron job to call your API:

1. Go to https://supabase.com/dashboard → Your Project → **SQL Editor**
2. Run this SQL (replace with your actual values):

```sql
-- Set your Vercel URL and CRON_SECRET
UPDATE public.cron_config
SET
  api_url = 'https://your-vercel-url.vercel.app',
  cron_secret = 'your-generated-cron-secret',
  updated_at = now()
WHERE id = 1;
```

### 5c. Verify It's Working

```sql
-- Check if cron job is scheduled
SELECT * FROM cron.job WHERE jobname = 'auto-decline-expired-bookings';

-- Manually test the cron
SELECT public.trigger_auto_decline_cron();
```

**For detailed setup and troubleshooting**, see [SUPABASE_CRON_SETUP.md](./SUPABASE_CRON_SETUP.md)

### 5d. Verify Vercel Fallback Cron (Daily)

Vercel also runs a daily cron as a backup/fallback:

1. Go to Vercel Dashboard → Your Project → Settings → Cron Jobs
2. You should see:
   - **Path:** `/api/cron/auto-decline-bookings`
   - **Schedule:** `0 0 * * *` (runs once daily at midnight UTC)

---

## Step 6: Update Database for Production

If your Supabase project is in a different environment, make sure all migrations are applied:

```bash
# Check migration status
supabase db remote ls

# Apply any pending migrations
supabase db push
```

---

## Step 7: Post-Deployment Checklist

After deployment, verify these features work:

### Authentication
- [ ] Sign up as a customer
- [ ] Sign up as a professional
- [ ] Sign out and sign back in

### Professional Flow
- [ ] Complete professional onboarding
- [ ] Upload documents
- [ ] View dashboard

### Customer Flow
- [ ] Browse professionals directory
- [ ] Create a booking
- [ ] Add payment method
- [ ] Authorize payment

### Email Notifications
- [ ] Professional receives "New Booking Request" email
- [ ] Check spam folder if not received

### Booking Management
- [ ] Professional can accept booking
- [ ] Customer receives "Booking Confirmed" email
- [ ] Professional can decline booking
- [ ] Customer receives "Booking Declined" email

### Cron Jobs (wait 24+ hours)
- [ ] Bookings auto-decline after 24 hours if not accepted
- [ ] Customer receives decline email

---

## Troubleshooting

### Environment Variables Not Working

Vercel requires a redeploy after adding/updating environment variables:
1. Go to Deployments → ... → Redeploy
2. Select "Use existing Build Cache" (faster)

### Emails Not Sending

1. Check Resend dashboard for logs
2. Verify `RESEND_API_KEY` is set correctly
3. Check if emails are in spam folder
4. For production, verify your domain in Resend

### Cron Jobs Not Running

1. Verify `vercel.json` exists in your repository root
2. Check Vercel Dashboard → Settings → Cron Jobs
3. Ensure `CRON_SECRET` matches in both Vercel env vars and local testing

### Stripe Webhook Errors

1. Check Stripe Dashboard → Developers → Webhooks → Events
2. Look for failed webhook events
3. Verify `STRIPE_WEBHOOK_SECRET` matches the one in Stripe
4. Test webhook endpoint manually:
   ```bash
   stripe trigger payment_intent.succeeded
   ```

### Database Connection Issues

1. Verify Supabase project is not paused (free tier pauses after inactivity)
2. Check Supabase connection pooler settings
3. Verify `SUPABASE_SERVICE_ROLE_KEY` is correct

---

## Vercel-Specific Configuration

### Build Configuration

Vercel auto-detects Next.js. If you need custom settings:

**Build Command:** `npm run build` (default)
**Output Directory:** `.next` (default)
**Install Command:** `npm install` (default)

### Edge Runtime

Many of our API routes use Edge Runtime for better performance:
```typescript
export const runtime = "edge";
```

This is already configured - no action needed.

### Environment Variable Scopes

When adding environment variables in Vercel:
- **Production:** Used in production deployments
- **Preview:** Used in preview deployments (PR previews)
- **Development:** Used in `vercel dev` command

For secrets, **only** check Production. For public keys like `NEXT_PUBLIC_*`, check all three.

---

## Monitoring & Analytics

### Vercel Analytics (Free)

1. Go to Vercel Dashboard → Your Project → Analytics
2. Click **"Enable"**
3. Vercel will automatically track:
   - Page views
   - Web Vitals (Core Web Vitals)
   - Real User Monitoring

### Log Monitoring

View real-time logs:
1. Vercel Dashboard → Your Project → Deployments
2. Click on a deployment → Functions
3. Click on a function to see invocation logs

**Tip:** Use `console.log()` in your API routes - they appear here.

---

## Security Best Practices

✅ **Already implemented:**
- Row-Level Security (RLS) on all Supabase tables
- Stripe webhook signature verification
- Role-based access control via middleware
- Cron endpoint authentication via `CRON_SECRET`

⚠️ **Recommended additions:**
- Set up [Vercel Firewall](https://vercel.com/docs/security/vercel-firewall) (Pro plan)
- Enable [Attack Challenge Mode](https://vercel.com/docs/security/attack-challenge-mode) (Pro plan)
- Add rate limiting to public API endpoints (future enhancement)

---

## Cost Considerations

### Free Tier Limits

**Vercel (Hobby):**
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Serverless function executions: 100,000/month
- ✅ Cron jobs: 1 job

**Supabase (Free):**
- ✅ 500MB database
- ✅ 1GB file storage
- ✅ 2GB bandwidth/month
- ⚠️ Pauses after 7 days inactivity

**Stripe:**
- ✅ No monthly fees
- ⚠️ 2.9% + 30¢ per successful charge

**Resend (Free):**
- ✅ 3,000 emails/month
- ✅ 100 emails/day
- ⚠️ Upgrade needed for custom domain

### When to Upgrade

Consider upgrading when you reach:
- **Vercel Pro ($20/mo):** 1TB bandwidth, team collaboration, faster builds
- **Supabase Pro ($25/mo):** 8GB database, no pause, daily backups
- **Resend Pro ($20/mo):** 50,000 emails/month, custom domains, better deliverability

---

## Next Steps After Deployment

1. ✅ Test all user flows end-to-end
2. ✅ Set up monitoring/alerting for errors
3. ✅ Configure Resend custom domain
4. ⏭️ Implement Sprint 2 features (check-in/check-out, service completion)
5. ⏭️ Add customer cancellation/rescheduling functionality
6. ⏭️ Build admin panel for professional vetting
7. ⏭️ Add in-app messaging (Sprint 3)

---

## Support

If you encounter issues during deployment:

1. Check Vercel deployment logs
2. Review Supabase database logs
3. Check Stripe webhook event logs
4. Review this guide's Troubleshooting section

**Helpful Resources:**
- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)

---

**Last Updated:** Sprint 1 Completion
**Version:** 1.0.0
