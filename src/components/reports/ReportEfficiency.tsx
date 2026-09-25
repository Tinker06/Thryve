interface ReportEfficiencyProps {
  label: string; // "TEAM EFFICIENCY" or "<NAME> EFFICIENCY"
  efficiencyPercent: number;
  estimatedLabel: string;
  actualLabel: string;
}

export default function ReportEfficiency({
  label,
  efficiencyPercent,
  estimatedLabel,
  actualLabel,
}: ReportEfficiencyProps) {
  return (
    <div className="report-card">
      <div className="report-section-label">02 / Efficiency</div>
      <h3>Time + output</h3>
      <div className="report-efficiency">
        <span>{label}</span>
        <strong>{efficiencyPercent}%</strong>
        <small>Based on completed work, deadline adherence and estimated vs actual time.</small>
      </div>
      <div className="time-compare" style={{ marginTop: 12 }}>
        <div className="time-box est">
          <span>ESTIMATED TIME</span>
          <strong>{estimatedLabel}</strong>
        </div>
        <div className="time-box actual">
          <span>ACTUAL COMPLETED</span>
          <strong>{actualLabel}</strong>
        </div>
      </div>
      <div className="notice blue" style={{ marginBottom: 0 }}>
        <b>Risk signal:</b> late completion and unfinished checklist items are separated from completed work.
      </div>
    </div>
  );
}
