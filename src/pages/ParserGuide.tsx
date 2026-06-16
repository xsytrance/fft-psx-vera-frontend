import { Download, ShieldCheck, TerminalSquare } from 'lucide-react';
import Eyebrow from '../components/ui/Eyebrow';

export default function ParserGuide() {
  const parserDownloadUrl = `${import.meta.env.BASE_URL}tools/duckstation_fft_parser.py`;

  return (
    <div className="page-parser-guide">
      <header className="page-header parser-guide-head">
        <div>
          <Eyebrow tone="aether">Read-only field tool</Eyebrow>
          <h1>DuckStation save parser</h1>
          <p className="phase">Export raw PS1 memory-card truth without touching the original card.</p>
        </div>
        <a className="btn-primary" href={parserDownloadUrl} download>
          <Download size={16} /> Download parser
        </a>
      </header>

      <section className="parser-guide-grid">
        <div className="panel panel--truth parser-guide-card">
          <ShieldCheck size={28} />
          <h2>What it does</h2>
          <p>
            The parser validates DuckStation/ePSXe raw memory cards, lists FFT save slots, extracts confirmed
            character and equipment bytes, and can diff two save slots for controlled changes.
          </p>
          <p className="parser-safe-note">It is read-only and never writes back to your memory card.</p>
        </div>

        <div className="panel parser-guide-card parser-guide-commands">
          <TerminalSquare size={28} />
          <h2>Run it locally</h2>
          <ol>
            <li>Download <code>duckstation_fft_parser.py</code>.</li>
            <li>Find your DuckStation/ePSXe raw PS1 card, usually a <code>.mcd</code> or <code>.mcr</code> file.</li>
            <li>Run: <code>python3 duckstation_fft_parser.py /path/to/epsxe000.mcd</code></li>
            <li>JSON output: <code>python3 duckstation_fft_parser.py /path/to/epsxe000.mcd --json</code></li>
            <li>Compare slots: <code>python3 duckstation_fft_parser.py /path/to/epsxe000.mcd --diff-slots 1 2</code></li>
          </ol>
        </div>
      </section>
    </div>
  );
}
