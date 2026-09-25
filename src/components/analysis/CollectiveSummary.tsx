// src/components/analysis/CollectiveSummary.tsx
import { useEffect, useState } from "react";
import { analyzeProject } from "../../lib/aiClient";
import type { ProjectAnalysis } from "../../lib/aiClient";

interface Props {
  projectId: string;
  // Computed from real Analysis.tsx data — used ONLY if the AI call fails,
  // so the panel never shows nothing or crashes (Phase 14).
  fallbackLines: string[];
}

export default function CollectiveSummary({ projectId, fallbackLines }: Props) {
  const [analysis, setAnalysis] = useState<ProjectAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiUnavailable, setAiUnavailable] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setAiUnavailable(false);

      const res = await analyzeProject(projectId);

      if (cancelled) return;

      if (res.success && res.data && res.data.summary) {
        setAnalysis(res.data);
      } else {
        setAiUnavailable(true);
        setAnalysis(null);
      }

      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  return (
    <div className="panel">
      <h3>COLLECTIVE SUMMARY</h3>

      {loading && <p style={{ fontSize: 13, fontWeight: 700 }}>Generating summary…</p>}

      {!loading && aiUnavailable && (
        <>
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--red, #b00020)", marginBottom: 8 }}>
            AI temporarily unavailable — showing a computed summary instead.
          </p>
          <ul style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.6, paddingLeft: 18 }}>
            {fallbackLines.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </>
      )}

      {!loading && !aiUnavailable && analysis && (
        <>
          <p style={{ fontSize: 13, lineHeight: 1.6 }}>{analysis.summary}</p>

          {analysis.risks && analysis.risks.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <strong style={{ fontSize: 13 }}>Risks identified:</strong>
              <ul style={{ fontSize: 13, paddingLeft: 18, marginTop: 4 }}>
                {analysis.risks.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.knowledgeGaps && analysis.knowledgeGaps.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <strong style={{ fontSize: 13 }}>AI-detected knowledge gaps:</strong>
              <ul style={{ fontSize: 13, paddingLeft: 18, marginTop: 4 }}>
                {analysis.knowledgeGaps.map((g, i) => (
                  <li key={i}>
                    <strong>{g.topic}</strong> — {g.evidence} → {g.recommendation}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}