import React, { useState } from 'react';
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

export const UserBadgesRow: React.FC<UserBadgesRowProps> = ({
  userId,
  badges: customBadges,
  size = 'xs',
  showLabels = false,
  className = '',
  onBadgeClick,
}) => {
  const [hoveredBadge, setHoveredBadge] = useState<BadgeDefinition | null>(null);

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

  return (
    <div className={`relative inline-flex items-center shrink-0 ${sizeDimensions.container} ${className}`}>
      {badges.slice(0, 5).map((badge, idx) => {
        const rarity = RARITY_DETAILS[badge.rarity];
        return (
          <div
            key={`${badge.id}-${idx}`}
            className="relative group shrink-0"
            onMouseEnter={() => setHoveredBadge(badge)}
            onMouseLeave={() => setHoveredBadge(null)}
            onClick={(e) => {
              if (onBadgeClick) {
                e.stopPropagation();
                onBadgeClick(badge);
              }
            }}
          >
            <div
              className={`${sizeDimensions.wrapper} ${sizeDimensions.radius} ${sizeDimensions.padding} shrink-0 flex items-center justify-center transition-transform duration-150 group-hover:scale-125 cursor-pointer relative`}
              style={{
                backgroundColor: `${rarity.color}15`,
                border: `${sizeDimensions.borderWidth} solid ${rarity.color}90`,
                boxShadow: `0 1px 3px ${rarity.color}25`,
              }}
              title={`${badge.name} (${badge.rarity}) — Slot ${idx + 1}`}
            >
              <BadgeArtwork badge={badge} size={sizeDimensions.badgeSize} />
            </div>

            {/* Hover Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none min-w-[130px] max-w-[180px]">
              <div
                className="px-2.5 py-1.5 rounded-xl text-center text-white shadow-xl backdrop-blur-md border text-[10px] w-full"
                style={{
                  backgroundColor: '#171916F2',
                  borderColor: `${rarity.color}80`,
                  boxShadow: `0 8px 20px -4px ${rarity.color}60`,
                }}
              >
                <div className="font-extrabold truncate" style={{ color: rarity.color }}>
                  {badge.name}
                </div>
                <div className="flex items-center justify-center gap-1.5 text-[9px] text-[#A8A29E] mt-0.5">
                  <span className="font-bold" style={{ color: rarity.color }}>
                    {badge.rarity}
                  </span>
                  <span>·</span>
                  <span className="font-mono">Slot {idx + 1}/5</span>
                </div>
                <div className="text-[9px] text-neutral-300 mt-1 line-clamp-2 leading-tight">
                  {badge.description}
                </div>
              </div>
              <div
                className="w-2 h-2 rotate-45 -mt-1"
                style={{ backgroundColor: '#171916F2', borderRight: `1px solid ${rarity.color}80`, borderBottom: `1px solid ${rarity.color}80` }}
              />
            </div>
          </div>
        );
      })}

      {showLabels && hoveredBadge && (
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full border ml-1 hidden sm:inline-block"
          style={{
            color: RARITY_DETAILS[hoveredBadge.rarity].color,
            borderColor: `${RARITY_DETAILS[hoveredBadge.rarity].color}60`,
            backgroundColor: `${RARITY_DETAILS[hoveredBadge.rarity].color}15`,
          }}
        >
          {hoveredBadge.name}
        </span>
      )}
    </div>
  );
};
