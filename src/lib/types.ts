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