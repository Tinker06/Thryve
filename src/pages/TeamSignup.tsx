import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { teamSignup } from "../lib/functionsClient";

export default function TeamSignup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    teamName: "",
    teamEmail: "",
    leadName: "",
    leadEmail: "",
    password: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (
      !form.teamName ||
      !form.teamEmail ||
      !form.leadName ||
      !form.leadEmail ||
      !form.password
    ) {
      setError("Please fill in every field.");
      return;
    }

    setSubmitting(true);

    try {
      const result = await teamSignup({
        teamName: form.teamName,
        teamEmail: form.teamEmail,
        teamLeadName: form.leadName,
        teamLeadEmail: form.leadEmail,
        password: form.password,
      });

      setCreatedCode(result.teamCode);
    } catch (err: any) {
      setError(err?.message ?? "Could not create team. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (createdCode) {
    return (
      <div className="form-shell">
        <div className="form-card">
          <div className="eyebrow">TEAM CREATED</div>
          <h2>YOU'RE IN.</h2>

          <div className="notice green">
            <b>Your Team ID: {createdCode}</b>
            <br />
            Save this — you'll need it every time you log in, along with the
            team email and password.
          </div>

          <button
            className="btn"
            onClick={() => navigate("/team-login")}
          >
            GO TO TEAM LOGIN →
          </button>
        </div>
      </div>
    );
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

        <label>Team lead email</label>
        <input
          type="email"
          value={form.leadEmail}
          onChange={(e) => update("leadEmail", e.target.value)}
          placeholder="priya@example.com"
        />

        <p className="small">
          This is the account you'll actually log in with — it can be the same
          as the team email or different.
        </p>

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
          <button className="btn paper" type="button">
            ALREADY HAVE A TEAM?
          </button>
        </Link>
      </form>
    </div>
  );
}