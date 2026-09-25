// src/App.tsx
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import RoleAssignmentPage from "./pages/RoleAssignment";
import SprintPage from "./pages/Sprint";
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
        {/* /chat, /analysis, /insights routes get added in later phases */}
      </nav>
      <Routes>
        <Route path="/" element={<RoleAssignmentPage />} />
        <Route path="/sprint" element={<SprintPage />} />
      </Routes>
    </BrowserRouter>
  );
}