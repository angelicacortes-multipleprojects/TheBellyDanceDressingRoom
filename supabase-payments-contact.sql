alter table public.listings
  add column if not exists payment_options jsonb not null default '{}'::jsonb;
