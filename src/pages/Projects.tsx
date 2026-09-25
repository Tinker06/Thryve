import { Link } from "react-router-dom";

interface ProjectCard {
  id: string;
  name: string;
  description: string;
  members: number;
  progress: number;
  status: "ACTIVE" | "IN BUILD";
}

const demoProjects: ProjectCard[] = [
  { id: "p1", name: "StudySync", description: "AI-powered collaborative learning platform.", members: 4, progress: 72, status: "ACTIVE" },
  { id: "p2", name: "CampusCart", description: "Student marketplace with smart matching.", members: 3, progress: 41, status: "IN BUILD" },
];

export default function Projects() {
  return (
    <section>
      <div className="section-head">
        <div>
          <div className="eyebrow">TEAM WORKSPACE / PROJECT SELECT</div>
          <h2>CHOOSE YOUR PROJECT.</h2>
        </div>
        <Link to="/project-setup">
          <button className="btn pink">+ CREATE PROJECT</button>
        </Link>
      </div>

      <div className="notice blue">
        Select a project, create one, add a user, or enter project login.
      </div>

      <div className="grid">
        {demoProjects.map((p) => (
          <Link key={p.id} to="/member-login" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="card">
              <span className={`tag ${p.status === "ACTIVE" ? "green" : "teal"}`}>{p.status}</span>
              <h3>{p.name}</h3>
              <p>{p.description}</p>
              <b>{p.members} members • {p.progress}% progress</b>
              <div className="arrow">↗</div>
            </div>
          </Link>
        ))}

        <Link to="/project-setup" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="card">
            <span className="tag pink">NEW</span>
            <h3>+ Create project</h3>
            <p>Set project goal, team size and member profiles. AI prepares the first sprint.</p>
            <div className="arrow">+</div>
          </div>
        </Link>
      </div>
    </section>
  );
}