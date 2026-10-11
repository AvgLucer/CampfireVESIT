import { CrateDefinition, CollectorFrame } from '../types/ember';

export const CRATE_DEFINITIONS: Record<string, CrateDefinition> = {
  daily: {
    id: 'daily',
    name: 'Daily Crate',
    subtitle: 'Free Daily Discovery',
    cost: 0,
    availableRarities: ['Common', 'Rare', 'Legendary'],
    dropRates: {
      Common: 78,
      Rare: 20,
      Legendary: 2,
      Mythical: 0,
      Unreal: 0,
    },
    description: 'Claim once every 24 hours. A dependable daily reward to expand your campus badge collection.',
    themeColor: '#10B981', // Emerald
  },
  bronze: {
    id: 'bronze',
    name: 'Bronze Badge Crate',
    subtitle: 'Essential Explorer Crate',
    cost: 5,
    availableRarities: ['Common', 'Rare', 'Legendary', 'Mythical'],
    dropRates: {
      Common: 55,
      Rare: 30,
      Legendary: 13,
      Mythical: 2,
      Unreal: 0,
    },
    description: 'Accessible entry tier crate for 5 Embers. Features a 2% chance of unlocking an elusive Mythical badge.',
    themeColor: '#CD7F32', // Bronze
  },
  silver: {
    id: 'silver',
    name: 'Silver Badge Crate',
    subtitle: 'High-Yield Seeker Crate',
    cost: 10,
    availableRarities: ['Common', 'Rare', 'Legendary', 'Mythical', 'Unreal'],
    dropRates: {
      Common: 35,
      Rare: 35,
      Legendary: 23,
      Mythical: 6.5,
      Unreal: 0.5,
    },
    description: 'Balanced crate for 10 Embers with high Rare and Legendary odds, plus an entry 0.5% chance at an Unreal badge.',
    themeColor: '#94A3B8', // Silver
  },
  gold: {
    id: 'gold',
    name: 'Golden Badge Crate',
    subtitle: 'Apex Collector Crate',
    cost: 15,
    availableRarities: ['Common', 'Rare', 'Legendary', 'Mythical', 'Unreal'],
    dropRates: {
      Common: 20,
      Rare: 30,
      Legendary: 32,
      Mythical: 17,
      Unreal: 1.0,
    },
    description: 'Premium crate for 15 Embers. Highest Mythical rate (17%) and full 1.0% chance of Unreal singularity.',
    themeColor: '#F59E0B', // Gold
  },
};

export const COLLECTOR_FRAMES: CollectorFrame[] = [
  {
    id: 'common_collector',
    name: 'Common Collector Frame',
    rarityTarget: 'Common',
    description: 'Complete the entire 25/25 Common badge collection.',
    borderColor: '#94A3B8',
    glowColor: 'rgba(148, 163, 184, 0.4)',
  },
  {
    id: 'blue_collector',
    name: 'Blue Collector Frame',
    rarityTarget: 'Rare',
    description: 'Complete the entire 20/20 Rare badge collection.',
    borderColor: '#3B82F6',
    glowColor: 'rgba(59, 130, 246, 0.5)',
  },
  {
    id: 'golden_collector',
    name: 'Golden Collector Frame',
    rarityTarget: 'Legendary',
    description: 'Complete the entire 15/15 Legendary badge collection.',
    borderColor: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.6)',
  },
  {
    id: 'astral_collector',
    name: 'Astral Collector Frame',
    rarityTarget: 'Mythical',
    description: 'Complete the entire 10/10 Mythical badge collection.',
    borderColor: '#A855F7',
    glowColor: 'rgba(168, 85, 247, 0.65)',
  },
  {
    id: 'reality_breaker',
    name: 'Reality Breaker Profile Frame',
    rarityTarget: 'Unreal',
    description: 'Complete the ultimate 5/5 Unreal badge collection.',
    borderColor: '#F43F5E',
    glowColor: 'rgba(244, 63, 94, 0.8)',
  },
];
