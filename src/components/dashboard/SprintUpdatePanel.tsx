import type { DashboardTask } from "../../lib/types";

interface SprintUpdatePanelProps {
  tasks: DashboardTask[];
  onUpdateStatus: () => void;
  onRequestHelp: () => void;
}

const statusClass: Record<string, string> = {
  DONE: "done",
  IN_PROGRESS: "",
  BLOCKED: "blocked",
  LATE: "blocked",
  PENDING: "",
};

const statusLabel: Record<string, string> = {
  DONE: "DONE",
  IN_PROGRESS: "IN PROGRESS",
  BLOCKED: "BLOCKED",
  LATE: "LATE",
  PENDING: "PENDING",
};

export default function SprintUpdatePanel({ tasks, onUpdateStatus, onRequestHelp }: SprintUpdatePanelProps) {
  return (
    <div className="panel">
      <h3>MY SPRINT UPDATE</h3>
      {tasks.map((task) => (
        <div key={task.id} className={`task ${statusClass[task.status]}`}>
          <div>
            <b>{task.title}</b>
            <br />
            <small>{task.timeRange}</small>
          </div>
          <span className="status">{statusLabel[task.status]}</span>
        </div>
      ))}
      <button className="btn" onClick={onUpdateStatus}>UPDATE STATUS</button>{" "}
      <button className="btn pink" onClick={onRequestHelp}>REQUEST HELP</button>
    </div>
  );
}