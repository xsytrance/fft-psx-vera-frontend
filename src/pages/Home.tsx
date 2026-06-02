import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import type { Project } from '../types';

export default function Home() {
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const r = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!r.ok) {
        const err = await r.json().catch(() => ({ detail: r.statusText }));
        throw new Error(err.detail || 'Upload failed');
      }
      const data: Project = await r.json();
      dispatch({ type: 'ADD_PROJECT', payload: data });
      navigate(`/project/${data.id}`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="page-home">
      <section className="hero">
        <div className="hero-content">
          <h1>FFT PSX Vera</h1>
          <p className="hero-tagline">Upload your save. Meet your party. Talk to Ivalice.</p>
          <p className="hero-desc">
            Upload a Final Fantasy Tactics PSX memory card save file and chat with your characters.
            Your party, your story, your adventure.
          </p>
        </div>
      </section>

      <section className="upload-section">
        <div
          className={`dropzone ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".zip,.mcr,.mcd,.mcs"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            style={{ display: 'none' }}
          />
          <div className="dropzone-icon">{uploading ? '⏳' : '📁'}</div>
          <h2>{uploading ? 'Analyzing save...' : 'Drop your save file here'}</h2>
          <p>or click to browse</p>
          <p className="formats">.zip · .mcr · .mcd · .mcs</p>
        </div>
        {error && <div className="error-banner">⚠️ {error}</div>}
      </section>

      <section className="features">
        <div className="feature">
          <span className="feature-icon">💾</span>
          <h3>Save Analysis</h3>
          <p>Auto-detects your party, level, job class, and story progress from any PSX save file.</p>
        </div>
        <div className="feature">
          <span className="feature-icon">💬</span>
          <h3>Character Chat</h3>
          <p>Talk to Ramza, Delita, Agrias, and more — each with unique personality and knowledge.</p>
        </div>
        <div className="feature">
          <span className="feature-icon">🎮</span>
          <h3>Gameplay Guide</h3>
          <p>Ask about job unlocks, JP farming, rare weapons, treasure, and shop prices.</p>
        </div>
        <div className="feature">
          <span className="feature-icon">🎨</span>
          <h3>Custom Avatars</h3>
          <p>Pick from 20 job class images or upload your own custom character portraits.</p>
        </div>
      </section>
    </div>
  );
}
