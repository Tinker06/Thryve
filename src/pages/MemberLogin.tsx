import { useState } from "react";
import { Link } from "react-router-dom";
import { memberLogin } from "../lib/auth";

interface MemberLoginProps {
  onLogin: () => Promise<void> | void;
}

export default function MemberLogin({ onLogin }: MemberLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await memberLogin(email.trim(), password);
      await onLogin();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Login failed. Check your credentials."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="form-shell">
      <form className="form-card" onSubmit={handleLogin}>
        <div className="eyebrow">PROJECT LOGIN</div>
        <h2>WHO'S IN?</h2>

        <label>Member email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="member@example.com"
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <div className="notice red">{error}</div>}

        <button className="btn blue" type="submit" disabled={submitting}>
          {submitting ? "LOGGING IN..." : "LOGIN ↗"}
        </button>

        <div className="notice blue" style={{ marginTop: 16 }}>
          New users must be added and approved by the team lead before they
          can access the workspace.
        </div>

        <Link to="/">
          <button className="btn paper" type="button">
            BACK
          </button>
        </Link>
      </form>
    </div>
  );
}