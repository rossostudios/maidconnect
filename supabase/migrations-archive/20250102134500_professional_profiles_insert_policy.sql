-- Allow professionals to create their own profile row

begin;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'professional_profiles'
      and policyname = 'Professional profile can be created by owner'
  ) then
    create policy "Professional profile can be created by owner"
    on public.professional_profiles
    for insert
    with check (auth.uid() = profile_id);
  end if;
end;
$$;

commit;
