-- =========================================================
-- ENABLE ROW LEVEL SECURITY
-- =========================================================

alter table teams enable row level security;
alter table profiles enable row level security;
alter table team_members enable row level security;
alter table projects enable row level security;
alter table project_members enable row level security;
alter table sprints enable row level security;
alter table tasks enable row level security;
alter table sprint_tasks enable row level security;
alter table documents enable row level security;
alter table document_requests enable row level security;
alter table chat_messages enable row level security;
alter table notifications enable row level security;
alter table ai_insights enable row level security;
alter table work_requests enable row level security;
alter table activity_logs enable row level security;
alter table reports enable row level security;

-- =========================================================
-- TEAMS
-- =========================================================

create policy "team members can view own team"
  on teams for select
  using (is_team_member(id) or team_lead_user_id = auth.uid());

-- =========================================================
-- PROFILES
-- =========================================================

create policy "view profiles in same team"
  on profiles for select
  using (team_id in (select team_id from profiles where id = auth.uid()));

create policy "user can update own profile"
  on profiles for update
  using (id = auth.uid());

-- =========================================================
-- TEAM MEMBERS
-- =========================================================

create policy "view team_members in own team"
  on team_members for select
  using (is_team_member(team_id) or is_team_lead(team_id));

create policy "team lead manages team_members"
  on team_members for update
  using (is_team_lead(team_id));

-- =========================================================
-- PROJECTS
-- =========================================================

create policy "team members view team projects"
  on projects for select
  using (is_team_member(team_id));

create policy "team lead creates projects"
  on projects for insert
  with check (is_team_lead(team_id));

-- =========================================================
-- PROJECT MEMBERS
-- =========================================================

create policy "project members view membership"
  on project_members for select
  using (is_project_member(project_id) or is_team_lead(team_id));

-- =========================================================
-- SPRINTS / TASKS
-- =========================================================

create policy "project members view sprints"
  on sprints for select
  using (is_project_member(project_id));

create policy "project members view tasks"
  on tasks for select
  using (is_project_member(project_id));

create policy "assignee updates own task"
  on tasks for update
  using (assigned_to = auth.uid() or is_team_lead(team_id));

-- =========================================================
-- DOCUMENTS
-- =========================================================

create policy "owner sees own documents"
  on documents for select
  using (owner_user_id = auth.uid());

create policy "project members see shared documents"
  on documents for select
  using (visibility = 'SHARED' and is_project_member(project_id));

create policy "owner uploads documents"
  on documents for insert
  with check (owner_user_id = auth.uid() and is_project_member(project_id));

-- =========================================================
-- CHAT
-- =========================================================

create policy "project members read team chat"
  on chat_messages for select
  using (
    is_project_member(project_id)
    and (mode in ('TEAM_AI','TEAM_ONLY') or sender_id = auth.uid())
  );

create policy "project members send chat"
  on chat_messages for insert
  with check (is_project_member(project_id) and sender_id = auth.uid());

-- =========================================================
-- NOTIFICATIONS
-- =========================================================

create policy "user sees own notifications"
  on notifications for select
  using (recipient_user_id = auth.uid());

create policy "user updates own notifications"
  on notifications for update
  using (recipient_user_id = auth.uid());

-- =========================================================
-- AI INSIGHTS / REPORTS / WORK REQUESTS / ACTIVITY LOGS
-- =========================================================

create policy "project members view ai_insights"
  on ai_insights for select
  using (is_project_member(project_id));

create policy "project members view reports"
  on reports for select
  using (is_project_member(project_id));

create policy "project members view work_requests"
  on work_requests for select
  using (is_project_member(project_id));

create policy "team members view activity_logs"
  on activity_logs for select
  using (is_team_member(team_id));
