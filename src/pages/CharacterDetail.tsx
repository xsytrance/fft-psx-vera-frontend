import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useApp } from '../context/AppContext';
import type { Character, AvatarOption } from '../types';

export default function CharacterDetail() {
  const { id, charId } = useParams();
  const { state } = useApp();
  const [character, setCharacter] = useState<Character | null>(null);
  const [avatars, setAvatars] = useState<AvatarOption[]>([]);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const pid = Number(id);
    const project = state.projects.find(p => p.id === pid);
    const char = project?.characters?.find(c => c.id === Number(charId));
    if (char) setCharacter(char);
  }, [id, charId, state.projects]);

  useEffect(() => {
    if (showPicker) {
      fetch('/api/avatars')
        .then(r => r.json())
        .then(data => setAvatars(data.avatars || []))
        .catch(() => {});
    }
  }, [showPicker]);

  if (!character) return <div className="page-loading">Loading...</div>;

  const selectAvatar = async (url: string) => {
    await fetch(`/api/projects/${id}/characters/${charId}/set-avatar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatar_url: url }),
    });
    setCharacter(prev => prev ? { ...prev, avatar_url: url } : null);
    setShowPicker(false);
  };

  const uploadCustom = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    const r = await fetch(`/api/projects/${id}/characters/${charId}/avatar`, {
      method: 'POST', body: fd,
    });
    if (r.ok) {
      const data = await r.json();
      setCharacter(prev => prev ? { ...prev, avatar_url: data.url } : null);
      setShowPicker(false);
    }
  };

  return (
    <div className="page-char-detail">
      <div className="breadcrumb">
        <Link to="/">Home</Link> / <Link to="/dashboard">Projects</Link> /{' '}
        <Link to={`/project/${id}`}>Party</Link> / <span>{character.name}</span>
      </div>

      <div className="char-hero">
        <div className="char-avatar-large" onClick={() => setShowPicker(true)}>
          {character.avatar_url ? (
            <img src={character.avatar_url} alt={character.name} />
          ) : (
            <div className="avatar-placeholder">{character.name[0]}</div>
          )}
          <div className="avatar-edit-overlay">✏️ Edit</div>
        </div>
        <div className="char-hero-info">
          <h1>{character.name}</h1>
          <p className="char-role">{character.role || 'Party Member'}</p>
          {character.level > 0 && <span className="char-level-badge">Lv.{character.level}</span>}
        </div>
      </div>

      <div className="char-actions">
        <Link to={`/project/${id}/character/${charId}/chat`} className="btn-primary btn-chat">
          💬 Chat with {character.name}
        </Link>
      </div>

      {/* Avatar Picker Modal */}
      {showPicker && (
        <div className="modal-overlay" onClick={() => setShowPicker(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Choose Avatar</h3>
              <button className="btn-close" onClick={() => setShowPicker(false)}>✕</button>
            </div>
            <div className="avatar-grid">
              {avatars.map(av => (
                <button key={av.job} className="avatar-option" onClick={() => selectAvatar(av.url)}>
                  <img src={av.url} alt={av.job} />
                  <span>{av.job}</span>
                </button>
              ))}
            </div>
            <div className="avatar-upload">
              <label className="btn-upload">
                📷 Upload Custom
                <input type="file" accept="image/*" onChange={uploadCustom} style={{ display: 'none' }} />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
