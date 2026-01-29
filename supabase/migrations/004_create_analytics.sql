-- Create page_views table
create table public.page_views (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  path text not null,
  user_agent text null,
  ip text null,
  constraint page_views_pkey primary key (id)
);

-- Enable RLS
alter table public.page_views enable row level security;

-- Policies
-- 1. Insert: Public (anon) can insert (track views)
create policy "Public can insert page views" on public.page_views
  for insert
  with check (true);

-- 2. Select: Only authenticated users (admin) can view stats
create policy "Admins can view page views" on public.page_views
  for select
  to authenticated
  using (true);

-- Grant permissions
grant insert on public.page_views to anon;
grant select on public.page_views to authenticated;
