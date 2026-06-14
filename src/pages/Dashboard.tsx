import { Link } from 'react-router';
import { Library, Plus, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Eyebrow from '../components/ui/Eyebrow';

export default function Dashboard() {
  const { state } = useApp();
  const projects = state.projects;

  if (projects.length === 0) {
    return (
      <div className="page-dashboard empty">
        <div className="empty-state">
          <span className="empty-icon"><Library size={44} /></span>
          <h2>No campaigns archived yet</h2>
          <p>Upload a save file to open your first party ledger.</p>
          <Link to="/" className="btn-primary"><Plus size={16} /> Upload Save</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-dashboard">
      <div className="page-header">
        <div>
          <Eyebrow>Campaign archive</Eyebrow>
          <h1>Campaigns</h1>
        </div>
        <Link to="/" className="btn-primary"><Plus size={16} /> New Save</Link>
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
                <Users size={13} style={{ verticalAlign: '-2px', marginRight: '0.35rem' }} />
                {p.characters?.length || 0} characters
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
