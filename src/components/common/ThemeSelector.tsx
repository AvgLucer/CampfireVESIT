import React, { useState, useRef, useEffect } from 'react';
import { useTheme, AppTheme, THEMES } from '../../context/ThemeContext';
import { Palette, Check, Sparkles, Flame, Zap, Droplets, ChevronDown } from 'lucide-react';

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme, allThemes, themeConfig } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getThemeIcon = (t: AppTheme) => {
    switch (t) {
      case 'tron':
        return <Zap className="w-3.5 h-3.5 text-[#FF003C]" />;
      case 'azure':
        return <Droplets className="w-3.5 h-3.5 text-[#2563EB]" />;
      case 'classic':
      default:
        return <Flame className="w-3.5 h-3.5 text-[#F97316]" />;
    }
  };

  return (
    <div className="relative select-none" ref={dropdownRef}>
      {/* Navbar Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#E5E3DC] dark:border-neutral-700 hover:border-[#F97316] text-[#555952] dark:text-neutral-300 hover:text-[#171916] text-xs font-semibold hover:bg-[#FAF9F5] dark:hover:bg-neutral-800 transition-all cursor-pointer shadow-2xs group"
        title="Change Background Theme (Classic, Tron Ares, Smooth White & Blue)"
      >
        <Palette className="w-3.5 h-3.5 text-[#F97316] group-hover:rotate-12 transition-transform" />
        <span className="hidden sm:inline font-bold">{themeConfig.name}</span>
        <span className="sm:hidden">{themeConfig.icon}</span>
        <ChevronDown className={`w-3 h-3 text-[#737871] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-neutral-900 border border-[#E5E3DC] dark:border-neutral-800 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 space-y-2">
          <div className="px-2 pt-1 pb-2 border-b border-[#E5E3DC] dark:border-neutral-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-extrabold text-[#171916] dark:text-neutral-100 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[#F97316]" />
                <span>Select Theme</span>
              </div>
              <p className="text-[10px] text-[#737871] dark:text-neutral-400">
                Instantly transforms backgrounds, borders & accents
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-orange-100 text-[#F97316] dark:bg-orange-950">
              3 Themes
            </span>
          </div>

          <div className="space-y-1.5">
            {allThemes.map((t) => {
              const isSelected = theme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTheme(t.id);
                    setIsOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#FAF9F5] dark:bg-neutral-800/90 border-[#F97316] ring-1 ring-[#F97316]/30 shadow-xs'
                      : 'border-transparent hover:border-[#E5E3DC] dark:hover:border-neutral-700 hover:bg-[#FAF9F5] dark:hover:bg-neutral-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Visual Color Palette Swatch */}
                    <div className="w-8 h-8 rounded-xl border border-black/10 dark:border-white/10 flex items-center justify-center font-bold text-xs shadow-2xs shrink-0 overflow-hidden relative"
                      style={{ backgroundColor: t.previewColors.bg }}
                    >
                      <div
                        className="w-4 h-4 rounded-full shadow-xs flex items-center justify-center text-[9px]"
                        style={{ backgroundColor: t.previewColors.accent }}
                      >
                        <span className="text-white text-[8px] font-black">✦</span>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold text-[#171916] dark:text-neutral-100 truncate">
                          {t.name}
                        </span>
                        {getThemeIcon(t.id)}
                      </div>
                      <div className="text-[10px] text-[#737871] dark:text-neutral-400 truncate">
                        {t.subtitle}
                      </div>
                    </div>
                  </div>

                  {isSelected ? (
                    <div className="w-5 h-5 rounded-full bg-[#F97316] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full border border-black/15 dark:border-white/20" style={{ backgroundColor: t.previewColors.bg }} />
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.previewColors.accent }} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Info Footer */}
          <div className="pt-2 border-t border-[#E5E3DC] dark:border-neutral-800 text-[10px] text-[#737871] dark:text-neutral-400 text-center">
            {theme === 'tron' && '⚡ Tron: Ares Mode — Cyber obsidian with neon laser crimson red glow'}
            {theme === 'azure' && '❄️ Smooth White & Blue — Clean arctic white with royal cobalt accents'}
            {theme === 'classic' && '🔥 Campfire Classic — Warm campus parchment with vibrant orange'}
          </div>
        </div>
      )}
    </div>
  );
};
