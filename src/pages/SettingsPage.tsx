import { Link } from 'react-router';
import { Moon, Sun, Check, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useTheme, type Theme } from '../lib/theme';
import MusicControls from '../components/music/MusicControls';
import Eyebrow from '../components/ui/Eyebrow';

type ThemeChoice = {
  id: Theme;
  name: string;
  blurb: string;
  icon: typeof Moon;
  bg: string;
  chips: string[];
};

const THEMES: ThemeChoice[] = [
  {
    id: 'dark',
    name: 'Obsidian',
    blurb: 'Moonlit war-room. Deep obsidian surfaces, parchment text, bronze trim.',
    icon: Moon,
    bg: '#0a0e14',
    chips: ['#c9a24b', '#4fd1c5', '#e8743b', '#e9e2d2'],
  },
  {
    id: 'light',
    name: 'Parchment',
    blurb: 'Daylight ledger. Warm parchment surfaces, dark ink, deepened accents.',
    icon: Sun,
    bg: '#e9e0cb',
    chips: ['#876a26', '#1c857b', '#bf5420', '#2c2820'],
  },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="page-settings">
      <div className="page-header">
        <div className="breadcrumb">
          <Link to="/">Home</Link> / <span>Settings</span>
        </div>
        <Eyebrow>Companion settings</Eyebrow>
        <h1>Settings</h1>
      </div>

      <section className="panel" style={{ marginTop: '1.5rem' }}>
        <Eyebrow>Appearance</Eyebrow>
        <h2 className="section-title" style={{ margin: '0.3rem 0 0.25rem' }}>Theme</h2>
        <p className="empty-text" style={{ marginBottom: '1rem' }}>
          Choose how the companion looks. Parser truth, save data, and grounding never change with the theme.
        </p>

        <div className="settings-grid">
          {THEMES.map(t => {
            const Icon = t.icon;
            const active = theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                className={`theme-option ${active ? 'active' : ''}`}
                aria-pressed={active}
                onClick={() => setTheme(t.id)}
              >
                <div className="theme-swatch" style={{ background: t.bg }}>
                  {t.chips.map(c => <i key={c} style={{ background: c }} />)}
                </div>
                <div className="theme-option-head">
                  <strong><Icon size={15} style={{ verticalAlign: '-2px', marginRight: '0.4rem' }} />{t.name}</strong>
                  {active && <span className="chk"><Check size={16} /></span>}
                </div>
                <p>{t.blurb}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="panel panel--ember" style={{ marginTop: '1rem' }}>
        <MusicControls mode="settings" />
      </section>

      <section className="panel panel--truth" style={{ marginTop: '1rem' }}>
        <Eyebrow tone="aether">Grounding</Eyebrow>
        <h2 className="section-title" style={{ margin: '0.3rem 0 0.5rem' }}>Parser truth, always on</h2>
        <p className="empty-text" style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
          <ShieldCheck size={16} style={{ color: 'var(--aether)', flexShrink: 0, marginTop: '2px' }} />
          <span>
            Character responses are generated server-side and grounded in your parsed save. Model and prompt
            configuration live on the backend — this companion never lets the model invent save facts.
          </span>
        </p>
      </section>

      <section className="panel" style={{ marginTop: '1rem' }}>
        <Eyebrow>About</Eyebrow>
        <h2 className="section-title" style={{ margin: '0.3rem 0 0.5rem' }}>FFT PSX Vera</h2>
        <p className="empty-text">
          A tactical fantasy save companion — part of <strong>MultiVera</strong> by xsytrance. Your save file,
          parsed into a living party ledger.
        </p>
        <div style={{ marginTop: '1rem' }}>
          <Link to="/" className="btn-back"><ArrowLeft size={15} /> Back to Home</Link>
        </div>
      </section>
    </div>
  );
}
