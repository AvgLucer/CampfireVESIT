import React, { useState } from 'react';
import { useEmberEconomy } from '../context/EmberEconomyContext';
import { CrateDefinition } from '../types/ember';
import { CrateCard } from '../components/crates/CrateCard';
import { CrateOpeningModal } from '../components/crates/CrateOpeningModal';
import { EmberToken } from '../components/common/EmberToken';
import { BadgeArtwork } from '../components/badges/BadgeArtwork';
import {
  Box,
  Gift,
  Clock,
  Sparkles,
  ShieldCheck,
  History,
  Coins,
  RotateCcw,
  PlusCircle,
  HelpCircle,
  Award,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const CratesPage: React.FC = () => {
  const {
    economy,
    crates,
    isDailyRewardAvailable,
    dailyRewardCountdown,
    claimDailyReward,
    isDailyCrateAvailable,
    dailyCrateCountdown,
    openCrate,
    equipBadge,
    activeOpeningResult,
    activeOpeningCrate,
    closeOpeningModal,
    openWalletModal,
    addDemoEmbers,
    resetDailyCooldownsForDemo,
    resetEconomyToDemo,
  } = useEmberEconomy();

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

  return (
    <div className="space-y-8">
      {/* Header & Balance Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#737871] mb-1">
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
              Campus Crate Shop
            </span>
            <span>·</span>
            <span>Provably Weighted Odds</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171916] dark:text-neutral-100 tracking-tight">
            Crate Vault & Drop Shop
          </h1>
          <p className="text-xs sm:text-sm text-[#555952] dark:text-neutral-400 mt-0.5 max-w-2xl">
            Acquire collectible badges across four calibrated crate tiers. Duplicates automatically convert into EMBER compensation.
          </p>
        </div>

        {/* Currency & Vault action */}
        <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
          <button
            onClick={openWalletModal}
            className="px-4 py-2.5 rounded-2xl bg-white dark:bg-neutral-800 border border-[#E5E3DC] dark:border-neutral-700 hover:border-[#F97316] transition-colors cursor-pointer shadow-xs flex items-center gap-2"
            title="View wallet & transaction history"
          >
            <EmberToken amount={economy.emberBalance} size="md" />
          </button>

          <Link
            to="/badges"
            className="px-4 py-2.5 rounded-2xl bg-[#171916] text-white text-xs font-bold hover:bg-neutral-800 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span>My Collection ({economy.ownedBadgeIds.length}/75)</span>
          </Link>
        </div>
      </div>

      {/* DAILY BONUS BANNER & LIVE REWARD CLAIM */}
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

      {/* 4 CRATES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* RECENT DISCOVERIES STREAM */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-[#E5E3DC] dark:border-neutral-800 shadow-xs space-y-4">
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

      {/* DEMO / TESTING SIMULATOR SUITE (Clearly labeled for judges & development evaluation) */}
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
