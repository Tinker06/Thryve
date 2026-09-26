// src/components/tasks/PlaceholderBuilder.tsx
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { generatePlaceholder } from "../../lib/aiClient";
import type { PlaceholderResult } from "../../lib/aiClient";

interface Props {
  projectId: string;
  taskId: string;
  taskTitle: string;
  approvedByMemberId: string; // whoever is logged in / viewing this task
}

export default function PlaceholderBuilder({ projectId, taskId, taskTitle, approvedByMemberId }: Props) {
  const [scaffold, setScaffold] = useState<PlaceholderResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setScaffold(null);
    setSaved(false);

    const res = await generatePlaceholder(projectId, taskId);

    setLoading(false);

    if (!res.success || !res.data) {
      setError(res.error ?? "AI temporarily unavailable. Placeholder generation could not be completed.");
      return;
    }

    setScaffold(res.data);
  }

  function handleCancel() {
    setScaffold(null);
    setError(null);
    setSaved(false);
  }

  async function handleApprove() {
    if (!scaffold) return;

    try {
      const { error: insertErr } = await supabase.from("placeholder_scaffolds").insert({
        project_id: projectId,
        task_id: taskId,
        language: scaffold.language,
        filename: scaffold.filename,
        code: scaffold.code,
        explanation: scaffold.explanation,
        todo_markers: scaffold.todoMarkers,
        source_context: scaffold.sourceContext,
        approved_by: approvedByMemberId,
      });

      if (insertErr) throw insertErr;

      setSaved(true);
    } catch (err: any) {
      setError(err.message ?? "Failed to save approved scaffold.");
    }
  }

  async function handleCopy() {
    if (!scaffold) return;
    try {
      await navigator.clipboard.writeText(scaffold.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy to clipboard — select and copy manually.");
    }
  }

  return (
    <div className="panel">
      <h3>AI PLACEHOLDER BUILDER</h3>
      <p style={{ fontSize: 13, fontWeight: 700 }}>{taskTitle}</p>

      {!scaffold && !loading && (
        <button
          onClick={handleGenerate}
          style={{
            marginTop: 10,
            fontWeight: 700,
            padding: "8px 16px",
            border: "2px solid var(--ink)",
            background: "var(--ink)",
            color: "var(--bg, #fff)",
            cursor: "pointer",
          }}
        >
          GENERATE PLACEHOLDER CODE
        </button>
      )}

      {loading && <p style={{ fontSize: 13, fontWeight: 700, marginTop: 10 }}>Generating scaffold…</p>}

      {error && (
        <p style={{ color: "var(--red, #b00020)", fontSize: 12, fontWeight: 700, marginTop: 10 }}>
          {error}
        </p>
      )}

      {scaffold && (
        <div style={{ marginTop: 14, border: "2px solid var(--ink)", padding: 14 }}>
          {/* Mandatory label per Phase 11 spec — never let this read as finished code */}
          <div
            style={{
              display: "inline-block",
              background: "var(--pink2, #ffd7e0)",
              border: "2px solid var(--ink)",
              padding: "4px 10px",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 0.5,
            }}
          >
            AI-GENERATED SCAFFOLD — NOT PRODUCTION CODE
          </div>

          <p style={{ fontSize: 13, fontWeight: 700, marginTop: 10 }}>
            {scaffold.filename} · {scaffold.language}
          </p>

          <pre
            style={{
              background: "#0d0d0d",
              color: "#e6e6e6",
              padding: 12,
              overflowX: "auto",
              fontSize: 12,
              marginTop: 8,
              maxHeight: 320,
            }}
          >
            <code>{scaffold.code}</code>
          </pre>

          {scaffold.explanation && (
            <p style={{ fontSize: 13, marginTop: 10 }}>
              <strong>Explanation:</strong> {scaffold.explanation}
            </p>
          )}

          {scaffold.todoMarkers && scaffold.todoMarkers.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <strong style={{ fontSize: 13 }}>TODOs left for you:</strong>
              <ul style={{ fontSize: 13, paddingLeft: 18, marginTop: 4 }}>
                {scaffold.todoMarkers.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          )}

          {scaffold.sourceContext && scaffold.sourceContext.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <strong style={{ fontSize: 13 }}>Based on:</strong>
              <ul style={{ fontSize: 12, paddingLeft: 18, marginTop: 4, opacity: 0.8 }}>
                {scaffold.sourceContext.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            {!saved ? (
              <>
                <button
                  onClick={handleApprove}
                  style={{
                    fontWeight: 700,
                    padding: "8px 16px",
                    border: "2px solid var(--ink)",
                    background: "var(--ink)",
                    color: "var(--bg, #fff)",
                    cursor: "pointer",
                  }}
                >
                  APPROVE SCAFFOLD
                </button>
                <button
                  onClick={handleCancel}
                  style={{
                    fontWeight: 700,
                    padding: "8px 16px",
                    border: "2px solid var(--ink)",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                >
                  CANCEL
                </button>
              </>
            ) : (
              <>
                <span
                  style={{
                    fontWeight: 700,
                    padding: "8px 16px",
                    border: "2px solid var(--ink)",
                    background: "var(--green, #cdeecb)",
                  }}
                >
                  SAVED ✓
                </span>
                <button
                  onClick={handleCopy}
                  style={{
                    fontWeight: 700,
                    padding: "8px 16px",
                    border: "2px solid var(--ink)",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                >
                  {copied ? "COPIED ✓" : "COPY CODE"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}