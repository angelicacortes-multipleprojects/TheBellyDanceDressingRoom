create table if not exists public.beta_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  contact_email text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'reviewed', 'archived')),
  created_at timestamptz not null default now()
);

alter table public.beta_feedback enable row level security;

grant insert on public.beta_feedback to anon, authenticated;
grant select on public.beta_feedback to authenticated;

drop policy if exists "Anyone can submit beta feedback" on public.beta_feedback;
drop policy if exists "Users can read their own beta feedback" on public.beta_feedback;

create policy "Anyone can submit beta feedback"
  on public.beta_feedback for insert
  with check (true);

create policy "Users can read their own beta feedback"
  on public.beta_feedback for select
  using (auth.uid() = user_id);
