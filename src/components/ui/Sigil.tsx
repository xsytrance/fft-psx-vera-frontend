/**
 * Sigil — the FFT PSX Vera brand mark.
 * An original "void into gold" strategist's seal: an obsidian octagon frame,
 * an ascending chevron (tactics / Vera), a ledger bar, and an aether core
 * (the parsed save truth). No franchise assets.
 */
export default function Sigil({ size = 36, className }: { size?: number; className?: string }) {
  const id = 'sigil';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="FFT PSX Vera sigil"
    >
      <defs>
        <radialGradient id={`${id}-void`} cx="50%" cy="42%" r="62%">
          <stop offset="0%" stopColor="#1a2030" />
          <stop offset="55%" stopColor="#10131c" />
          <stop offset="100%" stopColor="#070910" />
        </radialGradient>
        <linearGradient id={`${id}-bronze`} x1="14" y1="6" x2="50" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f0d690" />
          <stop offset="48%" stopColor="#c9a24b" />
          <stop offset="100%" stopColor="#8a6d2e" />
        </linearGradient>
      </defs>
      <path
        d="M21 5 H43 L59 21 V43 L43 59 H21 L5 43 V21 Z"
        fill={`url(#${id}-void)`}
        stroke={`url(#${id}-bronze)`}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M24.5 12 H39.5 L52 24.5 V39.5 L39.5 52 H24.5 L12 39.5 V24.5 Z"
        fill="none"
        stroke="#c9a24b"
        strokeOpacity="0.28"
        strokeWidth="1"
      />
      <rect x="19" y="37.5" width="26" height="2.4" rx="1.2" fill={`url(#${id}-bronze)`} />
      <path
        d="M20 36 L32 16 L44 36"
        fill="none"
        stroke={`url(#${id}-bronze)`}
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="44.5" r="3" fill="#4fd1c5" />
      <circle cx="32" cy="44.5" r="6.2" fill="none" stroke="#4fd1c5" strokeOpacity="0.4" strokeWidth="1" />
    </svg>
  );
}
