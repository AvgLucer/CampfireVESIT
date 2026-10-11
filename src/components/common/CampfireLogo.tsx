import React from 'react';

interface CampfireLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export const CampfireLogo: React.FC<CampfireLogoProps> = ({
  size = 'md',
  showTagline = false,
  className = '',
}) => {
  const iconSize = size === 'sm' ? 20 : size === 'lg' ? 32 : 26;
  const textSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Flame Geometric SVG Mark */}
      <div
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-[#EA580C] via-[#F97316] to-[#FB7185] shadow-sm shadow-[#F97316]/30 text-white shrink-0"
        style={{ width: iconSize + 10, height: iconSize + 10 }}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Flame geometry with hearth base */}
          <path d="M12 2C10.5 4.5 8 7 8 11a4 4 0 0 0 8 0c0-4-2.5-6.5-4-9Z" fill="rgba(255,255,255,0.25)" />
          <path d="M12 9a2 2 0 0 0-2 2c0 1.5 1 2.5 2 2.5s2-1 2-2.5a2 2 0 0 0-2-2Z" fill="white" />
          <path d="M5 21h14" strokeWidth="2.5" />
          <path d="M7 18l10 0" strokeOpacity="0.6" strokeWidth="1.8" />
        </svg>
      </div>

      <div className="flex flex-col">
        <span className={`font-bold tracking-tight text-[#171916] ${textSize} leading-none`}>
          campfire<span className="text-[#F97316]">.</span>
        </span>
        {showTagline && (
          <span className="text-[11px] font-medium text-[#737871] tracking-normal mt-0.5">
            Your campus. Your people. Your place.
          </span>
        )}
      </div>
    </div>
  );
};
