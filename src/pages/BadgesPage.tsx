import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useEmberEconomy } from '../context/EmberEconomyContext';
import { BadgeDefinition, BadgeRarity, CrateDefinition } from '../types/ember';
import { BadgeCard } from '../components/badges/BadgeCard';
import { BadgeDetailModal } from '../components/badges/BadgeDetailModal';
import { UserBadgesRow } from '../components/badges/UserBadgesRow';
import { CrateCard } from '../components/crates/CrateCard';
import { CrateOpeningModal } from '../components/crates/CrateOpeningModal';
import { EmberToken } from '../components/common/EmberToken';
import { BadgeArtwork } from '../components/badges/BadgeArtwork';
import { RARITY_DETAILS } from '../data/badgeCatalogue';
import { COLLECTOR_FRAMES } from '../data/crateDefinitions';
import {
  Layers,
  Search,
  ArrowUpDown,
  Box,
  Sparkles,
  CheckCircle2,
  Clock,
  History,
  RotateCcw,
  PlusCircle,
  Gift,
  ArrowRight,
  Flame,
} from 'lucide-react';

export const BadgesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') === 'crates' 
    ? 'crates' 
    : searchParams.get('tab') === 'all' 
    ? 'all' 
    : 'badges';

  const {
    economy,
    allBadges,
    equippedBadges,
    ownedCount,
    totalBadgesCount,
    completionPercentage,
    rarityCounts,
    unlockedFrames,
    crates,
    isDailyRewardAvailable,
    dailyRewardCountdown,
    claimDailyReward,
    isDailyCrateAvailable,
    dailyCrateCountdown,
    openCrate,
    equipBadge,
    toggleFavoriteBadge,
    activeOpeningResult,
    activeOpeningCrate,
    closeOpeningModal,
    openWalletModal,
    addDemoEmbers,
    resetDailyCooldownsForDemo,
    resetEconomyToDemo,
  } = useEmberEconomy();

  // Search & Filter state for Badges
  const [searchQuery, setSearchQuery] = useState('');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [ownershipFilter, setOwnershipFilter] = useState<'all' | 'owned' | 'locked'>('all');
  const [sortBy, setSortBy] = useState<'rarity_desc' | 'rarity_asc' | 'name' | 'id'>('rarity_desc');
  const [selectedBadge, setSelectedBadge] = useState<BadgeDefinition | null>(null);

  // Crate Opening & Demo testing state
  const [isOpeningInProgress, setIsOpeningInProgress] = useState(false);
  const [showDemoTools, setShowDemoTools] = useState(false);

  const handleOpenCrate = (crate: CrateDefinition) => {
    setIsOpeningInProgress(true);
    openCrate(crate.id);
    setIsOpeningInProgress(false);
  };

  const cratesList = [
    crates.daily,
    crates.bronze,
    crates.silver,
    crates.gold,
  ].filter(Boolean);

  const rarityRank: Record<BadgeRarity, number> = {
    Unreal: 5,
    Mythical: 4,
    Legendary: 3,
    Rare: 2,
    Common: 1,
  };

  const filteredAndSortedBadges = useMemo(() => {
    return allBadges
      .filter((badge) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesName = badge.name.toLowerCase().includes(q);
          const matchesId = badge.id.toLowerCase().includes(q);
          const matchesDesc = badge.description.toLowerCase().includes(q);
          if (!matchesName && !matchesId && !matchesDesc) return false;
        }

        // Rarity filter
        if (rarityFilter !== 'all' && badge.rarity !== rarityFilter) {
          return false;
        }

        // Ownership filter
        const isOwned = economy.ownedBadgeIds.includes(badge.id);
        if (ownershipFilter === 'owned' && !isOwned) return false;
        if (ownershipFilter === 'locked' && isOwned) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rarity_desc') {
          return rarityRank[b.rarity] - rarityRank[a.rarity] || a.id.localeCompare(b.id);
        }
        if (sortBy === 'rarity_asc') {
          return rarityRank[a.rarity] - rarityRank[b.rarity] || a.id.localeCompare(b.id);
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        return a.id.localeCompare(b.id);
      });
  }, [allBadges, searchQuery, rarityFilter, ownershipFilter, sortBy, economy.ownedBadgeIds]);

  const setTab = (tab: 'badges' | 'crates' | 'all') => {
    if (tab === 'badges') {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('tab');
      setSearchParams(nextParams);
    } else {
      setSearchParams({ tab });
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER & EMBERS BALANCE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#737871] mb-1">
            <span className="px-2 py-0.5 rounded-md bg-orange-50 text-[#EA580C] font-bold border border-orange-200">
              Campus Collectibles Hub
            </span>
            <span>·</span>
            <span>Badge Vault & Crate Drop Shop</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171916] dark:text-neutral-100 tracking-tight">
            Badges & Crates
          </h1>
          <p className="text-xs sm:text-sm text-[#555952] dark:text-neutral-400 mt-0.5 max-w-2xl">
            Collect rarity-tiered profile emblems, open calibrated loot crates with EMBER, and showcase your campus prestige.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
          <button
            onClick={openWalletModal}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-[#E5E3DC] dark:border-neutral-700 hover:border-[#F97316] text-xs font-bold transition-colors cursor-pointer shadow-2xs flex items-center gap-2"
            title="Open EMBER Vault"
          >
            <EmberToken amount={economy.emberBalance} size="sm" />
          </button>

          {isDailyRewardAvailable && (
            <button
              onClick={claimDailyReward}
              className="px-3.5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 animate-pulse cursor-pointer"
              title="Claim +5 EMBER login reward"
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Claim +5 EMBER</span>
            </button>
          )}
        </div>
      </div>

      {/* COMBINED SEGMENTED TAB SWITCHER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 bg-[#FAF9F5] dark:bg-neutral-900 border border-[#E5E3DC] dark:border-neutral-800 rounded-2xl">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setTab('badges')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              currentTab === 'badges'
                ? 'bg-white dark:bg-neutral-800 text-[#171916] dark:text-white shadow-xs border border-[#E5E3DC] dark:border-neutral-700'
                : 'text-[#555952] dark:text-neutral-400 hover:text-[#171916] dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4 text-[#F97316]" />
            <span>Badge Vault</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-[#F97316] font-extrabold">
              {ownedCount}/{totalBadgesCount}
            </span>
          </button>

          <button
            onClick={() => setTab('crates')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              currentTab === 'crates'
                ? 'bg-white dark:bg-neutral-800 text-[#171916] dark:text-white shadow-xs border border-[#E5E3DC] dark:border-neutral-700'
                : 'text-[#555952] dark:text-neutral-400 hover:text-[#171916] dark:hover:text-white'
            }`}
          >
            <Box className="w-4 h-4 text-emerald-600" />
            <span>Crate Drop Shop</span>
            {isDailyCrateAvailable ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-extrabold animate-pulse">
                Free Ready!
              </span>
            ) : (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium">
                4 Tiers
              </span>
            )}
          </button>

          <button
            onClick={() => setTab('all')}
            className={`hidden md:flex px-3 py-2 rounded-xl text-xs font-bold transition-all items-center gap-1.5 cursor-pointer ${
              currentTab === 'all'
                ? 'bg-white dark:bg-neutral-800 text-[#171916] dark:text-white shadow-xs border border-[#E5E3DC] dark:border-neutral-700'
                : 'text-[#555952] dark:text-neutral-400 hover:text-[#171916] dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Combined View</span>
          </button>
        </div>

        {/* Quick hint / status */}
        <div className="hidden sm:flex items-center gap-3 text-xs text-[#737871] px-2 font-medium">
          <span>{completionPercentage}% Catalogue Complete</span>
          <span>·</span>
          <span>Duplicates give EMBER compensation</span>
        </div>
      </div>

      {/* =========================================================================
         SECTION A: CRATE SHOP (Rendered if tab === 'crates' or tab === 'all')
         ========================================================================= */}
      {(currentTab === 'crates' || currentTab === 'all') && (
        <div className="space-y-6 animate-in fade-in">
          {/* Daily Student Grant Banner */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-orange-50 via-amber-50/60 to-orange-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-900 border border-orange-200/80 dark:border-neutral-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950 text-[#F97316] flex items-center justify-center font-bold text-xl shrink-0 shadow-2xs">
                🎁
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#EA580C] dark:text-orange-400 flex items-center gap-1.5">
                  <span>Daily Student Grant</span>
                  <span className="text-[10px] text-neutral-400 font-normal">· Resets every 24 hours</span>
                </div>
                <h3 className="text-base font-extrabold text-[#171916] dark:text-neutral-100">
                  Claim 5 EMBER Daily Login Reward
                </h3>
                <p className="text-xs text-[#555952] dark:text-neutral-400 mt-0.5">
                  Log in once every 24 hours to receive 5 free EMBER towards your next badge crate.
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              {isDailyRewardAvailable ? (
                <button
                  onClick={claimDailyReward}
                  className="py-2.5 px-5 bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2 animate-pulse"
                >
                  <span>Claim +5 EMBER Now!</span>
                </button>
              ) : (
                <div className="px-4 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-[#E5E3DC] dark:border-neutral-700 text-right">
                  <span className="text-[10px] font-bold text-[#737871] uppercase tracking-wider block">
                    Next Claim Available In
                  </span>
                  <span className="text-xs font-mono font-extrabold text-[#EA580C]">
                    {dailyRewardCountdown}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 4 Calibrated Crate Cards */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <div>
                <h2 className="text-base font-extrabold text-[#171916] dark:text-neutral-100 flex items-center gap-2">
                  <Box className="w-4 h-4 text-[#F97316]" />
                  <span>Available Crate Tiers</span>
                </h2>
                <p className="text-xs text-[#555952] dark:text-neutral-400">
                  Calibrated drop rates. Duplicates provide automatic Ember refund.
                </p>
              </div>

              {currentTab === 'crates' && (
                <button
                  onClick={() => setTab('badges')}
                  className="text-xs font-bold text-[#F97316] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View Badge Vault ({ownedCount}/75)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {cratesList.map((crate) => (
                <CrateCard
                  key={crate.id}
                  crate={crate}
                  userBalance={economy.emberBalance}
                  isDailyAvailable={isDailyCrateAvailable}
                  dailyCountdown={dailyCrateCountdown}
                  onOpenCrate={handleOpenCrate}
                  isOpening={isOpeningInProgress}
                />
              ))}
            </div>
          </div>

          {/* Recent Discoveries Stream */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-[#E5E3DC] dark:border-neutral-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E3DC] dark:border-neutral-800">
              <div className="flex items-center gap-2 text-xs font-bold text-[#171916] dark:text-neutral-100">
                <History className="w-4 h-4 text-[#F97316]" />
                <span>Recent Crate Openings ({economy.openingHistory.length})</span>
              </div>
              <span className="text-[11px] text-[#737871]">Persistent Session Audit</span>
            </div>

            {economy.openingHistory.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#737871]">
                No crates opened yet in this session. Open your free Daily Crate above to get started!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {economy.openingHistory.slice(0, 6).map((item) => {
                  const formattedTime = new Date(item.createdAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-[#FAF9F5] dark:bg-neutral-800/60 border border-[#E5E3DC] dark:border-neutral-700 flex items-center gap-3 text-xs"
                    >
                      <BadgeArtwork badge={item.badge} size="sm" />
                      <div className="overflow-hidden flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-extrabold text-[#171916] dark:text-neutral-100 truncate">
                            {item.badge.name}
                          </span>
                          <span className="text-[9px] text-[#737871] font-mono shrink-0">
                            {formattedTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-bold text-[#F97316]">
                            {item.badge.rarity}
                          </span>
                          {item.isDuplicate ? (
                            <span className="text-[10px] font-mono text-amber-600 font-bold">
                              Dup (+{item.compensation} EMBER)
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-600 font-bold">
                              New Unlocked
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Testing Simulator Suite */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF9F5] dark:bg-neutral-900 border border-[#E5E3DC] dark:border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#737871]">
                  🧪 Developer & Judge Testing Tools (Demo Simulation)
                </span>
              </div>
              <button
                onClick={() => setShowDemoTools(!showDemoTools)}
                className="text-xs text-[#F97316] font-bold underline cursor-pointer"
              >
                {showDemoTools ? 'Hide Controls' : 'Show Testing Controls'}
              </button>
            </div>

            {showDemoTools && (
              <div className="pt-2 border-t border-[#E5E3DC] dark:border-neutral-800 flex flex-wrap items-center gap-2.5 text-xs animate-in fade-in">
                <button
                  onClick={() => addDemoEmbers(50)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-800 border border-[#D7D4CB] dark:border-neutral-700 hover:border-[#F97316] font-bold text-[#171916] dark:text-neutral-100 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>+50 EMBER (Demo Test)</span>
                </button>

                <button
                  onClick={() => addDemoEmbers(120)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-800 border border-[#D7D4CB] dark:border-neutral-700 hover:border-[#F97316] font-bold text-[#171916] dark:text-neutral-100 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span>+120 EMBER (Golden Crate Test)</span>
                </button>

                <button
                  onClick={resetDailyCooldownsForDemo}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-800 border border-[#D7D4CB] dark:border-neutral-700 hover:border-[#F97316] font-bold text-[#171916] dark:text-neutral-100 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span>Reset 24h Cooldowns (Demo)</span>
                </button>

                <button
                  onClick={resetEconomyToDemo}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400 font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Starter State (50 EMBER)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
         SECTION B: BADGE VAULT (Rendered if tab === 'badges' or tab === 'all')
         ========================================================================= */}
      {(currentTab === 'badges' || currentTab === 'all') && (
        <div className="space-y-6 animate-in fade-in">
          {/* Collection Progress & Rarity Tier Breakdown */}
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-[#E5E3DC] dark:border-neutral-800 shadow-xs space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#E5E3DC] dark:border-neutral-800">
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-[#737871]">
                  Collection Progress
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-[#171916] dark:text-neutral-100 font-mono">
                    {ownedCount} / {totalBadgesCount}
                  </span>
                  <span className="text-sm font-extrabold text-[#F97316] font-mono">
                    {completionPercentage}% complete
                  </span>
                </div>
                <p className="text-xs text-[#555952] dark:text-neutral-400">
                  {totalBadgesCount - ownedCount} badges remaining to discover across daily and shop crates.
                </p>
              </div>

              {/* Active 5 Profile Badges Preview */}
              <div className="p-3.5 rounded-2xl bg-[#FAF9F5] dark:bg-neutral-800 border border-[#E5E3DC] dark:border-neutral-700 flex flex-col gap-2 self-start lg:self-auto">
                <div className="flex items-center justify-between text-[10px] uppercase font-bold text-[#737871]">
                  <span>Active Profile Badges (5)</span>
                  <span className="text-[#F97316]">Visible Everywhere</span>
                </div>
                <UserBadgesRow badges={equippedBadges} size="sm" showLabels={true} />
              </div>
            </div>

            {/* 5 Rarity Tier Breakdown with Progress Bars */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {(['Common', 'Rare', 'Legendary', 'Mythical', 'Unreal'] as BadgeRarity[]).map((rarity) => {
                const data = rarityCounts[rarity];
                const percent = Number(((data.owned / data.total) * 100).toFixed(0));
                const config = RARITY_DETAILS[rarity];
                const isCompleted = data.owned >= data.total;

                return (
                  <div
                    key={rarity}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isCompleted
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300'
                        : 'bg-[#FAF9F5] dark:bg-neutral-800/60 border-[#E5E3DC] dark:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span style={{ color: config.color }}>{rarity}</span>
                      <span className="font-mono text-[#171916] dark:text-neutral-200 text-[11px]">
                        {data.owned}/{data.total}
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden mt-2">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: config.color,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#737871] mt-1.5 font-mono">
                      <span>{percent}%</span>
                      {isCompleted && (
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          Frame Active
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Collector Cosmetic Frames Unlock Panel */}
            <div className="pt-2 border-t border-[#E5E3DC] dark:border-neutral-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#171916] dark:text-neutral-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#F97316]" />
                  <span>Cosmetic Collector Frames ({unlockedFrames.length} of 5 Unlocked)</span>
                </span>
                <span className="text-[11px] text-[#737871]">Unlocked automatically upon 100% rarity completion</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                {COLLECTOR_FRAMES.map((frame) => {
                  const isUnlocked = unlockedFrames.includes(frame.id);
                  return (
                    <div
                      key={frame.id}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-xs ${
                        isUnlocked
                          ? 'bg-white dark:bg-neutral-800 border-emerald-400 shadow-2xs'
                          : 'bg-[#FAF9F5]/50 dark:bg-neutral-800/30 border-neutral-200 dark:border-neutral-700 opacity-60'
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 font-bold text-[10px]"
                        style={{
                          borderColor: frame.borderColor,
                          boxShadow: isUnlocked ? `0 0 8px ${frame.glowColor}` : 'none',
                        }}
                      >
                        {isUnlocked ? '✓' : '🔒'}
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-bold text-[#171916] dark:text-neutral-100 truncate text-[11px]">
                          {frame.name}
                        </div>
                        <div className="text-[9px] text-[#737871] truncate">
                          {isUnlocked ? 'Frame Active' : `Collect all ${frame.rarityTarget}s`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Teaser to open crates if in badges tab */}
          {currentTab === 'badges' && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-neutral-900 dark:to-neutral-900 border border-orange-200 dark:border-neutral-800 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950 text-[#F97316] flex items-center justify-center font-bold">
                  <Box className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-[#171916] dark:text-neutral-100">
                    Looking for unowned badges?
                  </span>
                  <p className="text-[11px] text-[#555952] dark:text-neutral-400">
                    Open crates in the integrated Drop Shop using your EMBER balance or free daily drop.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTab('crates')}
                className="px-3.5 py-1.5 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <span>Go to Crate Shop</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* FILTER & SEARCH BAR */}
          <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-[#E5E3DC] dark:border-neutral-800 shadow-xs space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#737871] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search badges by name, ID (#C01), or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D7D4CB] dark:border-neutral-700 bg-[#FAF9F5] dark:bg-neutral-800 text-[#171916] dark:text-neutral-100 focus:outline-hidden focus:border-[#F97316]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#737871]" />
                <span className="text-[#737871] font-semibold">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-lg border border-[#D7D4CB] dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold text-[#171916] dark:text-neutral-100 cursor-pointer"
                >
                  <option value="rarity_desc">Highest Rarity First</option>
                  <option value="rarity_asc">Lowest Rarity First</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="id">Catalogue ID (#01 - #75)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E5E3DC] dark:border-neutral-800">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[#737871] font-bold mr-1">Rarity:</span>
                {[
                  { id: 'all', label: `All (${allBadges.length})` },
                  { id: 'Common', label: `Common (${rarityCounts.Common.total})` },
                  { id: 'Rare', label: `Rare (${rarityCounts.Rare.total})` },
                  { id: 'Legendary', label: `Legendary (${rarityCounts.Legendary.total})` },
                  { id: 'Mythical', label: `Mythical (${rarityCounts.Mythical.total})` },
                  { id: 'Unreal', label: `Unreal (${rarityCounts.Unreal.total})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setRarityFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      rarityFilter === tab.id
                        ? 'bg-[#171916] text-white dark:bg-white dark:text-neutral-900 shadow-2xs font-bold'
                        : 'bg-[#FAF9F5] dark:bg-neutral-800 text-[#555952] dark:text-neutral-400 hover:text-[#171916]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-[#FAF9F5] dark:bg-neutral-800 p-1 rounded-xl border border-[#E5E3DC] dark:border-neutral-700">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'owned', label: `Owned (${ownedCount})` },
                  { id: 'locked', label: `Locked (${totalBadgesCount - ownedCount})` },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setOwnershipFilter(opt.id as any)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      ownershipFilter === opt.id
                        ? 'bg-white dark:bg-neutral-700 text-[#171916] dark:text-white shadow-2xs font-bold'
                        : 'text-[#737871] hover:text-[#171916]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* BADGES GRID */}
          {filteredAndSortedBadges.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white dark:bg-neutral-900 border border-[#E5E3DC] dark:border-neutral-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-950 text-[#F97316] flex items-center justify-center mx-auto text-xl">
                🔍
              </div>
              <h3 className="text-base font-bold text-[#171916] dark:text-neutral-100">
                No badges match your filter
              </h3>
              <p className="text-xs text-[#737871] max-w-sm mx-auto">
                Try resetting your search query or switching filters to view the full 75-badge catalogue.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setRarityFilter('all');
                  setOwnershipFilter('all');
                }}
                className="px-4 py-2 bg-[#FAF9F5] dark:bg-neutral-800 hover:bg-[#F2EFE9] text-xs font-semibold text-[#171916] dark:text-neutral-200 rounded-xl border border-[#E5E3DC] dark:border-neutral-700 cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4">
              {filteredAndSortedBadges.map((badge) => {
                const isOwned = economy.ownedBadgeIds.includes(badge.id);
                const ownedData = economy.ownedBadges.find((b) => b.badgeId === badge.id);
                const isEquipped = economy.equippedBadgeId === badge.id;
                const isFavorite = economy.favoriteBadgeIds.includes(badge.id);

                return (
                  <BadgeCard
                    key={badge.id}
                    badge={badge}
                    isOwned={isOwned}
                    ownedData={ownedData}
                    isEquipped={isEquipped}
                    isFavorite={isFavorite}
                    onSelect={(b) => setSelectedBadge(b)}
                    onEquip={(b) => equipBadge(b.id)}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* DETAILED INSPECTION MODAL */}
      <BadgeDetailModal
        badge={selectedBadge}
        isOwned={selectedBadge ? economy.ownedBadgeIds.includes(selectedBadge.id) : false}
        ownedData={selectedBadge ? economy.ownedBadges.find((b) => b.badgeId === selectedBadge.id) : undefined}
        isEquipped={selectedBadge ? economy.equippedBadgeId === selectedBadge.id : false}
        isFavorite={selectedBadge ? economy.favoriteBadgeIds.includes(selectedBadge.id) : false}
        onClose={() => setSelectedBadge(null)}
        onEquip={(id) => {
          equipBadge(id);
        }}
        onToggleFavorite={(id) => toggleFavoriteBadge(id)}
      />

      {/* ANIMATED CRATE OPENING MODAL */}
      <CrateOpeningModal
        result={activeOpeningResult}
        crate={activeOpeningCrate}
        onClose={closeOpeningModal}
        onEquip={(id) => equipBadge(id)}
        onOpenAnother={(c) => {
          closeOpeningModal();
          setTimeout(() => handleOpenCrate(c), 150);
        }}
        canOpenAnother={
          activeOpeningCrate
            ? activeOpeningCrate.id === 'daily'
              ? false
              : economy.emberBalance >= activeOpeningCrate.cost
            : false
        }
      />
    </div>
  );
};
