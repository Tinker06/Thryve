export type UserRole = 'team_lead' | 'member';

export type UserStatus =
  | 'pending_approval'
  | 'active'
  | 'blocked'
  | 'deactivated';

export interface Team {
  id: string;
  team_code: string;
  team_name: string;
  team_email: string;
  team_lead_user_id: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  team_id: string;
  full_name: string;
  email: string;
  personal_description: string | null;
  skills: string[] | null;
  learning_style: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string;
}

export interface Notification {
  id: string;
  team_id: string;
  project_id: string | null;
  recipient_user_id: string;
  type:
    | 'NEW_USER_REQUEST'
    | 'DELETE_USER_REQUEST'
    | 'DOCUMENT_SHARE_REQUEST'
    | 'WORK_REQUEST'
    | 'BLOCKED_USER'
    | 'LATE_TASK'
    | 'AI_SPRINT_READY'
    | 'AI_SPRINT_CHANGE'
    | 'COLLABORATION_RECOMMENDATION';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}
export type DashboardTaskStatus =
  | 'DONE'
  | 'IN_PROGRESS'
  | 'BLOCKED'
  | 'LATE'
  | 'PENDING';

export interface DashboardTask {
  id: string;
  title: string;
  timeRange: string;
  status: DashboardTaskStatus;
}

export interface ProjectFile {
  id: string;
  name: string;
  icon: string;
  visibility: 'PRIVATE' | 'SHARED';
}

export type ChatMode = 'all' | 'ai' | 'team';

export interface ChatMessageData {
  id: string;
  author: string;
  body: string;
  kind: 'ai' | 'me' | 'team';
}

export interface DeadlineChecklistItem {
  id: string;
  title: string;
  meta: string;
  done: boolean;
  late: boolean;
}
