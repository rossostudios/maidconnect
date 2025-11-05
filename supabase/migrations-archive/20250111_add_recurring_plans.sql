-- Week 5-6: Recurring Plans System
-- Enables customers to schedule regular services with discounts

-- Create recurring_plans table
create table if not exists public.recurring_plans (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  professional_id uuid not null references public.profiles(id) on delete cascade,

  -- Service details
  service_name text not null,
  duration_minutes integer not null,

  -- Recurrence settings
  frequency text not null check (frequency in ('weekly', 'biweekly', 'monthly')),
  day_of_week integer not null check (day_of_week between 0 and 6), -- 0 = Sunday, 6 = Saturday
  preferred_time time not null,

  -- Pricing
  base_amount integer not null, -- Amount in cents before discount
  discount_percentage integer not null default 10 check (discount_percentage >= 0 and discount_percentage <= 30), -- 10-30% discount
  final_amount integer not null, -- Amount after discount in cents
  currency text not null default 'COP',

  -- Status management
  status text not null default 'active' check (status in ('active', 'paused', 'cancelled')),
  pause_start_date date, -- When pause begins (null if not paused)
  pause_end_date date, -- When pause ends (null if not paused)

  -- Metadata
  created_at timestamp with time zone not null default timezone('utc', now()),
  updated_at timestamp with time zone not null default timezone('utc', now()),
  next_booking_date date not null, -- Next scheduled booking
  total_bookings_completed integer not null default 0,

  -- Constraints
  constraint valid_pause_dates check (
    (pause_start_date is null and pause_end_date is null) or
    (pause_start_date is not null and pause_end_date is not null and pause_end_date >= pause_start_date)
  )
);

-- Create index for efficient lookups
create index if not exists recurring_plans_customer_id_idx on public.recurring_plans(customer_id);
create index if not exists recurring_plans_professional_id_idx on public.recurring_plans(professional_id);
create index if not exists recurring_plans_next_booking_date_idx on public.recurring_plans(next_booking_date) where status = 'active';

-- Create recurring_plan_holidays table for skipping specific dates
create table if not exists public.recurring_plan_holidays (
  id uuid primary key default gen_random_uuid(),
  recurring_plan_id uuid not null references public.recurring_plans(id) on delete cascade,
  skip_date date not null,
  reason text, -- Optional reason for skipping
  created_at timestamp with time zone not null default timezone('utc', now()),

  -- Prevent duplicate skip dates for same plan
  unique(recurring_plan_id, skip_date)
);

-- Create index for efficient lookups
create index if not exists recurring_plan_holidays_plan_id_idx on public.recurring_plan_holidays(recurring_plan_id);

-- Enable Row Level Security
alter table public.recurring_plans enable row level security;
alter table public.recurring_plan_holidays enable row level security;

-- RLS Policies for recurring_plans

-- Customers can view their own plans
create policy "Customers can view own recurring plans"
on public.recurring_plans
for select
using (auth.uid() = customer_id);

-- Professionals can view plans assigned to them
create policy "Professionals can view assigned recurring plans"
on public.recurring_plans
for select
using (auth.uid() = professional_id);

-- Customers can create recurring plans
create policy "Customers can create recurring plans"
on public.recurring_plans
for insert
with check (auth.uid() = customer_id);

-- Customers can update their own plans (pause, cancel, modify)
create policy "Customers can update own recurring plans"
on public.recurring_plans
for update
using (auth.uid() = customer_id);

-- Admins can view all plans
create policy "Admins can view all recurring plans"
on public.recurring_plans
for select
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

-- RLS Policies for recurring_plan_holidays

-- Customers can view holidays for their plans
create policy "Customers can view holidays for own plans"
on public.recurring_plan_holidays
for select
using (
  exists (
    select 1 from public.recurring_plans
    where id = recurring_plan_id and customer_id = auth.uid()
  )
);

-- Customers can add holidays to their plans
create policy "Customers can add holidays to own plans"
on public.recurring_plan_holidays
for insert
with check (
  exists (
    select 1 from public.recurring_plans
    where id = recurring_plan_id and customer_id = auth.uid()
  )
);

-- Customers can remove holidays from their plans
create policy "Customers can remove holidays from own plans"
on public.recurring_plan_holidays
for delete
using (
  exists (
    select 1 from public.recurring_plans
    where id = recurring_plan_id and customer_id = auth.uid()
  )
);

-- Function to calculate next booking date
create or replace function calculate_next_booking_date(
  current_date date,
  frequency_type text,
  day_of_week integer
) returns date
language plpgsql
as $$
declare
  next_date date;
  days_until_target integer;
begin
  -- Calculate days until target day of week
  days_until_target := (day_of_week - extract(dow from current_date)::integer + 7) % 7;

  -- If days_until_target is 0, move to next occurrence
  if days_until_target = 0 then
    days_until_target := case
      when frequency_type = 'weekly' then 7
      when frequency_type = 'biweekly' then 14
      when frequency_type = 'monthly' then 28 -- Approximate monthly as 4 weeks
      else 7
    end;
  else
    -- Add frequency offset for first occurrence
    days_until_target := days_until_target + case
      when frequency_type = 'weekly' and days_until_target > 0 then 0
      when frequency_type = 'biweekly' then 7
      when frequency_type = 'monthly' then 21 -- Approximate
      else 0
    end;
  end if;

  next_date := current_date + days_until_target;

  return next_date;
end;
$$;

-- Trigger to update next_booking_date when plan is modified
create or replace function update_next_booking_date()
returns trigger
language plpgsql
as $$
begin
  -- Only update if frequency, day_of_week, or status changed
  if (TG_OP = 'INSERT') or
     (NEW.frequency != OLD.frequency) or
     (NEW.day_of_week != OLD.day_of_week) or
     (NEW.status != OLD.status and NEW.status = 'active') then

    NEW.next_booking_date := calculate_next_booking_date(
      current_date,
      NEW.frequency,
      NEW.day_of_week
    );
  end if;

  NEW.updated_at := timezone('utc', now());
  return NEW;
end;
$$;

create trigger update_recurring_plan_next_booking
before insert or update on public.recurring_plans
for each row
execute function update_next_booking_date();

-- Comments
comment on table public.recurring_plans is 'Week 5-6: Stores recurring service plans with discount pricing';
comment on table public.recurring_plan_holidays is 'Week 5-6: Tracks skipped dates for recurring plans (holidays, vacations)';
comment on column public.recurring_plans.discount_percentage is 'Discount for recurring plans (10-30%)';
comment on column public.recurring_plans.status is 'active: plan is running, paused: temporarily stopped, cancelled: permanently ended';
