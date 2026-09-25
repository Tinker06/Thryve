// src/App.tsx
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import RoleAssignmentPage from "./pages/RoleAssignment";
import SprintPage from "./pages/Sprint";
import ChatPage from "./pages/Chat";
import Analysis from "./pages/Analysis";
import Insights from "./pages/Insights";
import "./styles/thryve.css";

export default function App() {
  return (
    <BrowserRouter>
      <nav
        style={{
          display: "flex",
          gap: 10,
          padding: "14px 24px",
          background: "var(--paper)",
          borderBottom: "3px solid var(--ink)",
        }}
      >
        <Link className="btn paper" to="/">ROLES</Link>
        <Link className="btn paper" to="/sprint">SPRINT</Link>
        <Link className="btn paper" to="/chat">CHAT</Link>
        {/* /chat, /analysis, /insights routes get added in later phases */}
      </nav>
      <Routes>
        <Route path="/" element={<RoleAssignmentPage />} />
        <Route path="/sprint" element={<SprintPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/project/:projectId/analysis" element={<Analysis />} />
        <Route path="/project/:projectId/insights" element={<Insights />} />
      </Routes>
    </BrowserRouter>
  );
}