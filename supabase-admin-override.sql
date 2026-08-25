create table if not exists public.app_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.app_admins enable row level security;

grant select on public.app_admins to authenticated;
grant insert, update, delete on public.listings to authenticated;

drop policy if exists "Users can read their own admin status" on public.app_admins;
drop policy if exists "Owners can update their own listings" on public.listings;
drop policy if exists "Owners can delete their own listings" on public.listings;
drop policy if exists "Owners and admins can update listings" on public.listings;
drop policy if exists "Owners and admins can delete listings" on public.listings;

create policy "Users can read their own admin status"
  on public.app_admins for select
  using (auth.uid() = user_id);

create policy "Owners and admins can update listings"
  on public.listings for update
  using (
    auth.uid() = owner_id
    or exists (
      select 1
      from public.app_admins admin
      where admin.user_id = auth.uid()
    )
  )
  with check (
    auth.uid() = owner_id
    or exists (
      select 1
      from public.app_admins admin
      where admin.user_id = auth.uid()
    )
  );

create policy "Owners and admins can delete listings"
  on public.listings for delete
  using (
    auth.uid() = owner_id
    or exists (
      select 1
      from public.app_admins admin
      where admin.user_id = auth.uid()
    )
  );

-- After you sign in once, copy your user UUID from Supabase Auth > Users.
-- Then run this with your UUID to make only your account an app admin:
-- insert into public.app_admins (user_id) values ('YOUR-AUTH-USER-ID')
-- on conflict (user_id) do nothing;
