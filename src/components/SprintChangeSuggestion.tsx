// src/components/SprintChangeSuggestion.tsx
import { useState } from "react";
import { suggestSprintChange, type SprintChangeSuggestion } from "../lib/aiClient";

interface Props {
  projectId: string;
  userId: string;
}

export default function SprintChangeSuggestionBox({ projectId, userId }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<SprintChangeSuggestion | null>(null);
  const [rawResult, setRawResult] = useState<unknown>(null);
  const [applied, setApplied] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  function isRealSuggestion(data: unknown): data is SprintChangeSuggestion {
    return (
      !!data &&
      typeof data === "object" &&
      "reason" in data &&
      "suggestedChange" in data
    );
  }

  async function handleAsk() {
    setLoading(true);
    setError(null);
    setApplied(false);
    setDismissed(false);

    const res = await suggestSprintChange(projectId, userId);
    setLoading(false);

    if (!res.success) {
      setError(res.error || "AI temporarily unavailable.");
      return;
    }

    if (isRealSuggestion(res.data)) {
      setSuggestion(res.data);
      setRawResult(null);
    } else {
      setRawResult(res.data);
      setSuggestion(null);
    }
  }

  if (dismissed) return null;

  return (
    <div className="form-card">
      <h2>Detailed sprint suggestion</h2>
      <p>AI reviews recent chat, current progress, and blocked state — then proposes a change to the published sprint. Nothing changes until you approve it.</p>

      <button className="btn pink" onClick={handleAsk} disabled={loading}>
        {loading ? "ANALYZING..." : "ASK AI FOR SPRINT SUGGESTION"}
      </button>

      {error && <div className="notice red">{error}</div>}

      {rawResult != null && (
        <div className="notice blue">
          <b>Stub mode — wiring confirmed ✓</b>
          <p>AI_ENDPOINT is still pointed at ai-stub, so this isn't a real suggestion yet. Raw response below:</p>
          <pre className="raw">{JSON.stringify(rawResult, null, 2)}</pre>
        </div>
      )}

      {suggestion && !applied && (
        <div className="notice" style={{ background: "#d6e5ff" }}>
          <b>REASON</b>
          <p>{suggestion.reason}</p>
          <b>SUGGESTED CHANGE</b>
          <p>{suggestion.suggestedChange}</p>
          <p style={{ fontSize: 12 }}>{suggestion.details}</p>

          <div className="notice blue" style={{ marginTop: 10 }}>
            The published sprint stays unchanged until <b>you approve</b>.
          </div>

          <button className="btn teal" onClick={() => setApplied(true)}>
            APPLY CHANGE
          </button>{" "}
          <button className="btn paper" onClick={() => setDismissed(true)}>
            KEEP CURRENT
          </button>
        </div>
      )}

      {applied && (
        <div className="notice" style={{ background: "#a9d968" }}>
          <b>Detailed sprint approved ✓</b> Published sprint updated.
        </div>
      )}
    </div>
  );
}