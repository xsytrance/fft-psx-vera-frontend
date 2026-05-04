import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * TimelineNode — Circular node for a visual story timeline.
 *
 *   • States:
 *     – default:  outline ring
 *     – selected: filled circle + ring
 *     – hover:    scale 1.2
 *   • Connected by an optional connector line (rendered by parent).
 */

export type NodeState = 'default' | 'selected' | 'completed';

export interface TimelineNodeProps {
  /** Display label beneath the node. */
  label?: string;
  /** Node visual state. */
  state?: NodeState;
  /** Accent colour for the node fill / ring. */
  color: string;
  /** Click handler. */
  onClick?: () => void;
  className?: string;
}

export default function TimelineNode({
  label,
  state = 'default',
  color,
  onClick,
  className,
}: TimelineNodeProps) {
  const isSelected = state === 'selected';
  const isCompleted = state === 'completed';

  const buttonStyle: React.CSSProperties = {
    backgroundColor: isSelected || isCompleted ? color : 'transparent',
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: color,
    boxShadow: isSelected ? `0 0 0 4px ${color}33` : 'none',
  };

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <motion.button
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
        onClick={onClick}
        className={cn(
          'relative flex items-center justify-center rounded-full',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'w-4 h-4'
        )}
        style={buttonStyle}
        aria-label={label || 'Timeline node'}
      >
        {/* Inner dot for completed but not selected */}
        {isCompleted && !isSelected && (
          <span
            className="block rounded-full"
            style={{
              width: 6,
              height: 6,
              backgroundColor: color,
            }}
          />
        )}
      </motion.button>

      {label && (
        <span className="text-xs text-muted-foreground text-center max-w-[80px] leading-tight">
          {label}
        </span>
      )}
    </div>
  );
}
