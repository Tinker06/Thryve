import type { ReportTaskView } from '../../lib/reportCalculations';
import { formatMinutesShort } from '../../lib/reportCalculations';

interface ReportChecklistProps {
  heading: string;
  tasks: ReportTaskView[];
  /** Team view shows "Priya • completed ..."; member view omits the name. */
  showMember?: boolean;
}

function formatTaskMeta(task: ReportTaskView, showMember: boolean): string {
  const who = showMember ? `${task.member_name} • ` : '';
  const deadline = new Date(task.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (task.completed_at) {
    const completed = new Date(task.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${who}completed ${completed} • deadline ${deadline}`;
  }
  return `${who}pending • deadline ${deadline}`;
}

function formatTaskTime(task: ReportTaskView): string {
  return `EST ${formatMinutesShort(task.estimated_minutes)} / ACT ${formatMinutesShort(task.actual_minutes)}`;
}

export default function ReportChecklist({ heading, tasks, showMember = true }: ReportChecklistProps) {
  return (
    <div className="report-card">
      <div className="report-section-label">01 / Work done</div>
      <h3>{heading}</h3>
      <div className="report-checklist">
        {tasks.map((task) => (
          <div key={task.id} className={`report-check ${task.status}`}>
            <span className="box" />
            <div>
              <b>{task.name}</b>
              <small>{formatTaskMeta(task, showMember)}</small>
            </div>
            <span className="report-time">{formatTaskTime(task)}</span>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="notice blue" style={{ marginBottom: 0 }}>
            No tasks in this sprint yet.
          </div>
        )}
      </div>
    </div>
  );
}
