begin;

-- Drop the old cron job first
select cron.unschedule('auto-decline-expired-bookings');

-- Create a table to store cron configuration (since we can't use ALTER DATABASE)
create table if not exists public.cron_config (
  id integer primary key default 1,
  api_url text,
  cron_secret text,
  updated_at timestamptz default now(),
  constraint single_row check (id = 1)
);

-- Enable RLS
alter table public.cron_config enable row level security;

-- Only allow service role to read this table (it contains secrets)
create policy "Only service role can read cron config"
on public.cron_config
for select
using (auth.jwt() ->> 'role' = 'service_role');

-- Only allow service role to update this table
create policy "Only service role can update cron config"
on public.cron_config
for all
using (auth.jwt() ->> 'role' = 'service_role');

-- Insert a placeholder row (to be updated after deployment)
insert into public.cron_config (id, api_url, cron_secret)
values (1, null, null)
on conflict (id) do nothing;

-- Update the trigger function to read from the table
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
  -- Get API URL and CRON_SECRET from config table
  select
    c.api_url,
    c.cron_secret
  into api_url, cron_secret
  from public.cron_config c
  where c.id = 1;

  -- If not set, skip execution (will be configured after deployment)
  if api_url is null or cron_secret is null then
    raise notice 'API URL or CRON_SECRET not configured in cron_config table. Skipping auto-decline.';
    return;
  end if;

  -- Make HTTP GET request to our API endpoint
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

-- Re-schedule the cron job
select cron.schedule(
  'auto-decline-expired-bookings',
  '0 * * * *',
  $$select public.trigger_auto_decline_cron()$$
);

commit;
