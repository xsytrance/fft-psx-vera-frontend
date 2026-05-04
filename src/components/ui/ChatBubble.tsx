import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * ChatBubble — Distinct styling per message type.
 *
 *   • User: right-aligned, secondary background, rounded-2xl
 *   • Character: left-aligned, accent-tinted background (8% opacity), left
 *     border accent (3px), rounded-2xl. Character name label above bubble in
 *     accent colour.
 *   • System: centered, italic, muted, small text
 */

export interface ChatBubbleProps {
  message: string;
  characterName?: string;
  accentColor?: string;
  /** If true, renders as a user message (right-aligned). */
  isUser?: boolean;
  /** If true, renders as a system message (centered, muted). */
  isSystem?: boolean;
  className?: string;
}

export default function ChatBubble({
  message,
  characterName,
  accentColor = '#5B4B8A',
  isUser = false,
  isSystem = false,
  className,
}: ChatBubbleProps) {
  /* ── System message ── */
  if (isSystem) {
    return (
      <div className={cn('flex justify-center py-2', className)}>
        <span className="text-xs italic text-muted-foreground">
          {message}
        </span>
      </div>
    );
  }

  /* ── User message ── */
  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
        className={cn('flex justify-end py-1', className)}
      >
        <div
          className={cn(
            'max-w-[75%] rounded-2xl rounded-br-md px-4 py-3 text-sm',
            'bg-secondary text-secondary-foreground'
          )}
        >
          {message}
        </div>
      </motion.div>
    );
  }

  /* ── Character message ── */
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
      className={cn('flex flex-col items-start py-1', className)}
    >
      {/* Name label */}
      {characterName && (
        <span
          className="mb-1 ml-1 text-xs font-medium"
          style={{ color: accentColor }}
        >
          {characterName}
        </span>
      )}

      <div
        className={cn(
          'max-w-[75%] rounded-2xl rounded-bl-md px-4 py-3 text-sm',
          'text-card-foreground'
        )}
        style={{
          backgroundColor: `${accentColor}14`, // ~8% opacity on light bg
          borderLeftWidth: 3,
          borderLeftStyle: 'solid',
          borderLeftColor: accentColor,
        }}
      >
        {message}
      </div>
    </motion.div>
  );
}
