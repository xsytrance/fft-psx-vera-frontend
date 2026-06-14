import type { ReactNode } from 'react';

type BadgeTone = 'neutral' | 'gold' | 'aether' | 'ember' | 'arcane' | 'danger' | 'caution';

/** Badge — a compact pill for status, counts, and tags. */
export default function Badge({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  const toneClass = tone === 'neutral' ? '' : `badge--${tone}`;
  return <span className={`badge ${toneClass} ${className}`.trim()}>{children}</span>;
}
