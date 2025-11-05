-- Sprint 4 Phase 1: Core UX Improvements
-- Adds: saved addresses, availability calendar, instant booking, service add-ons

begin;

-- ============================================================================
-- CUSTOMER SAVED ADDRESSES
-- ============================================================================

-- Add saved_addresses to customer_profiles
alter table public.customer_profiles
  add column if not exists saved_addresses jsonb default '[]'::jsonb;

-- Saved address structure:
-- [
--   {
--     "id": "uuid",
--     "label": "Home",
--     "is_default": true,
--     "street": "Calle 123 #45-67",
--     "neighborhood": "Chapinero",
--     "city": "Bogotá",
--     "postal_code": "110111",
--     "building_access": "Ring apartment 301",
--     "parking_info": "Visitor parking in basement",
--     "special_notes": "Gate code: 1234",
--     "created_at": "2025-01-02T12:00:00Z"
--   }
-- ]

comment on column public.customer_profiles.saved_addresses is 'Customer saved addresses for quick booking';

-- ============================================================================
-- PROFESSIONAL AVAILABILITY & INSTANT BOOKING
-- ============================================================================

-- Add availability and instant booking settings to professional_profiles
alter table public.professional_profiles
  add column if not exists instant_booking_enabled boolean default false,
  add column if not exists instant_booking_settings jsonb default '{}'::jsonb,
  add column if not exists availability_settings jsonb default '{}'::jsonb,
  add column if not exists blocked_dates jsonb default '[]'::jsonb;

-- Instant booking settings structure:
-- {
--   "min_notice_hours": 24,
--   "max_booking_duration_hours": 8,
--   "auto_accept_recurring": true,
--   "only_verified_customers": false
-- }

-- Availability settings structure:
-- {
--   "working_hours": {
--     "monday": [{"start": "09:00", "end": "17:00"}],
--     "tuesday": [{"start": "09:00", "end": "17:00"}],
--     "wednesday": [{"start": "09:00", "end": "17:00"}],
--     "thursday": [{"start": "09:00", "end": "17:00"}],
--     "friday": [{"start": "09:00", "end": "17:00"}],
--     "saturday": [{"start": "10:00", "end": "14:00"}],
--     "sunday": []
--   },
--   "buffer_time_minutes": 30,
--   "max_bookings_per_day": 3,
--   "advance_booking_days": 60
-- }

-- Blocked dates structure (for vacations, holidays):
-- ["2025-01-15", "2025-01-16", "2025-12-25"]

comment on column public.professional_profiles.instant_booking_enabled is 'Allow customers to book instantly without approval';
comment on column public.professional_profiles.instant_booking_settings is 'Rules for instant booking (min notice, max duration, etc)';
comment on column public.professional_profiles.availability_settings is 'Working hours, buffer times, max bookings per day';
comment on column public.professional_profiles.blocked_dates is 'Array of dates when professional is unavailable (YYYY-MM-DD format)';

-- ============================================================================
-- SERVICE ADD-ONS
-- ============================================================================

