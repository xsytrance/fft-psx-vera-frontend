import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
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
  const parserDownloadUrl = `${import.meta.env.BASE_URL}tools/duckstation_fft_parser.py`;
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
      const fd = new FormData();
      fd.append('file', file);
      const r = await fetch(endpoint, { method: 'POST', body: fd });
      const text = await r.text();
      let body: any = text;
      try {
        body = text ? JSON.parse(text) : null;
      } catch {
        // Keep raw text for debug output.
      }

      if (!r.ok) {
        setDebug({
          ...baseDebug,
          status: r.status,
          statusText: r.statusText,
          requestId: r.headers.get('x-request-id') || undefined,
          responseBody: body,
          note: 'Upload reached the API/dev proxy, but parsing or proxying failed.',
        });
        throw new Error(body?.detail || body?.error || r.statusText || 'Upload failed');
      }

      const data: Project = body;
      dispatch({ type: 'ADD_PROJECT', payload: data });
      navigate(`/project/${data.id}`);
    } catch (e: any) {
      const message = e?.message || 'Upload failed';
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
        {error && (
          <div className="error-banner">
            <strong>⚠️ {error}</strong>
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
      </section>

      <section className="parser-download">
        <div>
          <span className="parser-eyebrow">NEW TOOL</span>
          <h2>DuckStation FFT save parser</h2>
          <p>
            Read-only Python parser for raw PS1 memory-card saves: validates .mcd/.mcr files,
            lists FFT slots, extracts confirmed equipment bytes, and diffs original vs edited saves.
          </p>
        </div>
        <a className="btn-primary" href={parserDownloadUrl} download>
          ⬇ Download parser
        </a>
      </section>

      <section className="parser-instructions">
        <span className="parser-eyebrow">HOW TO USE</span>
        <h2>Run the parser locally</h2>
        <ol>
          <li>Download <code>duckstation_fft_parser.py</code>.</li>
          <li>Find your DuckStation/ePSXe raw PS1 card, usually a <code>.mcd</code> or <code>.mcr</code> file.</li>
          <li>Run: <code>python3 duckstation_fft_parser.py /path/to/epsxe000.mcd</code></li>
          <li>For machine-readable output: <code>python3 duckstation_fft_parser.py /path/to/epsxe000.mcd --json</code></li>
          <li>To compare two FFT save slots: <code>python3 duckstation_fft_parser.py /path/to/epsxe000.mcd --diff-slots 1 2</code></li>
        </ol>
        <p>
          It is read-only: it validates the card, lists FFT save IDs, shows confirmed character/equipment bytes,
          and never writes back to your memory card.
        </p>
      </section>

      <section className="features">
        <div className="feature">
          <span className="feature-icon">💾</span>
          <h3>Save Analysis</h3>
          <p>Auto-detects your party, equipment, level, job class, and story progress from PSX save files.</p>
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
