/**
 * Sprint 2: Recurring Plans System
 *
 * Enables customers to schedule regular services with discounts (5-15% off)
 * Supports weekly, biweekly, and monthly subscriptions
 */

-- ============================================
-- TABLES
-- ============================================

-- Create recurring_plans table
create table if not exists public.recurring_plans (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  professional_id uuid not null references public.profiles(id) on delete cascade,

  -- Service details
  service_name text not null,
  duration_minutes integer not null,
  address text not null,
  special_instructions text,

  -- Recurrence settings
  frequency text not null check (frequency in ('weekly', 'biweekly', 'monthly')),
  day_of_week integer check (day_of_week between 0 and 6), -- 0 = Sunday, 6 = Saturday (NULL for monthly)
  preferred_time time not null,

  -- Pricing
  base_amount integer not null, -- Amount in COP before discount
  discount_percentage integer not null default 10 check (discount_percentage >= 0 and discount_percentage <= 30), -- 5-15% discount
  final_amount integer not null, -- Amount after discount in COP
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
  ),
  constraint day_of_week_required_for_weekly check (
    (frequency = 'monthly') or (day_of_week is not null)
  )
);

-- Create index for efficient lookups
create index if not exists recurring_plans_customer_id_idx on public.recurring_plans(customer_id);
create index if not exists recurring_plans_professional_id_idx on public.recurring_plans(professional_id);
create index if not exists recurring_plans_next_booking_date_idx on public.recurring_plans(next_booking_date) where status = 'active';
create index if not exists recurring_plans_status_idx on public.recurring_plans(status);

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
create index if not exists recurring_plan_holidays_skip_date_idx on public.recurring_plan_holidays(skip_date);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

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

-- Customers can delete their own plans (soft delete via status=cancelled preferred)
create policy "Customers can delete own recurring plans"
on public.recurring_plans
for delete
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

-- Admins can manage all plans
create policy "Admins can manage all recurring plans"
on public.recurring_plans
for all
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

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to calculate next booking date
create or replace function calculate_next_booking_date(
  start_date date,
  frequency_type text,
  day_of_week integer
) returns date
language plpgsql
as $$
declare
  next_date date;
  days_until_target integer;
begin
  -- For monthly, just add 30 days
  if frequency_type = 'monthly' then
    return start_date + interval '30 days';
  end if;

  -- Calculate days until target day of week
  days_until_target := (day_of_week - extract(dow from start_date)::integer + 7) % 7;

  -- If days_until_target is 0, move to next occurrence
  if days_until_target = 0 then
    days_until_target := case
      when frequency_type = 'weekly' then 7
      when frequency_type = 'biweekly' then 14
      else 7
    end;
  end if;

  next_date := start_date + days_until_target;

  return next_date;
end;
$$;

-- Trigger function to update next_booking_date and updated_at
create or replace function update_recurring_plan_metadata()
returns trigger
language plpgsql
as $$
begin
  -- Update next_booking_date if frequency or day_of_week changed, or on insert
  if (TG_OP = 'INSERT') or
     (NEW.frequency != OLD.frequency) or
     (NEW.day_of_week is distinct from OLD.day_of_week) or
     (NEW.status != OLD.status and NEW.status = 'active') then

    NEW.next_booking_date := calculate_next_booking_date(
      current_date,
      NEW.frequency,
      NEW.day_of_week
    );
  end if;

  -- Always update updated_at
  NEW.updated_at := timezone('utc', now());

  return NEW;
end;
$$;

-- Attach trigger to recurring_plans table
create trigger update_recurring_plan_metadata_trigger
before insert or update on public.recurring_plans
for each row
execute function update_recurring_plan_metadata();

-- ============================================
-- COMMENTS
-- ============================================

comment on table public.recurring_plans is 'Sprint 2: Stores recurring service plans with discount pricing (5-15% off)';
comment on table public.recurring_plan_holidays is 'Sprint 2: Tracks skipped dates for recurring plans (holidays, vacations)';
comment on column public.recurring_plans.discount_percentage is 'Discount for recurring plans (5-15% based on frequency)';
comment on column public.recurring_plans.status is 'active: plan is running, paused: temporarily stopped, cancelled: permanently ended';
comment on column public.recurring_plans.frequency is 'weekly (15% off), biweekly (10% off), monthly (5% off)';
comment on column public.recurring_plans.day_of_week is '0=Sunday, 1=Monday, ..., 6=Saturday. NULL for monthly plans.';
