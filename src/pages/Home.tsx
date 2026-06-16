import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { Upload, Loader2, AlertTriangle, HardDriveDownload, MessagesSquare, Compass, Sparkles, ScrollText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Sigil from '../components/ui/Sigil';
import Eyebrow from '../components/ui/Eyebrow';
import { api } from '../lib/api';
import type { Project } from '../types';

type UploadDebug = {
  endpoint: string;
  fileName: string;
  fileSize: number;
  status?: number;
  statusText?: string;
  requestId?: string;
  responseBody?: unknown;
  note?: string;
};

export default function Home() {
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [debug, setDebug] = useState<UploadDebug | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    setError('');
    setDebug(null);

    const endpoint = '/api/upload';
    const baseDebug: UploadDebug = {
      endpoint,
      fileName: file.name,
      fileSize: file.size,
    };

    try {
      const r = await api.uploadSave(file);

      if (!r.ok) {
        setDebug({
          ...baseDebug,
          status: r.status,
          statusText: r.statusText,
          requestId: r.requestId,
          responseBody: r.body,
          note: 'Upload reached the API/dev proxy, but parsing or proxying failed.',
        });
        const errBody = (r.body ?? null) as { detail?: string; error?: string } | null;
        throw new Error(errBody?.detail || errBody?.error || r.statusText || 'Upload failed');
      }

      const body = r.body as (Project & { status?: string; existing_save?: { id?: number } });
      const data = body.status === 'duplicate' && body.existing_save?.id
        ? await api.loadSaveHistory(body.existing_save.id)
        : body;

      if (!data?.id) {
        throw new Error('Save loaded, but the API did not return a project id.');
      }

      dispatch({ type: 'ADD_PROJECT', payload: data });
      navigate(`/project/${data.id}`);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Upload failed';
      setError(message);
      setDebug(current => current || {
        ...baseDebug,
        responseBody: message,
        note: 'Browser/dev-server failure before a usable API response arrived. Check Vite proxy target and backend port.',
      });
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
    <div className="page-home home-vault">
      <section className="home-hero-panel" aria-label="MultiVera Presents Final Fantasy Tactics">
        <div className="home-art-orbit" aria-hidden="true">
          <span>♈</span><span>♌</span><span>♐</span><span>✦</span>
        </div>
        <div className="home-brand-lockup">
          <Sigil size={72} className="hero-sigil" />
          <div>
            <Eyebrow tone="aether">MultiVera Presents</Eyebrow>
            <h1>Final Fantasy Tactics</h1>
            <p className="hero-tagline">Upload your save. Read its truth. Speak with your party.</p>
          </div>
        </div>
        <p className="hero-desc">
          A polished tactical companion terminal for PSX memory-card saves — grounded party chat,
          Save Truth, inventory reads, and a living campaign ledger drawn from your file.
        </p>
        <div className="home-feature-strip" aria-label="Core features">
          <span><HardDriveDownload size={15} /> Save Truth</span>
          <span><MessagesSquare size={15} /> Grounded Chat</span>
          <span><Compass size={15} /> Campaign Ledger</span>
          <span><Sparkles size={15} /> Portraits</span>
        </div>
      </section>

      <section className="home-action-grid">
        <div className="upload-section home-upload-card">
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
            <div className="dropzone-icon">
              {uploading ? <Loader2 size={34} className="spin" /> : <Upload size={34} />}
            </div>
            <h2>{uploading ? 'Reading the save...' : 'Drop your save file'}</h2>
            <p>or click to browse</p>
            <p className="formats">.zip · .mcr · .mcd · .mcs</p>
          </div>
          {error && (
            <div className="error-banner">
              <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertTriangle size={15} /> {error}
              </strong>
              {debug && (
                <details className="upload-debug" open>
                  <summary>Debug details</summary>
                  <dl>
                    <div><dt>Endpoint</dt><dd>{debug.endpoint}</dd></div>
                    <div><dt>File</dt><dd>{debug.fileName} ({debug.fileSize.toLocaleString()} bytes)</dd></div>
                    {debug.status && <div><dt>Status</dt><dd>{debug.status} {debug.statusText}</dd></div>}
                    {debug.requestId && <div><dt>Request ID</dt><dd>{debug.requestId}</dd></div>}
                    {debug.note && <div><dt>Note</dt><dd>{debug.note}</dd></div>}
                  </dl>
                  {debug.responseBody != null && (
                    <pre>{typeof debug.responseBody === 'string' ? debug.responseBody : JSON.stringify(debug.responseBody, null, 2)}</pre>
                  )}
                </details>
              )}
            </div>
          )}
        </div>

        <aside className="home-clean-card">
          <Eyebrow>Field Manual</Eyebrow>
          <h2>Need to export a save?</h2>
          <p>
            DuckStation/ePSXe parser instructions moved off the command deck so this screen stays clean.
          </p>
          <Link className="btn-ghost parser-guide-link" to="/parser-guide">
            <ScrollText size={16} /> Open parser guide
          </Link>
          <div className="home-art-card" aria-hidden="true">
            <span className="home-job-sigil">⚔</span>
            <span className="home-job-sigil">✦</span>
            <span className="home-job-sigil">♜</span>
          </div>
        </aside>
      </section>
    </div>
  );
}
