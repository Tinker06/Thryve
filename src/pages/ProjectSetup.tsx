import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ProjectMember } from "../lib/uiTypes";

const blankMember = (): ProjectMember => ({
  id: crypto.randomUUID(),
  name: "",
  email: "",
  description: "",
  skills: "",
});

export default function ProjectSetup() {
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [memberCount, setMemberCount] = useState(4);
  const [members, setMembers] = useState<ProjectMember[]>(
    Array.from({ length: 4 }, blankMember)
  );
  const [submitting, setSubmitting] = useState(false);

  function changeMemberCount(n: number) {
    setMemberCount(n);
    setMembers((prev) => {
      const next = [...prev];
      while (next.length < n) next.push(blankMember());
      return next.slice(0, n);
    });
  }

  function updateMember(id: string, field: keyof ProjectMember, value: string) {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      // TODO: call Person 1's createProject(), then
      // Person 3's generateRoles({ project, members }) to get AI role suggestions.
      await new Promise((r) => setTimeout(r, 600));
      navigate("/projects");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="form-shell">
      <form className="form-card" onSubmit={handleSubmit}>
        <div className="eyebrow">PROJECT SETUP / 01</div>
        <h2>BUILD YOUR CREW.</h2>
        <p><b>Project description + member profiles feed the AI planning layer.</b></p>

        <label>Project name</label>
        <input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="StudySync AI" />

        <label>Project description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />

        <label>Number of members</label>
        <select value={memberCount} onChange={(e) => changeMemberCount(Number(e.target.value))}>
          {[3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>

        {members.map((member, index) => (
          <div key={member.id} style={{ border: "2px solid var(--ink)", padding: 14, background: "#fff8e8", marginTop: 12 }}>
            <b>MEMBER {String(index + 1).padStart(2, "0")}{index === 0 ? " — TEAM LEAD" : ""}</b>
            <div className="form-row">
              <div>
                <label>Name</label>
                <input value={member.name} onChange={(e) => updateMember(member.id, "name", e.target.value)} />
              </div>
              <div>
                <label>Email</label>
                <input value={member.email} onChange={(e) => updateMember(member.id, "email", e.target.value)} />
              </div>
            </div>
            <label>Personal description</label>
            <textarea
              style={{ minHeight: 65 }}
              value={member.description}
              onChange={(e) => updateMember(member.id, "description", e.target.value)}
              placeholder="What they enjoy building, what they want to learn..."
            />
            <label>Skills</label>
            <input
              value={member.skills}
              onChange={(e) => updateMember(member.id, "skills", e.target.value)}
              placeholder="Python, React, SQL..."
            />
          </div>
        ))}

        <div className="notice green">
          AI will propose roles + individual sprint timelines. The team lead
          must approve the generated sprint before it becomes published.
        </div>

        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? "ANALYZING…" : "CREATE PROJECT + ANALYZE TEAM →"}
        </button>
      </form>
    </div>
  );
}