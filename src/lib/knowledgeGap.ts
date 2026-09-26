// src/lib/knowledgeGap.ts

export interface ChatMessageRow {
  sender_id: string;
  mode: "team_ai" | "ask_ai" | "team_only";
  content: string;
  created_at: string;
}

export interface MemberLite {
  id: string;
  name: string;
}

export interface KnowledgeGap {
  memberId: string;
  memberName: string;
  occurrences: number;
  reason: string;
  recommendation: string;
}

/**
 * Detects knowledge gaps using ONLY observable activity:
 * - repeated ASK AI messages from the same member (3+) suggest a recurring
 *   knowledge gap rather than a one-off question.
 *
 * This does not infer psychology or intent — it counts observable events.
 */
export function detectKnowledgeGaps(
  messages: ChatMessageRow[],
  members: MemberLite[]
): KnowledgeGap[] {
  const askAiCounts: Record<string, number> = {};

  messages
    .filter((m) => m.mode === "ask_ai")
    .forEach((m) => {
      askAiCounts[m.sender_id] = (askAiCounts[m.sender_id] ?? 0) + 1;
    });

  const gaps: KnowledgeGap[] = [];

  Object.entries(askAiCounts).forEach(([memberId, count]) => {
    if (count >= 3) {
      const member = members.find((m) => m.id === memberId);
      gaps.push({
        memberId,
        memberName: member?.name ?? "Unknown member",
        occurrences: count,
        reason: `Asked AI ${count} separate questions in project chat.`,
        recommendation: "15-minute peer teaching session recommended.",
      });
    }
  });

  return gaps.sort((a, b) => b.occurrences - a.occurrences);
}