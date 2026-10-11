import { BadgeDefinition } from '../types/ember';
import { BADGE_BY_ID, BADGE_CATALOGUE } from '../data/badgeCatalogue';

// Curated distinctive 5-badge setups for key students & coordinators
export const USER_DEFAULT_5_BADGES: Record<string, string[]> = {
  // Aarav Sharma (FE CE, Hackathon enthusiast, Carpool explorer)
  stu_aarav_vesit_01: ['C01', 'C02', 'C10', 'C16', 'R10'],
  // Neha Chawla / Neha Patil (Maths mentor & SE leader)
  stu_neha_03: ['C04', 'R01', 'R04', 'L02', 'C12'],
  stu_neha_02: ['C04', 'R01', 'C06', 'R10', 'C16'],
  // Tanvi Kulkarni (FE IT, Carpool commuter & coder)
  stu_tanvi_32: ['C03', 'C05', 'R03', 'R08', 'C15'],
  // Rohan Deshmukh (FE EXTC, Circuits & Robotics)
  stu_rohan_14: ['C08', 'C09', 'R02', 'R05', 'C20'],
  // Priya Kulkarni (Carpool Host, VESIT SE)
  stu_priya_08: ['C02', 'R07', 'R12', 'L05', 'C14'],
  // Siddharth Nair (Genesis Hacker)
  stu_sid_77: ['C11', 'R10', 'R11', 'L01', 'M01'],
  // Ananya Verma / Ananya Iyer (Cultural & Technical coordinator)
  stu_ananya_18: ['C06', 'C17', 'R06', 'R15', 'L03'],
  stu_ananya_22: ['C07', 'C18', 'R09', 'L04', 'M02'],
  // Kabir Mehta (Auto-rickshaw commuter)
  stu_kabir_55: ['C13', 'C19', 'R13', 'C21', 'R14'],
  // Aditya Verma (Coding lead)
  stu_aditya_05: ['C22', 'R16', 'R17', 'L06', 'M03'],
  // Vikram Rao (Robotics Council)
  stu_vikram_41: ['C23', 'C24', 'R18', 'L07', 'M04'],
  // Dr. Nupur Giri (Academic Coordinator / Admin)
  admin_nupur_giri: ['L08', 'L09', 'M05', 'U01', 'U02'],
};

// Fallback 5-badge pool for any dynamic or guest user
const FALLBACK_5_BADGES = ['C01', 'C02', 'C10', 'C16', 'R10'];

/**
 * Returns strictly 5 badges (min 5, max 5) for any user in the system.
 * Reads saved profile badges from localStorage if customized,
 * or returns their curated 5-badge profile loadout.
 */
export function getUserBadges(userId?: string | null): BadgeDefinition[] {
  if (!userId) {
    return FALLBACK_5_BADGES.map((id) => BADGE_BY_ID[id] || BADGE_CATALOGUE[0]);
  }

  // 1. Check if user has an active economy state in localStorage
  try {
    const stored = localStorage.getItem(`campfire_economy_v2_${userId}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed.equippedBadgeIds) && parsed.equippedBadgeIds.length === 5) {
        const badges = parsed.equippedBadgeIds
          .map((id: string) => BADGE_BY_ID[id])
          .filter(Boolean) as BadgeDefinition[];
        if (badges.length === 5) {
          return badges;
        }
      }
    }
  } catch {
    // Ignore and fallback
  }

  // 2. Check predefined profile loadouts
  const presetIds = USER_DEFAULT_5_BADGES[userId] || FALLBACK_5_BADGES;
  const result: BadgeDefinition[] = [];

  for (const id of presetIds) {
    if (BADGE_BY_ID[id]) {
      result.push(BADGE_BY_ID[id]);
    }
  }

  // 3. Ensure strictly 5 badges (never less than 5, never more than 5)
  let cursor = 0;
  while (result.length < 5 && cursor < BADGE_CATALOGUE.length) {
    const candidate = BADGE_CATALOGUE[cursor];
    if (!result.some((b) => b.id === candidate.id)) {
      result.push(candidate);
    }
    cursor++;
  }

  return result.slice(0, 5);
}
