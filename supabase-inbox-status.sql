grant update (status) on public.listing_inquiries to authenticated;

drop policy if exists "Conversation participants can update inquiry status" on public.listing_inquiries;

create policy "Conversation participants can update inquiry status"
  on public.listing_inquiries for update
  using (auth.uid() in (seller_id, buyer_id))
  with check (auth.uid() in (seller_id, buyer_id));
