import React from 'react';
import { BadgeDefinition, OwnedBadge } from '../../types/ember';
import { BadgeArtwork } from './BadgeArtwork';
import { RARITY_DETAILS } from '../../data/badgeCatalogue';
import { EmberToken } from '../common/EmberToken';
import {
  X,
  ShieldCheck,
  Check,
  Calendar,
  Box,
  Star,
  Award,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface BadgeDetailModalProps {
  badge: BadgeDefinition | null;
  isOwned: boolean;
  ownedData?: OwnedBadge;
  isEquipped: boolean;
  isFavorite: boolean;
  onClose: () => void;
  onEquip: (badgeId: string) => void;
  onToggleFavorite: (badgeId: string) => void;
}

export const BadgeDetailModal: React.FC<BadgeDetailModalProps> = ({
  badge,
  isOwned,
  ownedData,
  isEquipped,
  isFavorite,
  onClose,
  onEquip,
  onToggleFavorite,
}) => {
  if (!badge) return null;

  const rarityConfig = RARITY_DETAILS[badge.rarity];
  const formattedAcquiredDate = ownedData?.acquiredAt
    ? new Date(ownedData.acquiredAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="relative bg-white dark:bg-neutral-900 border border-[#E5E3DC] dark:border-neutral-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Ambient Glow Header */}
        <div
          className="relative p-6 pb-4 flex flex-col items-center text-center overflow-hidden border-b border-[#E5E3DC] dark:border-neutral-800"
          style={{
            background: `radial-gradient(circle at 50% 30%, ${rarityConfig.color}25, transparent 70%)`,
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Large Badge Artwork */}
          <div className="my-3 scale-110">
            <BadgeArtwork badge={badge} size="xl" isLocked={!isOwned} />
          </div>

          {/* Rarity & ID pill */}
          <div className="flex items-center gap-2 mt-2">
            <span
              className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border"
              style={{
                color: rarityConfig.color,
                borderColor: `${rarityConfig.color}60`,
                backgroundColor: `${rarityConfig.color}15`,
              }}
            >
              {badge.rarity} Tier
            </span>
            <span className="text-xs font-mono font-bold text-[#737871]">#{badge.id}</span>
          </div>

          <h3 className="text-xl font-extrabold text-[#171916] dark:text-neutral-100 mt-1">
            {badge.name}
          </h3>
          <p className="text-xs text-[#555952] dark:text-neutral-400 mt-1 max-w-xs">
            {badge.description}
          </p>
        </div>

        {/* Details & Specs Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Status Box */}
          <div className="p-3.5 rounded-2xl bg-[#FAF9F5] dark:bg-neutral-800/60 border border-[#E5E3DC] dark:border-neutral-700/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[#737871] font-medium">Ownership Status:</span>
              <span
                className={`font-bold flex items-center gap-1 ${
                  isOwned ? 'text-emerald-700 dark:text-emerald-400' : 'text-neutral-500'
                }`}
              >
                {isOwned ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Unlocked & Owned</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Locked</span>
                  </>
                )}
              </span>
            </div>

            {isOwned && formattedAcquiredDate && (
              <div className="flex items-center justify-between">
                <span className="text-[#737871] font-medium">Acquired On:</span>
                <span className="font-mono font-semibold text-[#171916] dark:text-neutral-200">
                  {formattedAcquiredDate}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-[#737871] font-medium">Eligible Crate Sources:</span>
              <span className="font-semibold text-[#EA580C] dark:text-orange-400 capitalize">
                {badge.eligibleCrates.join(', ')} Crates
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-[#E5E3DC]/60 dark:border-neutral-700/60">
              <span className="text-[#737871] font-medium">Duplicate Compensation:</span>
              <EmberToken amount={rarityConfig.compensation} size="xs" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
            {isOwned ? (
              <>
                <button
                  onClick={() => {
                    onEquip(badge.id);
                  }}
                  className={`flex-1 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                    isEquipped
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700'
                      : 'bg-[#F97316] hover:bg-[#EA580C] text-white'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>{isEquipped ? 'Unequip Badge' : 'Equip as Featured Badge'}</span>
                </button>

                <button
                  onClick={() => onToggleFavorite(badge.id)}
                  className={`w-full sm:w-auto py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                    isFavorite
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-300'
                      : 'bg-white dark:bg-neutral-800 text-[#555952] dark:text-neutral-300 border-[#E5E3DC] dark:border-neutral-700 hover:border-[#F97316]'
                  }`}
                  title="Toggle profile favorite showcase (up to 6)"
                >
                  <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-500 text-amber-500' : ''}`} />
                  <span>{isFavorite ? 'In Showcase' : 'Pin to Showcase'}</span>
                </button>
              </>
            ) : (
              <Link
                to="/badges?tab=crates"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[#F97316] hover:bg-[#EA580C] text-white flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Box className="w-4 h-4" />
                <span>Visit Crate Shop to Unlock</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
