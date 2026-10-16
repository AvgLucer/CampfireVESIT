import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppTheme = 'classic' | 'tron' | 'azure';

export interface ThemeConfig {
  id: AppTheme;
  name: string;
  subtitle: string;
  tagline: string;
  accentColor: string;
  previewColors: {
    bg: string;
    card: string;
    accent: string;
    text: string;
    border: string;
  };
  icon: string;
}

export const THEMES: Record<AppTheme, ThemeConfig> = {
  classic: {
    id: 'classic',
    name: 'Campfire Classic',
    subtitle: 'Warm Campus Parchment',
    tagline: 'Warm parchment paper with energetic campfire orange accents',
    accentColor: '#F97316',
    previewColors: {
      bg: '#F7F6F2',
      card: '#FFFFFF',
      accent: '#F97316',
      text: '#171916',
      border: '#E5E3DC',
    },
    icon: '🔥',
  },
  tron: {
    id: 'tron',
    name: 'Tron: Ares',
    subtitle: 'Cyber Obsidian & Red Glow',
    tagline: 'Deep dark obsidian with laser neon crimson red highlights & cyber grid',
    accentColor: '#FF003C',
    previewColors: {
      bg: '#070507',
      card: '#12090E',
      accent: '#FF003C',
      text: '#FFFFFF',
      border: '#7F1D1D',
    },
    icon: '⚡',
  },
  azure: {
    id: 'azure',
    name: 'Smooth White & Blue',
    subtitle: 'Clean Arctic Azure',
    tagline: 'Minimalist smooth ice-white with vibrant royal cobalt blue accents',
    accentColor: '#2563EB',
    previewColors: {
      bg: '#F0F6FF',
      card: '#FFFFFF',
      accent: '#2563EB',
      text: '#0F172A',
      border: '#DBEAFE',
    },
    icon: '❄️',
  },
};

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  cycleTheme: () => void;
  themeConfig: ThemeConfig;
  allThemes: ThemeConfig[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'campfire_app_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as AppTheme;
      if (saved && (saved === 'classic' || saved === 'tron' || saved === 'azure')) {
        return saved;
      }
    } catch {
      // Fallback
    }
    return 'classic';
  });

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // Ignore
    }
  };

  const cycleTheme = () => {
    if (theme === 'classic') setTheme('tron');
    else if (theme === 'tron') setTheme('azure');
    else setTheme('classic');
  };

  // Synchronize DOM attributes whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);

    if (theme === 'tron') {
      root.classList.add('dark');
      root.classList.remove('theme-azure', 'theme-classic');
      root.classList.add('theme-tron');
    } else if (theme === 'azure') {
      root.classList.remove('dark');
      root.classList.remove('theme-tron', 'theme-classic');
      root.classList.add('theme-azure');
    } else {
      root.classList.remove('dark');
      root.classList.remove('theme-tron', 'theme-azure');
      root.classList.add('theme-classic');
    }
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    setTheme,
    cycleTheme,
    themeConfig: THEMES[theme],
    allThemes: Object.values(THEMES),
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
