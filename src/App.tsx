import { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import RoleAssignmentPage from './pages/RoleAssignment';
import SprintPage from './pages/Sprint';
import Reports from './pages/reports';
import Login from './pages/Login';
import Projects from './pages/Projects';

import { getCurrentProfile, logout } from './lib/auth';
import type { Profile } from './lib/types';
import type { Project } from './lib/session';

import './styles/thryve.css';

export default function App() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshProfile() {
    const current = await getCurrentProfile();
    setProfile(current as Profile | null);
  }

  useEffect(() => {
    void refreshProfile().finally(() => setLoading(false));
  }, []);

  async function handleLogout() {
    await logout();
    setProfile(null);
    setProject(null);
  }

  if (loading) {
    return <main className="main">Loading THRYVE...</main>;
  }

  if (!profile) {
    return (
      <BrowserRouter>
        <Login onLogin={refreshProfile} />
      </BrowserRouter>
    );
  }

  if (!project) {
    return (
      <BrowserRouter>
        <Projects profile={profile} onSelect={setProject} />
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <nav
        style={{
          display: 'flex',
          gap: 10,
          padding: '14px 24px',
          background: 'var(--paper)',
          borderBottom: '3px solid var(--ink)',
          flexWrap: 'wrap',
        }}
      >
        <Link className="btn paper" to="/">
          ROLES
        </Link>

        <Link className="btn paper" to="/sprint">
          SPRINT
        </Link>

        <Link className="btn paper" to="/reports">
          REPORTS
        </Link>

        <button className="btn paper" onClick={() => setProject(null)}>
          PROJECTS
        </button>

        <button className="btn pink" onClick={handleLogout}>
          LOG OUT
        </button>
      </nav>

      <Routes>
        <Route
          path="/"
          element={<RoleAssignmentPage projectId={project.id} />}
        />

        <Route
          path="/sprint"
          element={<SprintPage projectId={project.id} userId={profile.id} />}
        />

        <Route
          path="/reports"
          element={<Reports projectId={project.id} />}
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}