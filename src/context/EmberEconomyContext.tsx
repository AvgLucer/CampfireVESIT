import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  UserEconomyState,
  BadgeDefinition,
  OwnedBadge,
  EmberTransaction,
  CrateDefinition,
  CrateOpeningResult,
  BadgeRarity,
  CollectorFrameId,
} from '../types/ember';
import { BADGE_CATALOGUE, BADGE_BY_ID, BADGES_BY_RARITY, RARITY_DETAILS } from '../data/badgeCatalogue';
import { CRATE_DEFINITIONS, COLLECTOR_FRAMES } from '../data/crateDefinitions';
import { getUserBadges as getUniversalUserBadges } from '../utils/userBadges';
import { useApp } from './AppContext';

interface EmberEconomyContextType {
  economy: UserEconomyState;
  allBadges: BadgeDefinition[];
  crates: Record<string, CrateDefinition>;
  equippedBadge: BadgeDefinition | null;
  equippedBadges: BadgeDefinition[]; // Strictly min and max 5 badges visible on profile
  favoriteBadges: BadgeDefinition[];

  // Daily rewards & cooldowns
  isDailyRewardAvailable: boolean;
  dailyRewardCountdown: string;
  nextDailyRewardTime: Date | null;
  claimDailyReward: () => boolean;

  // Daily Crate cooldowns
  isDailyCrateAvailable: boolean;
  dailyCrateCountdown: string;
  nextDailyCrateTime: Date | null;

  // Crate actions
  openCrate: (crateId: string) => CrateOpeningResult | null;

  // Badge actions
  equipBadge: (badgeId: string) => boolean;
  unequipBadge: () => void;
  setProfileBadgeSlot: (slotIndex: number, badgeId: string) => boolean;
  toggleFavoriteBadge: (badgeId: string) => boolean;
  isBadgeOwned: (badgeId: string) => boolean;
  getUserBadges: (userId?: string | null) => BadgeDefinition[];

  // Modals & Panels
  isWalletModalOpen: boolean;
  openWalletModal: () => void;
  closeWalletModal: () => void;

  activeOpeningResult: CrateOpeningResult | null;
  activeOpeningCrate: CrateDefinition | null;
  closeOpeningModal: () => void;

  // Progress stats
  ownedCount: number;
  totalBadgesCount: number;
  completionPercentage: number;
  rarityCounts: Record<BadgeRarity, { owned: number; total: number }>;
  unlockedFrames: CollectorFrameId[];

  // Demo utilities
  resetEconomyToDemo: () => void;
  addDemoEmbers: (amount: number) => void;
  resetDailyCooldownsForDemo: () => void;
}

const EmberEconomyContext = createContext<EmberEconomyContextType | undefined>(undefined);

const ECONOMY_STORAGE_PREFIX = 'campfire_economy_v2_';

// Initial Starter State for Demo Account
const getInitialStarterState = (userId: string): UserEconomyState => {
  const now = new Date();
  const registrationTx: EmberTransaction = {
    id: `tx_reg_${userId}`,
    userId,
    type: 'registration_bonus',
    amount: 50,
    balanceAfter: 50,
    reason: 'Campfire Registration Bonus (Welcome Grant)',
    createdAt: new Date(now.getTime() - 25 * 3600 * 1000).toISOString(), // 25 hours ago so daily claim is ready
  };

  // 5 starter badges to jumpstart the demo experience
  const starterBadges: OwnedBadge[] = [
    { badgeId: 'C01', acquiredAt: new Date(now.getTime() - 24 * 3600 * 1000).toISOString(), sourceCrate: 'starter' },
    { badgeId: 'C02', acquiredAt: new Date(now.getTime() - 20 * 3600 * 1000).toISOString(), sourceCrate: 'starter' },
    { badgeId: 'C10', acquiredAt: new Date(now.getTime() - 15 * 3600 * 1000).toISOString(), sourceCrate: 'starter' },
    { badgeId: 'C16', acquiredAt: new Date(now.getTime() - 10 * 3600 * 1000).toISOString(), sourceCrate: 'starter' },
    { badgeId: 'R10', acquiredAt: new Date(now.getTime() - 5 * 3600 * 1000).toISOString(), sourceCrate: 'starter' },
  ];

  return {
    userId,
    emberBalance: 50,
    lastDailyClaimAt: null, // Ready to claim immediately
    lastDailyCrateAt: null, // Ready to open immediately
    ownedBadgeIds: starterBadges.map((b) => b.badgeId),
    ownedBadges: starterBadges,
    equippedBadgeId: 'C01', // Primary badge
    equippedBadgeIds: ['C01', 'C02', 'C10', 'C16', 'R10'], // Exactly 5 badges visible on profile (min 5, max 5)
    favoriteBadgeIds: ['C01', 'C02', 'R10'],
    transactions: [registrationTx],
    openingHistory: [],
  };
};

