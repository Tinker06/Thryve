import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { memberLogin } from "../lib/auth";

export default function MemberLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Enter both email and password.");
      return;
    }
    setSubmitting(true);
    try {
      await memberLogin(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.message ?? "Login failed. Check your email and password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="form-shell">
      <form className="form-card" onSubmit={handleLogin}>
        <div className="eyebrow">STUDYSYNC / PROJECT LOGIN</div>
        <h2>WHO'S IN?</h2>
        <p>Members log into the selected project. A first-time temporary password can be changed after login.</p>

        <label>Member email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="lead@team.demo" />

        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />

        <div className="notice blue">
          First login? Use the random password sent to your email, then change
          it from Profile → Security.
        </div>

        {error && <div className="notice red">{error}</div>}

        <button className="btn blue" type="submit" disabled={submitting}>
          {submitting ? "LOGGING IN…" : "LOGIN ↗"}
        </button>

        <div className="choice-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <Link to="/user-signup" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="choice">
              <span className="tag teal">ADD USER</span>
              <h3>Add</h3>
              <p>General signup + lead approval.</p>
            </div>
          </Link>
          <Link to="/delete-user" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="choice">
              <span className="tag pink">DELETE</span>
              <h3>Delete user</h3>
              <p>Double-check identity, then request lead approval.</p>
            </div>
          </Link>
        </div>
      </form>
    </div>
  );
}