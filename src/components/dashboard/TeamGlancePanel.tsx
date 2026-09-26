interface MemberProgress {
  name: string;
  progress: number;
}

const demoProgress: MemberProgress[] = [
  { name: "PRIYA", progress: 84 },
  { name: "ARUN", progress: 68 },
  { name: "MEENA", progress: 55 },
  { name: "VISHAL", progress: 91 },
];

export default function TeamGlancePanel() {
  return (
    <div className="panel">
      <h3>TEAM AT A GLANCE</h3>
      {demoProgress.map((m) => (
        <div className="kpi" key={m.name} style={{ marginTop: 8 }}>
          <span>{m.name}</span>
          <strong>{m.progress}%</strong>
          <div className="progress"><span style={{ width: `${m.progress}%` }} /></div>
        </div>
      ))}
    </div>
  );
}