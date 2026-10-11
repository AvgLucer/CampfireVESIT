import React, { useState, useEffect } from 'react';
import { CrateOpeningResult, CrateDefinition } from '../../types/ember';
import { BadgeArtwork } from '../badges/BadgeArtwork';
import { RARITY_DETAILS } from '../../data/badgeCatalogue';
import { EmberToken } from '../common/EmberToken';
import {
  Sparkles,
  Check,
  Award,
  ArrowRight,
  RotateCcw,
  FastForward,
  Coins,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface CrateOpeningModalProps {
  result: CrateOpeningResult | null;
  crate: CrateDefinition | null;
  onClose: () => void;
  onEquip: (badgeId: string) => void;
  onOpenAnother?: (crate: CrateDefinition) => void;
  canOpenAnother?: boolean;
}

export const CrateOpeningModal: React.FC<CrateOpeningModalProps> = ({
  result,
  crate,
  onClose,
  onEquip,
  onOpenAnother,
  canOpenAnother = false,
}) => {
  if (!result || !crate) return null;

  const [phase, setPhase] = useState<'shaking' | 'burst' | 'revealed'>('shaking');
  const [isEquipped, setIsEquipped] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const { badge, isDuplicate, compensation } = result;
  const rarityConfig = RARITY_DETAILS[badge.rarity];

  // Stage sequence timings
  useEffect(() => {
    if (reducedMotion) {
      setPhase('revealed');
      return;
    }

    setPhase('shaking');
    const timer1 = setTimeout(() => {
      setPhase('burst');
    }, 1200);

    const timer2 = setTimeout(() => {
      setPhase('revealed');
    }, 2400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [result, reducedMotion]);

  const handleSkip = () => {
    setPhase('revealed');
  };

  const handleEquipClick = () => {
    onEquip(badge.id);
    setIsEquipped(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      {/* Control bar: skip animation & reduced motion */}
      <div className="absolute top-4 right-4 flex items-center gap-3 z-50">
        <label className="flex items-center gap-1.5 text-[11px] text-neutral-400 cursor-pointer bg-neutral-900/80 px-2.5 py-1 rounded-lg border border-neutral-800">
          <input
            type="checkbox"
            checked={reducedMotion}
            onChange={(e) => setReducedMotion(e.target.checked)}
            className="rounded-xs accent-[#F97316]"
          />
          <span>Fast / Reduced Motion</span>
        </label>

        {phase !== 'revealed' && (
          <button
            onClick={handleSkip}
            className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-lg border border-neutral-700 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <FastForward className="w-3.5 h-3.5 text-[#F97316]" />
            <span>Skip</span>
          </button>
        )}
      </div>

      <div className="relative max-w-md w-full flex flex-col items-center text-center">
        {/* PHASE 1: SHAKING CRATE */}
        {phase === 'shaking' && (
          <div className="flex flex-col items-center space-y-6 animate-pulse">
            <div className="relative w-36 h-36 flex items-center justify-center animate-bounce">
              <div
                className="absolute inset-0 rounded-full blur-xl"
                style={{ backgroundColor: `${rarityConfig.color}40` }}
              />
              <div className="relative z-10 w-28 h-28 drop-shadow-2xl">
                {/* 3D Crate icon pulsating */}
                <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
                  <rect x="14" y="28" width="52" height="42" rx="6" fill="#1E293B" stroke="#F97316" strokeWidth="3" />
                  <path d="M10 28h60l-8-14H18l-8 14z" fill="#334155" stroke="#FDBA74" strokeWidth="2.5" />
                  <rect x="36" y="24" width="8" height="46" fill="#EA580C" />
                  <circle cx="40" cy="48" r="6" fill="#FFF" />
                </svg>
              </div>
            </div>

            <div className="text-white space-y-1">
              <h3 className="text-lg font-black tracking-wider uppercase text-orange-400">
                Opening {crate.name}...
              </h3>
              <p className="text-xs text-neutral-400">Channeling campus embers</p>
            </div>
          </div>
        )}

        {/* PHASE 2: BURST OF COLORED LIGHT */}
        {phase === 'burst' && (
          <div className="flex flex-col items-center space-y-6">
            <div className="relative w-48 h-48 flex items-center justify-center">
              {/* Radial expanding aura matching rarity */}
              <div
                className="absolute inset-0 rounded-full animate-ping duration-700"
                style={{ backgroundColor: rarityConfig.color }}
              />
              <div
                className="absolute inset-4 rounded-full blur-2xl animate-pulse"
                style={{ backgroundColor: rarityConfig.color }}
              />

              {/* Rarity-specific particle burst effect */}
              {badge.rarity === 'Unreal' ? (
                <div className="relative z-10 text-white font-black text-2xl tracking-widest uppercase animate-pulse">
                  CRIMSON SINGULARITY
                </div>
              ) : badge.rarity === 'Mythical' ? (
                <div className="relative z-10 text-white font-black text-xl tracking-widest uppercase animate-pulse">
                  ASTRAL RESONANCE
                </div>
              ) : (
                <Sparkles className="relative z-10 w-16 h-16 text-white animate-spin" />
              )}
            </div>

            <div className="text-white text-xs font-bold uppercase tracking-widest" style={{ color: rarityConfig.color }}>
              {badge.rarity} Discovery Imminent!
            </div>
          </div>
        )}

        {/* PHASE 3: REVEALED CARD */}
        {phase === 'revealed' && (
          <div className="w-full bg-[#171916] border border-neutral-800 text-white rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-300">
            {/* Top Discovery Banner */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 text-xs">
              <span className="text-neutral-400 font-semibold">{crate.name} Opening</span>
              {isDuplicate ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-950 text-amber-300 border border-amber-600">
                  DUPLICATE DISCOVERED
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-950 text-emerald-300 border border-emerald-600">
                  NEW BADGE UNLOCKED!
                </span>
              )}
            </div>

            {/* Central Badge Reveal Showcase */}
            <div className="flex flex-col items-center text-center py-2">
              <div className="scale-125 mb-4">
                <BadgeArtwork badge={badge} size="xl" />
              </div>

              {/* Rarity and ID chip */}
              <div className="flex items-center gap-2 mt-2">
                <span
                  className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border"
                  style={{
                    color: rarityConfig.color,
                    borderColor: `${rarityConfig.color}60`,
                    backgroundColor: `${rarityConfig.color}20`,
                  }}
                >
                  {badge.rarity}
                </span>
                <span className="text-xs font-mono font-bold text-neutral-400">
                  #{badge.id}
                </span>
              </div>

              <h2 className="text-2xl font-black text-white mt-1 tracking-tight">
                {badge.name}
              </h2>
              <p className="text-xs text-neutral-300 mt-1 max-w-xs leading-relaxed">
                {badge.description}
              </p>
            </div>

            {/* DUPLICATE COMPENSATION NOTIFICATION */}
            {isDuplicate ? (
              <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-700/60 space-y-1 text-center">
                <div className="text-xs font-extrabold text-amber-300 flex items-center justify-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>Duplicate Compensation Awarded!</span>
                </div>
                <div className="text-[11px] text-amber-200/90">
                  You already own {badge.name}. Converted into:
                </div>
                <div className="pt-1 flex items-center justify-center">
                  <div className="px-3 py-1 rounded-full bg-black/40 border border-amber-500/40">
                    <EmberToken amount={`+${compensation}`} size="sm" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-800/60 text-center">
                <div className="text-xs font-bold text-emerald-300 flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Permanently Added to Your Badge Collection</span>
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">
                  Display it proudly on your profile and leaderboards
                </div>
              </div>
            )}

            {/* Actions Grid */}
            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleEquipClick}
                  disabled={isEquipped}
                  className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                    isEquipped
                      ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                      : 'bg-[#F97316] hover:bg-[#EA580C] text-white shadow-xs'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>{isEquipped ? 'Equipped!' : 'Equip on Profile'}</span>
                </button>

                <Link
                  to="/badges"
                  onClick={onClose}
                  className="py-2.5 px-3 rounded-xl text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Layers className="w-4 h-4 text-neutral-300" />
                  <span>View Collection</span>
                </Link>
              </div>

              <div className="flex items-center gap-2 pt-1">
                {onOpenAnother && canOpenAnother ? (
                  <button
                    onClick={() => onOpenAnother(crate)}
                    className="flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold bg-neutral-800 hover:bg-neutral-700 text-orange-400 border border-orange-500/40 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Open Another {crate.name}</span>
                  </button>
                ) : null}

                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 cursor-pointer transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
