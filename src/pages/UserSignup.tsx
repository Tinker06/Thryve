import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/ui/useToast";
import Toast from "../components/ui/Toast";

export default function UserSignup() {
  const navigate = useNavigate();
  const { toastMessage, showToast } = useToast();
  const [form, setForm] = useState({
    email: "",
    fullName: "",
    description: "",
    skills: "",
    learningStyle: "Hands-on / examples",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.email || !form.fullName) {
      setError("Email and full name are required.");
      return;
    }
    setSubmitting(true);
    try {
      // TODO: replace with Person 1's real call, e.g.
      // await inviteMember(form);
      await new Promise((r) => setTimeout(r, 500));
      showToast("Random password emailed + team lead notified ✓");
      setTimeout(() => navigate("/member-login"), 900);
    } catch {
      setError("Could not send invite. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="form-shell">
      <form className="form-card" onSubmit={handleSubmit}>
        <div className="eyebrow">GENERAL USER SIGNUP / APPROVAL REQUIRED</div>
        <h2>ADD A PERSON.</h2>
        <p>Every new user gets a random temporary password by email. The team lead is notified before activation.</p>

        <label>User email *</label>
        <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="kavya@team.demo" />

        <label>Full name</label>
        <input value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Kavya Raman" />

        <label>Personal description / learning profile</label>
        <textarea
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Interested in Python, machine learning and data analysis..."
        />

        <label>Optional skills</label>
        <input value={form.skills} onChange={(e) => update("skills", e.target.value)} placeholder="Python, ML, SQL, Data Analysis" />

        <label>Preferred learning style (optional)</label>
        <select value={form.learningStyle} onChange={(e) => update("learningStyle", e.target.value)}>
          <option>Hands-on / examples</option>
          <option>Visual</option>
          <option>Discussion first</option>
          <option>Independent</option>
        </select>

        <div className="notice pink">
          AI uses the profile + skills to recommend a role. The leader can
          accept, edit or manually assign it.
        </div>

        {error && <div className="notice red">{error}</div>}

        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? "SENDING…" : "SEND INVITE →"}
        </button>{" "}
        <button className="btn paper" type="button" onClick={() => navigate("/team-workspace")}>
          CANCEL
        </button>
      </form>
      <Toast message={toastMessage} />
    </div>
  );
}