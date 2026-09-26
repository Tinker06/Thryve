import { Link } from "react-router-dom";
import type { DeadlineChecklistItem } from "../../lib/uiTypes";

interface SprintDeadlinePanelProps {
  items: DeadlineChecklistItem[];
  completedCount: number;
  totalCount: number;
}

export default function SprintDeadlinePanel({ items, completedCount, totalCount }: SprintDeadlinePanelProps) {
  return (
    <div className="panel">
      <h3>SPRINT DEADLINE CHECKLIST</h3>
      <div className="notice blue">
        <b>Project sprint status:</b> {completedCount} / {totalCount} checklist
        items complete. Each task records whether it was completed before its deadline.
      </div>

      {items.map((item) => (
        <div
          key={item.id}
          className={`task ${item.done ? (item.late ? "blocked" : "done") : "pending"}`}
        >
          <div>
            <b>{item.done ? "✓" : item.late ? "⚠" : "○"} {item.title}</b>
            <br />
            <small>{item.meta}</small>
          </div>
          <span className="status">
            {item.late ? "LATE" : item.done ? "BEFORE DEADLINE" : "PENDING"}
          </span>
        </div>
      ))}

      <Link to="/sprint-checklist">
        <button className="btn teal">VIEW ENTIRE PROJECT SPRINT →</button>
      </Link>
    </div>
  );
}