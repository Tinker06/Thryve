import { useEffect, useState } from 'react';
import {
  createProject,
  loadMyProjects,
  type Project,
} from '../lib/session';
import type { Profile } from '../lib/types';

interface ProjectsProps {
  profile: Profile;
  onSelect: (project: Project) => void;
}

export default function Projects({ profile, onSelect }: ProjectsProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');

    try {
      setProjects(await loadMyProjects(profile.team_id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load projects');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [profile.team_id]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) return;

    setCreating(true);
    setError('');

    try {
      const project = await createProject(
        profile.team_id,
        profile.id,
        name,
        description
      );

      setProjects((prev) => [project, ...prev]);
      setName('');
      setDescription('');
      onSelect(project);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create project');
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="main">
      <div className="section-head">
        <div>
          <h2>PROJECTS</h2>
          <p>Select the project you want to work on.</p>
        </div>
      </div>

      {error && <div className="notice red">{error}</div>}

      {profile.role === 'team_lead' && (
        <div className="form-card" style={{ marginBottom: 20 }}>
          <h2>CREATE PROJECT</h2>

          <form onSubmit={handleCreate}>
            <label>Project name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <button
              className="btn pink"
              type="submit"
              disabled={creating}
              style={{ marginTop: 14 }}
            >
              {creating ? 'CREATING...' : 'CREATE PROJECT'}
            </button>
          </form>
        </div>
      )}

      {loading && <div className="notice blue">Loading projects...</div>}

      {!loading && projects.length === 0 && (
        <div className="notice blue">
          No projects are available for this team yet.
        </div>
      )}

      {!loading && projects.length > 0 && (
        <div className="grid">
          {projects.map((project) => (
            <div className="card" key={project.id}>
              <h3>{project.name}</h3>
              <p>{project.description || 'No description provided.'}</p>
              <button
                className="btn teal"
                onClick={() => onSelect(project)}
              >
                OPEN PROJECT
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}