alter table public.listings
  add column if not exists designer text not null default '';
