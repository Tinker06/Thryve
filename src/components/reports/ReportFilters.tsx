interface ReportFiltersProps {
  reportType: 'team' | 'member';
  period: string;
  onReportTypeChange: (type: 'team' | 'member') => void;
  onPeriodChange: (period: string) => void;
  onGenerate: () => void;
  onPrint: () => void;
}

const PERIODS = ['SPRINT 01', 'THIS WEEK', 'PROJECT TO DATE'];

export default function ReportFilters({
  reportType,
  period,
  onReportTypeChange,
  onPeriodChange,
  onGenerate,
  onPrint,
}: ReportFiltersProps) {
  return (
    <div className="report-toolbar">
      <select value={reportType} onChange={(e) => onReportTypeChange(e.target.value as 'team' | 'member')}>
        <option value="team">TEAM REPORT</option>
        <option value="member">MEMBER REPORT</option>
      </select>
      <select value={period} onChange={(e) => onPeriodChange(e.target.value)}>
        {PERIODS.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      <button className="btn" onClick={onGenerate}>
        GENERATE REPORT ↗
      </button>
      <button className="btn pink" onClick={onPrint}>
        PRINT / SAVE PDF
      </button>
    </div>
  );
}
