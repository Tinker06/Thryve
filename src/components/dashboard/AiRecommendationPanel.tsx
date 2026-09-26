interface AiRecommendationPanelProps {
  onPropose: () => void;
}

export default function AiRecommendationPanel({ onPropose }: AiRecommendationPanelProps) {
  return (
    <div className="panel">
      <div className="eyebrow">AI RECOMMENDATION</div>
      <h3>COLLAB ACTIVITY</h3>
      <div className="insight good">
        <b>PEER TEACHING</b>
        <p>Arun → Meena<br />15 min on API integration.</p>
        <button className="btn" onClick={onPropose}>PROPOSE</button>
      </div>
      <div className="insight info" style={{ marginTop: 10 }}>
        <b>KNOWLEDGE EXCHANGE</b>
        <p>4 useful document shares + 6 help interactions this sprint.</p>
      </div>
    </div>
  );
}