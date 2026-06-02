import { Link } from 'react-router';
import { useApp } from '../context/AppContext';

export default function Dashboard() {
  const { state } = useApp();
  const projects = state.projects;

  if (projects.length === 0) {
    return (
      <div className="page-dashboard empty">
        <div className="empty-state">
          <span className="empty-icon">📂</span>
          <h2>No Projects Yet</h2>
          <p>Upload a save file to get started.</p>
          <Link to="/" className="btn-primary">Upload Save</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-dashboard">
      <div className="page-header">
        <h1>Projects</h1>
        <Link to="/" className="btn-primary">+ New Project</Link>
      </div>
      <div className="project-grid">
        {projects.map(p => (
          <Link key={p.id} to={`/project/${p.id}`} className="project-card">
            <div className="project-card-header">
              <h3>{p.name}</h3>
              <span className="project-phase">{p.story_phase}</span>
            </div>
            <p className="project-desc">{p.description}</p>
            <div className="project-card-footer">
              <span className="project-chars">
                {p.characters?.length || 0} characters
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
