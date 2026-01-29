-- Create contacts table
create table public.contacts (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  name text not null,
  email text not null,
  message text not null,
  read boolean not null default false,
  constraint contacts_pkey primary key (id)
);

-- Enable RLS
alter table public.contacts enable row level security;

-- Policies
-- 1. Insert: Public (anon) can insert
create policy "Public can insert contacts" on public.contacts
  for insert
  with check (true);

-- 2. Select: Only authenticated users (admin) can view messages
create policy "Admins can view contacts" on public.contacts
  for select
  to authenticated
  using (true);

-- 3. Update: Admins can mark as read
create policy "Admins can update contacts" on public.contacts
  for update
  to authenticated
  using (true);

-- Grant permissions
grant insert on public.contacts to anon;
grant select, update on public.contacts to authenticated;
