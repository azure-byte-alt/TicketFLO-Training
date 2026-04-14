-- TicketFLO Training — Supabase Schema
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/ywnbhtdhuqvhhinkqwix/sql

-- ============================================================
-- TABLES
-- ============================================================

create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists scenarios (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  category text not null,
  difficulty text not null check (difficulty in ('beginner','intermediate','advanced')),
  ideal_title text,
  ideal_description text,
  ideal_steps text,
  ideal_priority text,
  ideal_category text,
  created_at timestamptz default now()
);

create table if not exists tickets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  scenario_id uuid references scenarios(id),
  title text not null,
  category text not null,
  priority text not null,
  description text not null,
  steps_to_reproduce text,
  submitted_at timestamptz default now()
);

create table if not exists feedback (
  id uuid default gen_random_uuid() primary key,
  ticket_id uuid references tickets(id) on delete cascade unique not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  total_score integer not null,
  title_score integer not null,
  description_score integer not null,
  steps_score integer not null,
  priority_category_score integer not null,
  strengths text[] not null default '{}',
  improvements text[] not null default '{}',
  overall_feedback text not null,
  ideal_title text,
  ideal_description text,
  ideal_steps text,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles enable row level security;
alter table tickets enable row level security;
alter table feedback enable row level security;
alter table scenarios enable row level security;

-- Profiles
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- Tickets
create policy "Users can view own tickets"
  on tickets for select using (auth.uid() = user_id);

create policy "Users can insert own tickets"
  on tickets for insert with check (auth.uid() = user_id);

create policy "Users can delete own tickets"
  on tickets for delete using (auth.uid() = user_id);

-- Feedback
create policy "Users can view own feedback"
  on feedback for select using (auth.uid() = user_id);

create policy "Users can insert own feedback"
  on feedback for insert with check (auth.uid() = user_id);

-- Scenarios (public read)
create policy "Anyone can view scenarios"
  on scenarios for select using (true);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- SEED SCENARIOS
-- ============================================================

insert into scenarios (title, description, category, difficulty, ideal_title, ideal_description, ideal_steps, ideal_priority, ideal_category) values

('Cannot Login to Email',
 'A user reports they are unable to log into their corporate email account. They say it''s been happening since this morning.',
 'Account Access', 'beginner',
 'User Unable to Login to Corporate Email Account (Outlook)',
 'User is unable to authenticate into their corporate email account (Outlook). The issue began this morning around 9:00 AM. The user has confirmed their password has not been changed and their account shows as active in the directory.',
 '1. User opens Outlook desktop client
2. Enters username and password
3. Receives "Authentication Failed" error message
4. Attempted via web browser (OWA) with same result
Expected: Successful login and inbox access
Actual: Authentication error on both desktop and web',
 'High', 'Account Access'),

('Printer Not Working',
 'An employee says the office printer on floor 3 is not printing. Other people are complaining too.',
 'Hardware', 'beginner',
 'Floor 3 Office Printer Offline - Multiple Users Affected',
 'The shared printer on Floor 3 (HP LaserJet 4015, asset tag #FL3-PRT-02) is not responding to print jobs. Multiple users on the floor are affected. Print queue shows jobs as pending but nothing is printing. The printer display shows no error messages.',
 '1. User sends document to print via Windows print dialog
2. Print job appears in queue with status "Pending"
3. Job remains pending indefinitely (>5 minutes)
4. Printer LCD display reads "Ready"
5. No physical output produced
Expected: Document prints within 30 seconds
Actual: Print job stalls indefinitely in queue',
 'Medium', 'Hardware'),

('Laptop Running Slow',
 'A manager complains their laptop has been very slow for the past week. They have an important presentation tomorrow.',
 'Performance', 'intermediate',
 'Manager Laptop Severe Performance Degradation - Dell XPS 15 #MGR-1042',
 'Manager''s laptop (Dell XPS 15, asset #MGR-1042, Windows 11 Pro) has been experiencing significant performance degradation for approximately one week. The issue is severely affecting productivity ahead of a critical client presentation scheduled for tomorrow morning. CPU usage is persistently high even with minimal applications running.',
 '1. User powers on laptop — boot time approximately 8 minutes (normally ~45 seconds)
2. Opens Chrome browser — takes 3-4 minutes to fully load
3. Attempts to open Excel spreadsheet — application becomes unresponsive for 5+ minutes
4. Task Manager shows CPU at 95-100% with multiple unknown background processes
5. Issue persists after restart
Expected: Normal boot in under 1 minute, applications load within 10-15 seconds
Actual: Severe lag across all operations, CPU pegged at 95-100%',
 'High', 'Performance'),

('Software Installation Request',
 'A developer needs Adobe Photoshop installed for a new design project starting next week.',
 'Software', 'beginner',
 'Software Installation Request: Adobe Photoshop CC - Developer Workstation #DEV-2201',
 'Developer requires Adobe Photoshop CC installation on their workstation (Windows 11, asset #DEV-2201) for an upcoming UI/UX design project. Project kickoff is scheduled for next Monday (confirmed by project manager). Business justification: creating UI mockups for a client deliverable. License to be sourced from existing Adobe Creative Cloud team subscription.',
 '1. Log into approved software portal
2. Search for Adobe Photoshop CC
3. Request installation for workstation asset #DEV-2201
4. Assign license from team Creative Cloud subscription pool
5. Confirm installation with requesting user',
 'Low', 'Software'),

('VPN Connection Dropping',
 'A remote worker says their VPN keeps disconnecting every 30 minutes. They work from home full-time.',
 'Network', 'intermediate',
 'Remote Worker VPN (Cisco AnyConnect) Dropping Every 30 Minutes - Full-Time WFH',
 'Remote employee (full-time work-from-home) is experiencing repeated disconnections from the corporate VPN (Cisco AnyConnect). The connection drops approximately every 30 minutes, requiring manual reconnection each time. The issue has been ongoing for 3 days. No recent changes to the home network or device configuration. The employee is unable to maintain a stable connection for video calls or access internal resources.',
 '1. Employee launches Cisco AnyConnect and connects to corporate VPN
2. Connection establishes successfully and shows "Connected"
3. After approximately 25-35 minutes, VPN disconnects automatically
4. AnyConnect shows error: "Session timeout - reason code 16"
5. Manual reconnection required — issue repeats consistently
Expected: Stable VPN connection maintained throughout the workday
Actual: Connection drops approximately every 30 minutes with session timeout error',
 'High', 'Network'),

('Two-Factor Authentication Locked Out',
 'An employee got a new phone and now can''t access systems that require 2FA. They need access urgently.',
 'Account Access', 'intermediate',
 'Employee 2FA Locked Out After New Device - Urgent Access Required to Email, VPN, Salesforce',
 'Employee received a replacement company phone (reason: device failure) and is now locked out of all systems requiring two-factor authentication. The affected systems are business-critical: corporate email (Outlook), VPN, and Salesforce CRM. The employee has a client meeting in 2 hours and cannot access required systems. Identity has been pre-verified by HR (ticket attached). Previous device is no longer functional. Backup codes were not saved.',
 '1. Employee powers on new phone
2. Attempts to login to Outlook (web)
3. Authentication prompt requests 2FA code from Microsoft Authenticator
4. Authenticator app not present on new device; old device no longer accessible
5. "Use another method" option tried — backup codes not available
6. Account lockout occurred after multiple failed attempts
Expected: Ability to authenticate using 2FA on new device
Actual: Completely locked out of all 2FA-protected systems',
 'Critical', 'Account Access')

on conflict do nothing;
