import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function TeamSignup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    teamName: "",
    teamEmail: "",
    teamLeadName: "",
    teamLeadEmail: "",
    password: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [teamCode, setTeamCode] = useState("");

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setTeamCode("");

    if (
      !form.teamName.trim() ||
      !form.teamEmail.trim() ||
      !form.teamLeadName.trim() ||
      !form.teamLeadEmail.trim() ||
      !form.password
    ) {
      setError("Please fill in every field.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/.netlify/functions/team-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamName: form.teamName.trim(),
          teamEmail: form.teamEmail.trim(),
          teamLeadName: form.teamLeadName.trim(),
          teamLeadEmail: form.teamLeadEmail.trim(),
          password: form.password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Could not create team.");
      }

      setTeamCode(result.teamCode);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not create team."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (teamCode) {
    return (
      <div className="form-shell">
        <div className="form-card">
          <div className="eyebrow">TEAM CREATED / SUCCESS</div>
          <h2>WELCOME TO THRYVE.</h2>

          <div className="notice green">
            Your team was created successfully.
          </div>

          <div
            style={{
              border: "3px solid var(--ink)",
              padding: 20,
              marginTop: 18,
              background: "var(--yellow)",
            }}
          >
            <div className="eyebrow">YOUR TEAM CODE</div>
            <h2 style={{ margin: "8px 0", letterSpacing: 2 }}>
              {teamCode}
            </h2>
            <p>
              Save this code. Your team lead will use it together with the
              team email and password to log in.
            </p>
          </div>

          <button
            className="btn"
            style={{ marginTop: 18 }}
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
          value={form.teamLeadName}
          onChange={(e) => update("teamLeadName", e.target.value)}
          placeholder="Priya"
        />

        <label>Team lead email</label>
        <input
          type="email"
          value={form.teamLeadEmail}
          onChange={(e) => update("teamLeadEmail", e.target.value)}
          placeholder="priya@example.com"
        />

        <label>Password</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          placeholder="Create a secure password"
        />

        <div className="notice blue">
          A unique THRYVE team code will be generated automatically.
        </div>

        {error && <div className="notice red">{error}</div>}

        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? "CREATING..." : "CREATE TEAM →"}
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