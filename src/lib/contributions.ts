// src/lib/contributions.ts
import { type ChatMessageRow } from "./knowledgeGap";

export interface TaskLite {
  assignee_id: string;
  status: "DONE" | "PENDING" | "AT_RISK" | "LATE";
}

export interface DocumentLite {
  uploaded_by: string;
}

export interface MemberLite {
  id: string;
  name: string;
}

export interface ContributionRow {
  memberId: string;
  memberName: string;
  tasksCompleted: number;
  docsShared: number;
  messagesSent: number;
  score: number;
  scorePercent: number; // relative to the team's top scorer, for bar width
}

/**
 * Weighted contribution score from OBSERVABLE activity only:
 * - completed tasks weigh most (they're verified outcomes)
 * - approved docs shared next (verified artifacts)
 * - chat messages least (participation signal, not output)
 *
 * Weights are arbitrary but transparent — change them here if your
 * team wants task completion to matter more/less than doc sharing.
 */
const WEIGHT_TASK = 10;
const WEIGHT_DOC = 5;
const WEIGHT_MESSAGE = 1;

export function computeContributions(
  members: MemberLite[],
  tasks: TaskLite[],
  chatMessages: ChatMessageRow[],
  documents: DocumentLite[]
): ContributionRow[] {
  const tasksCompletedByMember: Record<string, number> = {};
  tasks
    .filter((t) => t.status === "DONE")
    .forEach((t) => {
      tasksCompletedByMember[t.assignee_id] =
        (tasksCompletedByMember[t.assignee_id] ?? 0) + 1;
    });

  const docsByMember: Record<string, number> = {};
  documents.forEach((d) => {
    docsByMember[d.uploaded_by] = (docsByMember[d.uploaded_by] ?? 0) + 1;
  });

  const messagesByMember: Record<string, number> = {};
  chatMessages.forEach((m) => {
    messagesByMember[m.sender_id] = (messagesByMember[m.sender_id] ?? 0) + 1;
  });

  const rows: ContributionRow[] = members.map((m) => {
    const tasksCompleted = tasksCompletedByMember[m.id] ?? 0;
    const docsShared = docsByMember[m.id] ?? 0;
    const messagesSent = messagesByMember[m.id] ?? 0;
    const score =
      tasksCompleted * WEIGHT_TASK +
      docsShared * WEIGHT_DOC +
      messagesSent * WEIGHT_MESSAGE;

    return {
      memberId: m.id,
      memberName: m.name,
      tasksCompleted,
      docsShared,
      messagesSent,
      score,
      scorePercent: 0, // filled in below
    };
  });

  const maxScore = Math.max(1, ...rows.map((r) => r.score));
  rows.forEach((r) => {
    r.scorePercent = Math.round((r.score / maxScore) * 100);
  });

  return rows.sort((a, b) => b.score - a.score);
}