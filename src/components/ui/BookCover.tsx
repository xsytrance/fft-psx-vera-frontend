import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * BookCover — A book-cover-style card used for projects and "recently read" items.
 *
 * Visual identity:
 *   • aspect-[2/3] rounded-2xl rectangle
 *   • Gradient background (passed as prop)
 *   • Centered text (initials or icon)
 *   • Left "spine" border (4px accent color)
 *   • Hover: slight rotation(-1deg), shadow increase
 */

export interface BookCoverProps {
  /** Primary text — usually initials or a short title. */
  label: string;
  /** Gradient CSS string, e.g. "from-rose-400 to-orange-300". */
  gradient: string;
  /** Accent colour for the left spine. */
  spineColor: string;
  /** Optional sub-label shown beneath the primary label. */
  subLabel?: string;
  /** Additional CSS classes. */
  className?: string;
  /** Click handler. */
  onClick?: () => void;
}

export default function BookCover({
  label,
  gradient,
  spineColor,
  subLabel,
  className,
  onClick,
}: BookCoverProps) {
  return (
    <motion.button
      whileHover={{ rotate: -1, scale: 1.02 }}
      transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={onClick}
      className={cn(
        'relative aspect-[2/3] w-20 shrink-0 overflow-hidden rounded-2xl text-center',
        'shadow-card hover:shadow-hover',
        'cursor-pointer border-0 bg-transparent p-0 text-left',
        className
      )}
      style={{
        borderLeftWidth: 4,
        borderLeftStyle: 'solid',
        borderLeftColor: spineColor,
      }}
    >
      <div
        className={cn(
          'absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br p-2',
          gradient
        )}
      >
        <span
          className="font-serif text-lg font-bold leading-tight"
          style={{ color: 'rgba(255,255,255,0.95)' }}
        >
          {label}
        </span>
        {subLabel && (
          <span
            className="mt-1 text-[10px] font-medium uppercase tracking-wider"
            style={{ color: 'rgba(255,255,255,0.75)' }}
          >
            {subLabel}
          </span>
        )}
      </div>
    </motion.button>
  );
}
