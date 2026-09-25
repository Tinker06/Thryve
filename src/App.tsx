// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RoleAssignmentPage from "./pages/RoleAssignment";
import "./styles/thryve.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleAssignmentPage />} />
        {/* More routes get added here in later phases:
            /sprint, /chat, /analysis, /insights */}
      </Routes>
    </BrowserRouter>
  );
}