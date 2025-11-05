-- Storage policies for professional document bucket
begin;

drop policy if exists "Professional docs own read" on storage.objects;
create policy "Professional docs own read"
  on storage.objects
  for select
  using (
    bucket_id = 'professional-documents'
    and split_part(name, '/', 1) = auth.uid()::text
  );

drop policy if exists "Professional docs own write" on storage.objects;
create policy "Professional docs own write"
  on storage.objects
  for insert
  with check (
    bucket_id = 'professional-documents'
    and split_part(name, '/', 1) = auth.uid()::text
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'professional'
    )
  );

drop policy if exists "Professional docs own delete" on storage.objects;
create policy "Professional docs own delete"
  on storage.objects
  for delete
  using (
    bucket_id = 'professional-documents'
    and split_part(name, '/', 1) = auth.uid()::text
  );

-- Allow admins to view any professional document

drop policy if exists "Admin read professional documents" on storage.objects;
create policy "Admin read professional documents"
  on storage.objects
  for select
  using (
    bucket_id = 'professional-documents'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

commit;
