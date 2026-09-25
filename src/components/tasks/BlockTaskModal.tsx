// src/components/tasks/BlockTaskModal.tsx
import { useState } from "react";
import { markTaskBlocked } from "../../lib/blockedTasks";

interface Props {
  taskId: string;
  taskTitle: string;
  onClose: () => void;
  onBlocked: () => void; // call this to refresh the task list in the parent
}

export default function BlockTaskModal({ taskId, taskTitle, onClose, onBlocked }: Props) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    const result = await markTaskBlocked({ taskId, reason });

    setSubmitting(false);

    if (!result.success) {
      setError(result.error ?? "Failed to mark task blocked.");
      return;
    }

    onBlocked();
    onClose();
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "var(--bg, #fff)",
          border: "2px solid var(--ink)",
          padding: 20,
          width: 380,
          maxWidth: "90vw",
        }}
      >
        <h3 style={{ marginTop: 0 }}>MARK BLOCKED</h3>
        <p style={{ fontSize: 13, fontWeight: 700 }}>{taskTitle}</p>

        <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginTop: 10 }}>
          Reason for being blocked
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Waiting on API auth docs from Priya"
          rows={4}
          style={{
            width: "100%",
            border: "2px solid var(--ink)",
            padding: 8,
            marginTop: 6,
            fontSize: 13,
            fontFamily: "inherit",
          }}
        />

        {error && (
          <p style={{ color: "var(--red, #b00020)", fontSize: 12, fontWeight: 700, marginTop: 8 }}>
            {error}
          </p>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button
            onClick={handleSubmit}
            disabled={submitting || reason.trim().length === 0}
            style={{
              fontWeight: 700,
              padding: "8px 16px",
              border: "2px solid var(--ink)",
              background: "var(--ink)",
              color: "var(--bg, #fff)",
              cursor: submitting ? "default" : "pointer",
              opacity: submitting || reason.trim().length === 0 ? 0.5 : 1,
            }}
          >
            {submitting ? "SUBMITTING…" : "CONFIRM BLOCKED"}
          </button>
          <button
            onClick={onClose}
            disabled={submitting}
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
        </div>
      </div>
    </div>
  );
}