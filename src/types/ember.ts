export type BadgeRarity = 'Common' | 'Rare' | 'Legendary' | 'Mythical' | 'Unreal';

export type CrateType = 'daily' | 'bronze' | 'silver' | 'gold';

export interface BadgeDefinition {
  id: string; // e.g. 'C01', 'R01', 'L01', 'M01', 'U01'
  name: string;
  rarity: BadgeRarity;
  description: string;
  artworkConcept: string;
  eligibleCrates: CrateType[];
}

export interface OwnedBadge {
  badgeId: string;
  acquiredAt: string;
  sourceCrate: CrateType | 'starter' | 'reward';
}

export type EmberTransactionType =
  | 'registration_bonus'
  | 'daily_reward'
  | 'crate_purchase'
  | 'duplicate_compensation'
  | 'demo_reset'
  | 'demo_adjustment';

export interface EmberTransaction {
  id: string;
  userId: string;
  type: EmberTransactionType;
  amount: number; // positive for income, negative for expense
  balanceAfter: number;
  reason: string;
  createdAt: string;
  relatedCrateOpeningId?: string;
  relatedBadgeId?: string;
}

export interface CrateDefinition {
  id: CrateType;
  name: string;
  subtitle: string;
  cost: number; // 0 for daily, 5 for bronze, 10 for silver, 15 for gold
  availableRarities: BadgeRarity[];
  dropRates: Record<BadgeRarity, number>; // Must sum to 100%
  description: string;
  themeColor: string;
}

export interface CrateOpeningResult {
  id: string;
  userId: string;
  crateType: CrateType;
  cost: number;
  badge: BadgeDefinition;
  isDuplicate: boolean;
  compensation: number;
  createdAt: string;
}

export type CollectorFrameId =
  | 'common_collector'
  | 'blue_collector'
  | 'golden_collector'
  | 'astral_collector'
  | 'reality_breaker';

export interface CollectorFrame {
  id: CollectorFrameId;
  name: string;
  rarityTarget: BadgeRarity;
  description: string;
  borderColor: string;
  glowColor: string;
}

export interface UserEconomyState {
  userId: string;
  emberBalance: number;
  lastDailyClaimAt: string | null;
  lastDailyCrateAt: string | null;
  ownedBadgeIds: string[];
  ownedBadges: OwnedBadge[];
  equippedBadgeId: string | null;
  equippedBadgeIds: string[]; // Exactly 5 badges visible on profile (min and max 5 badges)
  favoriteBadgeIds: string[]; // up to 6 badges
  transactions: EmberTransaction[];
  openingHistory: CrateOpeningResult[];
}
