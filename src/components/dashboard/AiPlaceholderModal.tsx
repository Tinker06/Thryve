interface AiPlaceholderModalProps {
  open: boolean;
  onClose: () => void;
  onApprove: () => void;
}

export default function AiPlaceholderModal({ open, onClose, onApprove }: AiPlaceholderModalProps) {
  return (
    <div className={`modal ${open ? "show" : ""}`} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card">
        <div className="eyebrow">AI PLACEHOLDER / AUTHORIZED CONTEXT</div>
        <h3>GENERATE A SAFE SCAFFOLD.</h3>
        <p>Context used: <b>API_Spec_v2.pdf + project chat + your current sprint</b>.</p>
        <div className="notice blue">
          <b>Suggested:</b> FastAPI endpoint scaffold for contribution analysis
          with TODO markers for team-specific logic.
        </div>
        {/* TODO: replace this static block with Person 3's generatePlaceholder() response */}
        <pre style={{ border: "2px solid var(--ink)", background: "#fffdf2", padding: 14, overflow: "auto", fontSize: 12 }}>
{`@app.post('/analyze')
def analyze(payload):
    # TODO: connect authorized contribution model
    return {'status': 'scaffold', 'next': 'implement team model'}`}
        </pre>
        <button className="btn pink" onClick={() => { onApprove(); onClose(); }}>APPROVE SCAFFOLD</button>{" "}
        <button className="btn paper" onClick={onClose}>CANCEL</button>
      </div>
    </div>
  );
}