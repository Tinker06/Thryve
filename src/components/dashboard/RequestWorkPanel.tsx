import { useState } from "react";

interface RequestWorkPanelProps {
  onNotify: (message: string) => void;
}

const teammates = ["Arun — Frontend", "Meena — Analytics", "Vishal — QA / DevOps"];

export default function RequestWorkPanel({ onNotify }: RequestWorkPanelProps) {
  const [person, setPerson] = useState(teammates[0]);
  const [item, setItem] = useState("frontend-build / API integration code");
  const [reason, setReason] = useState(
    "I need the completed API integration module to connect it with the analytics dashboard."
  );
  const [sentRequests, setSentRequests] = useState<string[]>([
    "Arun has a completed frontend-build ready to share.",
  ]);

  function sendRequest() {
    if (!item.trim()) {
      onNotify("Enter the completed work you need first");
      return;
    }
    // TODO: call Person 1's sendWorkRequest({ toMember: person, item, reason })
    const name = person.split(" — ")[0];
    setSentRequests((prev) => [`${item} • ${reason}`, ...prev]);
    onNotify(`Work request sent to ${name} ✓`);
  }

  return (
    <div className="panel request-card">
      <h3>REQUEST COMPLETED WORK</h3>
      <p className="request-meta">
        Need work a teammate has already finished for your integration? Send a
        targeted request and the teammate gets an in-app project notification.
      </p>

      <div className="form-row">
        <div>
          <label>Teammate</label>
          <select value={person} onChange={(e) => setPerson(e.target.value)}>
            {teammates.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label>Completed work needed</label>
          <input value={item} onChange={(e) => setItem(e.target.value)} />
        </div>
      </div>

      <label>Integration reason</label>
      <textarea value={reason} onChange={(e) => setReason(e.target.value)} />

      <button className="btn teal" onClick={sendRequest}>SEND REQUEST TO TEAMMATE</button>

      <div className="request-status">
        {sentRequests.map((r, i) => (
          <div key={i}><span className="chip">{i === 0 ? "EXAMPLE" : "SENT"}</span> {r}</div>
        ))}
      </div>
    </div>
  );
}