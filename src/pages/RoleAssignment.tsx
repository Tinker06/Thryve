// src/pages/RoleAssignment.tsx
import { useState } from "react";
import {
  generateRoles,
  type ProjectMemberInput,
  type RoleAssignment,
} from "../lib/aiClient";

export default function RoleAssignmentPage() {
  const [projectDescription, setProjectDescription] = useState("");
  const [members, setMembers] = useState<ProjectMemberInput[]>([
    { name: "", personalDescription: "", skills: [], learningStyle: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawResult, setRawResult] = useState<unknown>(null);
  const [roles, setRoles] = useState<RoleAssignment[] | null>(null);

  function updateMember(index: number, field: keyof ProjectMemberInput, value: string) {
    setMembers((prev) => {
      const next = [...prev];
      if (field === "skills") {
        next[index] = { ...next[index], skills: value.split(",").map((s) => s.trim()) };
      } else {
        next[index] = { ...next[index], [field]: value };
      }
      return next;
    });
  }

  function addMember() {
    setMembers((prev) => [
      ...prev,
      { name: "", personalDescription: "", skills: [], learningStyle: "" },
    ]);
  }

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setRoles(null);
    setRawResult(null);

    const res = await generateRoles("demo-project-id", projectDescription, members);

    setLoading(false);

    if (!res.success) {
      setError(res.error || "AI temporarily unavailable.");
      return;
    }

    // While AI_ENDPOINT still points at ai-stub, res.data won't be a real
    // RoleAssignment[] array — it'll be the stub echo object. Handle both
    // so the page never crashes, and so you can SEE the wiring worked.
    if (Array.isArray(res.data)) {
      setRoles(res.data as RoleAssignment[]);
    } else {
      setRawResult(res.data);
    }
  }

  return (
    <main className="main">
      <div className="section-head">
        <div>
          <h2>WHO SHOULD DO WHAT?</h2>
          <p>Describe the project and your team. AI will suggest a role for each member — nothing is assigned until the leader approves.</p>
        </div>
      </div>

      <div className="form-card">
        <h2>Project</h2>
        <label>Project description</label>
        <textarea
          value={projectDescription}
          onChange={(e) => setProjectDescription(e.target.value)}
          placeholder="What are you building, and what does it need to do?"
        />

        <label style={{ marginTop: 24 }}>Members</label>
        {members.map((m, i) => (
          <div className="member" key={i}>
            <label>Name</label>
            <input
              value={m.name}
              onChange={(e) => updateMember(i, "name", e.target.value)}
              placeholder="e.g. Priya"
            />
            <label>Personal description</label>
            <textarea
              value={m.personalDescription}
              onChange={(e) => updateMember(i, "personalDescription", e.target.value)}
              placeholder="What are they good at? How do they like to work?"
            />
            <label>Skills (comma separated)</label>
            <input
              value={m.skills.join(", ")}
              onChange={(e) => updateMember(i, "skills", e.target.value)}
              placeholder="React, Python, UI design"
            />
            <label>Learning style</label>
            <input
              value={m.learningStyle}
              onChange={(e) => updateMember(i, "learningStyle", e.target.value)}
              placeholder="e.g. hands-on, reads docs first"
            />
          </div>
        ))}

        <button className="btn paper" style={{ marginTop: 14 }} onClick={addMember}>
          + ADD MEMBER
        </button>
        <br />
        <button
          className="btn pink"
          style={{ marginTop: 14 }}
          onClick={handleGenerate}
          disabled={loading || !projectDescription.trim()}
        >
          {loading ? "GENERATING..." : "GENERATE ROLES"}
        </button>
      </div>

      {error && <div className="notice red">{error}</div>}

      {rawResult != null && (
        <div className="notice blue">
          <b>Stub mode — wiring confirmed ✓</b>
          <p>AI_ENDPOINT is still pointed at ai-stub, so this isn't a real role suggestion yet. Raw response below:</p>
          <pre className="raw">{JSON.stringify(rawResult, null, 2)}</pre>
        </div>
      )}

      {roles && (
        <div className="grid" style={{ marginTop: 20 }}>
          {roles.map((r, i) => (
            <div className="card" key={i}>
              <span className="tag">{r.member}</span>
              <h3>{r.recommendedRole}</h3>
              <p>{r.reason}</p>
              <button className="btn teal">ACCEPT</button>{" "}
              <button className="btn paper">EDIT</button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}