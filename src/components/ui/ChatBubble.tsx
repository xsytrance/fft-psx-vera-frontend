import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getCharacterAvatar, getCharacterAccent } from '@/lib/theme';

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
  characterId?: number;
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
  characterId,
  accentColor,
  isUser = false,
  isSystem = false,
  className,
}: ChatBubbleProps) {
  const resolvedAccent = accentColor || (characterId ? getCharacterAccent(characterId, false) : '#5B4B8A');
  const avatarUrl = characterId ? getCharacterAvatar(characterId) : undefined;
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
      className={cn('flex items-start gap-2 py-1', className)}
    >
      {/* Character avatar */}
      {avatarUrl && (
        <div
          className="shrink-0 rounded-full overflow-hidden"
          style={{
            width: 32,
            height: 32,
            borderWidth: 2,
            borderStyle: 'solid',
            borderColor: resolvedAccent,
          }}
        >
          <img
            src={avatarUrl}
            alt={characterName || 'Character'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="flex flex-col items-start">
        {/* Name label */}
        {characterName && (
          <span
            className="mb-1 ml-1 text-xs font-medium"
            style={{ color: resolvedAccent }}
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
          backgroundColor: `${resolvedAccent}14`, // ~8% opacity on light bg
          borderLeftWidth: 3,
          borderLeftStyle: 'solid',
          borderLeftColor: resolvedAccent,
        }}
      >
        {message}
      </div>
      </div>
    </motion.div>
  );
}
