// Character avatar with gradient fallback and optional image
import { useState } from 'react';

interface CharacterAvatarProps {
  slug: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  className?: string;
  showName?: boolean;
}

// Each character gets a unique gradient color scheme matching their CT palette
const CHAR_STYLES: Record<string, { gradient: string; accent: string; emoji: string }> = {
  crono: {
    gradient: 'from-red-500 via-rose-400 to-orange-400',
    accent: 'border-red-400/40',
    emoji: '🔴',
  },
  marle: {
    gradient: 'from-blue-400 via-indigo-400 to-violet-500',
    accent: 'border-blue-400/40',
    emoji: '🩷',
  },
  lucca: {
    gradient: 'from-orange-400 via-amber-400 to-yellow-400',
    accent: 'border-orange-400/40',
    emoji: '🟡',
  },
  robo: {
    gradient: 'from-slate-400 via-gray-400 to-zinc-500',
    accent: 'border-slate-400/40',
    emoji: '🟢',
  },
  frog: {
    gradient: 'from-emerald-500 via-green-400 to-teal-400',
    accent: 'border-emerald-400/40',
    emoji: '🟩',
  },
  ayla: {
    gradient: 'from-amber-500 via-orange-400 to-yellow-500',
    accent: 'border-amber-400/40',
    emoji: '🟤',
  },
  magus: {
    gradient: 'from-purple-600 via-violet-500 to-indigo-500',
    accent: 'border-purple-400/40',
    emoji: '🟣',
  },
};

const CHAR_IMAGES: Record<string, string> = {
  crono: '/characters/crono.png',
  marle: '/characters/marle.png',
  lucca: '/characters/lucca.png',
  robo: '/characters/robo.png',
  frog: '/characters/frog.png',
  ayla: '/characters/ayla.png',
  magus: '/characters/magus.png',
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
