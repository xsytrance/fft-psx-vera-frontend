import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useApp } from '../context/AppContext';
import type { Project, Character, SaveTruth } from '../types';

export default function ProjectView() {
  const { id } = useParams();
  const { state } = useApp();
  const [project, setProject] = useState<Project | null>(null);
  const [saveTruth, setSaveTruth] = useState<SaveTruth | null>(null);
  const [saveTruthError, setSaveTruthError] = useState<string | null>(null);

  useEffect(() => {
    const p = state.projects.find(p => p.id === Number(id));
    if (p) {
      setProject(p);
    } else {
      fetch(`/api/projects/${id}`)
        .then(r => r.json())
        .then(data => setProject(data))
        .catch(() => {});
    }
  }, [id, state.projects]);

  useEffect(() => {
    if (!id) return;
    setSaveTruthError(null);
    fetch(`/api/projects/${id}/save-truth`)
      .then(r => {
        if (!r.ok) throw new Error(`Save truth unavailable (${r.status})`);
        return r.json();
      })
      .then(data => setSaveTruth(data))
      .catch(err => setSaveTruthError(err instanceof Error ? err.message : 'Save truth unavailable'));
  }, [id]);

  const auditedCharacters = useMemo(
    () => saveTruth?.characters.filter(char => char.has_equipment) ?? [],
    [saveTruth]
  );

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

      {characters.length >= 2 && (
        <div className="quick-actions">
          <Link to={`/project/${project.id}/group-chat`} className="btn-group-chat">
            {"\uD83D\uDDBC\uFE0F"} Council Chat
            <span className="btn-subtitle">Talk to multiple characters at once</span>
          </Link>
        </div>
      )}

      <section className="save-truth-audit">
        <div className="audit-header">
          <div>
            <span className="audit-eyebrow">SAVE TRUTH AUDIT</span>
            <h2>What the AI knows from this memory card</h2>
            <p>These are the hard facts injected before character personality or lore.</p>
          </div>
          {saveTruth && (
            <div className="audit-score">
              <strong>{saveTruth.characters_with_equipment}</strong>
              <span>with confirmed gear</span>
            </div>
          )}
        </div>

        {saveTruthError && <p className="audit-error">{saveTruthError}</p>}
        {!saveTruth && !saveTruthError && <p className="empty-text">Reading save truth...</p>}

        {saveTruth && (
          <>
            <div className="audit-stat-grid">
              <div><span>Story Phase</span><strong>{saveTruth.story_phase}</strong></div>
              <div><span>Characters</span><strong>{saveTruth.character_count}</strong></div>
              <div><span>Inventory</span><strong>{saveTruth.inventory_count}</strong></div>
              <div><span>Gil</span><strong>{saveTruth.gold}</strong></div>
            </div>

            {auditedCharacters.length === 0 ? (
              <p className="audit-warning">No confirmed equipment is stored for this project yet. Characters must not guess gear.</p>
            ) : (
              <div className="audit-character-grid">
                {auditedCharacters.map(char => (
                  <div className="audit-char-card" key={`${char.slot}-${char.name}`}>
                    <div className="audit-char-topline">
                      <h3>{char.name}</h3>
                      <span>Lv.{char.level} {char.job}</span>
                    </div>
                    <div className="audit-equipment-list">
                      {char.equipment.map(item => (
                        <div className="audit-equipment-row" key={`${char.slot}-${item.slot}`}>
                          <span>{item.slot.replaceAll('_', ' ')}</span>
                          <strong>{item.item_name}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>

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
                <div className="char-card-arrow">{"\u2192"}</div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
