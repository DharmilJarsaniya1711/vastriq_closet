import { CSSProperties } from 'react';

const colorMap: Record<string, { from: string; to: string; ink: string }> = {
  emerald: { from: '#0F4C3A', to: '#2E8B6F', ink: '#FAF7F0' },
  ivory: { from: '#FAF7F0', to: '#E8DFCB', ink: '#0F4C3A' },
  yellow: { from: '#D4AF37', to: '#F2E6B6', ink: '#0F4C3A' },
  maroon: { from: '#7B1E2B', to: '#C97B6B', ink: '#FAF7F0' },
  gold: { from: '#B8860B', to: '#F2E6B6', ink: '#0F4C3A' },
  red: { from: '#7B1E2B', to: '#C97B6B', ink: '#FAF7F0' },
  blue: { from: '#0A2540', to: '#3F6D9F', ink: '#FAF7F0' },
  pink: { from: '#C97B6B', to: '#F4D5CC', ink: '#0F4C3A' },
  green: { from: '#13573F', to: '#6DAB91', ink: '#FAF7F0' },
  black: { from: '#1A1A1A', to: '#4A4A4A', ink: '#FAF7F0' },
  white: { from: '#FAF7F0', to: '#F2EDE2', ink: '#0F4C3A' },
};

const fallback = colorMap.emerald;

interface OutfitImageProps {
  title: string;
  color?: string;
  src?: string;
  className?: string;
  ratio?: 'portrait' | 'square';
  withWatermark?: boolean;
}

const OutfitImage = ({ title, color, src, className = '', ratio = 'portrait', withWatermark = true }: OutfitImageProps) => {
  if (src) {
    return (
      <div className={`relative overflow-hidden ${ratio === 'portrait' ? 'aspect-[4/5]' : 'aspect-square'} ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={title} className="h-full w-full object-cover" />
      </div>
    );
  }

  const key = (color ?? '').toLowerCase();
  const palette = colorMap[key] ?? fallback;
  const initials = title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  const style: CSSProperties = {
    background: `linear-gradient(135deg, ${palette.from} 0%, ${palette.to} 100%)`,
    color: palette.ink,
  };

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${
        ratio === 'portrait' ? 'aspect-[4/5]' : 'aspect-square'
      } ${className}`}
      style={style}
    >
      {/* decorative diamond pattern */}
      <svg className="absolute inset-0 h-full w-full opacity-15" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="vc-diamond" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M20 0 L40 20 L20 40 L0 20 Z"
              fill="none"
              stroke={palette.ink}
              strokeWidth="0.6"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#vc-diamond)" />
      </svg>

      <div className="relative z-10 text-center">
        <p
          className="vc-wordmark text-[10px] opacity-70"
          style={{ color: palette.ink }}
        >
          Vastriq
        </p>
        <p
          className="mt-2 font-serif text-5xl"
          style={{ color: palette.ink, fontFamily: '"Cormorant Garamond", Georgia, serif' }}
        >
          {initials || 'VC'}
        </p>
      </div>

      {withWatermark && (
        <p
          className="absolute bottom-3 right-4 text-[9px] uppercase tracking-[0.3em] opacity-50"
          style={{ color: palette.ink }}
        >
          {key || 'premium'}
        </p>
      )}
    </div>
  );
};

export default OutfitImage;
