import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BadgeDefinition } from '../../types/ember';
import { BadgeArtwork } from './BadgeArtwork';
import { RARITY_DETAILS } from '../../data/badgeCatalogue';
import { getUserBadges } from '../../utils/userBadges';

interface UserBadgesRowProps {
  userId?: string | null;
  badges?: BadgeDefinition[];
  size?: '2xs' | 'xs' | 'sm' | 'md';
  showLabels?: boolean;
  className?: string;
  onBadgeClick?: (badge: BadgeDefinition) => void;
}

interface ActiveTooltip {
  badge: BadgeDefinition;
  slotIndex: number;
  rect: DOMRect;
}

export const UserBadgesRow: React.FC<UserBadgesRowProps> = ({
  userId,
  badges: customBadges,
  size = 'xs',
  showLabels = false,
  className = '',
  onBadgeClick,
}) => {
  const [activeTooltip, setActiveTooltip] = useState<ActiveTooltip | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Strictly min and max 5 badges
  const badges: BadgeDefinition[] = (customBadges && customBadges.length === 5)
    ? customBadges
    : getUserBadges(userId);

  const sizeDimensions = {
    '2xs': {
      wrapper: 'w-3.5 h-3.5',
      badgeSize: '2xs' as const,
      container: 'gap-0.5',
      radius: 'rounded-[3px]',
      padding: 'p-0',
      borderWidth: '1px',
    },
    xs: {
      wrapper: 'w-4.5 h-4.5',
      badgeSize: 'xs' as const,
      container: 'gap-1',
      radius: 'rounded-[4px]',
      padding: 'p-0.5',
      borderWidth: '1px',
    },
    sm: {
      wrapper: 'w-5.5 h-5.5',
      badgeSize: 'xs' as const,
      container: 'gap-1',
      radius: 'rounded-md',
      padding: 'p-0.5',
      borderWidth: '1.5px',
    },
    md: {
      wrapper: 'w-7 h-7',
      badgeSize: 'sm' as const,
      container: 'gap-1.5',
      radius: 'rounded-lg',
      padding: 'p-0.5',
      borderWidth: '1.5px',
    },
  }[size];

  // Dismiss tooltip on scroll or resize so it doesn't detach
  useEffect(() => {
    if (!activeTooltip) return;
    const handleScrollOrResize = () => setActiveTooltip(null);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [activeTooltip]);

  return (
    <div ref={containerRef} className={`relative inline-flex items-center shrink-0 ${sizeDimensions.container} ${className}`}>
      {badges.slice(0, 5).map((badge, idx) => {
        const rarity = RARITY_DETAILS[badge.rarity];
        return (
          <div
            key={`${badge.id}-${idx}`}
            className="relative shrink-0"
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setActiveTooltip({ badge, slotIndex: idx + 1, rect });
            }}
            onMouseLeave={() => setActiveTooltip(null)}
            onClick={(e) => {
              if (onBadgeClick) {
                e.stopPropagation();
                onBadgeClick(badge);
              }
            }}
          >
            <div
              className={`${sizeDimensions.wrapper} ${sizeDimensions.radius} ${sizeDimensions.padding} shrink-0 flex items-center justify-center transition-transform duration-150 hover:scale-125 cursor-pointer relative`}
              style={{
                backgroundColor: `${rarity.color}15`,
                border: `${sizeDimensions.borderWidth} solid ${rarity.color}90`,
                boxShadow: `0 1px 3px ${rarity.color}25`,
              }}
              title={`${badge.name} (${badge.rarity}) — ${badge.description}`}
            >
              <BadgeArtwork badge={badge} size={sizeDimensions.badgeSize} />
            </div>
          </div>
        );
      })}

      {showLabels && activeTooltip && (
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full border ml-1 hidden sm:inline-block"
          style={{
            color: RARITY_DETAILS[activeTooltip.badge.rarity].color,
            borderColor: `${RARITY_DETAILS[activeTooltip.badge.rarity].color}60`,
            backgroundColor: `${RARITY_DETAILS[activeTooltip.badge.rarity].color}15`,
          }}
        >
          {activeTooltip.badge.name}
        </span>
      )}

      {/* Portal Tooltip: Immune to overflow-hidden, cards, and modal clipping */}
      {typeof document !== 'undefined' && activeTooltip && createPortal(
        (() => {
          const { badge, slotIndex, rect } = activeTooltip;
          const rarity = RARITY_DETAILS[badge.rarity];
          const tooltipWidth = 230;
          const spaceAbove = rect.top;
          const showBelow = spaceAbove < 120;
          const topPos = showBelow ? rect.bottom + 8 : rect.top - 8;
          const centeredLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
          const leftPos = Math.max(12, Math.min(window.innerWidth - tooltipWidth - 12, centeredLeft));
          const arrowLeft = Math.max(12, Math.min(tooltipWidth - 12, rect.left + rect.width / 2 - leftPos));

          return (
            <div
              style={{
                position: 'fixed',
                top: `${topPos}px`,
                left: `${leftPos}px`,
                transform: showBelow ? 'translateY(0)' : 'translateY(-100%)',
                zIndex: 999999,
                width: `${tooltipWidth}px`,
              }}
              className="pointer-events-none transition-opacity duration-150 animate-in fade-in"
            >
              <div
                className="p-2.5 rounded-xl text-white shadow-2xl backdrop-blur-md border"
                style={{
                  backgroundColor: '#121411F5',
                  borderColor: `${rarity.color}99`,
                  boxShadow: `0 10px 28px -4px rgba(0,0,0,0.7), 0 0 16px -2px ${rarity.color}40`,
                }}
              >
                {/* Header: Sticker Name & Rarity Pill */}
                <div className="flex items-center justify-between gap-1.5 pb-1.5 border-b border-white/10">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-5 h-5 rounded shrink-0 flex items-center justify-center p-0.5" style={{ backgroundColor: `${rarity.color}25` }}>
                      <BadgeArtwork badge={badge} size="2xs" />
                    </div>
                    <span className="font-extrabold text-xs truncate" style={{ color: rarity.color }}>
                      {badge.name}
                    </span>
                  </div>
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 uppercase tracking-wide"
                    style={{
                      color: rarity.color,
                      borderColor: `${rarity.color}60`,
                      backgroundColor: `${rarity.color}20`,
                    }}
                  >
                    {badge.rarity}
                  </span>
                </div>

                {/* Definition / Description */}
                <div className="text-[11px] text-neutral-200 mt-1.5 leading-snug font-normal">
                  {badge.description}
                </div>

                {/* Footer slot indicator */}
                <div className="mt-2 pt-1 border-t border-white/10 flex items-center justify-between text-[9px] text-[#A8A29E]">
                  <span className="font-mono">#{badge.id}</span>
                  <span className="font-mono">Profile Slot {slotIndex}/5</span>
                </div>
              </div>

              {/* Arrow pointer */}
              <div
                className="w-2.5 h-2.5 rotate-45 absolute"
                style={{
                  left: `${arrowLeft}px`,
                  transform: 'translateX(-50%) rotate(45deg)',
                  top: showBelow ? '-5px' : 'auto',
                  bottom: showBelow ? 'auto' : '-5px',
                  backgroundColor: '#121411F5',
                  borderTop: showBelow ? `1px solid ${rarity.color}99` : 'none',
                  borderLeft: showBelow ? `1px solid ${rarity.color}99` : 'none',
                  borderBottom: showBelow ? 'none' : `1px solid ${rarity.color}99`,
                  borderRight: showBelow ? 'none' : `1px solid ${rarity.color}99`,
                }}
              />
            </div>
          );
        })(),
        document.body
      )}
    </div>
  );
};

