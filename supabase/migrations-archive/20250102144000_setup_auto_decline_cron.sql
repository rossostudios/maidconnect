begin;

-- Enable pg_cron extension for scheduled jobs
create extension if not exists pg_cron with schema extensions;

-- Enable pg_net extension for HTTP requests
create extension if not exists pg_net with schema extensions;

-- Grant necessary permissions
grant usage on schema extensions to postgres, anon, authenticated, service_role;

-- Create a function that calls our API endpoint to auto-decline expired bookings
-- This function will make an HTTP request to our Vercel API endpoint
create or replace function public.trigger_auto_decline_cron()
returns void
language plpgsql
security definer
as $$
declare
  api_url text;
  cron_secret text;
  request_id bigint;
begin
  -- Get API URL and CRON_SECRET from Supabase vault or use environment
  -- You'll need to set these in Supabase dashboard after deployment
  api_url := current_setting('app.api_url', true);
  cron_secret := current_setting('app.cron_secret', true);

  -- If not set, skip execution (will be configured after deployment)
  if api_url is null or cron_secret is null then
    raise notice 'API URL or CRON_SECRET not configured. Skipping auto-decline.';
    return;
  end if;

  -- Make HTTP GET request to our API endpoint
  -- The API endpoint handles Stripe cancellations and email notifications
  select net.http_get(
    url := api_url || '/api/cron/auto-decline-bookings',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || cron_secret,
      'Content-Type', 'application/json'
    )
  ) into request_id;

  raise notice 'Auto-decline cron triggered. Request ID: %', request_id;
end;
$$;

-- Schedule the function to run every hour at minute 0
-- Note: Supabase pg_cron runs in UTC timezone
select cron.schedule(
  'auto-decline-expired-bookings',  -- job name
  '0 * * * *',                       -- every hour at minute 0 (UTC)
  $$select public.trigger_auto_decline_cron()$$
);

commit;
