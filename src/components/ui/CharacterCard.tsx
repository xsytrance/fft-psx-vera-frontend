import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/AppContext';
import { getCharacterAccent } from '@/lib/theme';

/**
 * CharacterCard — Large card for browsing / highlighting a character.
 *
 *   • Rounded-2xl, shadow-card
 *   • Circular avatar with coloured ring (character accent)
 *   • Name in serif font
 *   • Role, affiliation badges
 *   • Personality trait chips
 *   • Hover: lift + "Chat" ghost button slides up from bottom
 */

export interface CharacterCardProps {
  characterId: number;
  name: string;
  role: string;
  affiliation?: string;
  personality?: string[];
  /** Character avatar image URL. */
  avatarUrl?: string;
  /** Fallback accent colour if character lookup fails. */
  accentColor?: string;
  /** Called when the user clicks the Chat ghost button. */
  onChat?: () => void;
  /** Called when the whole card is clicked. */
  onClick?: () => void;
  className?: string;
}

export default function CharacterCard({
  characterId,
  name,
  role,
  affiliation,
  personality = [],
  avatarUrl,
  accentColor,
  onChat,
  onClick,
  className,
}: CharacterCardProps) {
  const { state } = useApp();
  const isDark = state.darkMode;

  const color = accentColor || getCharacterAccent(characterId, isDark);

  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      layout
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-2xl bg-card shadow-card',
        'cursor-pointer border border-border',
        className
      )}
      whileHover={{ y: -4, boxShadow: 'var(--shadow-hover)' }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <div className="flex items-start gap-4 p-5">
        {/* Avatar */}
        <div
          className="flex shrink-0 items-center justify-center rounded-full overflow-hidden"
          style={{
            width: 64,
            height: 64,
            borderWidth: 3,
            borderStyle: 'solid',
            borderColor: color,
            boxShadow: `0 0 0 3px ${color}33`,
          }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <span className="text-white font-serif font-bold text-lg">
              {name.charAt(0)}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-xl font-semibold text-card-foreground truncate">
            {name}
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">
            {role}
          </p>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {affiliation && (
              <span
                className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: `${color}18`,
                  color,
                }}
              >
                {affiliation}
              </span>
            )}
            {personality.slice(0, 3).map((trait) => (
              <span
                key={trait}
                className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
              >
                {trait}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Chat ghost button (slides up on hover) */}
      <AnimatePresence>
        {hovered && onChat && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => {
              e.stopPropagation();
              onChat();
            }}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-white shadow-md"
            style={{ backgroundColor: color }}
          >
            <MessageCircle size={14} />
            Chat
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