-- Create service_addons table for customizable extras
create table if not exists public.service_addons (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professional_profiles(profile_id) on delete cascade,
  name text not null,
  description text,
  price_cop integer not null check (price_cop >= 0),
  duration_minutes integer default 0 check (duration_minutes >= 0),
  is_active boolean default true,
  display_order integer default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_service_addons_professional_id on public.service_addons(professional_id);
create index if not exists idx_service_addons_active on public.service_addons(professional_id, is_active) where is_active = true;

-- RLS policies for service_addons
alter table public.service_addons enable row level security;

-- Anyone can view active add-ons
create policy "Active service addons are viewable by anyone"
  on public.service_addons
  for select
  using (is_active = true);

-- Professionals can manage their own add-ons
create policy "Professionals can manage their own addons"
  on public.service_addons
  for all
  using (
    auth.uid() = professional_id
  );

-- Trigger for updated_at
create or replace function public.set_service_addons_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists service_addons_set_updated_at on public.service_addons;
create trigger service_addons_set_updated_at
  before update on public.service_addons
  for each row
  execute procedure public.set_service_addons_updated_at();

comment on table public.service_addons is 'Customizable add-on services that professionals can offer';

-- ============================================================================
-- BOOKING ADD-ONS (Selected add-ons for a booking)
-- ============================================================================

-- Add selected_addons to bookings table
alter table public.bookings
  add column if not exists selected_addons jsonb default '[]'::jsonb,
  add column if not exists addons_total_amount integer default 0;

-- Selected add-ons structure:
-- [
--   {
--     "addon_id": "uuid",
--     "name": "Inside refrigerator",
--     "price_cop": 10000,
--     "duration_minutes": 30
--   }
-- ]

comment on column public.bookings.selected_addons is 'Add-ons selected by customer for this booking';
comment on column public.bookings.addons_total_amount is 'Total cost of add-ons in cents';

-- ============================================================================
-- RECURRING BOOKINGS
-- ============================================================================

-- Add recurring booking fields to bookings table
alter table public.bookings
  add column if not exists is_recurring boolean default false,
  add column if not exists recurrence_pattern jsonb default null,
  add column if not exists parent_booking_id uuid references public.bookings(id) on delete set null,
  add column if not exists recurrence_instance_number integer default null,
  add column if not exists recurrence_status text check (recurrence_status in ('active', 'paused', 'cancelled'));

-- Recurrence pattern structure:
-- {
--   "frequency": "weekly",
--   "interval": 1,
--   "day_of_week": 3,
--   "end_date": "2025-06-01",
--   "occurrences_count": 12,
--   "total_occurrences": 12
-- }

create index if not exists idx_bookings_recurring on public.bookings(parent_booking_id) where parent_booking_id is not null;
create index if not exists idx_bookings_recurrence_status on public.bookings(recurrence_status) where recurrence_status is not null;

comment on column public.bookings.is_recurring is 'Whether this booking is part of a recurring series';
comment on column public.bookings.recurrence_pattern is 'Pattern for recurring bookings (frequency, end date, etc)';
comment on column public.bookings.parent_booking_id is 'Links to parent booking if this is part of a series';
comment on column public.bookings.recurrence_instance_number is 'Which occurrence in the series (1, 2, 3...)';
comment on column public.bookings.recurrence_status is 'Status of recurring series (active, paused, cancelled)';

-- ============================================================================
-- CUSTOMER PREFERENCES
-- ============================================================================

-- Add booking preferences to customer_profiles
alter table public.customer_profiles
  add column if not exists booking_preferences jsonb default '{}'::jsonb,
  add column if not exists favorite_professionals uuid[] default '{}';

-- Booking preferences structure:
-- {
--   "default_duration_hours": 3,
--   "preferred_time_slots": ["morning", "afternoon"],
--   "special_requests": "Please bring eco-friendly products",
--   "has_pets": true,
--   "pet_details": "One friendly dog",
--   "home_access_notes": "Key under mat"
-- }

create index if not exists idx_customer_favorites on public.customer_profiles using gin(favorite_professionals);

comment on column public.customer_profiles.booking_preferences is 'Customer default booking preferences';
comment on column public.customer_profiles.favorite_professionals is 'Array of professional IDs customer has favorited';

-- ============================================================================
-- MESSAGING SYSTEM (for booked customers only)
-- ============================================================================

-- Create conversations table
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  professional_id uuid not null references public.professional_profiles(profile_id) on delete cascade,
  last_message_at timestamptz,
  customer_unread_count integer default 0,
  professional_unread_count integer default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists idx_conversations_booking on public.conversations(booking_id);
create index if not exists idx_conversations_customer on public.conversations(customer_id);
create index if not exists idx_conversations_professional on public.conversations(professional_id);

-- Create messages table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  attachments text[] default '{}',
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_messages_conversation on public.messages(conversation_id, created_at desc);
create index if not exists idx_messages_unread on public.messages(conversation_id) where read_at is null;

-- RLS policies for conversations
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Users can view conversations they're part of
create policy "Users can view their own conversations"
  on public.conversations
  for select
  using (
    auth.uid() = customer_id or auth.uid() = professional_id
  );

-- Users can create conversations for their bookings
create policy "Users can create conversations for their bookings"
  on public.conversations
  for insert
  with check (
    auth.uid() = customer_id or auth.uid() = professional_id
  );

-- Users can update their own conversations
create policy "Users can update their own conversations"
  on public.conversations
  for update
  using (
    auth.uid() = customer_id or auth.uid() = professional_id
  );

-- Users can view messages in their conversations
create policy "Users can view messages in their conversations"
  on public.messages
  for select
  using (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
      and (conversations.customer_id = auth.uid() or conversations.professional_id = auth.uid())
    )
  );

-- Users can send messages in their conversations
create policy "Users can send messages in their conversations"
  on public.messages
  for insert
  with check (
    exists (
      select 1 from public.conversations
      where conversations.id = conversation_id
      and (conversations.customer_id = auth.uid() or conversations.professional_id = auth.uid())
    )
    and sender_id = auth.uid()
  );

-- Users can mark their own messages as read
create policy "Users can update messages to mark as read"
  on public.messages
  for update
  using (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
      and (conversations.customer_id = auth.uid() or conversations.professional_id = auth.uid())
    )
  );

-- Triggers for conversations and messages
create or replace function public.set_conversations_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists conversations_set_updated_at on public.conversations;
create trigger conversations_set_updated_at
  before update on public.conversations
  for each row
  execute procedure public.set_conversations_updated_at();

-- Function to update conversation when message is sent
create or replace function public.update_conversation_on_message()
returns trigger
language plpgsql
as $$
begin
  update public.conversations
  set
    last_message_at = new.created_at,
    customer_unread_count = case
      when new.sender_id != customer_id then customer_unread_count + 1
      else customer_unread_count
    end,
    professional_unread_count = case
      when new.sender_id != professional_id then professional_unread_count + 1
      else professional_unread_count
    end
  where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists update_conversation_on_message on public.messages;
create trigger update_conversation_on_message
  after insert on public.messages
  for each row
  execute procedure public.update_conversation_on_message();

comment on table public.conversations is 'Messaging conversations between customers and professionals (booking-based only)';
comment on table public.messages is 'Individual messages within conversations';

commit;
