import React from 'react';
import { CrateDefinition, BadgeRarity } from '../../types/ember';
import { EmberToken } from '../common/EmberToken';
import { RARITY_DETAILS } from '../../data/badgeCatalogue';
import { Clock, Sparkles, Box, ShieldCheck, ChevronRight } from 'lucide-react';

interface CrateCardProps {
  crate: CrateDefinition;
  userBalance: number;
  isDailyAvailable?: boolean;
  dailyNextClaimTime?: string | null;
  dailyCountdown?: string;
  onOpenCrate: (crate: CrateDefinition) => void;
  isOpening?: boolean;
}

// Render custom SVG illustration for each crate tier
const renderCrateIllustration = (tier: string) => {
  switch (tier) {
    case 'daily':
      return (
        <svg viewBox="0 0 80 80" fill="none" className="w-full h-full drop-shadow-md">
          <rect x="14" y="28" width="52" height="42" rx="6" fill="#059669" stroke="#34D399" strokeWidth="2.5" />
          <path d="M10 28h60l-8-14H18l-8 14z" fill="#10B981" stroke="#6EE7B7" strokeWidth="2.5" />
          <rect x="36" y="24" width="8" height="46" fill="#34D399" />
          <circle cx="40" cy="48" r="5" fill="#FBBF24" stroke="#FFF" strokeWidth="1.5" />
          <path d="M40 38c-2 2-3 4-3 6s1.5 3 3 3 3-1.5 3-3-1-4-3-6z" fill="#FFF" />
        </svg>
      );
    case 'bronze':
      return (
        <svg viewBox="0 0 80 80" fill="none" className="w-full h-full drop-shadow-md">
          <rect x="14" y="28" width="52" height="42" rx="6" fill="#78350F" stroke="#B45309" strokeWidth="2.5" />
          <path d="M10 28h60l-8-14H18l-8 14z" fill="#92400E" stroke="#D97706" strokeWidth="2.5" />
          <rect x="36" y="24" width="8" height="46" fill="#B45309" />
          <polygon points="40 42 45 52 35 52" fill="#FCD34D" />
          <circle cx="40" cy="48" r="7" stroke="#F59E0B" strokeWidth="2" fill="none" />
        </svg>
      );
    case 'silver':
      return (
        <svg viewBox="0 0 80 80" fill="none" className="w-full h-full drop-shadow-md">
          <rect x="14" y="28" width="52" height="42" rx="6" fill="#334155" stroke="#94A3B8" strokeWidth="2.5" />
          <path d="M10 28h60l-8-14H18l-8 14z" fill="#475569" stroke="#CBD5E1" strokeWidth="2.5" />
          <rect x="36" y="24" width="8" height="46" fill="#94A3B8" />
          <polygon points="40 40 47 48 40 56 33 48" fill="#38BDF8" stroke="#E2E8F0" strokeWidth="1.5" />
        </svg>
      );
    case 'gold':
      return (
        <svg viewBox="0 0 80 80" fill="none" className="w-full h-full drop-shadow-xl animate-pulse">
          <rect x="14" y="28" width="52" height="42" rx="6" fill="#78350F" stroke="#F59E0B" strokeWidth="3" />
          <path d="M10 28h60l-8-14H18l-8 14z" fill="#D97706" stroke="#FDE68A" strokeWidth="3" />
          <rect x="36" y="24" width="8" height="46" fill="#F59E0B" />
          <polygon points="40 38 43 45 50 46 45 51 46 58 40 54 34 58 35 51 30 46 37 45" fill="#FDE68A" stroke="#B45309" strokeWidth="1" />
          <circle cx="40" cy="48" r="3" fill="#F43F5E" />
        </svg>
      );
    default:
      return null;
  }
};

