alter table public.listings
  add column if not exists style text not null default '',
  add column if not exists designer text not null default '',
  add column if not exists color text not null default '',
  add column if not exists location text not null default '';

create table if not exists public.listing_inquiries (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  seller_id uuid not null references auth.users(id) on delete cascade,
  buyer_id uuid references auth.users(id) on delete set null,
  buyer_email text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'archived')),
  created_at timestamptz not null default now()
);

alter table public.listing_inquiries enable row level security;

grant insert on public.listing_inquiries to authenticated;
grant select on public.listing_inquiries to authenticated;
grant update (status) on public.listing_inquiries to authenticated;

drop policy if exists "Buyers can create listing inquiries" on public.listing_inquiries;
drop policy if exists "Sellers can read their listing inquiries" on public.listing_inquiries;

create policy "Buyers can create listing inquiries"
  on public.listing_inquiries for insert
  with check (auth.uid() = buyer_id);

create policy "Sellers can read their listing inquiries"
  on public.listing_inquiries for select
  using (auth.uid() = seller_id);
