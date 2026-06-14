import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Upload, Loader2, Download, AlertTriangle, HardDriveDownload, MessagesSquare, Compass, UserRoundCog } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Sigil from '../components/ui/Sigil';
import Eyebrow from '../components/ui/Eyebrow';
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
      let body: unknown = text;
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
        const errBody = (body ?? null) as { detail?: string; error?: string } | null;
        throw new Error(errBody?.detail || errBody?.error || r.statusText || 'Upload failed');
      }

      const data = body as Project;
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
    <div className="page-home">
      <section className="hero">
        <div className="hero-content">
          <Sigil size={84} className="hero-sigil" />
          <h1>FFT PSX Vera</h1>
          <p className="hero-tagline">Upload your save. Read its truth. Speak with your party.</p>
          <p className="hero-desc">
            A tactical fantasy companion terminal. Drop in a PSX memory-card save and the parser turns
            it into a living party ledger — every name, level, and item drawn straight from your file.
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
          <div className="dropzone-icon">
            {uploading ? <Loader2 size={40} className="spin" /> : <Upload size={40} />}
          </div>
          <h2>{uploading ? 'Reading the save...' : 'Drop your save file here'}</h2>
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
      </section>

      <section className="parser-download">
        <div>
          <Eyebrow tone="aether">Read-only tool</Eyebrow>
          <h2>DuckStation save parser</h2>
          <p>
            A read-only Python parser for raw PS1 memory-card saves: it validates .mcd/.mcr files,
            lists save slots, extracts confirmed equipment bytes, and diffs original vs edited saves.
          </p>
        </div>
        <a className="btn-primary" href={parserDownloadUrl} download>
          <Download size={16} /> Download parser
        </a>
      </section>

      <section className="parser-instructions">
        <Eyebrow>How to use</Eyebrow>
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
          <span className="feature-icon"><HardDriveDownload size={24} /></span>
          <h3>Save Truth</h3>
          <p>The parser reads your party, equipment, level, job, and inventory straight from the save — no guessing.</p>
        </div>
        <div className="feature">
          <span className="feature-icon"><MessagesSquare size={24} /></span>
          <h3>Grounded Chat</h3>
          <p>Talk to your roster — each voice is anchored to the parsed facts of your actual save.</p>
        </div>
        <div className="feature">
          <span className="feature-icon"><Compass size={24} /></span>
          <h3>Campaign Ledger</h3>
          <p>Inspect inventory changes, save-memory events, and what the party knows between battles.</p>
        </div>
        <div className="feature">
          <span className="feature-icon"><UserRoundCog size={24} /></span>
          <h3>Custom Portraits</h3>
          <p>Choose a portrait for each member or upload your own to make the roster yours.</p>
        </div>
      </section>
    </div>
  );
}
