import React, { useState } from 'react';
import { BadgeDefinition, OwnedBadge } from '../../types/ember';
import { BadgeArtwork } from './BadgeArtwork';
import { RARITY_DETAILS } from '../../data/badgeCatalogue';
import { Sparkles, Check, Lock, Info, Calendar, Box } from 'lucide-react';

interface BadgeCardProps {
  badge: BadgeDefinition;
  isOwned: boolean;
  ownedData?: OwnedBadge;
  isEquipped?: boolean;
  isFavorite?: boolean;
  onSelect?: (badge: BadgeDefinition) => void;
  onEquip?: (badge: BadgeDefinition) => void;
}

export const BadgeCard: React.FC<BadgeCardProps> = ({
  badge,
  isOwned,
  ownedData,
  isEquipped = false,
  isFavorite = false,
  onSelect,
  onEquip,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const rarityConfig = RARITY_DETAILS[badge.rarity];

  const formattedAcquiredDate = ownedData?.acquiredAt
    ? new Date(ownedData.acquiredAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(badge);
    }
  };

  return (
    <div
      className="relative group focus-within:ring-2 focus-within:ring-[#F97316] rounded-2xl outline-hidden select-none"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* Main Collectible Card */}
      <div
        onClick={handleCardClick}
        className={`relative p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center cursor-pointer ${
          isOwned
            ? 'bg-white hover:bg-[#FAF9F5] shadow-xs hover:shadow-md hover:-translate-y-1'
            : 'bg-[#F5F4EF]/70 hover:bg-[#FAF9F5] border-dashed border-[#D7D4CB] hover:border-[#A8A29E]'
        } ${
          isEquipped
            ? 'ring-2 ring-[#F97316] border-[#F97316] bg-[#FFF8F5]'
            : isOwned
            ? 'border-[#E5E3DC]'
            : ''
        }`}
        style={
          isOwned
            ? {
                borderColor: isEquipped ? '#F97316' : undefined,
              }
            : undefined
        }
      >
        {/* Top Badges / Indicators */}
        <div className="w-full flex items-center justify-between text-[10px] mb-2">
          {/* Rarity Tag */}
          <span
            className="px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[9px] border"
            style={{
              color: isOwned ? rarityConfig.color : '#737871',
              backgroundColor: isOwned ? `${rarityConfig.color}15` : '#E5E3DC50',
              borderColor: isOwned ? `${rarityConfig.color}40` : '#D7D4CB',
            }}
          >
            {badge.rarity}
          </span>

          {/* Status Indicator */}
          {isEquipped ? (
            <span className="flex items-center gap-1 font-bold text-[#EA580C] bg-orange-100 px-1.5 py-0.5 rounded-md text-[9px]">
              <Check className="w-3 h-3" />
              Equipped
            </span>
          ) : isOwned ? (
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md text-[9px]">
              Owned
            </span>
          ) : (
            <span className="flex items-center gap-0.5 text-[#737871] bg-neutral-100 px-1.5 py-0.5 rounded-md text-[9px]">
              <Lock className="w-2.5 h-2.5" />
              Locked
            </span>
          )}
        </div>

        {/* Central Artwork */}
        <div className="my-2 transition-transform duration-300 group-hover:scale-105">
          <BadgeArtwork badge={badge} size="lg" isLocked={!isOwned} />
        </div>

        {/* Badge ID & Name */}
        <div className="mt-1 w-full overflow-hidden">
          <div className="text-[10px] font-mono text-[#737871] font-bold">
            #{badge.id}
          </div>
          <h4
            className={`text-xs font-extrabold truncate mt-0.5 ${
              isOwned ? 'text-[#171916]' : 'text-[#737871]'
            }`}
          >
            {badge.name}
          </h4>
        </div>

        {/* Short summary or source note */}
        <div className="mt-1 text-[10px] text-[#737871] line-clamp-1 w-full">
          {isOwned ? (
            <span>{badge.description}</span>
          ) : (
            <span className="italic">
              Available in {badge.eligibleCrates.join(', ')} crates
            </span>
          )}
        </div>

        {/* Mobile touch trigger hint */}
        <div className="mt-2 text-[9px] text-[#F97316] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
          Tap for details
        </div>
      </div>

      {/* DESKTOP HOVER TOOLTIP */}
      {showTooltip && (
        <div className="hidden lg:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3.5 bg-[#171916] text-white rounded-xl shadow-2xl z-50 pointer-events-none animate-in fade-in zoom-in-95 border border-neutral-700 text-xs">
          <div className="flex items-start gap-2.5 pb-2 border-b border-neutral-800">
            <BadgeArtwork badge={badge} size="sm" isLocked={!isOwned} />
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white truncate">{badge.name}</span>
                <span
                  className="text-[9px] font-bold px-1.5 py-0.2 rounded border"
                  style={{
                    color: rarityConfig.color,
                    borderColor: `${rarityConfig.color}60`,
                    backgroundColor: `${rarityConfig.color}20`,
                  }}
                >
                  {badge.rarity}
                </span>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono">#{badge.id}</span>
            </div>
          </div>

          <p className="mt-2 text-[11px] text-neutral-300 leading-relaxed">
            {badge.description}
          </p>

          <div className="mt-2.5 pt-2 border-t border-neutral-800 space-y-1 text-[10px] text-neutral-400">
            <div className="flex items-center justify-between">
              <span>Status:</span>
              <span className={isOwned ? 'text-emerald-400 font-bold' : 'text-neutral-400'}>
                {isOwned ? (isEquipped ? 'Equipped on Profile' : 'Unlocked & In Collection') : 'Locked'}
              </span>
            </div>

            {isOwned && formattedAcquiredDate && (
              <div className="flex items-center justify-between">
                <span>Acquired:</span>
                <span className="text-neutral-200 font-mono">{formattedAcquiredDate}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span>Crate Sources:</span>
              <span className="text-orange-300 font-medium capitalize">
                {badge.eligibleCrates.join(', ')}
              </span>
            </div>

            {isOwned && (
              <div className="flex items-center justify-between">
                <span>Duplicate Value:</span>
                <span className="text-amber-400 font-bold font-mono">
                  +{rarityConfig.compensation} EMBER
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
