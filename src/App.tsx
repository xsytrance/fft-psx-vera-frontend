/**
 * FFT PSX Vera — Simplified Frontend
 * 
 * Flow: Upload save → See party → Click character → Chat
 * No multi-page navigation. No separate parse step. No complexity.
 */
import { useState, useEffect, useRef } from 'react';
import './App.css';

const API = '/api';

// ── Types ────────────────────────────────────────────────────────────────────

interface Character {
  id: number;
  name: string;
  slug: string;
  role: string;
  level: number;
  avatar_url: string;
  in_party: boolean;
}

interface Project {
  id: number;
  name: string;
  description: string;
  story_phase: string;
  characters: Character[];
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  character_name?: string;
}

interface AvatarOption {
  job: string;
  url: string;
}

// ── API Helpers ──────────────────────────────────────────────────────────────

async function uploadSave(file: File): Promise<Project> {
  const fd = new FormData();
  fd.append('file', file);
  const r = await fetch(`${API}/upload`, { method: 'POST', body: fd });
  if (!r.ok) {
    const err = await r.json().catch(() => ({ detail: r.statusText }));
    throw new Error(err.detail || `Upload failed (${r.status})`);
  }
  const data = await r.json();
  return {
    id: data.project_id,
    name: data.project_name,
    description: data.description || '',
    story_phase: data.story_phase || 'Unknown',
    characters: data.characters || [],
  };
}

async function chat(projectId: number, characterId: number, message: string): Promise<string> {
  const r = await fetch(`${API}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project_id: projectId, character_id: characterId, message }),
  });
  if (!r.ok) throw new Error('Chat failed');
  const data = await r.json();
  return data.response || '(No response)';
}

async function getAvatars(): Promise<AvatarOption[]> {
  const r = await fetch(`${API}/avatars`);
  if (!r.ok) return [];
  const data = await r.json();
  return data.avatars || [];
}

async function setCharacterAvatar(projectId: number, characterId: number, avatarUrl: string): Promise<void> {
  await fetch(`${API}/projects/${projectId}/characters/${characterId}/set-avatar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ avatar_url: avatarUrl }),
  });
}

async function uploadCustomAvatar(projectId: number, characterId: number, file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const r = await fetch(`${API}/projects/${projectId}/characters/${characterId}/avatar`, {
    method: 'POST',
    body: fd,
  });
  if (!r.ok) throw new Error('Avatar upload failed');
  const data = await r.json();
  return data.url;
}

// ── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [project, setProject] = useState<Project | null>(null);
  const [activeChar, setActiveChar] = useState<Character | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAvatars, setShowAvatars] = useState<number | null>(null);
  const [avatars, setAvatars] = useState<AvatarOption[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load avatars when showing picker
  useEffect(() => {
    if (showAvatars !== null) {
      getAvatars().then(setAvatars);
    }
  }, [showAvatars]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Upload Handler ────────────────────────────────────────────────────────

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const proj = await uploadSave(file);
      setProject(proj);
      setActiveChar(null);
      setMessages([]);
    } catch (err: any) {
      setError(err.message || 'Failed to upload save file');
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  // ── Chat Handler ──────────────────────────────────────────────────────────

  const handleSend = async () => {
    if (!input.trim() || !activeChar || !project || chatLoading) return;
    const msg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setChatLoading(true);
    try {
      const response = await chat(project.id, activeChar.id, msg);
      setMessages(prev => [...prev, { role: 'assistant', content: response, character_name: activeChar.name }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '(Error getting response)' }]);
    } finally {
      setChatLoading(false);
    }
  };

  // ── Avatar Handler ────────────────────────────────────────────────────────

  const handleSelectAvatar = async (charId: number, url: string) => {
    if (!project) return;
    await setCharacterAvatar(project.id, charId, url);
    setProject(prev => prev ? {
      ...prev,
      characters: prev.characters.map(c => c.id === charId ? { ...c, avatar_url: url } : c),
    } : null);
    if (activeChar?.id === charId) {
      setActiveChar(prev => prev ? { ...prev, avatar_url: url } : null);
    }
    setShowAvatars(null);
  };

  const handleCustomAvatar = async (charId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !project) return;
    try {
      const url = await uploadCustomAvatar(project.id, charId, file);
      await handleSelectAvatar(charId, url);
    } catch {
      // silent
    }
  };

  // ── Reset ─────────────────────────────────────────────────────────────────

  const handleReset = () => {
    setProject(null);
    setActiveChar(null);
    setMessages([]);
    setError('');
  };

  // ── Render: Upload Screen ─────────────────────────────────────────────────

  if (!project) {
    return (
      <div className="upload-screen">
        <div className="upload-container">
          <div className="logo">
            <span className="logo-icon">⚔️</span>
            <h1>FFT PSX Vera</h1>
            <p className="subtitle">Final Fantasy Tactics — Character Chat</p>
          </div>

          <div className={`upload-zone ${loading ? 'loading' : ''}`} onClick={() => fileRef.current?.click()}>
            <input
              ref={fileRef}
              type="file"
              accept=".zip,.mcr,.mcd,.mcs"
              onChange={handleUpload}
              style={{ display: 'none' }}
            />
            <div className="upload-icon">{loading ? '⏳' : '📁'}</div>
            <h2>{loading ? 'Loading...' : 'Upload Save File'}</h2>
            <p>Drop your .zip or .mcr file here, or click to browse</p>
            <p className="formats">Supports: .zip (with .mcr inside) • .mcr • .mcd • .mcs</p>
          </div>

          {error && <div className="error-msg">⚠️ {error}</div>}

          <div className="help-text">
            <p>Upload a DuckStation or ePSXe memory card save file.</p>
            <p>Your party will be detected automatically.</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Render: Character Select (no active chat) ─────────────────────────────

  if (!activeChar) {
    return (
      <div className="party-screen">
        <header className="party-header">
          <div className="header-left">
            <span className="logo-small">⚔️</span>
            <div>
              <h1>{project.name}</h1>
              <p className="phase">{project.story_phase}</p>
            </div>
          </div>
          <button className="btn-new" onClick={handleReset}>📁 New Save</button>
        </header>

        <div className="party-grid">
          {project.characters.map(char => (
            <div
              key={char.id}
              className="character-card"
              onClick={() => setActiveChar(char)}
            >
              <div className="card-avatar" onClick={(e) => { e.stopPropagation(); setShowAvatars(char.id); }}>
                {char.avatar_url ? (
                  <img src={char.avatar_url} alt={char.name} />
                ) : (
                  <div className="avatar-placeholder">{char.name[0]}</div>
                )}
                <div className="avatar-edit-hint">✏️</div>
              </div>
              <div className="card-info">
                <h3>{char.name}</h3>
                <p className="card-role">{char.role || 'Party Member'}</p>
                {char.level > 0 && <span className="card-level">Lv.{char.level}</span>}
              </div>
              <div className="card-chat-hint">Click to chat →</div>
            </div>
          ))}
        </div>

        {/* Avatar Picker Modal */}
        {showAvatars !== null && (
          <div className="modal-overlay" onClick={() => setShowAvatars(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Choose Avatar</h3>
                <button className="btn-close" onClick={() => setShowAvatars(null)}>✕</button>
              </div>
              <div className="avatar-grid">
                {avatars.map(av => (
                  <button
                    key={av.job}
                    className="avatar-option"
                    onClick={() => handleSelectAvatar(showAvatars, av.url)}
                  >
                    <img src={av.url} alt={av.job} />
                    <span>{av.job}</span>
                  </button>
                ))}
              </div>
              <div className="avatar-upload">
                <label className="btn-upload">
                  📷 Upload Custom Image
                  <input type="file" accept="image/*" onChange={e => handleCustomAvatar(showAvatars, e)} style={{ display: 'none' }} />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Render: Chat Screen ───────────────────────────────────────────────────

  return (
    <div className="chat-screen">
      <header className="chat-header">
        <button className="btn-back" onClick={() => setActiveChar(null)}>← Party</button>
        <div className="chat-char-info">
          {activeChar.avatar_url && <img src={activeChar.avatar_url} alt="" className="chat-avatar-small" />}
          <div>
            <h2>{activeChar.name}</h2>
            <p>{activeChar.role || 'Party Member'}</p>
          </div>
        </div>
        <button className="btn-new" onClick={handleReset}>📁 New Save</button>
      </header>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-welcome">
            <p>Start chatting with <strong>{activeChar.name}</strong></p>
            <p className="hint">Ask about the story, your party, gameplay tips...</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            {msg.role === 'assistant' && activeChar.avatar_url && (
              <img src={activeChar.avatar_url} alt="" className="msg-avatar" />
            )}
            <div className="msg-content">
              {msg.role === 'assistant' && <span className="msg-name">{msg.character_name}</span>}
              <p>{msg.content}</p>
            </div>
          </div>
        ))}
        {chatLoading && (
          <div className="message assistant">
            <div className="msg-content typing"><span>●●●</span></div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder={`Message ${activeChar.name}...`}
          disabled={chatLoading}
        />
        <button onClick={handleSend} disabled={chatLoading || !input.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}
