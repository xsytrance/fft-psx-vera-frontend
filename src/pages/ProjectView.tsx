import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useApp } from '../context/AppContext';
import type { Project, Character } from '../types';

export default function ProjectView() {
  const { id } = useParams();
  const { state } = useApp();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    const p = state.projects.find(p => p.id === Number(id));
    if (p) {
      setProject(p);
    } else {
      // Fetch from API
      fetch(`/api/projects/${id}`)
        .then(r => r.json())
        .then(data => setProject(data))
        .catch(() => {});
    }
  }, [id, state.projects]);

  if (!project) {
    return <div className="page-loading">Loading...</div>;
  }

  const characters: Character[] = project.characters || [];

  return (
    <div className="page-project">
      <div className="page-header">
        <div className="breadcrumb">
          <Link to="/">Home</Link> / <Link to="/dashboard">Projects</Link> / <span>{project.name}</span>
        </div>
        <h1>{project.name}</h1>
        <p className="phase">{project.story_phase}</p>
      </div>

      <section className="roster">
        <h2>Party Roster</h2>
        {characters.length === 0 ? (
          <p className="empty-text">No characters detected in this save.</p>
        ) : (
          <div className="character-grid">
            {characters.map(char => (
              <Link
                key={char.id}
                to={`/project/${project.id}/character/${char.id}`}
                className="char-card"
              >
                <div className="char-card-avatar">
                  {char.avatar_url ? (
                    <img src={char.avatar_url} alt={char.name} />
                  ) : (
                    <div className="avatar-placeholder">{char.name[0]}</div>
                  )}
                </div>
                <div className="char-card-info">
                  <h3>{char.name}</h3>
                  <p>{char.role || 'Party Member'}</p>
                  {char.level > 0 && <span className="char-level">Lv.{char.level}</span>}
                </div>
                <div className="char-card-arrow">→</div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
