# Supabase Cron Job Setup Guide

This guide will help you set up the hourly auto-decline cron job using Supabase's free pg_cron feature.

## Why Supabase Instead of Vercel?

- ✅ **Free**: Vercel Hobby only allows daily crons, Supabase allows hourly for free
- ✅ **Reliable**: Built into PostgreSQL, runs even if your app is down
- ✅ **Simple**: One-time setup, no ongoing maintenance

---

## Step 1: Apply the Migration

First, apply the migration that sets up the cron job:

```bash
# Make sure you're in your project directory
cd /Users/christopher/Desktop/maidconnect

# Push the migration to Supabase
supabase db push
```

Or if you prefer the Supabase dashboard:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to "SQL Editor"
4. Click "New Query"
5. Copy and paste the contents of `supabase/migrations/20250102144000_setup_auto_decline_cron.sql`
6. Click "Run"

---

## Step 2: Configure API URL and CRON_SECRET

After deploying to Vercel and getting your URL, you need to tell Supabase where to send the cron requests.

### Option A: Using Supabase Dashboard SQL Editor (Easiest)

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor**
4. Click **"New Query"**
5. Run this SQL:

```sql
-- Replace these with your actual values
ALTER DATABASE postgres SET app.api_url = 'https://your-vercel-url.vercel.app';
ALTER DATABASE postgres SET app.cron_secret = 'your-generated-cron-secret';
```

**Important:**
- Replace `https://your-vercel-url.vercel.app` with your actual Vercel deployment URL
- Replace `your-generated-cron-secret` with the secret you generated using `openssl rand -base64 32`

### Option B: Using Supabase CLI

```bash
# Connect to your database
supabase db remote connect

# Then run the ALTER DATABASE commands from Option A
```

---

## Step 3: Verify the Cron Job is Scheduled

To verify the cron job is set up correctly:

```sql
-- Check if cron job is scheduled
SELECT * FROM cron.job;
```

You should see a job named `auto-decline-expired-bookings` with schedule `0 * * * *`.

---

## Step 4: Test the Cron Job (Optional)

To manually trigger the cron job and test it:

```sql
-- Manually run the auto-decline function
SELECT public.trigger_auto_decline_cron();
```

Check the output/logs. If you haven't configured `app.api_url` and `app.cron_secret` yet, you'll see:
```
NOTICE: API URL or CRON_SECRET not configured. Skipping auto-decline.
```

After configuring them, you should see:
```
NOTICE: Auto-decline cron triggered. Request ID: <some_number>
```

---

## Step 5: Monitor Cron Job Execution

### View Cron Job History

```sql
-- See recent cron job runs
SELECT
  jobid,
  runid,
  job_pid,
  database,
  username,
  command,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'auto-decline-expired-bookings')
ORDER BY start_time DESC
LIMIT 10;
```

### Check HTTP Request Logs (pg_net)

```sql
-- See recent HTTP requests made by the cron job
SELECT
  id,
  created,
  url,
  status_code,
  content::text as response
FROM net._http_response
ORDER BY created DESC
LIMIT 10;
```

---

## Troubleshooting

### Cron job not running?

**Check if pg_cron is enabled:**
```sql
SELECT * FROM pg_extension WHERE extname = 'pg_cron';
```

**Check if the job is scheduled:**
```sql
SELECT * FROM cron.job WHERE jobname = 'auto-decline-expired-bookings';
```

**Check job run history:**
```sql
SELECT * FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 5;
```

### Configuration not found?

**Verify your settings:**
```sql
SHOW app.api_url;
SHOW app.cron_secret;
```

If they show empty, rerun the `ALTER DATABASE` commands from Step 2.

### HTTP requests failing?

**Check pg_net is enabled:**
```sql
SELECT * FROM pg_extension WHERE extname = 'pg_net';
```

**Check HTTP response logs:**
```sql
SELECT * FROM net._http_response ORDER BY created DESC LIMIT 5;
```

Common issues:
- Wrong API URL (make sure it includes `https://`)
- Wrong CRON_SECRET (make sure it matches your Vercel env var)
- Vercel endpoint not deployed yet

---

## Updating Configuration

If you need to change your API URL or CRON_SECRET later:

```sql
-- Update API URL
ALTER DATABASE postgres SET app.api_url = 'https://new-url.vercel.app';

-- Update CRON_SECRET
ALTER DATABASE postgres SET app.cron_secret = 'new-secret-here';
```

---

## Unscheduling the Cron Job (if needed)

To temporarily stop the cron job:

```sql
-- Unschedule the job
SELECT cron.unschedule('auto-decline-expired-bookings');

-- To re-enable it later
SELECT cron.schedule(
  'auto-decline-expired-bookings',
  '0 * * * *',
  $$SELECT public.trigger_auto_decline_cron()$$
);
```

---

## How It Works

1. **Every hour at minute 0** (e.g., 1:00, 2:00, 3:00 UTC), Supabase triggers the cron job
2. **The cron job** calls `public.trigger_auto_decline_cron()`
3. **The function** makes an HTTP GET request to your Vercel API endpoint: `https://your-app.vercel.app/api/cron/auto-decline-bookings`
4. **The API endpoint** finds expired bookings, cancels Stripe payments, updates the database, and sends emails
5. **Everything runs automatically** - no manual intervention needed!

---

## Timeline

- **Local Development**: Vercel cron doesn't run locally, but you can test the API endpoint manually
- **Production**:
  - Supabase cron: Runs **every hour** for free ✅
  - Vercel cron: Runs **once daily** at midnight UTC (backup/fallback)

---

## Cost

- ✅ **Supabase pg_cron**: FREE (included in free tier)
- ✅ **Vercel daily cron**: FREE (included in Hobby tier)
- ✅ **Total cost**: $0/month 🎉

---

## Next Steps

1. ✅ Apply the migration (Step 1)
2. ⏳ Deploy to Vercel (get your URL)
3. ⏳ Configure API URL and CRON_SECRET in Supabase (Step 2)
4. ✅ Test the cron job (Step 4)
5. ✅ Monitor execution (Step 5)

---

**Questions?** Check the troubleshooting section or refer to:
- [Supabase pg_cron docs](https://supabase.com/docs/guides/database/extensions/pg_cron)
- [Supabase pg_net docs](https://supabase.com/docs/guides/database/extensions/pg_net)
