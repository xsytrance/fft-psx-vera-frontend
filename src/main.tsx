/* FFT PSX Vera v1.0.1 — Final Fantasy Tactics Save Analyzer & Character Chat */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

/* ── Theme initialisation ──
 * Apply the saved / system dark-mode class *before* React hydrates so the
 * first paint already has the correct palette.  */
import { getInitialDarkMode } from './lib/theme';
const rootEl = document.documentElement;
if (getInitialDarkMode()) {
  rootEl.classList.add('dark');
} else {
  rootEl.classList.remove('dark');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
