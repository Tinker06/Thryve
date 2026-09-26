-- =========================================================
-- EXTENSIONS
-- =========================================================
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- =========================================================
-- TEAMS
-- =========================================================
create table teams (
  id uuid primary key default gen_random_uuid(),
  team_code text unique not null, -- THRYVE-XXXX
  team_name text not null,
  team_email text not null,
  team_lead_user_id uuid, -- set after auth user is created
  created_at timestamptz default now()
);

-- =========================================================
-- PROFILES (1:1 with auth.users)
-- =========================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  team_id uuid references teams(id) on delete cascade,
  full_name text not null,
  email text not null,
  personal_description text,
  skills text[],
  learning_style text,
  role text default 'member', -- 'team_lead' | 'member'
  status text default 'pending_approval', -- 'pending_approval' | 'active' | 'blocked' | 'deactivated'
  created_at timestamptz default now()
);

alter table teams
  add constraint fk_team_lead foreign key (team_lead_user_id) references profiles(id);

-- =========================================================
-- TEAM MEMBERS (membership + status inside a team)
-- =========================================================
create table team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  status text default 'pending_approval', -- pending_approval | active | blocked | deactivated
  added_by uuid references profiles(id),
  created_at timestamptz default now(),
  unique(team_id, user_id)
);

-- =========================================================
-- PROJECTS
-- =========================================================
create table projects (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade,
  name text not null,
  description text,
  created_by uuid references profiles(id),
  status text default 'active',
  created_at timestamptz default now()
);

create table project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  team_id uuid references teams(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  ai_role text,
  ai_role_reason text,
  ai_role_accepted boolean default false,
  created_at timestamptz default now(),
  unique(project_id, user_id)
);

-- =========================================================
-- SPRINTS + TASKS
-- =========================================================
create table sprints (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  team_id uuid references teams(id) on delete cascade,
  sprint_name text,
  goal text,
  status text default 'draft', -- draft | pending_approval | approved | rejected
  ai_generated boolean default true,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  team_id uuid references teams(id) on delete cascade,
  sprint_id uuid references sprints(id) on delete set null,
  assigned_to uuid references profiles(id),
  title text not null,
  description text,
  status text default 'pending', -- pending | in_progress | done | blocked | late
  blocked_reason text,
  start_time timestamptz,
  deadline timestamptz,
  estimated_minutes integer,
  completed_at timestamptz,
  dependencies uuid[],
  created_at timestamptz default now()
);

create table sprint_tasks (
  id uuid primary key default gen_random_uuid(),
  sprint_id uuid references sprints(id) on delete cascade,
  task_id uuid references tasks(id) on delete cascade,
  unique(sprint_id, task_id)
);

-- =========================================================
-- DOCUMENTS
-- =========================================================
create table documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  team_id uuid references teams(id) on delete cascade,
  owner_user_id uuid references profiles(id),
  file_name text not null,
  storage_path text not null,
  file_type text,
  file_size bigint,
  visibility text default 'PRIVATE', -- PRIVATE | SHARED
  extracted_text text,
  created_at timestamptz default now()
);

create table document_requests (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  team_id uuid references teams(id) on delete cascade,
  requested_by uuid references profiles(id),
  status text default 'pending', -- pending | approved | rejected
  created_at timestamptz default now()
);

-- =========================================================
-- CHAT
-- =========================================================
create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  team_id uuid references teams(id) on delete cascade,
  sender_id uuid references profiles(id),
  mode text not null, -- TEAM_AI | ASK_AI | TEAM_ONLY
  sender_type text not null, -- user | ai | team
  content text not null,
  created_at timestamptz default now()
);

-- =========================================================
-- NOTIFICATIONS
-- =========================================================
create table notifications (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  recipient_user_id uuid references profiles(id) on delete cascade,
  type text not null,
  title text not null,
  message text,
  read boolean default false,
  created_at timestamptz default now()
);

-- =========================================================
-- AI INSIGHTS
-- =========================================================
create table ai_insights (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  team_id uuid references teams(id) on delete cascade,
  knowledge_exchange jsonb,
  knowledge_gaps jsonb,
  collaboration_recommendations jsonb,
  collective_summary text,
  created_at timestamptz default now()
);

-- =========================================================
-- WORK REQUESTS
-- =========================================================
create table work_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  team_id uuid references teams(id) on delete cascade,
  requested_by uuid references profiles(id),
  requested_from uuid references profiles(id),
  task_id uuid references tasks(id),
  status text default 'pending',
  created_at timestamptz default now()
);

-- =========================================================
-- ACTIVITY LOGS
-- =========================================================
create table activity_logs (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade,
  project_id uuid references projects(id),
  actor_id uuid references profiles(id),
  action text not null,
  metadata jsonb,
  created_at timestamptz default now()
);

-- =========================================================
-- REPORTS (optional cache table for Person 4)
-- =========================================================
create table reports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  team_id uuid references teams(id) on delete cascade,
  scope text not null, -- team | member
  member_id uuid references profiles(id),
  period text not null, -- sprint_01 | this_week | project_to_date
  data jsonb,
  generated_at timestamptz default now()
);
create or replace function is_team_member(check_team_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
      and team_id = check_team_id
      and status = 'active'
  );
$$;

create or replace function is_team_lead(check_team_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
      and team_id = check_team_id
      and role = 'team_lead'
  );
$$;

create or replace function is_project_member(check_project_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from project_members
    where project_id = check_project_id
      and user_id = auth.uid()
  );
$$;
