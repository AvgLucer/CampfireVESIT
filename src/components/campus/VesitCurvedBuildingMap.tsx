import React, { useState } from 'react';
import { CampusLocation } from '../../types';
import {
  Compass,
  Layers,
  MapPin,
  Sparkles,
  Navigation,
  BookOpen,
  Mic,
  Award,
  Utensils,
  FileText,
  Printer,
  ChevronRight,
  Info,
} from 'lucide-react';
import { getOrientationCue } from '../../pages/CampusGuidePage';

interface VesitCurvedBuildingMapProps {
  locations: CampusLocation[];
  selectedLocation: CampusLocation;
  onSelectLocation: (loc: CampusLocation) => void;
}

export const VesitCurvedBuildingMap: React.FC<VesitCurvedBuildingMapProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
}) => {
  const [activeFloorView, setActiveFloorView] = useState<'all' | 'Ground Floor' | '1st Floor' | '2nd Floor'>('all');

  // Position nodes on the authentic VESIT C-shaped curved building blueprint (viewBox: 800 x 540)
  const nodeLayout: Record<string, { x: number; y: number; floor: string; label: string; icon: any; color: string; wing: string }> = {
    loc_canteen: {
      x: 230,
      y: 390,
      floor: 'Ground Floor',
      label: 'Campus Canteen',
      icon: Utensils,
      color: '#10B981', // emerald
      wing: 'Left Wing [Facing Inside]',
    },
    loc_principal: {
      x: 565,
      y: 405,
      floor: 'Ground Floor',
      label: "Principal's Office",
      icon: Award,
      color: '#D97706', // amber
      wing: 'Right Wing [Facing Inside]',
    },
    loc_admin: {
      x: 615,
      y: 330,
      floor: 'Ground Floor',
      label: 'Admin Office & Student Section',
      icon: FileText,
      color: '#0284C7', // sky
      wing: 'Right Wing [Facing Inside]',
    },
    loc_audi: {
      x: 580,
      y: 220,
      floor: 'Ground Floor',
      label: 'College Auditorium',
      icon: Mic,
      color: '#2563EB', // blue
      wing: 'Right Wing [Facing Inside]',
    },
    loc_xerox: {
      x: 200,
      y: 210,
      floor: 'Ground Floor',
      label: 'Stationery & Xerox',
      icon: Printer,
      color: '#E11D48', // rose
      wing: 'Backside Perimeter [Ground Floor]',
    },
    loc_library: {
      x: 320,
      y: 285,
      floor: '1st Floor',
      label: 'Central Library',
      icon: BookOpen,
      color: '#EA580C', // orange
      wing: '1st Floor · Right from Middle [Facing Entrance]',
    },
    loc_amphitheatre: {
      x: 400,
      y: 195,
      floor: '2nd Floor',
      label: 'Open-Air Amphitheatre',
      icon: Sparkles,
      color: '#9333EA', // purple
      wing: '2nd Floor · Grand Suspended Atrium [Facing Entrance]',
    },
  };

  // Generate SVG path from Main Entrance (400, 460) to selected node
  const getWalkingPath = (targetId: string) => {
    switch (targetId) {
      case 'loc_canteen':
        return 'M 400 460 L 400 420 Q 320 420 230 390';
      case 'loc_principal':
        return 'M 400 460 L 400 420 Q 480 420 565 405';
      case 'loc_admin':
        return 'M 400 460 L 400 420 Q 520 400 615 330';
      case 'loc_audi':
        return 'M 400 460 L 400 420 Q 550 380 580 220';
      case 'loc_xerox':
        return 'M 400 460 L 400 420 Q 280 410 210 320 L 200 210';
      case 'loc_library':
        // Entrance -> Central stairs (400, 350) -> Up to 1st Floor -> Right from middle facing entrance (towards 320, 285)
        return 'M 400 460 L 400 360 Q 360 340 320 285';
      case 'loc_amphitheatre':
        // Entrance -> Central stairs / elevator (400, 360) -> Up to 2nd Floor -> Grand Atrium
        return 'M 400 460 L 400 360 L 400 195';
      default:
        return 'M 400 460 L 400 400';
    }
  };

  const selectedNode = nodeLayout[selectedLocation?.id];

  return (
    <div className="rounded-3xl border border-[#E5E3DC] dark:border-neutral-800 bg-[#FAF9F5] dark:bg-neutral-900 overflow-hidden shadow-sm space-y-3">
      {/* Blueprint Header & Floor Navigation Tabs */}
      <div className="p-4 sm:p-5 bg-white dark:bg-neutral-850 border-b border-[#E5E3DC] dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F97316] animate-pulse" />
            <h3 className="text-sm font-black text-[#171916] dark:text-neutral-100 uppercase tracking-wider flex items-center gap-2">
              <span>VESIT Curved Structure Building</span>
              <span className="text-[10px] font-mono font-bold bg-orange-100 text-[#F97316] dark:bg-orange-950/80 px-2 py-0.5 rounded-full normal-case">
                C-Shaped Campus Plan
              </span>
            </h3>
          </div>
          <p className="text-[11px] text-[#737871] dark:text-neutral-400 mt-0.5">
            Architectural schematic of all 7 facilities inside the iconic VESIT curved building.
          </p>
        </div>

        {/* Floor Filter Buttons */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-[#FAF9F5] dark:bg-neutral-800 p-1 rounded-xl border border-[#E5E3DC] dark:border-neutral-700 text-xs">
          {(['all', 'Ground Floor', '1st Floor', '2nd Floor'] as const).map((floor) => (
            <button
              key={floor}
              type="button"
              onClick={() => setActiveFloorView(floor)}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                activeFloorView === floor
                  ? 'bg-[#171916] text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-2xs'
                  : 'text-[#737871] hover:text-[#171916] dark:hover:text-neutral-200'
              }`}
            >
              {floor === 'all' ? 'All Levels' : floor.replace(' Floor', 'F')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive SVG Canvas */}
      <div className="relative w-full overflow-hidden px-2 sm:px-4 py-2">
        <svg
          viewBox="0 0 800 540"
          className="w-full h-auto max-h-[500px] select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="archGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E5E3DC" strokeWidth="0.8" opacity="0.4" />
            </pattern>

            {/* Pulsing Gradient for active marker */}
            <radialGradient id="activePulse" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F97316" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#F97316" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
            </radialGradient>

            {/* Linear gradient for curved building walls */}
            <linearGradient id="curvedWallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#FAF9F5" stopOpacity="0.98" />
              <stop offset="100%" stopColor="#F5F3EC" stopOpacity="0.9" />
            </linearGradient>

            {/* Amphitheatre Tier Gradient */}
            <radialGradient id="amphiGrad" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#F3E8FF" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#E9D5FF" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#D8B4FE" stopOpacity="0.2" />
            </radialGradient>
          </defs>

          {/* Background grid */}
          <rect width="800" height="540" fill="url(#archGrid)" />

          {/* Compass / Orientation Guide at top right */}
          <g transform="translate(710, 60)">
            <circle cx="0" cy="0" r="32" fill="#FFFFFF" stroke="#E5E3DC" strokeWidth="1.5" />
            <path d="M 0 -22 L 6 -6 L 0 -10 L -6 -6 Z" fill="#F97316" />
            <path d="M 0 22 L 6 6 L 0 10 L -6 6 Z" fill="#737871" />
            <text x="0" y="-25" textAnchor="middle" fontSize="10" fontWeight="900" fill="#F97316">INSIDE</text>
            <text x="0" y="32" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#737871">ENTRANCE</text>
            <circle cx="0" cy="0" r="3" fill="#171916" />
          </g>

          {/* Orientation Reference Banner in SVG */}
          <g transform="translate(400, 30)">
            <rect x="-180" y="-14" width="360" height="28" rx="14" fill="#FFFFFF" stroke="#E5E3DC" strokeWidth="1" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.03))" />
            <text x="0" y="4" textAnchor="middle" fontSize="11" fontWeight="800" fill="#171916">
              VESIT C-SHAPED CURVED STRUCTURE BUILDING
            </text>
          </g>

          {/* ============================================================== */}
          {/* THE AUTHENTIC C-SHAPED CURVED BUILDING ARCHITECTURE */}
          {/* ============================================================== */}

          {/* Rear Annexe & Sports Quadrangle Backdrop */}
          <path
            d="M 120 180 Q 200 130 400 120 Q 600 130 680 180"
            fill="none"
            stroke="#D7D4CB"
            strokeWidth="8"
            strokeDasharray="4 4"
            opacity="0.6"
          />
          <text x="400" y="105" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#737871" letterSpacing="2">
            REAR CAMPUS PERIMETER · PLAYGROUND & PARKING (BACKSIDE)
          </text>

          {/* Outer C-Shape Wall Outline */}
          <path
            d="M 160 410 Q 140 200 400 140 Q 660 200 640 410"
            fill="none"
            stroke="#D7D4CB"
            strokeWidth="36"
            strokeLinecap="round"
            opacity="0.3"
          />

          {/* The Main C-Shaped Curved Building Body */}
          <path
            d="M 170 410 C 130 220, 240 145, 400 145 C 560 145, 670 220, 630 410 C 580 435, 530 405, 520 330 C 500 210, 300 210, 280 330 C 270 405, 220 435, 170 410 Z"
            fill="url(#curvedWallGrad)"
            stroke="#171916"
            strokeWidth="3"
            filter="drop-shadow(0 8px 16px rgba(0,0,0,0.06))"
          />

          {/* Inner Atrium / "Learning Street" Curved Promenade */}
          <path
            d="M 270 340 Q 290 225 400 225 Q 510 225 530 340"
            fill="none"
            stroke="#F97316"
            strokeWidth="2.5"
            strokeDasharray="6 4"
            opacity="0.8"
          />
          <text x="400" y="240" textAnchor="middle" fontSize="10" fontWeight="900" fill="#EA580C" opacity="0.9">
            CENTRAL CURVED CORRIDOR · "LEARNING STREET"
          </text>

          {/* SUSPENDED AMPHITHEATRE AT 2ND FLOOR (Central Core) */}
          <g opacity={activeFloorView === 'Ground Floor' || activeFloorView === '1st Floor' ? 0.35 : 1}>
            <ellipse cx="400" cy="195" rx="90" ry="45" fill="url(#amphiGrad)" stroke="#9333EA" strokeWidth="2.5" />
            <ellipse cx="400" cy="195" rx="65" ry="32" fill="none" stroke="#9333EA" strokeWidth="1.5" strokeDasharray="3 3" />
            <ellipse cx="400" cy="195" rx="40" ry="20" fill="none" stroke="#9333EA" strokeWidth="1" />
            <text x="400" y="180" textAnchor="middle" fontSize="11" fontWeight="900" fill="#7E22CE">
              2nd FLOOR AMPHITHEATRE
            </text>
            <text x="400" y="195" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#6B21A8">
              Whole Central Section [Facing Entrance]
            </text>
          </g>

          {/* 1st FLOOR CENTRAL FOYER & LIBRARY ZONE */}
          <g opacity={activeFloorView === 'Ground Floor' || activeFloorView === '2nd Floor' ? 0.35 : 1}>
            {/* Library outline on 1st Floor (Right from middle when facing entrance) */}
            <path
              d="M 260 270 Q 320 250 370 280 L 350 330 Q 300 310 260 270 Z"
              fill="#FFEDD5"
              stroke="#EA580C"
              strokeWidth="2"
              opacity="0.85"
            />
            <text x="315" y="270" textAnchor="middle" fontSize="10" fontWeight="900" fill="#C2410C">
              1st F · LIBRARY
            </text>
          </g>

          {/* CENTRAL STAIRCASE & ELEVATOR FOYER */}
          <g transform="translate(400, 360)">
            <rect x="-35" y="-18" width="70" height="36" rx="8" fill="#FFFFFF" stroke="#171916" strokeWidth="2" />
            <text x="0" y="-3" textAnchor="middle" fontSize="9" fontWeight="900" fill="#171916">STAIRS & LIFT</text>
            <text x="0" y="9" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#737871">To 1st & 2nd Floor</text>
          </g>

          {/* MAIN ENTRANCE PORCH AT THE BOTTOM CENTER */}
          <g transform="translate(400, 465)">
            {/* Porch threshold */}
            <rect x="-65" y="-18" width="130" height="36" rx="10" fill="#171916" stroke="#000000" strokeWidth="2" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))" />
            <text x="0" y="-1" textAnchor="middle" fontSize="11" fontWeight="900" fill="#FFFFFF" letterSpacing="1">
              MAIN ENTRANCE
            </text>
            <text x="0" y="11" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#F97316">
              COLLEGE FOYER PORCH
            </text>

            {/* Entrance directional arrows */}
            <path d="M 0 -22 L 0 -45" stroke="#F97316" strokeWidth="3" markerEnd="url(#arrow)" />
            <circle cx="0" cy="-45" r="4" fill="#F97316" />

            {/* Orientation helper banners */}
            <g transform="translate(0, 30)">
              <rect x="-140" y="-10" width="280" height="20" rx="10" fill="#FAF9F5" stroke="#E5E3DC" strokeWidth="1" />
              <text x="0" y="4" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#555952">
                Facing Inside (Upwards) ↑ · Facing Entrance (Downwards) ↓
              </text>
            </g>
          </g>

          {/* ANIMATED ACTIVE WALKING ROUTE PATH */}
          {selectedLocation && (
            <g>
              <path
                d={getWalkingPath(selectedLocation.id)}
                fill="none"
                stroke="#F97316"
                strokeWidth="4"
                strokeDasharray="8 6"
                strokeLinecap="round"
                className="animate-pulse"
              />
              {/* Walking path start dot */}
              <circle cx="400" cy="460" r="5" fill="#171916" stroke="#FFFFFF" strokeWidth="2" />
            </g>
          )}

          {/* ============================================================== */}
          {/* FACILITY NODES (ALL 7 POINTS ON THE CURVED STRUCTURE) */}
          {/* ============================================================== */}
          {locations.map((loc) => {
            const node = nodeLayout[loc.id];
            if (!node) return null;

            const isSelected = selectedLocation?.id === loc.id;
            const isFloorDimmed =
              activeFloorView !== 'all' &&
              !loc.floor.toLowerCase().includes(activeFloorView.toLowerCase().replace(' floor', ''));

            const IconComponent = node.icon;

            return (
              <g
                key={loc.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => onSelectLocation(loc)}
                className="cursor-pointer transition-transform duration-200"
                style={{ opacity: isFloorDimmed ? 0.3 : 1 }}
              >
                {/* Active radar pulsing ring */}
                {isSelected && (
                  <>
                    <circle cx="0" cy="0" r="32" fill="url(#activePulse)" className="animate-ping" opacity="0.6" />
                    <circle cx="0" cy="0" r="24" fill="none" stroke="#F97316" strokeWidth="2.5" strokeDasharray="4 2" />
                  </>
                )}

                {/* Marker circle */}
                <circle
                  cx="0"
                  cy="0"
                  r={isSelected ? 18 : 15}
                  fill={isSelected ? '#F97316' : '#FFFFFF'}
                  stroke={isSelected ? '#FFFFFF' : node.color}
                  strokeWidth={isSelected ? 3 : 2.5}
                  filter="drop-shadow(0 3px 6px rgba(0,0,0,0.2))"
                />

                {/* Center icon / dot */}
                <circle cx="0" cy="0" r="5" fill={isSelected ? '#FFFFFF' : node.color} />

                {/* Node Pill Tag */}
                <g transform="translate(0, 24)">
                  <rect
                    x="-65"
                    y="-10"
                    width="130"
                    height="20"
                    rx="10"
                    fill={isSelected ? '#171916' : '#FFFFFF'}
                    stroke={isSelected ? '#F97316' : '#D7D4CB'}
                    strokeWidth={isSelected ? 2 : 1}
                    filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="800"
                    fill={isSelected ? '#FFFFFF' : '#171916'}
                  >
                    {loc.name.split('(')[0].replace('Central ', '').replace('College ', '')}
                  </text>
                </g>

                {/* Floor Indicator Badge */}
                <g transform="translate(0, -22)">
                  <rect
                    x="-24"
                    y="-8"
                    width="48"
                    height="16"
                    rx="8"
                    fill={isSelected ? '#F97316' : '#FAF9F5'}
                    stroke={isSelected ? '#FFFFFF' : '#E5E3DC'}
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fontSize="8"
                    fontWeight="900"
                    fill={isSelected ? '#FFFFFF' : '#737871'}
                  >
                    {node.floor.split(' ')[0]}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Blueprint Legend & Selected Point Orientation Banner */}
      {selectedLocation && selectedNode && (
        <div className="p-4 sm:p-5 bg-white dark:bg-neutral-850 border-t border-[#E5E3DC] dark:border-neutral-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm"
                style={{ backgroundColor: selectedNode.color }}
              >
                {React.createElement(selectedNode.icon, { className: 'w-5 h-5' })}
              </div>
              <div>
                <div className="text-xs font-bold text-[#737871] dark:text-neutral-400 flex items-center gap-2">
                  <span>Selected Facility On Curved Structure:</span>
                  <span className="font-mono text-[#F97316] font-bold">{selectedLocation.floor}</span>
                </div>
                <h4 className="text-sm sm:text-base font-black text-[#171916] dark:text-neutral-100">
                  {selectedLocation.name}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-[11px] font-mono font-bold px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950 text-[#F97316] border border-orange-200 dark:border-orange-800 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5" />
                <span>{selectedNode.wing}</span>
              </span>
            </div>
          </div>

          {/* Real-world Walking Instruction Callout */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50/60 to-white dark:from-orange-950/40 dark:via-neutral-800 dark:to-neutral-800 border border-orange-200 dark:border-orange-800/60 flex items-start gap-2.5">
            <Compass className="w-4 h-4 text-[#F97316] shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed text-[#20231F] dark:text-neutral-200">
              <strong className="text-[#F97316] block sm:inline sm:mr-1">
                Directions:
              </strong>
              {getOrientationCue(selectedLocation.id)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
