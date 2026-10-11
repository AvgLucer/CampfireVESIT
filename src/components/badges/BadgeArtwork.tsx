import React from 'react';
import { BadgeDefinition, BadgeRarity } from '../../types/ember';
import { RARITY_DETAILS } from '../../data/badgeCatalogue';

interface BadgeArtworkProps {
  badge: BadgeDefinition;
  size?: '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLocked?: boolean;
  className?: string;
  showRarityGlow?: boolean;
}

// Bespoke SVG Artworks for all 75 unique badges matching prompt concepts
const renderBadgeIcon = (id: string, rarity: BadgeRarity, isLocked: boolean) => {
  const strokeColor = isLocked ? '#64748B' : 'currentColor';
  const fillColor = isLocked ? '#475569' : 'currentColor';

  switch (id) {
    // ==========================================
    // COMMON (C01 - C25)
    // ==========================================
    case 'C01': // First Spark: tiny ember with one glowing particle
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 4c-1.5 2.5-3.5 4.5-3.5 7.5a3.5 3.5 0 0 0 7 0C15.5 8.5 13.5 6.5 12 4z" fill={fillColor} fillOpacity="0.3" />
          <path d="M12 9a1.5 1.5 0 0 0-1.5 1.5c0 1 .5 1.5 1.5 1.5s1.5-.5 1.5-1.5A1.5 1.5 0 0 0 12 9z" fill={fillColor} />
          <circle cx="18" cy="6" r="1.5" fill={fillColor} />
        </svg>
      );
    case 'C02': // Fresh Arrival: minimalist campus entrance
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18M5 21V7l7-4 7 4v14" />
          <path d="M9 21v-7a3 3 0 0 1 6 0v7" fill={fillColor} fillOpacity="0.2" />
          <line x1="12" y1="3" x2="12" y2="7" />
        </svg>
      );
    case 'C03': // Notebook Buddy: open notebook with small flame
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
          <path d="M12 7c-.8 1.2-1.5 2.2-1.5 3.5a1.5 1.5 0 0 0 3 0C13.5 9.2 12.8 8.2 12 7z" fill={fillColor} />
          <line x1="8" y1="15" x2="16" y2="15" />
          <line x1="8" y1="18" x2="14" y2="18" />
        </svg>
      );
    case 'C04': // Coffee Break: steaming coffee cup
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" fill={fillColor} fillOpacity="0.2" />
          <line x1="6" y1="2" x2="6" y2="5" />
          <line x1="10" y1="2" x2="10" y2="5" />
          <line x1="14" y1="2" x2="14" y2="5" />
        </svg>
      );
    case 'C05': // Early Bird: sunrise over campus roof
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 18l10-6 10 6v3H2v-3z" fill={fillColor} fillOpacity="0.2" />
          <path d="M8 12a4 4 0 0 1 8 0" strokeWidth="2" />
          <line x1="12" y1="4" x2="12" y2="7" />
          <line x1="6.5" y1="6.5" x2="8.5" y2="8.5" />
          <line x1="17.5" y1="6.5" x2="15.5" y2="8.5" />
        </svg>
      );
    case 'C06': // Night Owl: crescent moon and tiny star
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8A9 9 0 0 0 12 3z" fill={fillColor} fillOpacity="0.2" />
          <polygon points="19 3 20 5 22 6 20 7 19 9 18 7 16 6 18 5 19 3" fill={fillColor} />
        </svg>
      );
    case 'C07': // First Steps: two footprints with glowing trail
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="8" cy="15" rx="2.5" ry="4" transform="rotate(-15 8 15)" fill={fillColor} fillOpacity="0.3" />
          <ellipse cx="16" cy="9" rx="2.5" ry="4" transform="rotate(15 16 9)" fill={fillColor} fillOpacity="0.3" />
          <circle cx="7" cy="9" r="1" fill={fillColor} />
          <circle cx="9" cy="8" r="1" fill={fillColor} />
          <circle cx="15" cy="3" r="1" fill={fillColor} />
          <circle cx="17" cy="4" r="1" fill={fillColor} />
        </svg>
      );
    case 'C08': // Curious Mind: question mark inside a lightbulb
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18h6M10 22h4" />
          <path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4.5 3 6h8c1.5-1.5 3-3.5 3-6a7 7 0 0 0-7-7z" fill={fillColor} fillOpacity="0.2" />
          <path d="M10.5 7.5a1.5 1.5 0 0 1 2.5 1c0 1-1.5 1.2-1.5 2.5" strokeWidth="2" />
          <circle cx="11.5" cy="13.5" r=".75" fill={fillColor} />
        </svg>
      );
    case 'C09': // Pixel Pal: smiling pixel-art cube
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="2" fill={fillColor} fillOpacity="0.2" />
          <rect x="7" y="8" width="2" height="2" fill={fillColor} />
          <rect x="15" y="8" width="2" height="2" fill={fillColor} />
          <path d="M8 14h8v2H8z" fill={fillColor} />
        </svg>
      );
    case 'C10': // Code Rookie: angle brackets surrounding spark
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="7 8 3 12 7 16" />
          <polyline points="17 8 21 12 17 16" />
          <polygon points="12 6 13.5 10.5 18 12 13.5 13.5 12 18 10.5 13.5 6 12 10.5 10.5 12 6" fill={fillColor} />
        </svg>
      );
    case 'C11': // Library Regular: small stack of books
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="16" width="16" height="5" rx="1" fill={fillColor} fillOpacity="0.3" />
          <rect x="5" y="10" width="14" height="5" rx="1" fill={fillColor} fillOpacity="0.2" />
          <rect x="7" y="4" width="10" height="5" rx="1" fill={fillColor} fillOpacity="0.4" />
          <line x1="7" y1="18.5" x2="10" y2="18.5" />
          <line x1="8" y1="12.5" x2="11" y2="12.5" />
        </svg>
      );
    case 'C12': // Campus Explorer: folded map with location pin
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" fill={fillColor} fillOpacity="0.2" />
          <line x1="9" y1="3" x2="9" y2="18" />
          <line x1="15" y1="6" x2="15" y2="21" />
          <path d="M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill={fillColor} />
        </svg>
      );
    case 'C13': // Team Player: three connected geometric figures
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="7" r="3" fill={fillColor} fillOpacity="0.3" />
          <circle cx="6" cy="17" r="3" fill={fillColor} fillOpacity="0.3" />
          <circle cx="18" cy="17" r="3" fill={fillColor} fillOpacity="0.3" />
          <line x1="12" y1="10" x2="6" y2="14" />
          <line x1="12" y1="10" x2="18" y2="14" />
          <line x1="9" y1="17" x2="15" y2="17" />
        </svg>
      );
    case 'C14': // Note Taker: pencil over a checklist
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="13" height="17" rx="2" fill={fillColor} fillOpacity="0.2" />
          <polyline points="6 9 8 11 12 7" />
          <line x1="6" y1="15" x2="12" y2="15" />
          <path d="M18 4l3 3-8 8-3.5.5.5-3.5 8-8z" fill={fillColor} />
        </svg>
      );
    case 'C15': // Little Helper: two hands holding a heart
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 7c-2-2.5-5-.5-5 2 0 2.5 5 6 5 6s5-3.5 5-6c0-2.5-3-4.5-5-2z" fill={fillColor} />
          <path d="M4 17c2-1 5 0 8 2M20 17c-2-1-5 0-8 2" />
        </svg>
      );
    case 'C16': // Study Starter: open book with progress ring
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 5a4 4 0 0 1 4-3h4v16H6a4 4 0 0 0-4 3V5z" fill={fillColor} fillOpacity="0.2" />
          <path d="M22 5a4 4 0 0 0-4-3h-4v16h4a4 4 0 0 1 4 3V5z" fill={fillColor} fillOpacity="0.2" />
          <circle cx="12" cy="7" r="3.5" strokeDasharray="14 7" strokeWidth="1.8" />
        </svg>
      );
    case 'C17': // First Challenge: small flag on a finish line
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 21V4" />
          <path d="M5 4h12l-3 4 3 4H5" fill={fillColor} fillOpacity="0.3" />
          <line x1="2" y1="21" x2="22" y2="21" strokeDasharray="3 3" />
        </svg>
      );
    case 'C18': // Green Thumb: leaf emerging from a pot
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 14h12l-1.5 7h-9L6 14z" fill={fillColor} fillOpacity="0.2" />
          <path d="M12 14V8c0-3 3-5 5-5 0 3-2 5-5 5" fill={fillColor} />
          <path d="M12 11c-2-1-4-1-4-3 2 0 3 1 4 3" />
        </svg>
      );
    case 'C19': // Cloud Watcher: cloud with tiny sun
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="16" cy="7" r="3" fill={fillColor} />
          <path d="M5 19a4 4 0 0 1-1-7.87 5 5 0 0 1 9.8-1.5A3.5 3.5 0 0 1 19 19H5z" fill={fillColor} fillOpacity="0.3" />
        </svg>
      );
    case 'C20': // Music Break: headphones with sound wave
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 14h3v6H3a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2zM18 14h3a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-3v-6z" fill={fillColor} fillOpacity="0.3" />
          <path d="M3 14v-3a9 9 0 0 1 18 0v3" />
          <line x1="9" y1="13" x2="9" y2="17" />
          <line x1="12" y1="11" x2="12" y2="19" />
          <line x1="15" y1="13" x2="15" y2="17" />
        </svg>
      );
    case 'C21': // Snack Scout: stylized snack box
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="8" width="16" height="12" rx="2" fill={fillColor} fillOpacity="0.2" />
          <path d="M4 8l8-4 8 4" />
          <circle cx="12" cy="14" r="2" fill={fillColor} />
        </svg>
      );
    case 'C22': // Train Tracker: minimal commuter train
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="3" width="14" height="15" rx="3" fill={fillColor} fillOpacity="0.2" />
          <line x1="5" y1="10" x2="19" y2="10" />
          <circle cx="8.5" cy="14.5" r="1.5" fill={fillColor} />
          <circle cx="15.5" cy="14.5" r="1.5" fill={fillColor} />
          <path d="M4 21l3-3M20 21l-3-3" />
        </svg>
      );
    case 'C23': // Good Vibes: smiling sun
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" fill={fillColor} fillOpacity="0.3" />
          <path d="M10 12.5a2 2 0 0 0 4 0" />
          <line x1="12" y1="2" x2="12" y2="4" />
          <line x1="12" y1="20" x2="12" y2="22" />
          <line x1="2" y1="12" x2="4" y2="12" />
          <line x1="20" y1="12" x2="22" y2="12" />
        </svg>
      );
    case 'C24': // Bookmark: ribbon bookmark with spark
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" fill={fillColor} fillOpacity="0.2" />
          <polygon points="12 8 13 10 15 11 13 12 12 14 11 12 9 11 11 10 12 8" fill={fillColor} />
        </svg>
      );
    case 'C25': // Warm Welcome: two small flames forming a heart
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill={fillColor} fillOpacity="0.2" />
          <path d="M9.5 9c0 2 2.5 4 2.5 4s2.5-2 2.5-4c0-1.5-1-2.5-2.5-4C10.5 6.5 9.5 7.5 9.5 9z" fill={fillColor} />
        </svg>
      );

    // ==========================================
    // RARE (R01 - R20) - Electric Blue Accents
    // ==========================================
    case 'R01': // Code Voyager: code window with compass
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="18" rx="2" fill={fillColor} fillOpacity="0.15" />
          <line x1="2" y1="8" x2="22" y2="8" />
          <circle cx="12" cy="14" r="4" fill={fillColor} fillOpacity="0.2" />
          <polygon points="12 11 13.5 14 12 17 10.5 14" fill={fillColor} />
        </svg>
      );
    case 'R02': // Midnight Compiler: terminal beneath crescent moon
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="7" width="18" height="14" rx="2" fill={fillColor} fillOpacity="0.2" />
          <polyline points="6 12 9 14 6 16" />
          <line x1="11" y1="16" x2="15" y2="16" />
          <path d="M18 2a3 3 0 1 0 3 3c0-.3-.05-.5-.1-.7a2 2 0 0 1-2.2-2.2c-.2-.05-.4-.1-.7-.1z" fill={fillColor} />
        </svg>
      );
    case 'R03': // Knowledge Keeper: glowing book inside a shield
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill={fillColor} fillOpacity="0.15" />
          <path d="M7 10a2.5 2.5 0 0 1 2.5-2H12v6H9.5A2.5 2.5 0 0 0 7 16.5V10z" fill={fillColor} />
          <path d="M17 10a2.5 2.5 0 0 0-2.5-2H12v6h2.5a2.5 2.5 0 0 1 2.5 2.5V10z" fill={fillColor} />
        </svg>
      );
    case 'R04': // Social Catalyst: connected nodes surrounding spark
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="5" cy="5" r="2.5" fill={fillColor} />
          <circle cx="19" cy="5" r="2.5" fill={fillColor} />
          <circle cx="5" cy="19" r="2.5" fill={fillColor} />
          <circle cx="19" cy="19" r="2.5" fill={fillColor} />
          <line x1="7" y1="6" x2="17" y2="6" strokeDasharray="2 2" />
          <line x1="7" y1="18" x2="17" y2="18" strokeDasharray="2 2" />
          <polygon points="12 8 13.5 11 16 12 13.5 13 12 16 10.5 13 8 12 10.5 11" fill={fillColor} />
        </svg>
      );
    case 'R05': // Campus Navigator: compass over a campus map
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" fill={fillColor} fillOpacity="0.15" />
          <polygon points="12 5 14.5 12 12 19 9.5 12" fill={fillColor} />
          <line x1="5" y1="12" x2="19" y2="12" strokeDasharray="1 2" />
        </svg>
      );
    case 'R06': // Deadline Dodger: clock passing through finish gate
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="10" cy="12" r="6" fill={fillColor} fillOpacity="0.2" />
          <polyline points="10 9 10 12 12 13" />
          <line x1="18" y1="4" x2="18" y2="20" strokeWidth="3" />
          <polyline points="13 7 18 12 13 17" />
        </svg>
      );
    case 'R07': // Debug Detective: magnifying glass over bug
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="10" cy="10" r="6" fill={fillColor} fillOpacity="0.2" />
          <line x1="14.5" y1="14.5" x2="20" y2="20" strokeWidth="2.5" />
          <ellipse cx="10" cy="10" rx="2" ry="3" fill={fillColor} />
          <line x1="7" y1="9" x2="13" y2="9" />
          <line x1="7" y1="11" x2="13" y2="11" />
        </svg>
      );
    case 'R08': // Quiz Conqueror: star-shaped quiz trophy
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3M18 9h3a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-3" />
          <path d="M6 3h12v7a6 6 0 0 1-12 0V3z" fill={fillColor} fillOpacity="0.2" />
          <polygon points="12 5 13 7 15 7.5 13.5 9 14 11 12 10 10 11 10.5 9 9 7.5 11 7" fill={fillColor} />
          <path d="M12 16v3M8 21h8" />
        </svg>
      );
    case 'R09': // Ride Connector: two location pins connected by route
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="7" r="3" fill={fillColor} />
          <circle cx="18" cy="17" r="3" fill={fillColor} />
          <path d="M6 10c0 5 12 2 12 7" strokeDasharray="3 3" strokeWidth="2" />
          <line x1="6" y1="10" x2="6" y2="12" />
          <line x1="18" y1="14" x2="18" y2="17" />
        </svg>
      );
    case 'R10': // Streak Starter: small flame with circular trail
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 7c-1.5 2-2.5 3.5-2.5 5.5a2.5 2.5 0 0 0 5 0C14.5 10.5 13.5 9 12 7z" fill={fillColor} />
          <path d="M21 12a9 9 0 1 1-6.2-8.5" strokeDasharray="4 2" strokeWidth="2" />
        </svg>
      );
    case 'R11': // Pixel Perfectionist: precisely aligned pixel grid
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="1" strokeDasharray="2 2" />
          <rect x="6" y="6" width="3" height="3" fill={fillColor} />
          <rect x="15" y="6" width="3" height="3" fill={fillColor} />
          <rect x="10.5" y="10.5" width="3" height="3" fill={fillColor} />
          <rect x="6" y="15" width="3" height="3" fill={fillColor} />
          <rect x="15" y="15" width="3" height="3" fill={fillColor} />
        </svg>
      );
    case 'R12': // Night Shift: glowing laptop under stars
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="9" width="16" height="10" rx="1" fill={fillColor} fillOpacity="0.25" />
          <path d="M2 20h20" strokeWidth="2.5" />
          <circle cx="6" cy="4" r="1" fill={fillColor} />
          <circle cx="12" cy="3" r="1.5" fill={fillColor} />
          <circle cx="19" cy="5" r="1" fill={fillColor} />
        </svg>
      );
    case 'R13': // Helpful Hand: hand holding a glowing orb
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="7" r="4" fill={fillColor} />
          <path d="M18 14a4 4 0 0 0-4-2h-4a4 4 0 0 0-4 2v4a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-4z" fill={fillColor} fillOpacity="0.2" />
        </svg>
      );
    case 'R14': // Event Hopper: ticket surrounded by confetti
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8z" fill={fillColor} fillOpacity="0.2" />
          <line x1="9" y1="8" x2="9" y2="16" strokeDasharray="2 2" />
          <circle cx="3" cy="4" r="1" fill={fillColor} />
          <circle cx="21" cy="4" r="1" fill={fillColor} />
          <circle cx="2" cy="19" r="1" fill={fillColor} />
          <circle cx="22" cy="19" r="1" fill={fillColor} />
        </svg>
      );
    case 'R15': // Idea Machine: gear surrounding a lightbulb
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="8" strokeDasharray="3 3" strokeWidth="2" />
          <path d="M9 16h6M10 19h4" />
          <path d="M12 5a4.5 4.5 0 0 0-3 7.8V14h6v-1.2A4.5 4.5 0 0 0 12 5z" fill={fillColor} fillOpacity="0.3" />
        </svg>
      );
    case 'R16': // Data Diver: stylized database with a blue wave
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="5" rx="8" ry="3" fill={fillColor} fillOpacity="0.3" />
          <path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
          <path d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
          <path d="M2 19c3-1 5 1 8 0s5-1 8 0" strokeWidth="2.5" />
        </svg>
      );
    case 'R17': // Problem Solver: maze leading to a bright center
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" fill={fillColor} fillOpacity="0.1" />
          <path d="M7 3v6h10V7" />
          <path d="M3 13h14v4H7" />
          <circle cx="12" cy="12" r="2" fill={fillColor} />
        </svg>
      );
    case 'R18': // Squad Builder: four connected geometric avatars
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="5" height="5" rx="1" fill={fillColor} />
          <rect x="15" y="4" width="5" height="5" rx="1" fill={fillColor} />
          <rect x="4" y="15" width="5" height="5" rx="1" fill={fillColor} />
          <rect x="15" y="15" width="5" height="5" rx="1" fill={fillColor} />
          <line x1="9" y1="6.5" x2="15" y2="6.5" />
          <line x1="6.5" y1="9" x2="6.5" y2="15" />
          <line x1="17.5" y1="9" x2="17.5" y2="15" />
          <line x1="9" y1="17.5" x2="15" y2="17.5" />
        </svg>
      );
    case 'R19': // Map Whisperer: map with a luminous destination
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" fill={fillColor} fillOpacity="0.2" />
          <circle cx="12" cy="12" r="3" fill={fillColor} />
          <line x1="12" y1="8" x2="12" y2="6" strokeWidth="2" />
          <line x1="12" y1="16" x2="12" y2="18" strokeWidth="2" />
        </svg>
      );
    case 'R20': // Blue Flame: distinctive blue flame crystal
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 17 9 14 22 10 22 7 9" fill={fillColor} fillOpacity="0.3" />
          <polygon points="12 5 15 10 13 18 11 18 9 10" fill={fillColor} />
        </svg>
      );

    // ==========================================
    // LEGENDARY (L01 - L15) - Amber Gold Metallics
    // ==========================================
    case 'L01': // Golden Compiler: gold terminal with radiant spark
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="3" fill={fillColor} fillOpacity="0.2" />
          <polyline points="6 10 9 12 6 14" strokeWidth="2.5" />
          <polygon points="15 8 16.5 11 19 12 16.5 13 15 16 13.5 13 11 12 13.5 11" fill={fillColor} />
        </svg>
      );
    case 'L02': // Code Architect: golden geometric software blueprint
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7" fill={fillColor} fillOpacity="0.4" />
          <polyline points="2 12 12 17 22 12" />
          <polyline points="2 17 12 22 22 17" />
        </svg>
      );
    case 'L03': // Academic Ace: laurel surrounding a graduation cap
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 5 2 9 12 13 22 9" fill={fillColor} fillOpacity="0.3" />
          <path d="M6 11v5c0 2 3 3 6 3s6-1 6-3v-5" />
          <path d="M3 13c1 4 4 7 9 7s8-3 9-7" strokeDasharray="2 3" strokeWidth="2.5" />
        </svg>
      );
    case 'L04': // Campus Champion: gold trophy above campus silhouette
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 4h12v6a6 6 0 0 1-12 0V4z" fill={fillColor} fillOpacity="0.3" />
          <path d="M6 6H3a2 2 0 0 0-2 2v1a3 3 0 0 0 3 3h2M18 6h3a2 2 0 0 1 2 2v1a3 3 0 0 1-3 3h-2" />
          <line x1="12" y1="16" x2="12" y2="19" strokeWidth="3" />
          <path d="M3 21h18" strokeWidth="2.5" />
        </svg>
      );
    case 'L05': // Challenge Master: polished challenge emblem
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15 8 22 9 17 14 18 21 12 17 6 21 7 14 2 9 9 8" fill={fillColor} fillOpacity="0.35" />
          <circle cx="12" cy="12" r="3" fill={fillColor} />
        </svg>
      );
    case 'L06': // Streak Sovereign: crown above uninterrupted flame
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="5 8 7 3 12 6 17 3 19 8" fill={fillColor} fillOpacity="0.4" />
          <path d="M12 9c-2 3-3.5 5-3.5 8a3.5 3.5 0 0 0 7 0C15.5 14 14 12 12 9z" fill={fillColor} />
        </svg>
      );
    case 'L07': // Knowledge Alchemist: golden flask filled with light
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 2h4v5l5 11a2 2 0 0 1-2 3H7a2 2 0 0 1-2-3l5-11V2z" fill={fillColor} fillOpacity="0.2" />
          <polygon points="12 12 13 14 15 14.5 13.5 16 14 18 12 17 10 18 10.5 16 9 14.5 11 14" fill={fillColor} />
        </svg>
      );
    case 'L08': // The Pathfinder: compass with gold central star
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9.5" strokeWidth="2" />
          <polygon points="12 4 14 10 20 12 14 14 12 20 10 14 4 12 10 10" fill={fillColor} fillOpacity="0.4" />
          <circle cx="12" cy="12" r="2" fill={fillColor} />
        </svg>
      );
    case 'L09': // Collaboration Crown: three gold figures forming a crown
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="10" r="2" fill={fillColor} />
          <circle cx="12" cy="7" r="2.5" fill={fillColor} />
          <circle cx="18" cy="10" r="2" fill={fillColor} />
          <path d="M3 19l3-6 6 3 6-3 3 6H3z" fill={fillColor} fillOpacity="0.3" />
        </svg>
      );
    case 'L10': // Logic Legend: golden maze with central diamond
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="3" strokeWidth="2" />
          <rect x="5" y="5" width="14" height="14" rx="2" strokeDasharray="3 3" />
          <polygon points="12 8 16 12 12 16 8 12" fill={fillColor} />
        </svg>
      );
    case 'L11': // Data Monarch: gold database inside royal crest
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l7 3v7c0 5-7 9-7 9s-7-4-7-9V5l7-3z" fill={fillColor} fillOpacity="0.15" />
          <ellipse cx="12" cy="8" rx="4" ry="1.5" fill={fillColor} />
          <path d="M8 8v3c0 1 1.8 1.5 4 1.5s4-.5 4-1.5V8" />
          <path d="M8 11v3c0 1 1.8 1.5 4 1.5s4-.5 4-1.5v-3" />
        </svg>
      );
    case 'L12': // Ember Guardian: golden flame protected by shield
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="2.2" />
          <path d="M12 7c-1.8 2.5-3 4-3 6.5a3 3 0 0 0 6 0C15 11 13.8 9.5 12 7z" fill={fillColor} />
        </svg>
      );
    case 'L13': // Perfect Sequence: symmetrical chain of glowing nodes
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="4" cy="12" r="2" fill={fillColor} />
          <circle cx="8" cy="8" r="2.5" fill={fillColor} />
          <circle cx="12" cy="12" r="3" fill={fillColor} />
          <circle cx="16" cy="16" r="2.5" fill={fillColor} />
          <circle cx="20" cy="12" r="2" fill={fillColor} />
          <path d="M4 12l4-4 4 4 4 4 4-4" strokeWidth="2" />
        </svg>
      );
    case 'L14': // Golden Hour: radiant golden sunset
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 16a8 8 0 0 1 16 0H4z" fill={fillColor} fillOpacity="0.4" />
          <line x1="12" y1="2" x2="12" y2="5" strokeWidth="2.5" />
          <line x1="5" y1="5" x2="7.5" y2="7.5" strokeWidth="2.5" />
          <line x1="19" y1="5" x2="16.5" y2="7.5" strokeWidth="2.5" />
          <line x1="2" y1="19" x2="22" y2="19" strokeWidth="2.5" />
        </svg>
      );
    case 'L15': // Crown of Code: crown constructed from code symbols
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="3 8 7 4 12 7 17 4 21 8 20 18 4 18" fill={fillColor} fillOpacity="0.25" />
          <polyline points="7 12 5.5 13.5 7 15" strokeWidth="2" />
          <polyline points="17 12 18.5 13.5 17 15" strokeWidth="2" />
          <line x1="11" y1="16" x2="13" y2="11" strokeWidth="2" />
        </svg>
      );

    // ==========================================
    // MYTHICAL (M01 - M10) - Violet Magical Particles
    // ==========================================
    case 'M01': // Astral Flame: purple flame surrounded by orbiting stars
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(-30 12 12)" strokeDasharray="3 3" />
          <path d="M12 5c-2.5 3.5-4 5.5-4 9a4 4 0 0 0 8 0c0-3.5-1.5-5.5-4-9z" fill={fillColor} fillOpacity="0.4" />
          <circle cx="5" cy="8" r="1.5" fill={fillColor} />
          <circle cx="19" cy="16" r="1.5" fill={fillColor} />
        </svg>
      );
    case 'M02': // Void Scholar: open book floating in cosmic ring
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" strokeWidth="1.5" strokeDasharray="6 4" />
          <path d="M5 9c2-1 4-1 7 0v7c-3-1-5-1-7 0V9z" fill={fillColor} />
          <path d="M19 9c-2-1-4-1-7 0v7c3-1 5-1 7 0V9z" fill={fillColor} />
        </svg>
      );
    case 'M03': // Nebula Navigator: compass suspended in a nebula
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" fill={fillColor} fillOpacity="0.15" />
          <polygon points="12 3 15 12 12 21 9 12" fill={fillColor} />
          <circle cx="12" cy="12" r="3" fill="#000" />
          <circle cx="12" cy="12" r="1.5" fill={fillColor} />
        </svg>
      );
    case 'M04': // Quantum Thinker: glowing orbital atom
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(30 12 12)" />
          <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(-30 12 12)" />
          <circle cx="12" cy="12" r="3" fill={fillColor} />
        </svg>
      );
    case 'M05': // Celestial Architect: crystalline architectural structure in space
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 20 8 16 20 8 20 4 8" fill={fillColor} fillOpacity="0.25" />
          <line x1="12" y1="2" x2="12" y2="20" />
          <line x1="4" y1="8" x2="20" y2="8" />
          <line x1="12" y1="12" x2="16" y2="20" />
          <line x1="12" y1="12" x2="8" y2="20" />
        </svg>
      );
    case 'M06': // Phantom Compiler: spectral terminal with violet code
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10c0 3-4 6-8 6s-8-3-8-6V5z" fill={fillColor} fillOpacity="0.2" />
          <polyline points="7 9 10 11 7 13" strokeWidth="2.5" />
          <line x1="12" y1="13" x2="16" y2="13" strokeWidth="2.5" />
        </svg>
      );
    case 'M07': // Eclipse Crown: crown surrounding a dark eclipse
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="13" r="5" fill="#171916" stroke={strokeColor} strokeWidth="2" />
          <path d="M4 9l4 2 4-6 4 6 4-2v6H4V9z" fill={fillColor} fillOpacity="0.3" />
        </svg>
      );
    case 'M08': // Dreamweaver: interconnected purple stars forming web
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15 9 22 12 15 15 12 22 9 15 2 12 9 9" fill={fillColor} fillOpacity="0.25" />
          <circle cx="12" cy="12" r="3" fill={fillColor} />
          <circle cx="6" cy="6" r="1.5" fill={fillColor} />
          <circle cx="18" cy="6" r="1.5" fill={fillColor} />
          <circle cx="6" cy="18" r="1.5" fill={fillColor} />
          <circle cx="18" cy="18" r="1.5" fill={fillColor} />
        </svg>
      );
    case 'M09': // Arcane Algorithm: luminous geometric algorithmic seal
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
          <polygon points="12 3 19.8 16.5 4.2 16.5" fill={fillColor} fillOpacity="0.2" />
          <polygon points="12 21 4.2 7.5 19.8 7.5" fill={fillColor} fillOpacity="0.2" />
          <circle cx="12" cy="12" r="2" fill={fillColor} />
        </svg>
      );
    case 'M10': // Mythic Ember: crystalline violet flame with halo
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="7" rx="6" ry="2" strokeWidth="1.5" />
          <polygon points="12 5 16 11 14 20 10 20 8 11" fill={fillColor} fillOpacity="0.4" />
          <polygon points="12 8 14 12 13 17 11 17 10 12" fill={fillColor} />
        </svg>
      );

    // ==========================================
    // UNREAL (U01 - U05) - Crimson Singularity & Pink Aura
    // ==========================================
    case 'U01': // Reality Breaker: fractured crimson diamond splitting reality grid
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {/* Fractured Reality Grid background */}
          <line x1="2" y1="6" x2="22" y2="6" strokeDasharray="2 3" strokeOpacity="0.4" />
          <line x1="2" y1="18" x2="22" y2="18" strokeDasharray="2 3" strokeOpacity="0.4" />
          <line x1="6" y1="2" x2="6" y2="22" strokeDasharray="2 3" strokeOpacity="0.4" />
          <line x1="18" y1="2" x2="18" y2="22" strokeDasharray="2 3" strokeOpacity="0.4" />
          {/* Main fractured diamond */}
          <polygon points="12 2 20 12 12 22 4 12" fill={fillColor} fillOpacity="0.3" strokeWidth="2.5" />
          {/* Internal crystalline cleavage fracture lines */}
          <path d="M12 2L9 11L15 13L12 22" stroke="#FFF" strokeWidth="2" />
          <circle cx="12" cy="12" r="2" fill="#FFF" />
        </svg>
      );
    case 'U02': // Zero Probability: dark orb with razor-bright pink singularity
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9.5" fill="#0A0A0C" stroke={strokeColor} strokeWidth="2.2" />
          {/* Razor rays */}
          <line x1="12" y1="2" x2="12" y2="22" stroke="#FDA4AF" strokeWidth="1.8" />
          <line x1="2" y1="12" x2="22" y2="12" stroke="#FDA4AF" strokeWidth="1.8" />
          {/* Blinding singularity core */}
          <polygon points="12 8 13.5 11 16 12 13.5 13 12 16 10.5 13 8 12 10.5 11" fill="#FFF" />
          <circle cx="12" cy="12" r="2" fill="#F43F5E" />
        </svg>
      );
    case 'U03': // Eternal Singularity: black hole with crimson energy accretion disk
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {/* Warped accretion disk */}
          <ellipse cx="12" cy="12" rx="10" ry="3.5" transform="rotate(-20 12 12)" stroke={strokeColor} strokeWidth="3" />
          <circle cx="12" cy="12" r="5" fill="#050507" />
          <ellipse cx="12" cy="12" rx="4.5" ry="4.5" stroke="#FDA4AF" strokeWidth="1" strokeDasharray="3 2" />
        </svg>
      );
    case 'U04': // Beyond Existence: abstract dimensional portal with layered geometry
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 21 8 21 16 12 22 3 16 3 8" strokeWidth="2" fill={fillColor} fillOpacity="0.2" />
          <polygon points="12 6 18 10 18 14 12 18 6 14 6 10" strokeWidth="1.5" />
          <polygon points="12 9 15 11 15 13 12 15 9 13 9 11" fill={fillColor} />
          <circle cx="12" cy="12" r="1.5" fill="#FFF" />
        </svg>
      );
    case 'U05': // The Last Flame: monumental crimson flame encased in obsidian crown
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {/* Obsidian Crown Base */}
          <path d="M4 17l4-2 4 3 4-3 4 2v4H4v-4z" fill="#0F172A" stroke={strokeColor} strokeWidth="2" />
          {/* Monumental primordial crimson flame */}
          <path
            d="M12 2C9.5 5 7 8 7 13a5 5 0 0 0 10 0c0-5-2.5-8-5-11z"
            fill={fillColor}
            fillOpacity="0.4"
            strokeWidth="2"
          />
          <path d="M12 6c-1.5 2-3 4-3 7a3 3 0 0 0 6 0c0-3-1.5-5-3-7z" fill="#FFF" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-current" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="3" fill={fillColor} />
        </svg>
      );
  }
};

