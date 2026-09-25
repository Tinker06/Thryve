import { Routes, Route, Link, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import TeamLogin from "./pages/TeamLogin";
import TeamSignup from "./pages/TeamSignup";
import TeamWorkspace from "./pages/TeamWorkspace";
import Projects from "./pages/Projects";
import ProjectSetup from "./pages/ProjectSetup";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/team-login", label: "Team Login" },
  { to: "/team-workspace", label: "Workspace" },
];

function Topbar() {
  const location = useLocation();
  return (
    <header className="topbar">
      <div className="brand">
        <div className="logo">T</div>
        <div>
          <h1>Thryve</h1>
          <small>LEARN • SHARE • BUILD</small>
        </div>
      </div>
      <nav className="nav">
        {navItems.map((item) => (
          <Link key={item.to} to={item.to}>
            <button className={location.pathname === item.to ? "active" : ""}>
              {item.label}
            </button>
          </Link>
        ))}
      </nav>
    </header>
  );
}

export default function App() {
  return (
    <div className="app">
      <Topbar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/team-login" element={<TeamLogin />} />
          <Route path="/team-signup" element={<TeamSignup />} />
          <Route path="/team-workspace" element={<TeamWorkspace />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/project-setup" element={<ProjectSetup />} />
        </Routes>
      </main>
    </div>
  );
}