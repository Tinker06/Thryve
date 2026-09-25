import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/ui/useToast";
import Toast from "../components/ui/Toast";

export default function DeleteUser() {
  const navigate = useNavigate();
  const { toastMessage, showToast } = useToast();
  const [nameConfirm, setNameConfirm] = useState("");
  const [emailConfirm, setEmailConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const expectedName = "Vishal";
  const expectedEmail = "vishal@team.demo";

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (
      nameConfirm.trim().toLowerCase() !== expectedName.toLowerCase() ||
      emailConfirm.trim().toLowerCase() !== expectedEmail.toLowerCase()
    ) {
      setError("Name and email must exactly match the account you're requesting to delete.");
      return;
    }
    setSubmitting(true);
    try {
      // TODO: replace with Person 1's real call, e.g.
      // await requestDeleteUser({ name: nameConfirm, email: emailConfirm });
      await new Promise((r) => setTimeout(r, 500));
      showToast("Delete request sent to team lead ✓");
      setTimeout(() => navigate("/member-login"), 900);
    } catch {
      setError("Could not submit the delete request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="form-shell">
      <form className="form-card" onSubmit={handleRequest}>
        <div className="eyebrow">DELETE USER / DOUBLE CHECK</div>
        <h2>REMOVE A PERSON?</h2>
        <p><b>The account is not removed immediately.</b> A request is emailed to the team lead.</p>

        <label>Type the user name</label>
        <input value={nameConfirm} onChange={(e) => setNameConfirm(e.target.value)} placeholder="e.g. Vishal" />

        <label>Type the user email again</label>
        <input type="email" value={emailConfirm} onChange={(e) => setEmailConfirm(e.target.value)} placeholder="vishal@team.demo" />

        <div className="notice red">
          ⚠ Team-lead approval is required. The user remains active until approval.
        </div>

        {error && <div className="notice red">{error}</div>}

        <button className="btn red" type="submit" disabled={submitting}>
          {submitting ? "SENDING…" : "REQUEST DELETE"}
        </button>{" "}
        <button className="btn paper" type="button" onClick={() => navigate("/member-login")}>
          CANCEL
        </button>
      </form>
      <Toast message={toastMessage} />
    </div>
  );
}