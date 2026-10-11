import React from 'react';

interface EmberTokenProps {
  amount?: number | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  isAnimated?: boolean;
  className?: string;
}

export const EmberTokenIcon: React.FC<{ size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const pixelSize = {
    xs: 14,
    sm: 18,
    md: 22,
    lg: 28,
    xl: 38,
  }[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full transition-transform ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
    >
      {/* Outer subtle glow */}
      <div
        className="absolute inset-0 rounded-full bg-[#F97316]/30 blur-[2px] pointer-events-none"
        style={{ transform: 'scale(1.15)' }}
      />

      {/* Circular token coin with bevel gradient */}
      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-1 drop-shadow-xs"
      >
        <defs>
          <linearGradient id="emberTokenOuter" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FDBA74" />
            <stop offset="0.4" stopColor="#F97316" />
            <stop offset="0.8" stopColor="#EA580C" />
            <stop offset="1" stopColor="#9A3412" />
          </linearGradient>
          <linearGradient id="emberTokenInner" x1="7" y1="7" x2="25" y2="25" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7C2D12" />
            <stop offset="0.7" stopColor="#431407" />
            <stop offset="1" stopColor="#1C0A04" />
          </linearGradient>
          <linearGradient id="flameFacet" x1="16" y1="8" x2="16" y2="24" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FED7AA" />
            <stop offset="0.3" stopColor="#FDBA74" />
            <stop offset="0.7" stopColor="#FB923C" />
            <stop offset="1" stopColor="#F97316" />
          </linearGradient>
          <linearGradient id="innerCore" x1="16" y1="14" x2="16" y2="22" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFF7ED" />
            <stop offset="1" stopColor="#FDBA74" />
          </linearGradient>
        </defs>

        {/* Outer Ring rim */}
        <circle cx="16" cy="16" r="14.5" fill="url(#emberTokenOuter)" stroke="#FED7AA" strokeWidth="0.8" />
        {/* Recessed coin interior */}
        <circle cx="16" cy="16" r="11.5" fill="url(#emberTokenInner)" stroke="#9A3412" strokeWidth="0.6" />

        {/* Faceted Ember Flame Emblem */}
        {/* Main outer faceted flame */}
        <path
          d="M16 7.5C14.2 10.5 11 13.5 11 18C11 21.2 13.2 23.5 16 23.5C18.8 23.5 21 21.2 21 18C21 13.5 17.8 10.5 16 7.5Z"
          fill="url(#flameFacet)"
        />
        {/* Left facet shadow */}
        <path
          d="M16 7.5C14.2 10.5 11 13.5 11 18C11 21.2 13.2 23.5 16 23.5L16 14Z"
          fill="#EA580C"
          fillOpacity="0.4"
        />
        {/* Bright inner core flame */}
        <path
          d="M16 13.5C14.9 15.5 13.5 17.2 13.5 19.5C13.5 21.2 14.6 22.3 16 22.3C17.4 22.3 18.5 21.2 18.5 19.5C18.5 17.2 17.1 15.5 16 13.5Z"
          fill="url(#innerCore)"
        />
        {/* Tiny sparkling core point */}
        <circle cx="16" cy="19.5" r="1.2" fill="#FFFFFF" />
      </svg>
    </div>
  );
};

export const EmberToken: React.FC<EmberTokenProps> = ({
  amount,
  size = 'sm',
  showLabel = true,
  isAnimated = false,
  className = '',
}) => {
  const textClass = {
    xs: 'text-[11px] font-semibold gap-1',
    sm: 'text-xs font-bold gap-1.5',
    md: 'text-sm font-extrabold gap-1.5',
    lg: 'text-base font-extrabold gap-2',
    xl: 'text-2xl font-black gap-2.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-mono tracking-tight text-[#171916] dark:text-neutral-100 ${textClass} ${
        isAnimated ? 'animate-pulse' : ''
      } ${className}`}
    >
      <EmberTokenIcon size={size} />
      {amount !== undefined && (
        <span className="tabular-nums">
          {typeof amount === 'number' ? amount.toLocaleString() : amount}
        </span>
      )}
      {showLabel && (
        <span
          className={`font-sans uppercase font-bold tracking-wider text-[#EA580C] dark:text-orange-400 ${
            size === 'xs'
              ? 'text-[9px]'
              : size === 'sm'
              ? 'text-[10px]'
              : size === 'md'
              ? 'text-xs'
              : size === 'lg'
              ? 'text-xs'
              : 'text-sm'
          }`}
        >
          EMBER
        </span>
      )}
    </span>
  );
};
