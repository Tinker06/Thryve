import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function TeamSignup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    teamName: "",
    teamEmail: "",
    leadName: "",
    numUsers: "4",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.teamName || !form.teamEmail || !form.leadName || !form.password) {
      setError("Please fill in every field.");
      return;
    }
    setSubmitting(true);
    try {
      // TODO: replace with Person 1's real call, e.g.
      // const team = await createTeam(form);
      await new Promise((r) => setTimeout(r, 500)); // placeholder delay
      navigate("/team-workspace");
    } catch (err) {
      setError("Could not create team. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="form-shell">
      <form className="form-card" onSubmit={handleSubmit}>
        <div className="eyebrow">TEAM SIGNUP / 00A</div>
        <h2>CREATE THE TEAM.</h2>

        <label>Team name</label>
        <input
          value={form.teamName}
          onChange={(e) => update("teamName", e.target.value)}
          placeholder="StudySync"
        />

        <label>Team email</label>
        <input
          type="email"
          value={form.teamEmail}
          onChange={(e) => update("teamEmail", e.target.value)}
          placeholder="team@example.com"
        />

        <label>Team lead name</label>
        <input
          value={form.leadName}
          onChange={(e) => update("leadName", e.target.value)}
          placeholder="Priya"
        />

        <label>Number of users</label>
        <select value={form.numUsers} onChange={(e) => update("numUsers", e.target.value)}>
          {[3, 4, 5, 6, 7].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>

        <label>Team password</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          placeholder="Create a secure password"
        />

        <div className="notice blue">
          The team email is the approval channel. New user signups, additions,
          deletions and share approvals notify the team lead.
        </div>

        {error && <div className="notice red">{error}</div>}

        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? "CREATING…" : "CREATE TEAM →"}
        </button>{" "}
        <Link to="/team-login">
          <button className="btn paper" type="button">ALREADY HAVE A TEAM?</button>
        </Link>
      </form>
    </div>
  );
}