interface ReportKpisProps {
  workDone: string;
  checklist: string;
  taskCount: number;
  riskCount: number;
}

export default function ReportKpis({ workDone, checklist, taskCount, riskCount }: ReportKpisProps) {
  return (
    <div className="report-kpis">
      <div className="report-kpi">
        <span>WORK DONE</span>
        <strong>{workDone}</strong>
      </div>
      <div className="report-kpi">
        <span>CHECKLIST</span>
        <strong>{checklist}</strong>
      </div>
      <div className="report-kpi">
        <span>NO. OF TASKS</span>
        <strong>{taskCount}</strong>
      </div>
      <div className="report-kpi">
        <span>NO. OF RISKS</span>
        <strong>{riskCount}</strong>
      </div>
    </div>
  );
}
