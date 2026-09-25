// src/pages/Sprint.tsx
import { useState } from "react";
import {
  generateSprint,
  regenerateSprint,
  type SprintPlan,
  type SprintTask,
} from "../lib/aiClient";
import { supabase } from "../lib/supabaseClient";
import SprintChangeSuggestionBox from "../components/SprintChangeSuggestion";
import BlockTaskModal from "../components/tasks/BlockTaskModal";
import PlaceholderBuilder from "../components/tasks/PlaceholderBuilder";

const STATUS_COLOR: Record<SprintTask["status"], string> = {
  DONE: "#a9d968",
  PENDING: "#fff8e8",
  AT_RISK: "#f7dd58",
  LATE: "#ef7777",
};

interface DbTask {
  id: string;
  title: string;
  assigneeId: string | null;
}

export default function SprintPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sprint, setSprint] = useState<SprintPlan | null>(null);
  const [rawResult, setRawResult] = useState<unknown>(null);
  const [approved, setApproved] = useState(false);
  const [showRegenBox, setShowRegenBox] = useState(false);
  const [feedback, setFeedback] = useState("");

  // Real DB rows created once the sprint is approved — this is what
  // MARK BLOCKED and GENERATE PLACEHOLDER buttons actually operate on.
  const [dbTasks, setDbTasks] = useState<DbTask[]>([]);
  const [blockingTask, setBlockingTask] = useState<{ id: string; title: string } | null>(null);
  const [placeholderTaskId, setPlaceholderTaskId] = useState<string | null>(null);

  function isRealSprintPlan(data: unknown): data is SprintPlan {
    return (
      !!data &&
      typeof data === "object" &&
      "sprintName" in data &&
      "tasks" in data
    );
  }

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setApproved(false);
    setShowRegenBox(false);

    const res = await generateSprint("demo-project-id");
    setLoading(false);

    if (!res.success) {
      setError(res.error || "AI temporarily unavailable.");
      return;
    }

    if (isRealSprintPlan(res.data)) {
      setSprint(res.data);
      setRawResult(null);
    } else {
      setRawResult(res.data);
      setSprint(null);
    }
  }

  async function handleRegenerate() {
    if (!feedback.trim()) return;
    setLoading(true);
    setError(null);

    const res = await regenerateSprint("demo-project-id", feedback);
    setLoading(false);

    if (!res.success) {
      setError(res.error || "AI temporarily unavailable.");
      return;
    }

    if (isRealSprintPlan(res.data)) {
      setSprint(res.data);
      setRawResult(null);
    } else {
      setRawResult(res.data);
      setSprint(null);
    }

    setApproved(false);
    setShowRegenBox(false);
    setFeedback("");
    setDbTasks([]);
  }

  // NEW: saves the AI-drafted tasks into the real `tasks` table so they
  // get real IDs. Without this, MARK BLOCKED / PLACEHOLDER had nothing
  // to attach to — the sprint tasks only ever existed in memory.
  async function handleApprove() {
    if (!sprint) return;
    setApproved(true);
    setError(null);

    try {
      const { data: members, error: membersErr } = await supabase
        .from("project_members")
        .select("id, name")
        .eq("project_id", "demo-project-id");

      if (membersErr) throw membersErr;

      const rowsToInsert = sprint.tasks.map((t) => {
        const match = (members ?? []).find(
          (m) => m.name.toLowerCase().trim() === t.member.toLowerCase().trim()
        );
        return {
          project_id: "demo-project-id",
          assignee_id: match ? match.id : null,
          title: t.title,
          status: t.status,
        };
      });

      const { data: inserted, error: insertErr } = await supabase
        .from("tasks")
        .insert(rowsToInsert)
        .select("id, title, assignee_id");

      if (insertErr) throw insertErr;

      setDbTasks(
        (inserted ?? []).map((row) => ({
          id: row.id,
          title: row.title,
          assigneeId: row.assignee_id,
        }))
      );
    } catch (err: any) {
      setError(err.message ?? "Sprint approved, but saving tasks to the database failed.");
    }
  }

  return (
    <main className="main">
      <div className="section-head">
        <div>
          <h2>SPRINT 01</h2>
          <p>AI drafts the sprint. Nothing goes live until the team lead approves it.</p>
        </div>
        <button className="btn pink" onClick={handleGenerate} disabled={loading}>
          {loading ? "GENERATING..." : sprint || rawResult ? "REGENERATE FROM SCRATCH" : "GENERATE SPRINT"}
        </button>
      </div>

      {error && <div className="notice red">{error}</div>}

      {rawResult != null && (
        <div className="notice blue">
          <b>Stub mode — wiring confirmed ✓</b>
          <p>AI_ENDPOINT is still pointed at ai-stub, so this isn't a real sprint yet. Raw response below:</p>
          <pre className="raw">{JSON.stringify(rawResult, null, 2)}</pre>
        </div>
      )}

      {sprint && (
        <>
          <div className="form-card">
            <h2>{sprint.sprintName}</h2>
            <p><b>Goal:</b> {sprint.goal}</p>
            <p><b>Timeline:</b> {sprint.timeline}</p>
          </div>

          <div className="grid">
            {sprint.tasks.map((t, i) => (
              <div className="card" key={i} style={{ background: STATUS_COLOR[t.status] }}>
                <span className="tag">{t.member}</span>
                <h3>{t.title}</h3>
                <p>{t.description}</p>
                <p style={{ fontSize: 12, fontWeight: 900 }}>
                  EST: {t.estimatedTime} • DEADLINE: {t.deadline}
                </p>
                <span className="tag" style={{ background: "#fff" }}>{t.status}</span>
              </div>
            ))}
          </div>

          {!approved && !showRegenBox && (
            <div className="notice">
              <b>TEAM LEAD APPROVAL REQUIRED</b>
              <br />
              <button className="btn teal" style={{ marginTop: 10 }} onClick={handleApprove}>
                APPROVE SPRINT
              </button>{" "}
              <button className="btn paper" style={{ marginTop: 10 }} onClick={() => setShowRegenBox(true)}>
                REJECT + REGENERATE
              </button>
            </div>
          )}

          {approved && (
            <div className="notice" style={{ background: "#a9d968" }}>
              <b>Sprint 01 published ✓</b> Team lead approval recorded.
            </div>
          )}

          {showRegenBox && (
            <div className="form-card">
              <h2>Why regenerate?</h2>
              <label>Leader feedback</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="e.g. Meena needs more time on API context; add peer teaching before analytics work."
              />
              <button
                className="btn pink"
                style={{ marginTop: 12 }}
                onClick={handleRegenerate}
                disabled={loading || !feedback.trim()}
              >
                {loading ? "REGENERATING..." : "REGENERATE SPRINT"}
              </button>{" "}
              <button className="btn paper" style={{ marginTop: 12 }} onClick={() => setShowRegenBox(false)}>
                CANCEL
              </button>
            </div>
          )}

          {approved && dbTasks.length > 0 && (
            <div className="panel" style={{ marginTop: 20 }}>
              <h3>TASK ACTIONS</h3>
              {dbTasks.map((t) => (
                <div key={t.id} style={{ border: "2px solid var(--ink)", padding: 12, marginTop: 10 }}>
                  <p style={{ fontWeight: 700 }}>{t.title}</p>
                  <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                    <button
                      className="btn paper"
                      onClick={() => setBlockingTask({ id: t.id, title: t.title })}
                    >
                      MARK BLOCKED
                    </button>
                    <button
                      className="btn paper"
                      onClick={() => setPlaceholderTaskId(placeholderTaskId === t.id ? null : t.id)}
                    >
                      {placeholderTaskId === t.id ? "HIDE PLACEHOLDER" : "GENERATE PLACEHOLDER"}
                    </button>
                  </div>

                  {placeholderTaskId === t.id && (
                    <PlaceholderBuilder
                      projectId="demo-project-id"
                      taskId={t.id}
                      taskTitle={t.title}
                      approvedByMemberId={t.assigneeId ?? ""}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <SprintChangeSuggestionBox projectId="demo-project-id" userId="demo-user-id" />

      {blockingTask && (
        <BlockTaskModal
          taskId={blockingTask.id}
          taskTitle={blockingTask.title}
          onClose={() => setBlockingTask(null)}
          onBlocked={() => setBlockingTask(null)}
        />
      )}
    </main>
  );
}