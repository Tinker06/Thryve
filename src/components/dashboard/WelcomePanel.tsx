interface WelcomePanelProps {
  memberFirstName: string;
  teamProgress: number;
  myProgress: number;
  openTasks: number;
}

export default function WelcomePanel({
  memberFirstName,
  teamProgress,
  myProgress,
  openTasks,
}: WelcomePanelProps) {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="panel">
      <div className="eyebrow">{today.toUpperCase()}</div>
      <h3>GOOD MORNING, {memberFirstName.toUpperCase()}. 👋</h3>
      <div className="notice green">
        ✦ AI is using only authorized project context: project chat, approved
        shared documents, sprint updates and contribution history.
      </div>
      <p><b>Your team is building StudySync.</b> The dashboard combines execution + learning signals.</p>

      <div className="stats">
        <div className="stat"><span>TEAM PROGRESS</span><strong>{teamProgress}%</strong></div>
        <div className="stat"><span>MY PROGRESS</span><strong>{myProgress}%</strong></div>
        <div className="stat"><span>OPEN TASKS</span><strong>{String(openTasks).padStart(2, "0")}</strong></div>
      </div>

      <div className="bar-label"><span>OVERALL PROJECT</span><span>{teamProgress}%</span></div>
      <div className="progress"><span style={{ width: `${teamProgress}%` }} /></div>
    </div>
  );
}