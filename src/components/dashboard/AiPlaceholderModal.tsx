import { useEffect, useState } from "react";
import { generatePlaceholder } from "../../lib/aiClient";
import type { PlaceholderResult } from "../../lib/aiClient";

interface AiPlaceholderModalProps {
  open: boolean;
  projectId: string;
  taskId: string | null;
  onClose: () => void;
  onApprove: () => void;
}

export default function AiPlaceholderModal({ open, projectId, taskId, onClose, onApprove }: AiPlaceholderModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scaffold, setScaffold] = useState<PlaceholderResult | null>(null);

  useEffect(() => {
    if (!open || !taskId) return;

    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      setScaffold(null);
      const result = await generatePlaceholder(projectId, taskId!);
      if (cancelled) return;
      if (result.success && result.data) {
        setScaffold(result.data);
      } else {
        setError(result.error ?? "AI temporarily unavailable.");
      }
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [open, taskId, projectId]);

  return (
    <div className={`modal ${open ? "show" : ""}`} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card">
        <div className="eyebrow">AI PLACEHOLDER / AUTHORIZED CONTEXT</div>
        <h3>GENERATE A SAFE SCAFFOLD.</h3>

        {loading && <p>Generating scaffold from authorized project context…</p>}

        {error && <div className="notice red">{error}</div>}

        {!loading && !error && scaffold && (
          <>
            <p>File: <b>{scaffold.filename}</b> ({scaffold.language})</p>
            {scaffold.sourceContext.length > 0 && (
              <p className="small">Context used: {scaffold.sourceContext.join(", ")}</p>
            )}
            {scaffold.explanation && <div className="notice blue">{scaffold.explanation}</div>}
            <div className="notice pink">
              <b>AI-GENERATED SCAFFOLD</b> — a starting point, not finished production code.
            </div>
            <pre style={{ border: "2px solid var(--ink)", background: "#fffdf2", padding: 14, overflow: "auto", fontSize: 12 }}>
              {scaffold.code}
            </pre>
            {scaffold.todoMarkers.length > 0 && (
              <ul className="list">
                {scaffold.todoMarkers.map((todo, i) => <li key={i}>{todo}</li>)}
              </ul>
            )}
          </>
        )}

        <button className="btn pink" disabled={loading || !scaffold} onClick={() => { onApprove(); onClose(); }}>
          APPROVE SCAFFOLD
        </button>{" "}
        <button className="btn paper" onClick={onClose}>CANCEL</button>
      </div>
    </div>
  );
}