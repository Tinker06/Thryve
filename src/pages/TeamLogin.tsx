import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface TeamLoginProps {
  onLogin: () => Promise<void> | void;
}

export default function TeamLogin({ onLogin }: TeamLoginProps) {
  const [teamEmail, setTeamEmail] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      // 1. Verify team email + team code with our backend.
      const response = await fetch("/.netlify/functions/team-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamEmail: teamEmail.trim(),
          teamCode: teamCode.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Invalid team credentials.");
      }

      // 2. Authenticate the actual team-lead Auth account
      // directly through Supabase Auth.
      const { error: authError } =
        await supabase.auth.signInWithPassword({
          email: result.teamLeadEmail,
          password,
        });

      if (authError) {
        throw new Error(authError.message);
      }

      // 3. Let App.tsx load the authenticated profile.
      await onLogin();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Login failed."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="form-shell">
      <form className="form-card" onSubmit={handleSubmit}>
        <div className="eyebrow">TEAM WORKSPACE / 00</div>

        <h2>WELCOME, TEAM.</h2>

        <p>
          Enter your team email, team code and team lead password.
        </p>

        <label>Team email</label>
        <input
          type="email"
          value={teamEmail}
          onChange={(e) => setTeamEmail(e.target.value)}
          placeholder="team@example.com"
          required
        />

        <label>Team code</label>
        <input
          value={teamCode}
          onChange={(e) => setTeamCode(e.target.value)}
          placeholder="THRYVE-8238"
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <div className="notice red">
            {error}
          </div>
        )}

        <button
          className="btn"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "LOGGING IN..." : "LOGIN TO TEAM →"}
        </button>

        <Link to="/team-signup">
          <button
            className="btn pink"
            type="button"
            style={{ marginTop: 10 }}
          >
            NEW TEAM SIGNUP +
          </button>
        </Link>
      </form>
    </div>
  );
}