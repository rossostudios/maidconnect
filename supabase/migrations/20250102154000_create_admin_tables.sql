-- Admin panel tables for vetting, moderation, and audit logs

begin;

-- Admin audit logs - track all administrative actions
create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id) on delete cascade,
  action_type text not null check (action_type in (
    'approve_professional',
    'reject_professional',
    'suspend_user',
    'unsuspend_user',
    'ban_user',
    'verify_document',
    'reject_document',
    'resolve_dispute',
    'update_professional_status',
    'manual_payout',
    'other'
  )),
  target_user_id uuid references public.profiles(id) on delete set null,
  target_resource_type text, -- 'booking', 'document', 'dispute', 'payout', etc.
  target_resource_id uuid,
  details jsonb, -- Flexible field for action-specific data
  notes text, -- Admin notes about the action
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_admin_audit_logs_admin_id on public.admin_audit_logs(admin_id);
create index if not exists idx_admin_audit_logs_target_user_id on public.admin_audit_logs(target_user_id);
create index if not exists idx_admin_audit_logs_action_type on public.admin_audit_logs(action_type);
create index if not exists idx_admin_audit_logs_created_at on public.admin_audit_logs(created_at desc);

-- User suspensions - track suspended/banned users
create table if not exists public.user_suspensions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  suspended_by uuid not null references public.profiles(id) on delete cascade,
  suspension_type text not null check (suspension_type in ('temporary', 'permanent', 'ban')),
  reason text not null,
  details jsonb, -- Additional context
  suspended_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz, -- null for permanent bans
  lifted_at timestamptz, -- When suspension was lifted (if applicable)
  lifted_by uuid references public.profiles(id) on delete set null,
  lift_reason text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_user_suspensions_user_id on public.user_suspensions(user_id);
create index if not exists idx_user_suspensions_suspended_by on public.user_suspensions(suspended_by);
-- Index for active suspensions (not yet lifted)
create index if not exists idx_user_suspensions_active on public.user_suspensions(user_id, expires_at)
  where lifted_at is null;

-- Admin professional reviews - track vetting process
-- Note: professional_reviews table already exists for customer reviews
create table if not exists public.admin_professional_reviews (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professional_profiles(profile_id) on delete cascade,
  reviewed_by uuid not null references public.profiles(id) on delete cascade,
  review_type text not null check (review_type in ('application', 'document', 'background_check', 'periodic')),
  status text not null check (status in ('pending', 'approved', 'rejected', 'needs_info')),

  -- Review details
  documents_verified boolean default false,
  background_check_passed boolean,
  references_verified boolean,
  interview_completed boolean,

  -- Admin notes
  notes text,
  internal_notes text, -- Not visible to professional
  rejection_reason text, -- If rejected

  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  reviewed_at timestamptz
);

create index if not exists idx_admin_professional_reviews_professional_id on public.admin_professional_reviews(professional_id);
create index if not exists idx_admin_professional_reviews_reviewed_by on public.admin_professional_reviews(reviewed_by);
create index if not exists idx_admin_professional_reviews_status on public.admin_professional_reviews(status);

-- Disputes - customer/professional dispute resolution
create table if not exists public.disputes (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  opened_by uuid not null references public.profiles(id) on delete cascade,
  opened_by_role text not null check (opened_by_role in ('customer', 'professional')),

  dispute_type text not null check (dispute_type in (
    'service_quality',
    'payment',
    'cancellation',
    'no_show',
    'damage',
    'safety',
    'other'
  )),

  status text not null default 'open' check (status in ('open', 'investigating', 'resolved', 'closed')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),

  -- Details
  description text not null,
  customer_statement text,
  professional_statement text,
  evidence_urls text[], -- Links to uploaded evidence

  -- Resolution
  assigned_to uuid references public.profiles(id) on delete set null, -- Admin handling the dispute
  resolution_notes text,
  resolution_action text, -- 'refund_customer', 'pay_professional', 'partial_refund', 'no_action', etc.
  refund_amount integer, -- If refund issued
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id) on delete set null,

  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_disputes_booking_id on public.disputes(booking_id);
create index if not exists idx_disputes_opened_by on public.disputes(opened_by);
create index if not exists idx_disputes_status on public.disputes(status);
create index if not exists idx_disputes_assigned_to on public.disputes(assigned_to);

-- Updated_at trigger functions
create or replace function public.set_user_suspensions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.set_admin_professional_reviews_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.set_disputes_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- Create triggers
drop trigger if exists user_suspensions_set_updated_at on public.user_suspensions;
create trigger user_suspensions_set_updated_at
  before update on public.user_suspensions
  for each row
  execute procedure public.set_user_suspensions_updated_at();

drop trigger if exists admin_professional_reviews_set_updated_at on public.admin_professional_reviews;
create trigger admin_professional_reviews_set_updated_at
  before update on public.admin_professional_reviews
  for each row
  execute procedure public.set_admin_professional_reviews_updated_at();

drop trigger if exists disputes_set_updated_at on public.disputes;
create trigger disputes_set_updated_at
  before update on public.disputes
  for each row
  execute procedure public.set_disputes_updated_at();

-- RLS Policies
alter table public.admin_audit_logs enable row level security;
alter table public.user_suspensions enable row level security;
alter table public.admin_professional_reviews enable row level security;
alter table public.disputes enable row level security;

-- Admin audit logs - only admins can view
create policy "Admins can view all audit logs"
  on public.admin_audit_logs
  for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admins can insert audit logs
create policy "Admins can insert audit logs"
  on public.admin_audit_logs
  for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- User suspensions - admins can manage, users can view their own
create policy "Admins can view all suspensions"
  on public.user_suspensions
  for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Users can view their own suspensions"
  on public.user_suspensions
  for select
  using (user_id = auth.uid());

create policy "Admins can manage suspensions"
  on public.user_suspensions
  for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admin professional reviews - admins can manage, professionals can view their own
create policy "Admins can view all admin reviews"
  on public.admin_professional_reviews
  for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Professionals can view their own admin reviews"
  on public.admin_professional_reviews
  for select
  using (professional_id = auth.uid());

create policy "Admins can manage admin reviews"
  on public.admin_professional_reviews
  for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Disputes - customers/professionals can view their disputes, admins can view all
create policy "Admins can view all disputes"
  on public.disputes
  for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Users can view disputes they opened"
  on public.disputes
  for select
  using (opened_by = auth.uid());

create policy "Users can view disputes for their bookings"
  on public.disputes
  for select
  using (
    exists (
      select 1 from public.bookings
      where bookings.id = disputes.booking_id
      and (bookings.customer_id = auth.uid() or bookings.professional_id = auth.uid())
    )
  );

create policy "Users can create disputes for their bookings"
  on public.disputes
  for insert
  with check (
    exists (
      select 1 from public.bookings
      where bookings.id = booking_id
      and (bookings.customer_id = auth.uid() or bookings.professional_id = auth.uid())
    )
  );

create policy "Admins can manage all disputes"
  on public.disputes
  for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Comments
comment on table public.admin_audit_logs is 'Audit trail of all administrative actions';
comment on table public.user_suspensions is 'Track user suspensions and bans';
comment on table public.admin_professional_reviews is 'Track professional vetting and review process (admin reviews, not customer reviews)';
comment on table public.disputes is 'Customer/professional dispute resolution system';

commit;
