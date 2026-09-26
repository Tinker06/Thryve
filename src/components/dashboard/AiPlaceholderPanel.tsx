interface AiPlaceholderPanelProps {
  disabled?: boolean;
  onOpenModal: () => void;
}

export default function AiPlaceholderPanel({ disabled, onOpenModal }: AiPlaceholderPanelProps) {
  return (
    <div className="panel">
      <h3>AI PLACEHOLDER BUILDER</h3>
      <p>
        If you are blocked, AI can prepare a temporary code/program scaffold
        using the <b>authorized documents + project chat + your current sprint</b>.
      </p>
      <div className="notice pink">
        AI suggests; the user approves. The generated placeholder is labelled
        as a scaffold and does not silently replace your work.
      </div>
      <button className="btn pink" disabled={disabled} onClick={onOpenModal}>
        {disabled ? "NO BLOCKED TASK RIGHT NOW" : "GENERATE PLACEHOLDER CODE"}
      </button>
    </div>
  );
}