// UI-scaffold types owned by Person 2 — these describe shapes the
// dashboard/forms need but that don't have a matching backend table yet
// (or use a different shape than the DB, e.g. ProjectMember here is the
// project-setup form's local draft state, not the real `profiles` row).

export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  description: string;
  skills: string;
}

export type TaskStatus = "DONE" | "IN_PROGRESS" | "BLOCKED" | "LATE" | "PENDING";

export interface DashboardTask {
  id: string;
  title: string;
  timeRange: string;
  status: TaskStatus;
}

export interface ProjectFile {
  id: string;
  name: string;
  icon: string;
  visibility: "PRIVATE" | "SHARED";
}

export type ChatMode = "all" | "ai" | "team";

export interface ChatMessageData {
  id: string;
  author: string;
  body: string;
  kind: "ai" | "me" | "team";
}

export interface DeadlineChecklistItem {
  id: string;
  title: string;
  meta: string;
  done: boolean;
  late: boolean;
}