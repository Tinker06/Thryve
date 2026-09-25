// src/pages/Insights.tsx
import CollaborationRecommendations from "../components/insights/CollaborationRecommendations";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { detectKnowledgeGaps, type ChatMessageRow, type KnowledgeGap } from "../lib/knowledgeGap";
import { computeContributions, type ContributionRow, type DocumentLite, type TaskLite } from "../lib/contributions";

interface Member {
  id: string;
  name: string;
  ai_role: string | null;
}

export default function Insights() {
  const { projectId } = useParams<{ projectId: string }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [members, setMembers] = useState<Member[]>([]);
  const [tasks, setTasks] = useState<TaskLite[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessageRow[]>([]);
  const [documents, setDocuments] = useState<DocumentLite[]>([]);

  useEffect(() => {
    if (!projectId) return;

    async function loadInsights() {
      setLoading(true);
      setError(null);

      try {
        const [membersRes, tasksRes, chatRes, docsRes] = await Promise.all([
          supabase.from("project_members").select("id, name, ai_role").eq("project_id", projectId),
          supabase.from("tasks").select("assignee_id, status").eq("project_id", projectId),
          supabase.from("chat_messages").select("sender_id, mode, content, created_at").eq("project_id", projectId),
          supabase.from("documents").select("uploaded_by").eq("project_id", projectId).eq("approved", true),
        ]);

        if (membersRes.error) throw membersRes.error;
        if (tasksRes.error) throw tasksRes.error;
        if (chatRes.error) throw chatRes.error;
        if (docsRes.error) throw docsRes.error;

        setMembers(membersRes.data ?? []);
        setTasks((tasksRes.data ?? []) as TaskLite[]);
        setChatMessages((chatRes.data ?? []) as ChatMessageRow[]);
        setDocuments((docsRes.data ?? []) as DocumentLite[]);
      } catch (err: any) {
        setError(err.message ?? "Failed to load insights.");
      } finally {
        setLoading(false);
      }
    }

    loadInsights();
  }, [projectId]);

  if (!projectId) return <div className="page">No project selected.</div>;
  if (loading) return <div className="page">Loading insights…</div>;
  if (error) return <div className="page" style={{ color: "var(--red)" }}>Error: {error}</div>;

  // ---- Knowledge exchange ----
  const totalMessages = chatMessages.length;
  const askAiCount = chatMessages.filter((m) => m.mode === "ask_ai").length;
  const teamAiCount = chatMessages.filter((m) => m.mode === "team_ai").length;
  const teamOnlyCount = chatMessages.filter((m) => m.mode === "team_only").length;

  const messagesByMember: Record<string, number> = {};
  chatMessages.forEach((m) => {
    messagesByMember[m.sender_id] = (messagesByMember[m.sender_id] ?? 0) + 1;
  });
  const mostActiveEntry = Object.entries(messagesByMember).sort((a, b) => b[1] - a[1])[0];
  const mostActiveMember = mostActiveEntry
    ? members.find((m) => m.id === mostActiveEntry[0])?.name ?? "Unknown member"
    : "No activity yet";

  // ---- Knowledge gap (same detector as Phase 7) ----
  const knowledgeGaps: KnowledgeGap[] = detectKnowledgeGaps(
    chatMessages,
    members.map((m) => ({ id: m.id, name: m.name }))
  );

  // ---- Contributions ----
  const contributions: ContributionRow[] = computeContributions(
    members.map((m) => ({ id: m.id, name: m.name })),
    tasks,
    chatMessages,
    documents
  );

  // ---- Team progress (same formula as Analysis) ----
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "DONE").length;
  const teamProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // ---- Collective summary: rule-based, from real numbers only ----
  // NOTE: this is computed text, not a Gemini call. It becomes AI-generated
  // prose once aiClient.ts + generateCollaborationRecommendations are wired in.
  const collectiveSummary: string[] = [];

  collectiveSummary.push(
    totalTasks === 0
      ? "No tasks recorded yet — team progress cannot be assessed."
      : `The team has completed ${completedTasks} of ${totalTasks} tasks (${teamProgress}% progress).`
  );

  collectiveSummary.push(
    totalMessages === 0
      ? "No chat activity recorded yet."
      : `Strong knowledge exchange was observed with ${totalMessages} messages exchanged, most actively from ${mostActiveMember}.`
  );

  if (knowledgeGaps.length === 0) {
    collectiveSummary.push("Current collaboration risk is low — no repeated-question patterns detected.");
  } else {
    const topGap = knowledgeGaps[0];
    collectiveSummary.push(
      `Current collaboration risk is elevated: ${topGap.memberName} shows a recurring knowledge gap (${topGap.occurrences} repeated questions).`
    );
  }

  if (contributions.length > 1) {
    const top = contributions[0];
    const bottom = contributions[contributions.length - 1];
    if (top.score > 0 && bottom.score === 0) {
      collectiveSummary.push(
        `Contribution is uneven: ${top.memberName} leads observable activity while ${bottom.memberName} has no recorded contributions yet.`
      );
    }
  }

  collectiveSummary.push(
    knowledgeGaps.length > 0
      ? `Recommended next activity: ${knowledgeGaps[0].recommendation}`
      : "Recommended next activity: continue current sprint cadence, no intervention needed."
  );

  return (
    <div className="page">
      <div className="section-head">
        <div>
          <div className="eyebrow">TEAM INTELLIGENCE / INSIGHTS</div>
          <h2>INSIGHTS.</h2>
        </div>
        <span className="pill">KNOWLEDGE + CONTRIBUTIONS + FEEDBACK</span>
      </div>

      {/* KNOWLEDGE EXCHANGE */}
      <div className="panel">
        <h3>KNOWLEDGE EXCHANGE</h3>
        <div className="metric-grid">
          <div className="metric">
            <span>TOTAL MESSAGES</span>
            <strong>{totalMessages}</strong>
          </div>
          <div className="metric">
            <span>ASK AI</span>
            <strong>{askAiCount}</strong>
          </div>
          <div className="metric">
            <span>TEAM + AI</span>
            <strong>{teamAiCount}</strong>
          </div>
          <div className="metric">
            <span>TEAM ONLY</span>
            <strong>{teamOnlyCount}</strong>
          </div>
        </div>
        <p style={{ fontSize: 13, fontWeight: 700, marginTop: 10 }}>
          Most active: {mostActiveMember}
        </p>
      </div>

      {/* KNOWLEDGE GAP */}
      <div className="panel">
        <h3>KNOWLEDGE GAP</h3>
        {knowledgeGaps.length === 0 ? (
          <p style={{ fontSize: 13, fontWeight: 700 }}>No repeated-question patterns detected yet.</p>
        ) : (
          knowledgeGaps.map((gap) => (
            <div
              key={gap.memberId}
              style={{
                border: "2px solid var(--ink)",
                background: "var(--pink2)",
                padding: 12,
                marginTop: 10,
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              <div>
                <strong>{gap.memberName}</strong> — {gap.reason}
              </div>
              <div style={{ marginTop: 6 }}>→ {gap.recommendation}</div>
            </div>
          ))
        )}
      </div>

      {/* CONTRIBUTIONS */}
      <div className="panel">
        <h3>CONTRIBUTIONS</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Tasks Done</th>
              <th>Docs Shared</th>
              <th>Messages</th>
              <th>Contribution</th>
            </tr>
          </thead>
          <tbody>
            {contributions.map((row) => (
              <tr key={row.memberId}>
                <td>{row.memberName}</td>
                <td>{row.tasksCompleted}</td>
                <td>{row.docsShared}</td>
                <td>{row.messagesSent}</td>
                <td>
                  <div style={{ background: "var(--panel-alt, #eee)", height: 10, width: "100%", border: "1px solid var(--ink)" }}>
                    <div
                      style={{
                        background: "var(--ink)",
                        height: "100%",
                        width: `${row.scorePercent}%`,
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* COLLECTIVE INSIGHTS */}
      <div className="panel">
        <h3>COLLECTIVE INSIGHTS</h3>
        <ul style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.6, paddingLeft: 18 }}>
          {collectiveSummary.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </div>

      {/* AI FEEDBACK LOOP */}
      <div className="panel">
        <h3>AI FEEDBACK LOOP</h3>
        <div className="metric-grid">
          <div className="metric">
            <span>01 AUTHORIZED INPUTS</span>
            <strong style={{ fontSize: 12 }}>Chat, tasks, approved docs</strong>
          </div>
          <div className="metric">
            <span>02 PATTERN ANALYSIS</span>
            <strong style={{ fontSize: 12 }}>Knowledge gap + contribution scoring</strong>
          </div>
          <div className="metric">
            <span>03 TEAM INTELLIGENCE</span>
            <strong style={{ fontSize: 12 }}>Insights + Analysis dashboards</strong>
          </div>
          <div className="metric">
            <span>04 FEEDBACK LOOP</span>
            <strong style={{ fontSize: 12 }}>Lead approves before sprint changes</strong>
          </div>
        </div>
      </div>
    </div>
  );
}