// Character avatar with gradient fallback and optional image
import { useState } from 'react';

interface CharacterAvatarProps {
  slug: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  className?: string;
  showName?: boolean;
}

// Each character gets a unique gradient color scheme matching their FFT palette
const CHAR_STYLES: Record<string, { gradient: string; accent: string; emoji: string }> = {
  'ramza-beoulve': {
    gradient: 'from-amber-400 via-yellow-400 to-orange-400',
    accent: 'border-amber-400/40',
    emoji: '⚔️',
  },
  'delita-heiral': {
    gradient: 'from-rose-500 via-red-400 to-pink-400',
    accent: 'border-rose-400/40',
    emoji: '🗡️',
  },
  'agrias-oaks': {
    gradient: 'from-blue-400 via-indigo-400 to-cyan-400',
    accent: 'border-blue-400/40',
    emoji: '🛡️',
  },
  'mustadio-bunansa': {
    gradient: 'from-emerald-500 via-green-400 to-teal-400',
    accent: 'border-emerald-400/40',
    emoji: '🔧',
  },
  'rapha-galthena': {
    gradient: 'from-purple-500 via-violet-400 to-fuchsia-400',
    accent: 'border-purple-400/40',
    emoji: '✨',
  },
  'marach-galthena': {
    gradient: 'from-pink-500 via-rose-400 to-red-400',
    accent: 'border-pink-400/40',
    emoji: '💫',
  },
  'meliadoul-tengille': {
    gradient: 'from-sky-400 via-blue-400 to-indigo-400',
    accent: 'border-sky-400/40',
    emoji: '⚡',
  },
  'cidolfus-orlandeau': {
    gradient: 'from-yellow-500 via-amber-400 to-orange-500',
    accent: 'border-yellow-400/40',
    emoji: '⭐',
  },
  'alma-beoulve': {
    gradient: 'from-lavender-400 via-purple-300 to-pink-300',
    accent: 'border-purple-300/40',
    emoji: '🌸',
  },
  'wiegraf-felicles': {
    gradient: 'from-slate-500 via-gray-500 to-zinc-600',
    accent: 'border-slate-400/40',
    emoji: '🌑',
  },
  'dycedarg-hyral': {
    gradient: 'from-red-600 via-rose-500 to-orange-500',
    accent: 'border-red-500/40',
    emoji: '😈',
  },
  'goffard-gaffgarion': {
    gradient: 'from-zinc-500 via-slate-400 to-gray-500',
    accent: 'border-zinc-400/40',
    emoji: '💀',
  },
  'elmdore-larg': {
    gradient: 'from-yellow-400 via-gold-400 to-amber-500',
    accent: 'border-yellow-500/40',
    emoji: '👑',
  },
  'orran-dalton': {
    gradient: 'from-indigo-400 via-blue-400 to-cyan-400',
    accent: 'border-indigo-400/40',
    emoji: '📜',
  },
};

const CHAR_IMAGES: Record<string, string> = {
  'ramza-beoulve': '/characters/ramza.png',
  'delita-heiral': '/characters/delita.png',
  'agrias-oaks': '/characters/agrias.png',
  'mustadio-bunansa': '/characters/mustadio.png',
  'rapha-galthena': '/characters/rapha.png',
  'marach-galthena': '/characters/marach.png',
  'meliadoul-tengille': '/characters/meliadoul.png',
  'cidolfus-orlandeau': '/characters/orlandeau.png',
  'alma-beoulve': '/characters/alma.png',
  'wiegraf-felicles': '/characters/wiegraf.png',
};

const SIZE_CLASSES: Record<string, { container: string; text: string }> = {
  xs: { container: 'w-5 h-5', text: 'text-[8px]' },
  sm: { container: 'w-6 h-6', text: 'text-[10px]' },
  md: { container: 'w-8 h-8', text: 'text-xs' },
  lg: { container: 'w-10 h-10', text: 'text-sm' },
  xl: { container: 'w-14 h-14', text: 'text-lg' },
  hero: { container: 'w-20 h-20 md:w-24 md:h-24', text: 'text-xl md:text-2xl' },
};

export default function CharacterAvatar({ slug, name, size = 'md', className = '', showName = false }: CharacterAvatarProps) {
  const style = CHAR_STYLES[slug.toLowerCase()] || { gradient: 'from-gray-400 to-gray-500', accent: 'border-gray-400/40', emoji: '⚪' };
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES['md'];
  const imgSrc = CHAR_IMAGES[slug.toLowerCase()];
  const [imgError, setImgError] = useState(false);

  const avatar = (
    <div className={`${sizeClass.container} rounded-full shrink-0 overflow-hidden border-2 ${style.accent} bg-gradient-to-br ${style.gradient} flex items-center justify-center ${className}`}>
      {imgSrc && !imgError ? (
        <img
          src={imgSrc}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className={`${sizeClass.text} font-bold text-white drop-shadow-md`}>
          {style.emoji}
        </span>
      )}
    </div>
  );

  if (showName) {
    return (
      <div className="flex items-center gap-2">
        {avatar}
        <span className="text-sm font-medium truncate">{name}</span>
      </div>
    );
  }

  return avatar;
}

export function getCharacterStyle(slug: string) {
  return CHAR_STYLES[slug.toLowerCase()] || { gradient: 'from-gray-400 to-gray-500', accent: 'border-gray-400/40', emoji: '⚪' };
}

export { CHAR_STYLES };