export const BadgeArtwork: React.FC<BadgeArtworkProps> = ({
  badge,
  size = 'md',
  isLocked = false,
  className = '',
  showRarityGlow = true,
}) => {
  const { id, rarity } = badge;
  const config = RARITY_DETAILS[rarity];

  const sizeClasses = {
    '2xs': 'w-3 h-3 p-0 rounded text-[8px]',
    xs: 'w-4 h-4 p-0.5 rounded text-[9px]',
    sm: 'w-6 h-6 p-1 rounded-md text-xs',
    md: 'w-10 h-10 p-1.5 rounded-xl text-sm',
    lg: 'w-14 h-14 p-2 rounded-2xl text-base',
    xl: 'w-20 h-20 p-2.5 rounded-3xl text-xl',
  }[size];

  // Specific rarity styling
  const rarityBorderClasses = {
    Common: 'border-slate-300 dark:border-slate-600',
    Rare: 'border-blue-500 shadow-sm shadow-blue-500/25',
    Legendary: 'border-amber-400 shadow-md shadow-amber-500/30',
    Mythical: 'border-purple-500 shadow-lg shadow-purple-500/35 ring-1 ring-purple-400/40',
    Unreal: 'border-rose-500 shadow-xl shadow-rose-500/50 ring-2 ring-rose-400/60 animate-pulse',
  }[rarity];

  const rarityBgClasses = {
    Common: 'bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900',
    Rare: 'bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-950/60 dark:to-slate-900',
    Legendary: 'bg-gradient-to-b from-amber-50 to-amber-100 dark:from-amber-950/60 dark:to-slate-900',
    Mythical: 'bg-gradient-to-b from-purple-50 to-purple-100 dark:from-purple-950/70 dark:to-slate-900',
    Unreal: 'bg-gradient-to-b from-rose-950/80 via-neutral-900 to-neutral-950 text-rose-400',
  }[rarity];

  const rarityTextColor = {
    Common: 'text-slate-600 dark:text-slate-300',
    Rare: 'text-blue-600 dark:text-blue-400',
    Legendary: 'text-amber-600 dark:text-amber-400',
    Mythical: 'text-purple-600 dark:text-purple-400',
    Unreal: 'text-rose-500 dark:text-rose-400',
  }[rarity];

  if (isLocked) {
    return (
      <div
        className={`relative flex items-center justify-center shrink-0 border border-neutral-300/60 dark:border-neutral-700 bg-neutral-100/80 dark:bg-neutral-800/80 text-neutral-400 opacity-60 backdrop-blur-xs select-none transition-transform ${sizeClasses} ${className}`}
        title={`Locked: ${badge.name} (${badge.rarity})`}
      >
        <div className="w-full h-full flex items-center justify-center filter grayscale contrast-50 opacity-40">
          {renderBadgeIcon(id, rarity, true)}
        </div>
        {/* Subtle lock symbol overlaid */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="w-3.5 h-3.5 text-neutral-500/80 drop-shadow-xs"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor" fillOpacity="0.2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 border-2 transition-all duration-300 ${sizeClasses} ${rarityBorderClasses} ${rarityBgClasses} ${rarityTextColor} ${className}`}
      style={showRarityGlow ? { borderColor: config.color } : {}}
    >
      {/* Background ambient shimmer for Unreal & Mythical */}
      {rarity === 'Unreal' && (
        <div className="absolute inset-0 rounded-inherit bg-gradient-to-tr from-rose-500/20 via-pink-500/10 to-transparent pointer-events-none" />
      )}
      {rarity === 'Mythical' && (
        <div className="absolute inset-0 rounded-inherit bg-purple-500/10 pointer-events-none" />
      )}

      {/* SVG Icon Artwork */}
      <div className="relative z-1 w-full h-full flex items-center justify-center drop-shadow-xs">
        {renderBadgeIcon(id, rarity, false)}
      </div>
    </div>
  );
};
