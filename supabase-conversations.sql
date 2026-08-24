create table if not exists public.inquiry_messages (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.listing_inquiries(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.inquiry_messages enable row level security;

grant insert on public.inquiry_messages to authenticated;
grant select on public.inquiry_messages to authenticated;
grant update (status) on public.listing_inquiries to authenticated;

drop policy if exists "Conversation participants can read messages" on public.inquiry_messages;
drop policy if exists "Conversation participants can send messages" on public.inquiry_messages;
drop policy if exists "Buyers can read their listing inquiries" on public.listing_inquiries;
drop policy if exists "Conversation participants can update inquiry status" on public.listing_inquiries;

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

create policy "Buyers can read their listing inquiries"
  on public.listing_inquiries for select
  using (auth.uid() = buyer_id);

create policy "Conversation participants can update inquiry status"
  on public.listing_inquiries for update
  using (auth.uid() in (seller_id, buyer_id))
  with check (auth.uid() in (seller_id, buyer_id));
