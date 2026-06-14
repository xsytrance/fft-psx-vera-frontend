import type { ReactNode } from 'react';

type EyebrowTone = 'gold' | 'ember' | 'aether' | 'arcane';

/** Eyebrow — a small engraved label that sits above a heading. */
export default function Eyebrow({
  children,
  tone = 'gold',
  className = '',
}: {
  children: ReactNode;
  tone?: EyebrowTone;
  className?: string;
}) {
  const toneClass = tone === 'gold' ? '' : `eyebrow--${tone}`;
  return <span className={`eyebrow ${toneClass} ${className}`.trim()}>{children}</span>;
}
