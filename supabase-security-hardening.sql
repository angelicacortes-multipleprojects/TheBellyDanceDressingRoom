revoke update, delete on public.listing_reports from authenticated;
revoke update, delete on public.beta_feedback from authenticated;
revoke update, delete on public.listing_inquiries from authenticated;

grant select on public.listing_reports to authenticated;
grant select on public.beta_feedback to authenticated;
grant select on public.listing_inquiries to authenticated;
grant update (status) on public.listing_inquiries to authenticated;
