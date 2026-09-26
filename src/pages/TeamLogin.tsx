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

      const { error: authError } =
        await supabase.auth.signInWithPassword({
          email: result.teamLeadEmail,
          password,
        });

      if (authError) {
        throw new Error(authError.message);
      }

      await onLogin();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed."
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

        <label>Team email</label>
        <input
          type="email"
          value={teamEmail}
          onChange={(e) => setTeamEmail(e.target.value)}
          required
        />

        <label>Team code</label>
        <input
          value={teamCode}
          onChange={(e) => setTeamCode(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <div className="notice red">{error}</div>}

        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? "LOGGING IN..." : "LOGIN TO TEAM →"}
        </button>

        <Link to="/team-signup">
          <button className="btn pink" type="button">
            NEW TEAM SIGNUP +
          </button>
        </Link>
      </form>
    </div>
  );
}