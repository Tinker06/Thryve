import { Link } from "react-router-dom";
import { useState } from "react";
import { useToast } from "../components/ui/useToast";
import Toast from "../components/ui/Toast";

interface InboxItem {
  id: string;
  requester: string;
  item: string;
  reason: string;
  resolved: boolean;
}

const initialInbox: InboxItem[] = [
  { id: "r1", requester: "Meena", item: "analyzer.py", reason: "connect knowledge metrics to the analytics page.", resolved: false },
  { id: "r2", requester: "Arun", item: "API_Spec_v2.pdf", reason: "finish frontend API integration.", resolved: false },
];

export default function Requests() {
  const { toastMessage, showToast } = useToast();
  const [inbox, setInbox] = useState<InboxItem[]>(initialInbox);

  function approve(id: string) {
    const target = inbox.find((i) => i.id === id);
    if (!target) return;
    // TODO: call Person 1's approveWorkRequest(id)
    setInbox((prev) => prev.map((i) => (i.id === id ? { ...i, resolved: true } : i)));
    showToast(`${target.requester} approved ✓ AI automatically shared ${target.item} with them`);
  }

  return (
    <section>
      <div className="section-head">
        <div>
          <div className="eyebrow">COLLABORATION REQUESTS</div>
          <h2>REQUESTS.</h2>
          <p>Ask teammates for completed work you need for your integration, or approve incoming document/work requests.</p>
        </div>
        <Link to="/documents"><button className="btn">+ NEW WORK REQUEST</button></Link>
      </div>

      <div className="grid">
        <div className="card">
          <span className="tag blue">WORK REQUEST</span>
          <h3>Priya → Arun</h3>
          <p>Need <b>frontend-build / API integration code</b> for analytics integration.</p>
          <button className="btn teal" onClick={() => showToast("Request sent to Arun ✓")}>REQUEST SENT</button>
        </div>
        <div className="card">
          <span className="tag pink">DOCUMENT</span>
          <h3>Meena → Priya</h3>
          <p>Request: <b>API_Spec_v2.pdf</b></p>
          <button className="btn teal" onClick={() => showToast("Approved. AI automatically shared API_Spec_v2.pdf with Meena ✓")}>
            APPROVE & AUTO-SHARE
          </button>
        </div>
        <div className="card">
          <span className="tag green">COMPLETED</span>
          <h3>Vishal → Team</h3>
          <p>Testing checklist is completed and ready for the integration team.</p>
          <button className="btn paper" onClick={() => showToast("Completed work marked available ✓")}>VIEW WORK</button>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 18 }}>
        <h3>REQUEST INBOX</h3>
        {inbox.map((req) => (
          <div key={req.id} className={`task ${req.resolved ? "done" : "pending"}`}>
            <div>
              <b>{req.requester} requests {req.item}</b>
              <br />
              <span className="small">Reason: {req.reason}</span>
            </div>
            {req.resolved ? (
              <span className="status">SHARED ✓</span>
            ) : (
              <button className="btn teal" onClick={() => approve(req.id)}>APPROVE & SHARE</button>
            )}
          </div>
        ))}
        <div className="task blocked">
          <div>
            <b>Priya is waiting on frontend-build</b>
            <br />
            <span className="small">Integration dependency • teammate notified.</span>
          </div>
          <span className="status">WAITING</span>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 18 }}>
        <h3>WHAT GETS NOTIFIED?</h3>
        <div className="three-col" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          <div className="kpi"><b>WORK REQUEST</b><br /><span className="small">Target teammate gets an in-app + project notification</span></div>
          <div className="kpi"><b>SHARE APPROVAL</b><br /><span className="small">Owner approves; AI grants access automatically</span></div>
          <div className="kpi"><b>BLOCKED / LATE</b><br /><span className="small">Whole project team receives a collaboration alert</span></div>
        </div>
      </div>

      <Toast message={toastMessage} />
    </section>
  );
}