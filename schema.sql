-- Create table for event registrations
create table if not exists event_registrations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  event_id text not null,
  attending boolean not null default false,
  meal_preference text check (meal_preference in ('Veg', 'Non-Veg')),
  total_participants integer default 1 check (total_participants > 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Prevent duplicate registrations for the same event by the same user
  unique(user_id, event_id)
);

-- Set up Row Level Security (RLS)
alter table event_registrations enable row level security;

-- Policies

-- Users can view their own registrations
create policy "Users can view their own registrations"
  on event_registrations for select
  using ( auth.uid() = user_id );

-- Users can insert their own registrations
create policy "Users can insert their own registrations"
  on event_registrations for insert
  with check ( auth.uid() = user_id );

-- Users can update their own registrations
create policy "Users can update their own registrations"
  on event_registrations for update
  using ( auth.uid() = user_id );

-- Admins can view all registrations (assuming admin check uses a function or role check)
-- Adjust the condition based on your actual admin check logic, e.g., checking a profile role or app_metadata
create policy "Admins can view all registrations"
  on event_registrations for select
  using ( 
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
