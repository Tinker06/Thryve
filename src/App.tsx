import { Routes, Route, Link, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import TeamLogin from "./pages/TeamLogin";
import TeamSignup from "./pages/TeamSignup";
import TeamWorkspace from "./pages/TeamWorkspace";
import Projects from "./pages/Projects";
import ProjectSetup from "./pages/ProjectSetup";
import MemberLogin from "./pages/MemberLogin";
import UserSignup from "./pages/UserSignup";
import DeleteUser from "./pages/DeleteUser";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import Requests from "./pages/Requests";
import Profile from "./pages/Profile";
import TeammateStub from "./pages/_TeammateStub";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/team-login", label: "Team Login" },
  { to: "/team-workspace", label: "Workspace" },
  { to: "/dashboard", label: "Dashboard" },
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
          <Route path="/member-login" element={<MemberLogin />} />
          <Route path="/user-signup" element={<UserSignup />} />
          <Route path="/delete-user" element={<DeleteUser />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/profile" element={<Profile />} />

          {/* Owned by Person 3 — stubs until their branch merges */}
          <Route path="/sprint" element={<TeammateStub title="Sprint 01" owner="Person 3" />} />
          <Route path="/sprint-checklist" element={<TeammateStub title="Sprint Checklist" owner="Person 3" />} />
          <Route path="/analysis" element={<TeammateStub title="Analysis" owner="Person 3" />} />
          <Route path="/insights" element={<TeammateStub title="AI Insights" owner="Person 3" />} />

          {/* Owned by Person 4 */}
          <Route path="/reports" element={<TeammateStub title="Team Report" owner="Person 4" />} />
        </Routes>
      </main>
    </div>
  );
}