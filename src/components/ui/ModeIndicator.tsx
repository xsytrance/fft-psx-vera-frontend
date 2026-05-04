import { cn } from '@/lib/utils';

/**
 * ModeIndicator — Pill-shaped badge showing the current interaction mode.
 *
 *   • story-locked: plum (#5B4B8A)
 *   • post-end:     amber (#D4884F)
 *   • casual:       green (#4A7C59)
 *   • multi-character: violet (#7C3AED)
 *   • agent:        slate (#64748B)
 */

export type InteractionMode =
  | 'story-locked'
  | 'post-end'
  | 'casual'
  | 'multi-character'
  | 'agent';

const MODE_META: Record<
  InteractionMode,
  { label: string; bg: string; fg: string }
> = {
  'story-locked': {
    label: 'Story Locked',
    bg: '#5B4B8A',
    fg: '#FFFFFF',
  },
  'post-end': {
    label: 'Post-End',
    bg: '#D4884F',
    fg: '#14121A',
  },
  casual: {
    label: 'Casual',
    bg: '#4A7C59',
    fg: '#FFFFFF',
  },
  'multi-character': {
    label: 'Multi-Character',
    bg: '#7C3AED',
    fg: '#FFFFFF',
  },
  agent: {
    label: 'Agent',
    bg: '#64748B',
    fg: '#FFFFFF',
  },
};

export interface ModeIndicatorProps {
  mode: InteractionMode;
  /** Optional click handler for a mode-switcher dropdown. */
  onClick?: () => void;
  className?: string;
}

export default function ModeIndicator({
  mode,
  onClick,
  className,
}: ModeIndicatorProps) {
  const meta = MODE_META[mode] ?? MODE_META.agent;

  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-transform',
        'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
        className
      )}
      style={{
        backgroundColor: meta.bg,
        color: meta.fg,
      }}
    >
      {meta.label}
    </button>
  );
}
