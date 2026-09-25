export interface Team {
  id: string;
  name: string;
  email: string;
  leadName: string;
  numUsers: number;
}

export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  description: string;
  skills: string;
}

export interface Project {
  id: string;
  teamId: string;
  name: string;
  description: string;
  members: ProjectMember[];
  progress: number;
  status: "active" | "in_build";
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