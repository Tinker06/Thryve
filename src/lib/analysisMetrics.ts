// src/lib/analysisMetrics.ts
//
// Pure computation only — no Supabase calls in here. Fetch the raw rows
// wherever your Analysis page already does, then pass them into
// computeProjectMetrics(). Every number below is derived from real rows,
// per Phase 12: "Use actual database values. Do not use random percentages."

export interface TaskRow {
  id: string;
  assignee_id: string | null;
  status: "DONE" | "PENDING" | "AT_RISK" | "LATE" | "BLOCKED";
  deadline: string | null;
  completed_at: string | null;
}

export interface ChatMessageRow {
  sender_id: string;
  mode: "team_ai" | "ask_ai" | "team_only";
}

export interface DocumentRow {
  uploaded_by: string;
}

export interface WorkRequestRow {
  requested_by: string;
}

export interface MemberRow {
  id: string;
  name: string;
}

export interface MemberMetrics {
  memberId: string;
  memberName: string;
  tasksTotal: number;
  tasksCompleted: number;
  tasksPending: number;
  tasksLate: number;
  tasksBlocked: number;
  individualProgress: number; // % of this member's tasks that are DONE
}

export interface ProjectMetrics {
  // Team-wide
  totalTasks: number;
  tasksCompleted: number;
  tasksPending: number;
  tasksLate: number;
  tasksBlocked: number;
  tasksAtRisk: number;
  teamProgress: number; // % completedTasks / totalTasks

  // Deadline adherence: of the tasks that ARE completed, how many
  // finished on or before their deadline
  deadlineAdherence: number; // %

  // Docs / requests / chat — all straight counts, no derived guesses
  documentsShared: number;
  workRequests: number;
  helpInteractions: number; // ask_ai messages specifically
  knowledgeExchangeSignals: number; // total chat messages, all modes

  // Per member
  members: MemberMetrics[];
}

export function computeProjectMetrics(
  members: MemberRow[],
  tasks: TaskRow[],
  documents: DocumentRow[],
  workRequests: WorkRequestRow[],
  chatMessages: ChatMessageRow[]
): ProjectMetrics {
  const totalTasks = tasks.length;
  const tasksCompleted = tasks.filter((t) => t.status === "DONE").length;
  const tasksPending = tasks.filter((t) => t.status === "PENDING").length;
  const tasksLate = tasks.filter((t) => t.status === "LATE").length;
  const tasksBlocked = tasks.filter((t) => t.status === "BLOCKED").length;
  const tasksAtRisk = tasks.filter((t) => t.status === "AT_RISK").length;

  const teamProgress = totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0;

  // Deadline adherence — only meaningful among tasks that were actually
  // completed AND had a deadline set.
  const completedWithDeadline = tasks.filter(
    (t) => t.status === "DONE" && t.deadline && t.completed_at
  );
  const completedOnTime = completedWithDeadline.filter(
    (t) => new Date(t.completed_at as string).getTime() <= new Date(t.deadline as string).getTime()
  );
  const deadlineAdherence =
    completedWithDeadline.length > 0
      ? Math.round((completedOnTime.length / completedWithDeadline.length) * 100)
      : 0;

  const documentsShared = documents.length;
  const workRequestsCount = workRequests.length;
  const helpInteractions = chatMessages.filter((m) => m.mode === "ask_ai").length;
  const knowledgeExchangeSignals = chatMessages.length;

  const memberMetrics: MemberMetrics[] = members.map((m) => {
    const memberTasks = tasks.filter((t) => t.assignee_id === m.id);
    const completed = memberTasks.filter((t) => t.status === "DONE").length;
    const pending = memberTasks.filter((t) => t.status === "PENDING").length;
    const late = memberTasks.filter((t) => t.status === "LATE").length;
    const blocked = memberTasks.filter((t) => t.status === "BLOCKED").length;

    return {
      memberId: m.id,
      memberName: m.name,
      tasksTotal: memberTasks.length,
      tasksCompleted: completed,
      tasksPending: pending,
      tasksLate: late,
      tasksBlocked: blocked,
      individualProgress: memberTasks.length > 0 ? Math.round((completed / memberTasks.length) * 100) : 0,
    };
  });

  return {
    totalTasks,
    tasksCompleted,
    tasksPending,
    tasksLate,
    tasksBlocked,
    tasksAtRisk,
    teamProgress,
    deadlineAdherence,
    documentsShared,
    workRequests: workRequestsCount,
    helpInteractions,
    knowledgeExchangeSignals,
    members: memberMetrics,
  };
}