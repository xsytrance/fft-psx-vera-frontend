/**
 * AmbientBackground — Subtle full-page atmospheric layer.
 *
 * Creates a very soft, slow-moving gradient mesh using the selected
 * character's accent colors at very low opacity (2-4%).
 * CSS-only drift animation; positioned absolutely behind content.
 */

import { useMemo } from 'react';

export interface AmbientBackgroundProps {
  /** Primary accent colour (hex). */
  primaryColor: string;
  /** Secondary accent colour (hex); falls back to primary. */
  secondaryColor?: string;
  /** Light-mode opacity (default 0.03). */
  lightOpacity?: number;
  /** Dark-mode opacity (default 0.05). */
  darkOpacity?: number;
  className?: string;
}

export default function AmbientBackground({
  primaryColor,
  secondaryColor,
  lightOpacity = 0.03,
  darkOpacity = 0.05,
  className,
}: AmbientBackgroundProps) {
  const secondary = secondaryColor || primaryColor;

  const gradient = useMemo(
    () =>
      `radial-gradient(circle at 70% 30%, ${primaryColor} 0%, transparent 60%), ` +
      `radial-gradient(circle at 30% 70%, ${secondary} 0%, transparent 50%)`,
    [primaryColor, secondary]
  );

  return (
    <div
      className={
        'absolute inset-0 pointer-events-none transition-opacity duration-1000 ' +
        `opacity-[${lightOpacity}] dark:opacity-[${darkOpacity}] ` +
        (className || '')
      }
      style={{ background: gradient }}
      aria-hidden="true"
    />
  );
}
