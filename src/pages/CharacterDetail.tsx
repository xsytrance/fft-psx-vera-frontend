import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { MessageSquare, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Eyebrow from '../components/ui/Eyebrow';
import TruthSeal from '../components/ui/TruthSeal';
import { api } from '../lib/api';
import type { Character, AvatarOption, SaveTruthCharacter } from '../types';

const normalizeName = (value: string | null | undefined) =>
  (value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

export default function CharacterDetail() {
  const { id, charId } = useParams();
  const { state } = useApp();
  const [avatars, setAvatars] = useState<AvatarOption[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [avatarOverride, setAvatarOverride] = useState<string | null>(null);
  const [grounded, setGrounded] = useState<SaveTruthCharacter | null>(null);
  const [truthLoaded, setTruthLoaded] = useState(false);

  const baseCharacter = useMemo(() => {
    const project = state.projects.find(p => p.id === Number(id));
    return project?.characters?.find(c => c.id === Number(charId)) ?? null;
  }, [id, charId, state.projects]);

  const character: Character | null = baseCharacter
    ? { ...baseCharacter, avatar_url: avatarOverride ?? baseCharacter.avatar_url }
    : null;

  useEffect(() => {
    if (showPicker) {
      api.getAvatars()
        .then(data => setAvatars(data.avatars || []))
        .catch(() => {});
    }
  }, [showPicker]);

  // Parser-confirmed combat record for this character.
  useEffect(() => {
    if (!id || !baseCharacter) return;
    let cancelled = false;
    api.getSaveTruth(id)
      .then(data => {
        if (cancelled) return;
        setTruthLoaded(true);
        const target = normalizeName(baseCharacter.name);
        const match = data.characters.find(c => normalizeName(c.name) === target)
          || data.characters.find(c => {
            const n = normalizeName(c.name);
            return Boolean(n && target && (n.includes(target) || target.includes(n)));
          });
        setGrounded(match || null);
      })
      .catch(() => { if (!cancelled) setTruthLoaded(true); });
    return () => { cancelled = true; };
  }, [id, baseCharacter]);

  if (!character) return <div className="page-loading">Loading...</div>;

  const selectAvatar = async (url: string) => {
    await api.setAvatar(id!, charId!, url).catch(() => {});
    setAvatarOverride(url);
    setShowPicker(false);
  };

  const uploadCustom = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await api.uploadAvatar(id!, charId!, file);
      setAvatarOverride(data.url);
      setShowPicker(false);
    } catch {
      /* keep the picker open on failure */
    }
  };

  const subtitle = grounded && grounded.level > 0
    ? `${character.role || 'Party Member'} · Lv.${grounded.level} ${grounded.job}`
    : (character.role || 'Party Member');

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
          <Eyebrow>Roster · Dossier</Eyebrow>
          <h1>{character.name}</h1>
          <p className="char-role">{subtitle}</p>
          {character.level > 0 && <span className="char-level-badge">Lv.{character.level}</span>}
        </div>
      </div>

      <div className="char-actions">
        <Link to={`/project/${id}/character/${charId}/chat`} className="btn-primary btn-chat">
          <MessageSquare size={16} /> Speak with {character.name}
        </Link>
      </div>

      <section className="panel panel--truth char-dossier">
        <div className="dossier-head">
          <Eyebrow tone="aether">Parser-confirmed record</Eyebrow>
          {grounded && <TruthSeal label="From your save" />}
        </div>

        {!truthLoaded && <p className="empty-text">Reading save truth…</p>}

        {truthLoaded && grounded && (
          <>
            <div className="audit-stat-grid">
              <div><span>Job</span><strong>{grounded.job || '—'}</strong></div>
              <div><span>Level</span><strong>{grounded.level}</strong></div>
              <div><span>HP</span><strong>{grounded.hp}</strong></div>
              <div><span>MP</span><strong>{grounded.mp}</strong></div>
            </div>
            {grounded.equipment && grounded.equipment.length > 0 && (
              <div className="dossier-gear">
                <h3 className="section-title">Equipped</h3>
                <ul className="grounding-gear">
                  {grounded.equipment.map(item => (
                    <li key={item.slot}>
                      <span>{item.slot.replaceAll('_', ' ')}</span>
                      <strong>{item.item_name}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="dossier-note">
              <ShieldCheck size={14} />
              <span>In conversation, {character.name} stays true to these parser-confirmed facts — they won't claim gear, levels, or items your save doesn't contain.</span>
            </p>
          </>
        )}

        {truthLoaded && !grounded && (
          <p className="empty-text">
            {character.name} is in your roster, but the parser has no confirmed combat record (level, job, or gear) for them in this save yet.
          </p>
        )}
      </section>

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
