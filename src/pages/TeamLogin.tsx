import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { teamLogin } from "../lib/functionsClient";
import { supabase } from "../lib/supabase";

export default function TeamLogin() {
  const navigate = useNavigate();
  const [teamEmail, setTeamEmail] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!teamEmail || !teamCode || !password) {
      setError("Fill in team email, team ID, and password.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await teamLogin({ teamEmail, teamCode, password });

      // team-login.ts only verifies the password server-side — it doesn't
      // create a browser session. We have to do that ourselves with the
      // tokens it hands back.
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: result.accessToken,
        refresh_token: result.refreshToken,
      });
      if (sessionError) throw sessionError;

      navigate("/team-workspace");
    } catch (err: any) {
      setError(err?.message ?? "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="form-shell">
      <form className="form-card" onSubmit={handleLogin}>
        <div className="eyebrow">TEAM WORKSPACE / 00</div>
        <h2>WELCOME, TEAM.</h2>
        <p><b>Team login is the top-level gate. Projects and members live inside this workspace.</b></p>

        <label>Team email</label>
        <input type="email" value={teamEmail} onChange={(e) => setTeamEmail(e.target.value)} placeholder="team@example.com" />

        <label>Team ID</label>
        <input value={teamCode} onChange={(e) => setTeamCode(e.target.value)} placeholder="THRYVE-XXXX" />

        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />

        {error && <div className="notice red">{error}</div>}

        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? "LOGGING IN…" : "LOGIN TO TEAM →"}
        </button>{" "}
        <Link to="/team-signup">
          <button className="btn pink" type="button">NEW TEAM SIGNUP +</button>
        </Link>
      </form>
    </div>
  );
}