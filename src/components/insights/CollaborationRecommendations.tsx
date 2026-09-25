// src/components/insights/CollaborationRecommendations.tsx
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { generateCollaborationRecommendations } from "../../lib/aiClient";
import type { CollaborationRecommendation } from "../../lib/aiClient";

// Minimal member shape this component needs — just enough to turn a
// participant NAME (what the AI returns) back into a member ID
// (what the notifications table needs).
export interface MemberLite {
  id: string;
  name: string;
}

// Gate: only show/attempt this panel if you already have a detected gap.
export interface KnowledgeGapLite {
  memberId: string;
  memberName: string;
  occurrences: number;
  reason: string;
  recommendation?: string;
}

interface Props {
  projectId: string;
  members: MemberLite[];
  knowledgeGaps: KnowledgeGapLite[];
}

interface RecommendationRow extends CollaborationRecommendation {
  proposed: boolean;
}

export default function CollaborationRecommendations({ projectId, members, knowledgeGaps }: Props) {
  const [recommendations, setRecommendations] = useState<RecommendationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiUnavailable, setAiUnavailable] = useState(false);
  const [proposeError, setProposeError] = useState<string | null>(null);

  useEffect(() => {
    if (knowledgeGaps.length === 0) {
      setRecommendations([]);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setAiUnavailable(false);

      const res = await generateCollaborationRecommendations(projectId);

      if (cancelled) return;

      if (res.success && res.data && res.data.length > 0) {
        setRecommendations(res.data.map((r) => ({ ...r, proposed: false })));
      } else {
        setAiUnavailable(true);
        setRecommendations(buildFallbackRecommendations(knowledgeGaps, members));
      }

      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [projectId, knowledgeGaps.length]);

  function findMemberIdByName(name: string): string | null {
    const match = members.find((m) => m.name.toLowerCase().trim() === name.toLowerCase().trim());
    return match ? match.id : null;
  }

  async function handlePropose(rec: RecommendationRow, index: number) {
    setProposeError(null);

    try {
      const recipientIds = rec.participants
        .map((name) => findMemberIdByName(name))
        .filter((id): id is string => id !== null);

      if (recipientIds.length === 0) {
        throw new Error("Could not match any participant names to project members.");
      }

      const title = `Collaboration suggested: ${rec.activity}`;
      const message = `${rec.participants.join(" & ")} · ${rec.duration}. Reason: ${rec.reason}`;

      const rows = recipientIds.map((recipientId) => ({
        project_id: projectId,
        recipient_id: recipientId,
        type: "collaboration_recommendation",
        title,
        message,
      }));

      const { error } = await supabase.from("notifications").insert(rows);
      if (error) throw error;

      setRecommendations((prev) => prev.map((r, i) => (i === index ? { ...r, proposed: true } : r)));
    } catch (err: any) {
      setProposeError(err.message ?? "Failed to send notification.");
    }
  }

  if (knowledgeGaps.length === 0) return null;

  return (
    <div className="panel">
      <h3>COLLABORATION RECOMMENDATIONS</h3>

      {loading && <p style={{ fontSize: 13, fontWeight: 700 }}>Generating recommendations…</p>}

      {!loading && aiUnavailable && (
        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--red, #b00020)" }}>
          AI temporarily unavailable — showing a rule-based suggestion instead.
        </p>
      )}

      {proposeError && (
        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--red, #b00020)" }}>{proposeError}</p>
      )}

      {!loading &&
        recommendations.map((rec, i) => (
          <div
            key={`${rec.activity}-${i}`}
            style={{ border: "2px solid var(--ink)", padding: 12, marginTop: 10, fontSize: 13 }}
          >
            <div style={{ fontWeight: 700, textTransform: "uppercase" }}>{rec.activity}</div>
            <div style={{ marginTop: 4 }}>
              {rec.participants.join(" & ")} · {rec.duration}
            </div>
            <div style={{ marginTop: 4 }}>Reason: {rec.reason}</div>
            <div style={{ marginTop: 4 }}>Expected benefit: {rec.expectedBenefit}</div>
            {rec.relatedTask && <div style={{ marginTop: 4 }}>Related: {rec.relatedTask}</div>}

            <button
              disabled={rec.proposed}
              onClick={() => handlePropose(rec, i)}
              style={{
                marginTop: 10,
                fontWeight: 700,
                padding: "6px 14px",
                border: "2px solid var(--ink)",
                background: rec.proposed ? "var(--green, #cdeecb)" : "var(--ink)",
                color: rec.proposed ? "var(--ink)" : "var(--bg, #fff)",
                cursor: rec.proposed ? "default" : "pointer",
              }}
            >
              {rec.proposed ? "PROPOSED ✓" : "PROPOSE"}
            </button>
          </div>
        ))}
    </div>
  );
}

function buildFallbackRecommendations(
  gaps: KnowledgeGapLite[],
  members: MemberLite[]
): RecommendationRow[] {
  if (gaps.length === 0) return [];

  const topGap = gaps[0];
  const helper = members.find((m) => m.id !== topGap.memberId);
  if (!helper) return [];

  return [
    {
      activity: "Peer teaching session",
      participants: [helper.name, topGap.memberName],
      duration: "15 minutes",
      reason: topGap.reason,
      expectedBenefit: "Resolves the repeated question and reduces duplicate AI queries.",
      relatedTask: "",
      proposed: false,
    },
  ];
}