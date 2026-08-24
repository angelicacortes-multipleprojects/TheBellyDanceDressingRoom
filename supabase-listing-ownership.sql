grant insert, update, delete on public.listings to authenticated;

drop policy if exists "Signed-in users can create their own listings" on public.listings;
drop policy if exists "Owners can update their own listings" on public.listings;
drop policy if exists "Owners can delete their own listings" on public.listings;

create policy "Signed-in users can create their own listings"
  on public.listings for insert
  with check (auth.uid() = owner_id);

create policy "Owners can update their own listings"
  on public.listings for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Owners can delete their own listings"
  on public.listings for delete
  using (auth.uid() = owner_id);
