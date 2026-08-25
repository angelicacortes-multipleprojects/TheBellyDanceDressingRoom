create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.app_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  price integer not null check (price >= 0),
  size text not null,
  style text not null default '',
  designer text not null default '',
  color text not null default '',
  location text not null default '',
  condition text not null,
  ship boolean not null default true,
  seller_name text not null default 'Seller',
  details text not null default '',
  payment_options jsonb not null default '{}'::jsonb,
  image_urls text[] not null check (array_length(image_urls, 1) between 1 and 5),
  status text not null default 'active' check (status in ('active', 'sold', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.listing_reports (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  reporter_id uuid references auth.users(id) on delete set null,
  reason text not null,
  status text not null default 'new' check (status in ('new', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now()
);

create table if not exists public.beta_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  contact_email text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'reviewed', 'archived')),
  created_at timestamptz not null default now()
);

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

create table if not exists public.inquiry_messages (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.listing_inquiries(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.app_admins enable row level security;
alter table public.listings enable row level security;
alter table public.listing_reports enable row level security;
alter table public.beta_feedback enable row level security;
alter table public.listing_inquiries enable row level security;
alter table public.inquiry_messages enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant select on public.app_admins to authenticated;
grant select on public.listings to anon, authenticated;
grant insert, update, delete on public.profiles to authenticated;
grant insert, update, delete on public.listings to authenticated;
grant insert on public.listing_reports to authenticated;
grant select on public.listing_reports to authenticated;
grant insert on public.beta_feedback to anon, authenticated;
grant select on public.beta_feedback to authenticated;
grant insert on public.listing_inquiries to authenticated;
grant select on public.listing_inquiries to authenticated;
grant update (status) on public.listing_inquiries to authenticated;
grant insert on public.inquiry_messages to authenticated;
grant select on public.inquiry_messages to authenticated;

create policy "Public profiles are readable"
  on public.profiles for select
  using (true);

create policy "Users can create their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can read their own admin status"
  on public.app_admins for select
  using (auth.uid() = user_id);

create policy "Active and sold listings are public"
  on public.listings for select
  using (status in ('active', 'sold'));

create policy "Signed-in users can create their own listings"
  on public.listings for insert
  with check (auth.uid() = owner_id);

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

create policy "Signed-in users can create reports"
  on public.listing_reports for insert
  with check (auth.uid() = reporter_id);

create policy "Users can read their own reports"
  on public.listing_reports for select
  using (auth.uid() = reporter_id);

create policy "Anyone can submit beta feedback"
  on public.beta_feedback for insert
  with check (true);

create policy "Users can read their own beta feedback"
  on public.beta_feedback for select
  using (auth.uid() = user_id);

create policy "Buyers can create listing inquiries"
  on public.listing_inquiries for insert
  with check (auth.uid() = buyer_id);

create policy "Sellers can read their listing inquiries"
  on public.listing_inquiries for select
  using (auth.uid() = seller_id);

create policy "Buyers can read their listing inquiries"
  on public.listing_inquiries for select
  using (auth.uid() = buyer_id);

create policy "Conversation participants can update inquiry status"
  on public.listing_inquiries for update
  using (auth.uid() in (seller_id, buyer_id))
  with check (auth.uid() in (seller_id, buyer_id));

create policy "Conversation participants can read messages"
  on public.inquiry_messages for select
  using (
    exists (
      select 1
      from public.listing_inquiries inquiry
      where inquiry.id = inquiry_id
      and auth.uid() in (inquiry.seller_id, inquiry.buyer_id)
    )
  );

create policy "Conversation participants can send messages"
  on public.inquiry_messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1
      from public.listing_inquiries inquiry
      where inquiry.id = inquiry_id
      and auth.uid() in (inquiry.seller_id, inquiry.buyer_id)
    )
  );

insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

create policy "Listing photos are publicly readable"
  on storage.objects for select
  using (bucket_id = 'listing-photos');

create policy "Signed-in users can upload listing photos"
  on storage.objects for insert
  with check (
    bucket_id = 'listing-photos'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update their own listing photos"
  on storage.objects for update
  using (
    bucket_id = 'listing-photos'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own listing photos"
  on storage.objects for delete
  using (
    bucket_id = 'listing-photos'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