const sanitizeLoadedState = (raw: any, userId: string): UserEconomyState => {
  const fallback = getInitialStarterState(userId);
  if (!raw || typeof raw !== 'object') return fallback;

  let equippedBadgeIds = Array.isArray(raw.equippedBadgeIds) ? [...raw.equippedBadgeIds] : [];
  if (equippedBadgeIds.length === 0) {
    equippedBadgeIds = ['C01', 'C02', 'C10', 'C16', 'R10'];
  }
  // Ensure exactly 5 badges
  const defaults = ['C01', 'C02', 'C10', 'C16', 'R10'];
  for (const defId of defaults) {
    if (equippedBadgeIds.length >= 5) break;
    if (!equippedBadgeIds.includes(defId)) {
      equippedBadgeIds.push(defId);
    }
  }
  equippedBadgeIds = equippedBadgeIds.slice(0, 5);

  return {
    ...fallback,
    ...raw,
    userId,
    equippedBadgeIds,
    equippedBadgeId: raw.equippedBadgeId || equippedBadgeIds[0] || 'C01',
  };
};

export const EmberEconomyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, showToast } = useApp();
  const currentUserId = user?.userId || 'stu_guest';

  // Load economy for current user from localStorage
  const [economy, setEconomy] = useState<UserEconomyState>(() => {
    try {
      const stored = localStorage.getItem(ECONOMY_STORAGE_PREFIX + currentUserId);
      if (stored) {
        return sanitizeLoadedState(JSON.parse(stored), currentUserId);
      }
    } catch (err) {
      console.warn('Failed to load user economy:', err);
    }
    return getInitialStarterState(currentUserId);
  });

  // Switch economy whenever active user changes
  useEffect(() => {
    try {
      const stored = localStorage.getItem(ECONOMY_STORAGE_PREFIX + currentUserId);
      if (stored) {
        setEconomy(sanitizeLoadedState(JSON.parse(stored), currentUserId));
      } else {
        const freshState = getInitialStarterState(currentUserId);
        setEconomy(freshState);
        localStorage.setItem(ECONOMY_STORAGE_PREFIX + currentUserId, JSON.stringify(freshState));
      }
    } catch {
      setEconomy(getInitialStarterState(currentUserId));
    }
  }, [currentUserId]);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ECONOMY_STORAGE_PREFIX + economy.userId, JSON.stringify(economy));
    } catch (err) {
      console.warn('Failed to save economy state:', err);
    }
  }, [economy]);

  // Modal states
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [activeOpeningResult, setActiveOpeningResult] = useState<CrateOpeningResult | null>(null);
  const [activeOpeningCrate, setActiveOpeningCrate] = useState<CrateDefinition | null>(null);

  // Time ticker for live countdowns (updates every second)
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format remaining seconds into HH:MM:SS
  const formatCountdown = (diffSeconds: number): string => {
    if (diffSeconds <= 0) return '00:00:00';
    const hrs = Math.floor(diffSeconds / 3600);
    const mins = Math.floor((diffSeconds % 3600) / 60);
    const secs = Math.floor(diffSeconds % 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  // Daily Reward calculations (24 hours = 86400000 ms)
  const nextDailyRewardTime = economy.lastDailyClaimAt
    ? new Date(new Date(economy.lastDailyClaimAt).getTime() + 24 * 3600 * 1000)
    : null;

  const dailyRewardDiffSeconds = nextDailyRewardTime
    ? Math.max(0, Math.floor((nextDailyRewardTime.getTime() - currentTime) / 1000))
    : 0;

  const isDailyRewardAvailable = !nextDailyRewardTime || dailyRewardDiffSeconds === 0;
  const dailyRewardCountdown = formatCountdown(dailyRewardDiffSeconds);

  // Daily Crate calculations (24 hours)
  const nextDailyCrateTime = economy.lastDailyCrateAt
    ? new Date(new Date(economy.lastDailyCrateAt).getTime() + 24 * 3600 * 1000)
    : null;

  const dailyCrateDiffSeconds = nextDailyCrateTime
    ? Math.max(0, Math.floor((nextDailyCrateTime.getTime() - currentTime) / 1000))
    : 0;

  const isDailyCrateAvailable = !nextDailyCrateTime || dailyCrateDiffSeconds === 0;
  const dailyCrateCountdown = formatCountdown(dailyCrateDiffSeconds);

  // Claim Daily Login Reward (5 EMBER every 24h)
  const claimDailyReward = useCallback((): boolean => {
    if (!isDailyRewardAvailable) {
      showToast(`Daily reward cooldown active. Next claim in ${dailyRewardCountdown}`, 'warning');
      return false;
    }

    const awardAmount = 5;
    const newBalance = economy.emberBalance + awardAmount;
    const nowIso = new Date().toISOString();

    const tx: EmberTransaction = {
      id: `tx_daily_${Date.now()}`,
      userId: economy.userId,
      type: 'daily_reward',
      amount: awardAmount,
      balanceAfter: newBalance,
      reason: 'Daily Login Reward (+5 EMBER)',
      createdAt: nowIso,
    };

    setEconomy((prev) => ({
      ...prev,
      emberBalance: newBalance,
      lastDailyClaimAt: nowIso,
      transactions: [tx, ...prev.transactions],
    }));

    showToast('Claimed 5 EMBER daily reward! 🔥', 'success');
    return true;
  }, [isDailyRewardAvailable, dailyRewardCountdown, economy, showToast]);

  // Open Crate Logic
  const openCrate = useCallback(
    (crateId: string): CrateOpeningResult | null => {
      const crateDef = CRATE_DEFINITIONS[crateId];
      if (!crateDef) {
        showToast('Invalid crate type', 'error');
        return null;
      }

      // Check balance & cooldowns
      if (crateDef.id === 'daily') {
        if (!isDailyCrateAvailable) {
          showToast(`Daily Crate on cooldown. Ready in ${dailyCrateCountdown}`, 'warning');
          return null;
        }
      } else {
        if (economy.emberBalance < crateDef.cost) {
          showToast(`Insufficient EMBER balance (${economy.emberBalance}/${crateDef.cost})`, 'error');
          return null;
        }
      }

      // Step 1: Weighted selection of rarity
      const roll = Math.random() * 100;
      let cumulative = 0;
      let chosenRarity: BadgeRarity = 'Common';

      for (const rarity of ['Common', 'Rare', 'Legendary', 'Mythical', 'Unreal'] as BadgeRarity[]) {
        const rate = crateDef.dropRates[rarity] || 0;
        cumulative += rate;
        if (roll < cumulative && rate > 0) {
          chosenRarity = rarity;
          break;
        }
      }

      // Step 2: Uniform selection from badges of that rarity
      const eligiblePool = BADGES_BY_RARITY[chosenRarity];
      if (!eligiblePool || eligiblePool.length === 0) {
        showToast('Selection error in catalogue', 'error');
        return null;
      }
      const chosenBadge = eligiblePool[Math.floor(Math.random() * eligiblePool.length)];

      // Step 3: Check duplicate status
      const isDuplicate = economy.ownedBadgeIds.includes(chosenBadge.id);
      const compensation = isDuplicate ? RARITY_DETAILS[chosenRarity].compensation : 0;
      const nowIso = new Date().toISOString();
      const openingId = `open_${Date.now()}`;

      // Calculate new balance
      const newBalance = economy.emberBalance - crateDef.cost + compensation;

      // Transactions to record
      const newTransactions: EmberTransaction[] = [];

      // Paid crate purchase transaction
      if (crateDef.cost > 0) {
        newTransactions.push({
          id: `tx_buy_${Date.now()}_1`,
          userId: economy.userId,
          type: 'crate_purchase',
          amount: -crateDef.cost,
          balanceAfter: economy.emberBalance - crateDef.cost,
          reason: `Purchased ${crateDef.name} (-${crateDef.cost} EMBER)`,
          createdAt: nowIso,
          relatedCrateOpeningId: openingId,
        });
      }

      // Duplicate compensation transaction
      if (isDuplicate && compensation > 0) {
        newTransactions.push({
          id: `tx_dup_${Date.now()}_2`,
          userId: economy.userId,
          type: 'duplicate_compensation',
          amount: compensation,
          balanceAfter: newBalance,
          reason: `Duplicate Badge Compensation: ${chosenBadge.name} (+${compensation} EMBER)`,
          createdAt: nowIso,
          relatedCrateOpeningId: openingId,
          relatedBadgeId: chosenBadge.id,
        });
      }

      const openingResult: CrateOpeningResult = {
        id: openingId,
        userId: economy.userId,
        crateType: crateDef.id,
        cost: crateDef.cost,
        badge: chosenBadge,
        isDuplicate,
        compensation,
        createdAt: nowIso,
      };

      // Atomic state update
      setEconomy((prev) => {
        let updatedOwnedIds = prev.ownedBadgeIds;
        let updatedOwnedBadges = prev.ownedBadges;

        if (!isDuplicate) {
          updatedOwnedIds = [...prev.ownedBadgeIds, chosenBadge.id];
          updatedOwnedBadges = [
            { badgeId: chosenBadge.id, acquiredAt: nowIso, sourceCrate: crateDef.id },
            ...prev.ownedBadges,
          ];
        }

        return {
          ...prev,
          emberBalance: Math.max(0, newBalance),
          lastDailyCrateAt: crateDef.id === 'daily' ? nowIso : prev.lastDailyCrateAt,
          ownedBadgeIds: updatedOwnedIds,
          ownedBadges: updatedOwnedBadges,
          transactions: [...newTransactions, ...prev.transactions],
          openingHistory: [openingResult, ...prev.openingHistory],
        };
      });

      // Launch animated reveal modal
      setActiveOpeningResult(openingResult);
      setActiveOpeningCrate(crateDef);

      return openingResult;
    },
    [economy, isDailyCrateAvailable, dailyCrateCountdown, showToast]
  );

  // Equip badge into slot 0 and set as primary
  const equipBadge = useCallback(
    (badgeId: string): boolean => {
      if (!economy.ownedBadgeIds.includes(badgeId)) {
        showToast('You must own this badge before equipping it to your profile.', 'warning');
        return false;
      }

      const badge = BADGE_BY_ID[badgeId];
      setEconomy((prev) => {
        let currentSlots = [...(prev.equippedBadgeIds || ['C01', 'C02', 'C10', 'C16', 'R10'])];
        if (currentSlots.includes(badgeId)) {
          // Move to front
          currentSlots = [badgeId, ...currentSlots.filter((id) => id !== badgeId)];
        } else {
          // Replace front or shift
          currentSlots = [badgeId, ...currentSlots.slice(0, 4)];
        }
        return {
          ...prev,
          equippedBadgeId: badgeId,
          equippedBadgeIds: currentSlots.slice(0, 5),
        };
      });

      showToast(`Equipped "${badge?.name || badgeId}" in your 5 profile badges!`, 'success');
      return true;
    },
    [economy.ownedBadgeIds, showToast]
  );

  // Set an exact badge into one of the 5 profile badge slots (0 to 4)
  const setProfileBadgeSlot = useCallback(
    (slotIndex: number, badgeId: string): boolean => {
      if (slotIndex < 0 || slotIndex >= 5) return false;
      if (!economy.ownedBadgeIds.includes(badgeId)) {
        showToast('You must own this badge to set it on your profile.', 'warning');
        return false;
      }

      const badge = BADGE_BY_ID[badgeId];
      setEconomy((prev) => {
        const slots = [...(prev.equippedBadgeIds || ['C01', 'C02', 'C10', 'C16', 'R10'])];
        slots[slotIndex] = badgeId;
        return {
          ...prev,
          equippedBadgeIds: slots.slice(0, 5),
          equippedBadgeId: slotIndex === 0 ? badgeId : prev.equippedBadgeId,
        };
      });

      showToast(`Set "${badge?.name || badgeId}" to Profile Slot ${slotIndex + 1}!`, 'success');
      return true;
    },
    [economy.ownedBadgeIds, showToast]
  );

  const unequipBadge = useCallback(() => {
    setEconomy((prev) => ({
      ...prev,
      equippedBadgeId: prev.equippedBadgeIds[0] || null,
    }));
    showToast('Reset profile badge highlight', 'info');
  }, [showToast]);

  // Toggle favorite showcase badge (up to 6)
  const toggleFavoriteBadge = useCallback(
    (badgeId: string): boolean => {
      if (!economy.ownedBadgeIds.includes(badgeId)) {
        showToast('You must own this badge first', 'warning');
        return false;
      }

      setEconomy((prev) => {
        const isFav = prev.favoriteBadgeIds.includes(badgeId);
        if (isFav) {
          return {
            ...prev,
            favoriteBadgeIds: prev.favoriteBadgeIds.filter((id) => id !== badgeId),
          };
        } else {
          if (prev.favoriteBadgeIds.length >= 6) {
            showToast('Showcase limited to 6 favorite badges', 'info');
            return prev;
          }
          return {
            ...prev,
            favoriteBadgeIds: [...prev.favoriteBadgeIds, badgeId],
          };
        }
      });
      return true;
    },
    [economy.ownedBadgeIds, showToast]
  );

  const isBadgeOwned = useCallback(
    (badgeId: string): boolean => {
      return economy.ownedBadgeIds.includes(badgeId);
    },
    [economy.ownedBadgeIds]
  );

  // Derived progress stats
  const totalBadgesCount = BADGE_CATALOGUE.length; // 75
  const ownedCount = economy.ownedBadgeIds.length;
  const completionPercentage = Number(((ownedCount / totalBadgesCount) * 100).toFixed(1));

  const rarityCounts: Record<BadgeRarity, { owned: number; total: number }> = {
    Common: {
      owned: economy.ownedBadgeIds.filter((id) => BADGE_BY_ID[id]?.rarity === 'Common').length,
      total: BADGES_BY_RARITY.Common.length, // 25
    },
    Rare: {
      owned: economy.ownedBadgeIds.filter((id) => BADGE_BY_ID[id]?.rarity === 'Rare').length,
      total: BADGES_BY_RARITY.Rare.length, // 20
    },
    Legendary: {
      owned: economy.ownedBadgeIds.filter((id) => BADGE_BY_ID[id]?.rarity === 'Legendary').length,
      total: BADGES_BY_RARITY.Legendary.length, // 15
    },
    Mythical: {
      owned: economy.ownedBadgeIds.filter((id) => BADGE_BY_ID[id]?.rarity === 'Mythical').length,
      total: BADGES_BY_RARITY.Mythical.length, // 10
    },
    Unreal: {
      owned: economy.ownedBadgeIds.filter((id) => BADGE_BY_ID[id]?.rarity === 'Unreal').length,
      total: BADGES_BY_RARITY.Unreal.length, // 5
    },
  };

  // Collector Frame Unlocks
  const unlockedFrames: CollectorFrameId[] = [];
  if (rarityCounts.Common.owned >= rarityCounts.Common.total) unlockedFrames.push('common_collector');
  if (rarityCounts.Rare.owned >= rarityCounts.Rare.total) unlockedFrames.push('blue_collector');
  if (rarityCounts.Legendary.owned >= rarityCounts.Legendary.total) unlockedFrames.push('golden_collector');
  if (rarityCounts.Mythical.owned >= rarityCounts.Mythical.total) unlockedFrames.push('astral_collector');
  if (rarityCounts.Unreal.owned >= rarityCounts.Unreal.total) unlockedFrames.push('reality_breaker');

  // Primary equipped badge definition
  const equippedBadge = economy.equippedBadgeId ? BADGE_BY_ID[economy.equippedBadgeId] || null : null;

  // Strictly 5 equipped profile badges (min 5, max 5)
  const equippedBadges: BadgeDefinition[] = (() => {
    const rawIds = economy.equippedBadgeIds && economy.equippedBadgeIds.length === 5
      ? economy.equippedBadgeIds
      : ['C01', 'C02', 'C10', 'C16', 'R10'];
    const resolved = rawIds.map((id) => BADGE_BY_ID[id]).filter(Boolean) as BadgeDefinition[];
    let idx = 0;
    while (resolved.length < 5 && idx < BADGE_CATALOGUE.length) {
      const candidate = BADGE_CATALOGUE[idx];
      if (!resolved.some(b => b.id === candidate.id)) {
        resolved.push(candidate);
      }
      idx++;
    }
    return resolved.slice(0, 5);
  })();

  const favoriteBadges = economy.favoriteBadgeIds.map((id) => BADGE_BY_ID[id]).filter(Boolean);

  // Demo utilities
  const resetEconomyToDemo = useCallback(() => {
    const demoState = getInitialStarterState(economy.userId);
    setEconomy(demoState);
    localStorage.setItem(ECONOMY_STORAGE_PREFIX + economy.userId, JSON.stringify(demoState));
    showToast('Demo economy reset to 50 EMBER and initial starter collection!', 'info');
  }, [economy.userId, showToast]);

  const addDemoEmbers = useCallback(
    (amount: number) => {
      const newBal = economy.emberBalance + amount;
      const tx: EmberTransaction = {
        id: `tx_demo_${Date.now()}`,
        userId: economy.userId,
        type: 'demo_adjustment',
        amount,
        balanceAfter: newBal,
        reason: `Demo Simulator Adjustment (+${amount} EMBER)`,
        createdAt: new Date().toISOString(),
      };
      setEconomy((prev) => ({
        ...prev,
        emberBalance: newBal,
        transactions: [tx, ...prev.transactions],
      }));
      showToast(`Added ${amount} EMBER for demo testing!`, 'success');
    },
    [economy, showToast]
  );

  const resetDailyCooldownsForDemo = useCallback(() => {
    setEconomy((prev) => ({
      ...prev,
      lastDailyClaimAt: null,
      lastDailyCrateAt: null,
    }));
    showToast('Reset daily claim and daily crate cooldowns for demo testing!', 'success');
  }, [showToast]);

  return (
    <EmberEconomyContext.Provider
      value={{
        economy,
        allBadges: BADGE_CATALOGUE,
        crates: CRATE_DEFINITIONS,
        equippedBadge,
        equippedBadges,
        favoriteBadges,
        isDailyRewardAvailable,
        dailyRewardCountdown,
        nextDailyRewardTime,
        isDailyCrateAvailable,
        dailyCrateCountdown,
        nextDailyCrateTime,
        claimDailyReward,
        openCrate,
        equipBadge,
        unequipBadge,
        setProfileBadgeSlot,
        toggleFavoriteBadge,
        isBadgeOwned,
        getUserBadges: getUniversalUserBadges,
        isWalletModalOpen,
        openWalletModal: () => setIsWalletModalOpen(true),
        closeWalletModal: () => setIsWalletModalOpen(false),
        activeOpeningResult,
        activeOpeningCrate,
        closeOpeningModal: () => {
          setActiveOpeningResult(null);
          setActiveOpeningCrate(null);
        },
        ownedCount,
        totalBadgesCount,
        completionPercentage,
        rarityCounts,
        unlockedFrames,
        resetEconomyToDemo,
        addDemoEmbers,
        resetDailyCooldownsForDemo,
      }}
    >
      {children}
    </EmberEconomyContext.Provider>
  );
};

export const useEmberEconomy = (): EmberEconomyContextType => {
  const context = useContext(EmberEconomyContext);
  if (!context) {
    throw new Error('useEmberEconomy must be used within an EmberEconomyProvider');
  }
  return context;
};