export const CrateCard: React.FC<CrateCardProps> = ({
  crate,
  userBalance,
  isDailyAvailable = true,
  dailyCountdown,
  onOpenCrate,
  isOpening = false,
}) => {
  const isDaily = crate.id === 'daily';
  const canAfford = isDaily ? isDailyAvailable : userBalance >= crate.cost;
  const isBlocked = isDaily ? !isDailyAvailable : userBalance < crate.cost;

  const raritiesOrder: BadgeRarity[] = ['Common', 'Rare', 'Legendary', 'Mythical', 'Unreal'];

  return (
    <div className="relative p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-[#E5E3DC] dark:border-neutral-800 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between gap-5 group">
      {/* Top Header Badge & Price Tag */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#737871]">
              {crate.subtitle}
            </span>
            <h3 className="text-lg font-black text-[#171916] dark:text-neutral-100 tracking-tight">
              {crate.name}
            </h3>
          </div>

          {/* Cost badge */}
          <div className="shrink-0">
            {isDaily ? (
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                FREE (24H)
              </span>
            ) : (
              <div className="px-3 py-1 rounded-full bg-[#FFF8F5] dark:bg-orange-950/40 border border-[#F97316]/30 flex items-center gap-1.5">
                <EmberToken amount={crate.cost} size="xs" />
              </div>
            )}
          </div>
        </div>

        {/* Central 3D Crate Graphic */}
        <div className="h-28 flex items-center justify-center my-1 transition-transform group-hover:scale-105 duration-300">
          <div className="w-24 h-24">
            {renderCrateIllustration(crate.id)}
          </div>
        </div>

        <p className="text-xs text-[#555952] dark:text-neutral-400 mt-2 leading-relaxed">
          {crate.description}
        </p>
      </div>

      {/* Published Drop Rates Matrix (Always clearly visible as requested) */}
      <div className="space-y-2 pt-3 border-t border-[#E5E3DC] dark:border-neutral-800">
        <div className="text-[11px] font-bold text-[#171916] dark:text-neutral-200 flex items-center justify-between">
          <span>Published Drop Rates:</span>
          <span className="text-[10px] text-[#737871] font-mono">100% Total Odds</span>
        </div>

        <div className="grid grid-cols-5 gap-1 text-center font-mono">
          {raritiesOrder.map((rarity) => {
            const rate = crate.dropRates[rarity];
            const isEligible = rate > 0;
            const rConfig = RARITY_DETAILS[rarity];

            return (
              <div
                key={rarity}
                className={`p-1.5 rounded-lg border flex flex-col items-center justify-center ${
                  isEligible
                    ? 'bg-[#FAF9F5] dark:bg-neutral-800 border-[#E5E3DC] dark:border-neutral-700'
                    : 'bg-neutral-100/50 dark:bg-neutral-900 border-dashed border-neutral-300/50 dark:border-neutral-800 opacity-40'
                }`}
              >
                <div
                  className="text-[9px] font-bold uppercase truncate w-full"
                  style={{ color: isEligible ? rConfig.color : '#94A3B8' }}
                >
                  {rarity.slice(0, 3)}
                </div>
                <div
                  className={`text-[11px] font-extrabold mt-0.5 ${
                    isEligible
                      ? 'text-[#171916] dark:text-neutral-100'
                      : 'text-neutral-400'
                  }`}
                >
                  {rate > 0 ? `${rate}%` : '0%'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Explicit guarantee notes */}
        <div className="text-[10px] text-[#737871] pt-1">
          {isDaily && (
            <span className="text-emerald-700 dark:text-emerald-400 font-medium">
              ✓ Guaranteed Common, Rare, or Legendary. No Mythical/Unreal.
            </span>
          )}
          {crate.id === 'bronze' && (
            <span>
              ✓ 2% Mythical opportunity. Unreal badges unavailable.
            </span>
          )}
          {crate.id === 'silver' && (
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              ★ 0.5% Unreal Singularity opportunity.
            </span>
          )}
          {crate.id === 'gold' && (
            <span className="text-amber-600 dark:text-amber-400 font-bold">
              ⚡ 17% Mythical + exactly 1.0% Unreal Singularity drop rate.
            </span>
          )}
        </div>
      </div>

      {/* Action Button & Cooldown */}
      <div className="pt-2">
        {isDaily && !isDailyAvailable ? (
          <div className="w-full py-2.5 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border border-neutral-300 dark:border-neutral-700 text-xs font-bold flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600 animate-spin" />
            <span>Ready in {dailyCountdown || 'tomorrow'}</span>
          </div>
        ) : (
          <button
            onClick={() => onOpenCrate(crate)}
            disabled={!canAfford || isOpening}
            className={`w-full py-3 px-4 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
              canAfford
                ? 'bg-[#F97316] hover:bg-[#EA580C] text-white hover:shadow-md'
                : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed border border-neutral-300 dark:border-neutral-700'
            }`}
          >
            <Box className="w-4 h-4" />
            <span>{isDaily ? 'Open Free Daily Crate' : `Open Crate (${crate.cost} EMBER)`}</span>
          </button>
        )}

        {!isDaily && userBalance < crate.cost && (
          <p className="text-[10px] text-center text-rose-600 font-semibold mt-1.5">
            Needs {crate.cost - userBalance} more EMBER to purchase
          </p>
        )}
      </div>
    </div>
  );
};
