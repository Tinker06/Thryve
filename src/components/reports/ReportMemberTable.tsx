import type { MemberRow } from '../../lib/reportCalculations';

interface ReportMemberTableProps {
  rows: MemberRow[];
  onSelectMember: (memberId: string, memberName: string) => void;
}

export default function ReportMemberTable({ rows, onSelectMember }: ReportMemberTableProps) {
  return (
    <div className="report-card" style={{ marginTop: 18 }}>
      <div className="report-section-label">03 / Member snapshot</div>
      <h3>Contribution report</h3>
      <div className="report-table-wrap">
        <table className="report-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Work done</th>
              <th>Tasks</th>
              <th>Risks</th>
              <th>Efficiency</th>
              <th>Estimated</th>
              <th>Actual</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.member_id}
                onClick={() => onSelectMember(row.member_id, row.member_name)}
                style={{ cursor: 'pointer' }}
                title={`Open ${row.member_name}'s member report`}
              >
                <td>{row.member_name}</td>
                <td>{row.workDoneLabel}</td>
                <td>{row.taskCount}</td>
                <td>{row.riskCount}</td>
                <td>{row.efficiencyPercent}%</td>
                <td>{row.estimatedLabel}</td>
                <td>{row.actualLabel}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7}>No members with tasks in this period yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
