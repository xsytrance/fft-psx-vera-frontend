import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * TypingIndicator — Animated "[Name] is thinking…" bubble for chat.
 *
 *   • Character avatar + speech bubble with 3 animated dots
 *   • Framer Motion staggered pulse animation (1500ms loop)
 *   • Caption beneath bubble
 */

export interface TypingIndicatorProps {
  characterName: string;
  /** Avatar colour / character accent. */
  accentColor: string;
  /** Optional avatar image URL; takes precedence over initial. */
  avatarUrl?: string;
  /** Optional avatar initial (fallback to first char of name). */
  avatarInitial?: string;
  className?: string;
}

export default function TypingIndicator({
  characterName,
  accentColor,
  avatarUrl,
  avatarInitial,
  className,
}: TypingIndicatorProps) {
  const initial = avatarInitial || characterName.charAt(0);

  return (
    <div className={cn('flex items-end gap-3 py-1', className)}>
      {/* Avatar */}
      <div
        className="flex shrink-0 items-center justify-center rounded-full overflow-hidden"
        style={{
          width: 32,
          height: 32,
          borderWidth: 2,
          borderStyle: 'solid',
          borderColor: accentColor,
        }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={characterName}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span
            className="text-white font-serif font-bold text-sm flex items-center justify-center w-full h-full"
            style={{ backgroundColor: accentColor }}
          >
            {initial}
          </span>
        )}
      </div>

      <div className="flex flex-col items-start gap-1">
        {/* Thinking bubble */}
        <div
          className="flex items-center gap-1 rounded-2xl rounded-bl-md px-4 py-2.5"
          style={{ backgroundColor: `${accentColor}14` }}
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="block rounded-full"
              style={{
                width: 6,
                height: 6,
                backgroundColor: accentColor,
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.1, 0.8],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Caption */}
        <span className="ml-1 text-xs italic text-muted-foreground">
          {characterName} is thinking…
        </span>
      </div>
    </div>
  );
}
