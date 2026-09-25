// src/pages/Analysis.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { detectKnowledgeGaps, type ChatMessageRow, type KnowledgeGap } from "../lib/knowledgeGap";
import { computeProjectMetrics, type DocumentRow, type WorkRequestRow } from "../lib/analysisMetrics";

interface Member {
  id: string;
  name: string;
  ai_role: string | null;
}

interface Task {
  id: string;
  assignee_id: string;
  status: "DONE" | "PENDING" | "AT_RISK" | "LATE" | "BLOCKED";
  deadline: string | null;
  completed_at: string | null;
}

interface MemberRow {
  id: string;
  name: string;
  aiRole: string;
  workCount: number;
  progress: number;
  knowledgeSignal: number;
  status: string;
}

export default function Analysis() {
  const { projectId } = useParams<{ projectId: string }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [members, setMembers] = useState<Member[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [workRequests, setWorkRequests] = useState<WorkRequestRow[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessageRow[]>([]);

  useEffect(() => {
    if (!projectId) return;

    async function loadAnalysis() {
      setLoading(true);
      setError(null);

      try {
        const [membersRes, tasksRes, docsRes, workReqRes, chatRes] = await Promise.all([
          supabase.from("project_members").select("id, name, ai_role").eq("project_id", projectId),
          supabase.from("tasks").select("id, assignee_id, status, deadline, completed_at").eq("project_id", projectId),
          supabase.from("documents").select("uploaded_by").eq("project_id", projectId).eq("approved", true),
          supabase.from("work_requests").select("requested_by").eq("project_id", projectId),
          supabase.from("chat_messages").select("sender_id, mode, content, created_at").eq("project_id", projectId),
        ]);

        if (membersRes.error) throw membersRes.error;
        if (tasksRes.error) throw tasksRes.error;
        if (docsRes.error) throw docsRes.error;
        if (workReqRes.error) throw workReqRes.error;
        if (chatRes.error) throw chatRes.error;

        setMembers(membersRes.data ?? []);
        setTasks((tasksRes.data ?? []) as Task[]);
        setDocuments((docsRes.data ?? []) as DocumentRow[]);
        setWorkRequests((workReqRes.data ?? []) as WorkRequestRow[]);
        setChatMessages((chatRes.data ?? []) as ChatMessageRow[]);
      } catch (err: any) {
        setError(err.message ?? "Failed to load analysis data.");
      } finally {
        setLoading(false);
      }
    }

    loadAnalysis();
  }, [projectId]);

  const metrics = computeProjectMetrics(members, tasks, documents, workRequests, chatMessages);

  const messageCounts: Record<string, number> = {};
  chatMessages.forEach((m) => {
    messageCounts[m.sender_id] = (messageCounts[m.sender_id] ?? 0) + 1;
  });

  const memberRows: MemberRow[] = members.map((m) => {
    const memberTasks = tasks.filter((t) => t.assignee_id === m.id);
    const memberCompleted = memberTasks.filter((t) => t.status === "DONE").length;
    const memberProgress = memberTasks.length > 0 ? Math.round((memberCompleted / memberTasks.length) * 100) : 0;

    let status = "ON TRACK";
    if (memberTasks.some((t) => t.status === "BLOCKED")) status = "BLOCKED";
    else if (memberTasks.some((t) => t.status === "LATE")) status = "LATE";
    else if (memberTasks.some((t) => t.status === "AT_RISK")) status = "AT RISK";
    else if (memberTasks.length > 0 && memberCompleted === memberTasks.length) status = "DONE";

    return {
      id: m.id,
      name: m.name,
      aiRole: m.ai_role ?? "Unassigned",
      workCount: memberTasks.length,
      progress: memberProgress,
      knowledgeSignal: messageCounts[m.id] ?? 0,
      status,
    };
  });

  const knowledgeGaps: KnowledgeGap[] = detectKnowledgeGaps(
    chatMessages,
    members.map((m) => ({ id: m.id, name: m.name }))
  );

  if (!projectId) return <div className="page">No project selected.</div>;
  if (loading) return <div className="page">Loading analysis…</div>;
  if (error) return <div className="page" style={{ color: "var(--red)" }}>Error: {error}</div>;

  return (
    <div className="page">
      <div className="section-head">
        <div>
          <div className="eyebrow">TEAM INTELLIGENCE / DETAILED VIEW</div>
          <h2>ANALYSIS.</h2>
        </div>
        <span className="pill">AI + TASK + DOCS + CHAT</span>
      </div>

      <div className="metric-grid">
        <div className="metric">
          <span>TEAM PROGRESS</span>
          <strong>{metrics.teamProgress}%</strong>
        </div>
        <div className="metric">
          <span>KNOWLEDGE EXCHANGE</span>
          <strong>{metrics.knowledgeExchangeSignals} msgs</strong>
        </div>
        <div className="metric">
          <span>DOCS SHARED</span>
          <strong>{metrics.documentsShared}</strong>
        </div>
        <div className="metric">
          <span>WORK REQUESTS</span>
          <strong>{metrics.workRequests}</strong>
        </div>
        <div className="metric">
          <span>HELP INTERACTIONS (ASK AI)</span>
          <strong>{metrics.helpInteractions}</strong>
        </div>
        <div className="metric">
          <span>DEADLINE ADHERENCE</span>
          <strong>{metrics.deadlineAdherence}%</strong>
        </div>
        <div className="metric">
          <span>TASKS BLOCKED</span>
          <strong>{metrics.tasksBlocked}</strong>
        </div>
        <div className="metric">
          <span>TASKS LATE</span>
          <strong>{metrics.tasksLate}</strong>
        </div>
      </div>

      <div className="panel">
        <h3>WHO DID WHAT?</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Member</th>
              <th>AI Role</th>
              <th>Work</th>
              <th>Progress</th>
              <th>Knowledge Signal</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {memberRows.map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>{row.aiRole}</td>
                <td>{row.workCount} tasks</td>
                <td>{row.progress}%</td>
                <td>{row.knowledgeSignal} msgs</td>
                <td>
                  <span
                    className={
                      "chip " +
                      (row.status === "DONE"
                        ? "green"
                        : row.status === "LATE" || row.status === "BLOCKED"
                        ? "pink"
                        : "blue")
                    }
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel">
        <h3>KNOWLEDGE GAP</h3>
        {knowledgeGaps.length === 0 ? (
          <p style={{ fontSize: 13, fontWeight: 700 }}>
            No repeated-question patterns detected yet.
          </p>
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
    </div>
  );
}