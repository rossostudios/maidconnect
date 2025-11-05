-- Track Expo push tokens for Casaora mobile apps

begin;

create table if not exists public.mobile_push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  expo_push_token text not null,
  platform text check (platform in ('ios', 'android', 'web', 'unknown')) default 'unknown',
  device_name text,
  app_version text,
  last_seen_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, expo_push_token)
);

create index if not exists mobile_push_tokens_user_idx
  on public.mobile_push_tokens(user_id);

alter table public.mobile_push_tokens enable row level security;

create policy "Users can manage their own mobile push tokens"
  on public.mobile_push_tokens
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.set_mobile_push_tokens_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists tr_mobile_push_tokens_updated_at on public.mobile_push_tokens;
create trigger tr_mobile_push_tokens_updated_at
  before update on public.mobile_push_tokens
  for each row
  execute procedure public.set_mobile_push_tokens_updated_at();

comment on table public.mobile_push_tokens is 'Expo push tokens registered by Casaora mobile apps.';
comment on column public.mobile_push_tokens.platform is 'Platform reported by the device (ios, android, web, unknown).';

commit;
