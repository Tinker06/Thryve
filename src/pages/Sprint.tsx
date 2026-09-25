// src/pages/Sprint.tsx
import { useState } from "react";
import {
  generateSprint,
  regenerateSprint,
  type SprintPlan,
  type SprintTask,
} from "../lib/aiClient";
import SprintChangeSuggestionBox from "../components/SprintChangeSuggestion";

const STATUS_COLOR: Record<SprintTask["status"], string> = {
  DONE: "#a9d968",
  PENDING: "#fff8e8",
  AT_RISK: "#f7dd58",
  LATE: "#ef7777",
};

export default function SprintPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sprint, setSprint] = useState<SprintPlan | null>(null);
  const [rawResult, setRawResult] = useState<unknown>(null);
  const [approved, setApproved] = useState(false);
  const [showRegenBox, setShowRegenBox] = useState(false);
  const [feedback, setFeedback] = useState("");

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
              <button className="btn teal" style={{ marginTop: 10 }} onClick={() => setApproved(true)}>
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
           
        </>
      )}<SprintChangeSuggestionBox projectId="demo-project-id" userId="demo-user-id" />
    </main>
  );
}