import ReportKpis from './ReportKpis';
import ReportChecklist from './ReportChecklist';
import ReportEfficiency from './ReportEfficiency';
import { summarize, type ReportTaskView } from '../../lib/reportCalculations';

interface MemberReportProps {
  memberName: string;
  tasks: ReportTaskView[];
  onBackToTeam: () => void;
}

export default function MemberReport({ memberName, tasks, onBackToTeam }: MemberReportProps) {
  const summary = summarize(tasks);

  return (
    <div id="reportContent">
      <ReportKpis
        workDone={summary.workDoneLabel}
        checklist={summary.checklistLabel}
        taskCount={summary.taskCount}
        riskCount={summary.riskCount}
      />

      <div className="report-grid" style={{ marginTop: 18 }}>
        <ReportChecklist heading={`${memberName} — member work report`} tasks={tasks} showMember={false} />
        <ReportEfficiency
          label={`${memberName.toUpperCase()} EFFICIENCY`}
          efficiencyPercent={summary.efficiencyPercent}
          estimatedLabel={summary.estimatedHoursLabel}
          actualLabel={summary.actualHoursLabel}
        />
      </div>

      <div className="report-signoff" style={{ marginTop: 18 }}>
        <span>REPORT READY • {memberName.toUpperCase()} MEMBER VIEW</span>
        <br />
        <span className="report-note">Generated from live sprint data.</span>
      </div>

      <button className="btn paper" style={{ marginTop: 18 }} onClick={onBackToTeam}>
        ← BACK TO TEAM REPORT
      </button>
    </div>
  );
}
