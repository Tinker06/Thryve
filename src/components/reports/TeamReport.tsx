import ReportKpis from './ReportKpis';
import ReportChecklist from './ReportChecklist';
import ReportEfficiency from './ReportEfficiency';
import ReportMemberTable from './ReportMemberTable';
import { summarize, type MemberRow, type ReportTaskView } from '../../lib/reportCalculations';

interface TeamReportProps {
  tasks: ReportTaskView[];
  memberRows: MemberRow[];
  onSelectMember: (memberId: string, memberName: string) => void;
}

export default function TeamReport({ tasks, memberRows, onSelectMember }: TeamReportProps) {
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
        <ReportChecklist heading="Team execution checklist" tasks={tasks} showMember />
        <ReportEfficiency
          label="TEAM EFFICIENCY"
          efficiencyPercent={summary.efficiencyPercent}
          estimatedLabel={summary.estimatedHoursLabel}
          actualLabel={summary.actualHoursLabel}
        />
      </div>

      <ReportMemberTable rows={memberRows} onSelectMember={onSelectMember} />

      <div className="report-card" style={{ marginTop: 18 }}>
        <div className="report-section-label">04 / Checklist with time</div>
        <h3>What the report records</h3>
        <div className="three-col">
          <div className="kpi">
            <b>✓ BEFORE DEADLINE</b>
            <br />
            <span className="small">Completion timestamp is on or before the deadline.</span>
          </div>
          <div className="kpi">
            <b>! LATE</b>
            <br />
            <span className="small">Completed after the deadline and counted as a risk signal.</span>
          </div>
          <div className="kpi">
            <b>○ PENDING</b>
            <br />
            <span className="small">Not completed yet; estimated time remains visible for planning.</span>
          </div>
        </div>
      </div>

      <div className="report-signoff" style={{ marginTop: 18 }}>
        <span>REPORT READY • TEAM VIEW</span>
        <br />
        <span className="report-note">
          Generated from live sprint data. Efficiency is calculated, not hardcoded — see REPORTS.md for the formula.
        </span>
      </div>
    </div>
  );
}
