import { useState } from "react";
import { Link } from "react-router-dom";

interface ApprovalItem {
  id: string;
  kind: "new_user" | "delete_user" | "document_share";
  title: string;
  detail: string;
}

const initialApprovals: ApprovalItem[] = [
  {
    id: "a1",
    kind: "new_user",
    title: "NEW USER: Kavya",
    detail: "kavya@team.demo — AI suggests Data / AI based on her profile.",
  },
  {
    id: "a2",
    kind: "delete_user",
    title: "DELETE USER: Vishal",
    detail: "vishal@team.demo — requester typed the name + email twice.",
  },
  {
    id: "a3",
    kind: "document_share",
    title: "DOCUMENT SHARE",
    detail: "Meena requested API_Spec_v2.pdf from Priya.",
  },
];

export default function TeamWorkspace() {
  const [approvals, setApprovals] = useState(initialApprovals);
  const [toast, setToast] = useState("");

  function resolve(id: string, message: string) {
    // TODO: call Person 1's API to persist the approval/rejection
    setApprovals((prev) => prev.filter((a) => a.id !== id));
    showToast(message);
  }

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(""), 2800);
  }

  return (
    <section>
      <div className="section-head">
        <div>
          <div className="eyebrow">TEAM CONTROL PANEL</div>
          <h2>CHOOSE YOUR MOVE.</h2>
        </div>
        <span className="pill">4 USERS / 2 PROJECTS</span>
      </div>

      {approvals.length > 0 && (
        <div className="notice green">
          ✓ Team lead inbox: <b>{approvals.length} requests waiting</b>
        </div>
      )}

      <div className="choice-grid">
        <Link to="/projects" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="choice">
            <span className="tag">PROJECTS</span>
            <h3>Create / choose project</h3>
            <p>Choose an existing project or create a new one with name, description and member count.</p>
          </div>
        </Link>
        <Link to="/user-signup" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="choice">
            <span className="tag teal">ADD USER</span>
            <h3>New user signup</h3>
            <p>Collect email + personalisation. A random temporary password is emailed.</p>
          </div>
        </Link>
        <Link to="/member-login" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="choice">
            <span className="tag pink">PROJECT LOGIN</span>
            <h3>Enter a project</h3>
            <p>Members log in separately once a project has been selected.</p>
          </div>
        </Link>
      </div>

      <div className="panel" style={{ marginTop: 20, padding: 20 }}>
        <h3 style={{ fontFamily: "Georgia, serif", fontSize: 30, margin: "0 0 14px" }}>
          LEAD APPROVAL QUEUE
        </h3>

        {approvals.length === 0 && <p>No pending requests.</p>}

        {approvals.map((item) => (
          <div
            key={item.id}
            style={{ border: "2px solid var(--ink)", padding: 12, background: "#d6e5ff", marginTop: 10 }}
          >
            <b>{item.title}</b>
            <br />
            <small>{item.detail}</small>
            <br />
            {item.kind === "new_user" && (
              <>
                <button className="btn" onClick={() => resolve(item.id, "User approved ✓")}>APPROVE</button>{" "}
                <button className="btn paper" onClick={() => resolve(item.id, "User request rejected")}>REJECT</button>
              </>
            )}
            {item.kind === "delete_user" && (
              <>
                <button className="btn red" onClick={() => resolve(item.id, "Deletion approved ✓")}>APPROVE DELETE</button>{" "}
                <button className="btn paper" onClick={() => resolve(item.id, "Deletion cancelled")}>KEEP USER</button>
              </>
            )}
            {item.kind === "document_share" && (
              <>
                <button className="btn teal" onClick={() => resolve(item.id, "Document automatically shared ✓")}>APPROVE & AUTO-SHARE</button>{" "}
                <button className="btn paper" onClick={() => resolve(item.id, "Share request denied")}>DENY</button>
              </>
            )}
          </div>
        ))}
      </div>

      {toast && (
        <div
          style={{
            position: "fixed",
            right: 22,
            bottom: 22,
            border: "3px solid var(--ink)",
            background: "var(--yellow)",
            boxShadow: "var(--shadow-sm)",
            padding: 15,
            fontWeight: 1000,
            maxWidth: 420,
            zIndex: 80,
          }}
        >
          {toast}
        </div>
      )}
    </section>
  );
}