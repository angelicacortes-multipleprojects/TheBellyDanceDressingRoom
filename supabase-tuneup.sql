alter table public.listings
  add column if not exists seller_name text not null default 'Seller';

create table if not exists public.listing_reports (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  reporter_id uuid references auth.users(id) on delete set null,
  reason text not null,
  status text not null default 'new' check (status in ('new', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now()
);

alter table public.listing_reports enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant select on public.listings to anon, authenticated;
grant insert, update, delete on public.profiles to authenticated;
grant insert, update, delete on public.listings to authenticated;
grant insert on public.listing_reports to authenticated;
grant select, update, delete on public.listing_reports to authenticated;

drop policy if exists "Active listings are public" on public.listings;
drop policy if exists "Active and sold listings are public" on public.listings;

create policy "Active and sold listings are public"
  on public.listings for select
  using (status in ('active', 'sold'));

drop policy if exists "Signed-in users can create reports" on public.listing_reports;
drop policy if exists "Users can read their own reports" on public.listing_reports;

create policy "Signed-in users can create reports"
  on public.listing_reports for insert
  with check (auth.uid() = reporter_id);

create policy "Users can read their own reports"
  on public.listing_reports for select
  using (auth.uid() = reporter_id);
