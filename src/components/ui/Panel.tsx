import type { ReactNode } from 'react';

type PanelVariant = 'default' | 'truth' | 'ember' | 'arcane' | 'aether';

/**
 * Panel — the base record surface of the design language.
 *  - "truth"  → a sealed ledger / parser record (factual, sacred)
 *  - "ember"  → campfire / character warmth
 *  - "arcane" → the spellbound LLM layer
 */
export default function Panel({
  children,
  variant = 'default',
  className = '',
  as: Tag = 'section',
}: {
  children: ReactNode;
  variant?: PanelVariant;
  className?: string;
  as?: 'section' | 'div' | 'article' | 'aside';
}) {
  const variantClass = variant === 'default' ? '' : `panel--${variant}`;
  return <Tag className={`panel ${variantClass} ${className}`.trim()}>{children}</Tag>;
}
