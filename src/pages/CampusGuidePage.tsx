import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CampusLocation } from '../types';
import {
  MapPin,
  Search,
  Clock,
  Navigation,
  Phone,
  Building,
  Compass,
  BookOpen,
  Mic,
  Sparkles,
  Award,
  Utensils,
  FileText,
  Printer,
  Layers,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { VesitCurvedBuildingMap } from '../components/campus/VesitCurvedBuildingMap';

const campusLocIcon = L.divIcon({
  html: `<div style="background-color: #F97316; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(249,115,22,0.4); border: 3px solid white; font-size: 15px;">📍</div>`,
  className: 'custom-campus-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Helper component to center map on selection
const MapRecenter: React.FC<{ coords: [number, number] }> = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, 18, { animate: true });
  }, [coords, map]);
  return null;
};

// Helper for location icons
const getLocationIcon = (id: string) => {
  if (id.includes('library')) return <BookOpen className="w-5 h-5 text-[#F97316]" />;
  if (id.includes('amphi')) return <Sparkles className="w-5 h-5 text-purple-600" />;
  if (id.includes('audi')) return <Mic className="w-5 h-5 text-blue-600" />;
  if (id.includes('principal')) return <Award className="w-5 h-5 text-amber-600" />;
  if (id.includes('canteen')) return <Utensils className="w-5 h-5 text-emerald-600" />;
  if (id.includes('admin')) return <FileText className="w-5 h-5 text-sky-600" />;
  if (id.includes('xerox')) return <Printer className="w-5 h-5 text-rose-600" />;
  return <MapPin className="w-5 h-5 text-[#F97316]" />;
};

// Helper for orientation cues exactly matched to college campus architecture
export const getOrientationCue = (id: string) => {
  if (id.includes('library')) return '1st Floor right from middle [facing entrance]';
  if (id.includes('audi')) return 'right from entrance [facing inside of college] Ground Floor';
  if (id.includes('amphi')) return '2nd floor [facing entrance whole part is a big amphitheatre]';
  if (id.includes('principal')) return 'right from entrance [facing inside of college] Ground Floor';
  if (id.includes('canteen')) return 'left from entrance [facing inside of college] Ground floor';
  if (id.includes('admin')) return 'right from Entrance [Facing inside of College] Ground Floor';
  if (id.includes('xerox')) return 'Backside of the college for stationary and Xerox [ground floor]';
  return 'Ground Floor';
};

export const CampusGuidePage: React.FC = () => {
  const { locations, activeLocationFocus } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFloor, setSelectedFloor] = useState<string>('all');
  const [mapViewMode, setMapViewMode] = useState<'blueprint' | 'satellite'>('blueprint');

  const [selectedLocation, setSelectedLocation] = useState<CampusLocation>(() => {
    return activeLocationFocus || locations[0];
  });

  // Keep selectedLocation updated if activeLocationFocus changes or current location is invalidated
  useEffect(() => {
    if (activeLocationFocus) {
      setSelectedLocation(activeLocationFocus);
    } else if (!locations.some((l) => l.id === selectedLocation?.id)) {
      if (locations.length > 0) {
        setSelectedLocation(locations[0]);
      }
    }
  }, [activeLocationFocus, locations, selectedLocation]);

  const categories = [
    { id: 'all', label: 'All 7 Places' },
    { id: 'library', label: 'Library' },
    { id: 'auditorium', label: 'Auditorium & Amphitheatre' },
    { id: 'admin', label: 'Principal & Admin Offices' },
    { id: 'canteen', label: 'Canteen' },
    { id: 'amenity', label: 'Stationery & Xerox' },
  ];

  const floors = [
    { id: 'all', label: 'All Floors' },
    { id: 'Ground Floor', label: 'Ground Floor (5)' },
    { id: '1st Floor', label: '1st Floor (1)' },
    { id: '2nd Floor', label: '2nd Floor (1)' },
  ];

  const filteredLocations = locations.filter((loc) => {
    // Category filter
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'auditorium') {
        if (loc.category !== 'auditorium') return false;
      } else if (selectedCategory === 'admin') {
        if (loc.category !== 'admin') return false;
      } else if (loc.category !== selectedCategory) {
        return false;
      }
    }

    // Floor filter
    if (selectedFloor !== 'all' && !loc.floor.includes(selectedFloor)) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        loc.name.toLowerCase().includes(q) ||
        loc.building.toLowerCase().includes(q) ||
        loc.instructions.toLowerCase().includes(q) ||
        loc.floor.toLowerCase().includes(q) ||
        loc.roomNumber?.toLowerCase().includes(q) ||
        getOrientationCue(loc.id).toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Header Banner with generous padding */}
      <div className="rounded-3xl bg-gradient-to-br from-orange-500/10 via-[#FAF9F5] to-amber-500/10 dark:from-orange-950/30 dark:via-neutral-900 dark:to-neutral-900 border border-[#E5E3DC] dark:border-neutral-800 p-6 sm:p-9 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 text-[#F97316] text-xs font-bold uppercase tracking-wider">
              <Compass className="w-4 h-4" />
              <span>VESIT Chembur Mumbai · Campus Orientation & Facility Guide</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-[#171916] dark:text-neutral-100 tracking-tight">
              Campus Guide & Facility Navigator
            </h1>
            <p className="text-sm sm:text-base text-[#555952] dark:text-neutral-300 max-w-3xl leading-relaxed">
              Find key facilities instantly with exact orientation cues relative to the college entrance.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-4 py-2 rounded-2xl bg-white dark:bg-neutral-800 border border-[#E5E3DC] dark:border-neutral-700 text-xs font-mono font-black text-[#171916] dark:text-neutral-200 shadow-2xs">
              7 Key Facilities
            </span>
          </div>
        </div>
      </div>

      {/* QUICK ORIENTATION SCHEMATIC / OVERVIEW CARDS (Spacious 3-Tier Architecture) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-[#E5E3DC] dark:border-neutral-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-[#E5E3DC] dark:border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-[#F97316] flex items-center justify-center font-black text-lg">
              🧭
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#171916] dark:text-neutral-100">
                Official Orientation & Floor Plan
              </h2>
              <p className="text-xs sm:text-sm text-[#737871] dark:text-neutral-400">
                Exact facing cues relative to the college entrance porch & foyer.
              </p>
            </div>
          </div>
          <span className="text-xs font-extrabold uppercase text-[#F97316] hidden sm:inline tracking-wider">
            Click any place to inspect
          </span>
        </div>

        {/* 3-Tier Floor Architecture Cards with generous space */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Ground Floor */}
          <div className="p-5 rounded-2xl bg-[#FAF9F5] dark:bg-neutral-800/60 border border-[#E5E3DC] dark:border-neutral-700 space-y-3.5">
            <div className="flex items-center justify-between text-xs font-black text-[#171916] dark:text-neutral-200 pb-1 border-b border-[#E5E3DC] dark:border-neutral-700">
              <span className="flex items-center gap-1.5 text-[#F97316]">
                <Layers className="w-4 h-4" />
                <span className="text-sm">Ground Floor (5 Facilities)</span>
              </span>
              <span className="text-[10px] text-[#737871] font-mono uppercase font-bold">Entrance Level</span>
            </div>
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  const loc = locations.find((l) => l.id === 'loc_principal');
                  if (loc) setSelectedLocation(loc);
                }}
                className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                  selectedLocation?.id === 'loc_principal'
                    ? 'bg-orange-50/80 border-[#F97316] dark:bg-orange-950/40'
                    : 'bg-white dark:bg-neutral-900 border-[#E5E3DC] dark:border-neutral-700 hover:border-[#F97316]'
                }`}
              >
                <span className="font-bold text-sm text-[#171916] dark:text-neutral-200">Principal Office</span>
                <span className="text-xs font-extrabold text-[#F97316] dark:text-orange-400">
                  right from entrance [facing inside of college] Ground Floor
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const loc = locations.find((l) => l.id === 'loc_admin');
                  if (loc) setSelectedLocation(loc);
                }}
                className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                  selectedLocation?.id === 'loc_admin'
                    ? 'bg-orange-50/80 border-[#F97316] dark:bg-orange-950/40'
                    : 'bg-white dark:bg-neutral-900 border-[#E5E3DC] dark:border-neutral-700 hover:border-[#F97316]'
                }`}
              >
                <span className="font-bold text-sm text-[#171916] dark:text-neutral-200">Administrative Office</span>
                <span className="text-xs font-extrabold text-[#F97316] dark:text-orange-400">
                  right from Entrance [Facing inside of College] Ground Floor
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const loc = locations.find((l) => l.id === 'loc_audi');
                  if (loc) setSelectedLocation(loc);
                }}
                className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                  selectedLocation?.id === 'loc_audi'
                    ? 'bg-orange-50/80 border-[#F97316] dark:bg-orange-950/40'
                    : 'bg-white dark:bg-neutral-900 border-[#E5E3DC] dark:border-neutral-700 hover:border-[#F97316]'
                }`}
              >
                <span className="font-bold text-sm text-[#171916] dark:text-neutral-200">Auditorium</span>
                <span className="text-xs font-extrabold text-[#F97316] dark:text-orange-400">
                  right from entrance [facing inside of college ]
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const loc = locations.find((l) => l.id === 'loc_canteen');
                  if (loc) setSelectedLocation(loc);
                }}
                className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                  selectedLocation?.id === 'loc_canteen'
                    ? 'bg-orange-50/80 border-[#F97316] dark:bg-orange-950/40'
                    : 'bg-white dark:bg-neutral-900 border-[#E5E3DC] dark:border-neutral-700 hover:border-[#F97316]'
                }`}
              >
                <span className="font-bold text-sm text-[#171916] dark:text-neutral-200">Canteen</span>
                <span className="text-xs font-extrabold text-[#F97316] dark:text-orange-400">
                  left from entrance [facing inside of college] Ground floor
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const loc = locations.find((l) => l.id === 'loc_xerox');
                  if (loc) setSelectedLocation(loc);
                }}
                className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                  selectedLocation?.id === 'loc_xerox'
                    ? 'bg-orange-50/80 border-[#F97316] dark:bg-orange-950/40'
                    : 'bg-white dark:bg-neutral-900 border-[#E5E3DC] dark:border-neutral-700 hover:border-[#F97316]'
                }`}
              >
                <span className="font-bold text-sm text-[#171916] dark:text-neutral-200">Xerox & Stationery</span>
                <span className="text-xs font-extrabold text-[#F97316] dark:text-orange-400">
                  Backside of the college for stationary and Xerox [ground floor]
                </span>
              </button>
            </div>
          </div>

          {/* 1st Floor */}
          <div className="p-5 rounded-2xl bg-[#FAF9F5] dark:bg-neutral-800/60 border border-[#E5E3DC] dark:border-neutral-700 space-y-3.5">
            <div className="flex items-center justify-between text-xs font-black text-[#171916] dark:text-neutral-200 pb-1 border-b border-[#E5E3DC] dark:border-neutral-700">
              <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                <Layers className="w-4 h-4" />
                <span className="text-sm">1st Floor (Library)</span>
              </span>
              <span className="text-[10px] text-[#737871] font-mono uppercase font-bold">Foyer Stairs / Lift</span>
            </div>
            <div>
              <button
                type="button"
                onClick={() => {
                  const loc = locations.find((l) => l.id === 'loc_library');
                  if (loc) setSelectedLocation(loc);
                }}
                className={`w-full p-4 rounded-xl border text-left transition-all cursor-pointer space-y-2 ${
                  selectedLocation?.id === 'loc_library'
                    ? 'bg-orange-50/80 border-[#F97316] dark:bg-orange-950/40'
                    : 'bg-white dark:bg-neutral-900 border-[#E5E3DC] dark:border-neutral-700 hover:border-[#F97316]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#171916] dark:text-neutral-200">Library</span>
                  <BookOpen className="w-4 h-4 text-[#F97316]" />
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-[#F97316] dark:text-orange-400">
                  1st Floor right from middle [facing entrance]
                </div>
                <div className="text-[11px] text-[#737871] dark:text-neutral-400 leading-relaxed">
                  Book bank, quiet reading hall, and IEEE digital research stations.
                </div>
              </button>
            </div>
          </div>

          {/* 2nd Floor */}
          <div className="p-5 rounded-2xl bg-[#FAF9F5] dark:bg-neutral-800/60 border border-[#E5E3DC] dark:border-neutral-700 space-y-3.5">
            <div className="flex items-center justify-between text-xs font-black text-[#171916] dark:text-neutral-200 pb-1 border-b border-[#E5E3DC] dark:border-neutral-700">
              <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                <Layers className="w-4 h-4" />
                <span className="text-sm">2nd Floor (Amphitheatre)</span>
              </span>
              <span className="text-[10px] text-[#737871] font-mono uppercase font-bold">Central Open Floor</span>
            </div>
            <div>
              <button
                type="button"
                onClick={() => {
                  const loc = locations.find((l) => l.id === 'loc_amphitheatre');
                  if (loc) setSelectedLocation(loc);
                }}
                className={`w-full p-4 rounded-xl border text-left transition-all cursor-pointer space-y-2 ${
                  selectedLocation?.id === 'loc_amphitheatre'
                    ? 'bg-orange-50/80 border-[#F97316] dark:bg-orange-950/40'
                    : 'bg-white dark:bg-neutral-900 border-[#E5E3DC] dark:border-neutral-700 hover:border-[#F97316]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#171916] dark:text-neutral-200">Amphitheatre</span>
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-[#F97316] dark:text-orange-400">
                  2nd floor [facing entrance whole part is a big amphitheatre]
                </div>
                <div className="text-[11px] text-[#737871] dark:text-neutral-400 leading-relaxed">
                  Tiered open forum for student cultural jams, drama, club kickoffs & hackathon presentations.
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-[#737871] absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search by facility name or orientation cue (e.g. Library, Canteen, Xerox, Auditorium, Principal, Admin)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 text-sm rounded-2xl bg-white dark:bg-neutral-900 border border-[#E5E3DC] dark:border-neutral-800 shadow-xs text-[#20231F] dark:text-neutral-100 focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 transition-all"
          />
        </div>

        {/* Category Pill Tabs & Floor Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl font-medium transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#F97316] text-white shadow-2xs font-bold'
                    : 'bg-white dark:bg-neutral-900 text-[#555952] dark:text-neutral-300 border border-[#E5E3DC] dark:border-neutral-800 hover:text-[#171916]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-xs font-bold text-[#737871] mr-1">Floor:</span>
            {floors.map((fl) => (
              <button
                key={fl.id}
                onClick={() => setSelectedFloor(fl.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  selectedFloor === fl.id
                    ? 'bg-[#171916] text-white dark:bg-neutral-200 dark:text-neutral-900'
                    : 'bg-[#FAF9F5] dark:bg-neutral-800 text-[#737871] hover:text-[#171916]'
                }`}
              >
                {fl.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN 2-COLUMN SPLIT: Directory List & Map / Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10">
        {/* Left Column (5 cols): Searchable Location List with Generous Spacing */}
        <div className="lg:col-span-5 space-y-4 max-h-[720px] overflow-y-auto pr-1">
          <div className="text-xs font-bold text-[#737871] dark:text-neutral-400 px-1 flex items-center justify-between">
            <span>Showing {filteredLocations.length} Campus Facilities</span>
            <span className="text-[10px] font-mono">VESIT Chembur</span>
          </div>

          {filteredLocations.map((loc) => {
            const isSelected = selectedLocation?.id === loc.id;
            const orientationCue = getOrientationCue(loc.id);

            return (
              <div
                key={loc.id}
                onClick={() => setSelectedLocation(loc)}
                className={`p-5 sm:p-6 rounded-3xl border transition-all cursor-pointer space-y-3.5 ${
                  isSelected
                    ? 'bg-white dark:bg-neutral-900 border-[#F97316] ring-2 ring-[#F97316]/30 shadow-md'
                    : 'bg-white dark:bg-neutral-900 border-[#E5E3DC] dark:border-neutral-800 hover:border-[#F97316]/60 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#FAF9F5] dark:bg-neutral-800 border border-[#E5E3DC] dark:border-neutral-700 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      {getLocationIcon(loc.id)}
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-extrabold text-[#171916] dark:text-neutral-100 leading-snug">
                        {loc.name}
                      </h3>
                      <div className="text-xs font-semibold text-[#555952] dark:text-neutral-400 mt-1">
                        {loc.building} · <strong className="text-[#F97316] font-bold">{loc.floor}</strong>
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono font-bold px-2.5 py-1 bg-[#FAF9F5] dark:bg-neutral-800 border border-[#E5E3DC] dark:border-neutral-700 text-[#555952] dark:text-neutral-300 rounded-lg shrink-0">
                    {loc.floor.split(' ')[0]}
                  </span>
                </div>

                {/* STANDOUT "WHERE IT IS" BOX WITH EXTRA-LARGE BOLD FONT */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-orange-500/5 dark:from-orange-950/50 dark:via-orange-950/30 dark:to-neutral-900 border-2 border-orange-200 dark:border-orange-800 shadow-2xs space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#EA580C] dark:text-orange-400">
                    <Navigation className="w-3.5 h-3.5 text-[#F97316] shrink-0" />
                    <span>WHERE IT IS:</span>
                  </div>
                  <div className="text-sm sm:text-base md:text-lg font-black text-[#171916] dark:text-neutral-100 tracking-tight leading-snug">
                    {orientationCue}
                  </div>
                </div>

                <p className="text-xs text-[#737871] dark:text-neutral-400 line-clamp-2 leading-relaxed">
                  {loc.instructions}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right Column (7 cols): VESIT Curved Building Map & Selected Details */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8">
          {/* Map View Mode Switcher */}
          <div className="flex items-center justify-between bg-white dark:bg-neutral-900 p-2 rounded-2xl border border-[#E5E3DC] dark:border-neutral-800 shadow-2xs">
            <span className="text-xs font-black text-[#171916] dark:text-neutral-100 pl-2 flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#F97316]" />
              <span>Campus Map View:</span>
            </span>
            <div className="flex items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setMapViewMode('blueprint')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  mapViewMode === 'blueprint'
                    ? 'bg-[#F97316] text-white shadow-xs'
                    : 'bg-[#FAF9F5] dark:bg-neutral-800 text-[#737871] hover:text-[#171916]'
                }`}
              >
                🏛️ Curved Structure Building
              </button>
              <button
                type="button"
                onClick={() => setMapViewMode('satellite')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  mapViewMode === 'satellite'
                    ? 'bg-[#171916] text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs'
                    : 'bg-[#FAF9F5] dark:bg-neutral-800 text-[#737871] hover:text-[#171916]'
                }`}
              >
                🗺️ Campus Satellite Map
              </button>
            </div>
          </div>

          {/* Interactive Map: Curved Building Blueprint (Default) or OpenStreetMap */}
          {mapViewMode === 'blueprint' ? (
            <VesitCurvedBuildingMap
              locations={locations}
              selectedLocation={selectedLocation}
              onSelectLocation={(loc) => setSelectedLocation(loc)}
            />
          ) : (
            <div className="rounded-3xl border border-[#E5E3DC] dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-900 shadow-sm">
              <div className="p-3 bg-neutral-100 dark:bg-neutral-800 border-b border-[#E5E3DC] dark:border-neutral-700 text-xs text-[#555952] dark:text-neutral-300 flex items-center justify-between">
                <span>VESIT Campus Grounds · Hashu Advani Memorial Complex, Collector&apos;s Colony, Chembur</span>
                <span className="font-mono font-bold text-[#F97316]">19.0461° N, 72.8955° E</span>
              </div>
              <div className="h-64 sm:h-80 w-full z-10">
                {selectedLocation && (
                  <MapContainer
                    center={selectedLocation.coords}
                    zoom={18}
                    scrollWheelZoom={false}
                    className="h-full w-full"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapRecenter coords={selectedLocation.coords} />
                    {locations.map((loc) => (
                      <Marker
                        key={loc.id}
                        position={loc.coords}
                        icon={campusLocIcon}
                        eventHandlers={{
                          click: () => setSelectedLocation(loc),
                        }}
                      >
                        <Popup>
                          <div className="text-xs font-bold">{loc.name}</div>
                          <div className="text-[11px] text-[#555952] mt-0.5">
                            {loc.floor} · {getOrientationCue(loc.id)}
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                )}
              </div>
            </div>
          )}

          {/* Location Detail Card with generous spacing & extra prominent "WHERE IT IS" font */}
          {selectedLocation && (
            <div className="p-7 sm:p-9 rounded-3xl bg-white dark:bg-neutral-900 border border-[#E5E3DC] dark:border-neutral-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] font-black text-[#F97316] uppercase tracking-wider px-3 py-1 rounded-md bg-orange-100 dark:bg-orange-950/60">
                      {selectedLocation.category.toUpperCase()}
                    </span>
                    <span className="text-xs font-bold text-[#737871] dark:text-neutral-400">
                      Floor: <strong className="text-[#171916] dark:text-neutral-100 text-sm">{selectedLocation.floor}</strong>
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#171916] dark:text-neutral-100 tracking-tight flex items-center gap-2">
                    {selectedLocation.name}
                  </h2>
                  <div className="text-xs sm:text-sm text-[#555952] dark:text-neutral-400 font-medium">
                    {selectedLocation.building} {selectedLocation.roomNumber ? `· ${selectedLocation.roomNumber}` : ''}
                  </div>
                </div>

                <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0 self-start shadow-2xs">
                  Active Facility
                </span>
              </div>

              {/* EXTRA-PROMINENT "WHERE IT IS" LOCATION CARD WITH BIG FONT */}
              <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-orange-500/15 via-orange-500/5 to-amber-500/10 dark:from-orange-950/60 dark:via-neutral-900 dark:to-neutral-900 border-2 border-orange-300 dark:border-orange-700/80 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#EA580C] dark:text-orange-400">
                  <Compass className="w-4 h-4 text-[#F97316]" />
                  <span>WHERE IT IS · OFFICIAL ORIENTATION</span>
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl font-black text-[#171916] dark:text-neutral-100 tracking-tight leading-snug">
                  {getOrientationCue(selectedLocation.id)}
                </div>
                <div className="text-xs sm:text-sm text-[#444840] dark:text-neutral-300 leading-relaxed pt-2 border-t border-orange-200/80 dark:border-orange-900/60 font-medium">
                  {selectedLocation.instructions}
                </div>
              </div>

              {/* Timing & Accessibility Grid with generous padding */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#555952] dark:text-neutral-300">
                <div className="p-4 rounded-2xl border border-[#E5E3DC] dark:border-neutral-800 bg-[#FAF9F5] dark:bg-neutral-800/60 space-y-1.5">
                  <div className="text-xs text-[#737871] dark:text-neutral-400 font-bold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#F97316]" />
                    <span>Operating Timings</span>
                  </div>
                  <div className="font-bold text-xs sm:text-sm text-[#171916] dark:text-neutral-100">
                    {selectedLocation.openingHours}
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-[#E5E3DC] dark:border-neutral-800 bg-[#FAF9F5] dark:bg-neutral-800/60 space-y-1.5">
                  <div className="text-xs text-[#737871] dark:text-neutral-400 font-bold flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[#F97316]" />
                    <span>Accessibility Features</span>
                  </div>
                  <div className="font-bold text-xs sm:text-sm text-[#171916] dark:text-neutral-100">
                    {selectedLocation.accessibility}
                  </div>
                </div>
              </div>

              {/* Direct Contact Footer */}
              {selectedLocation.contact && (
                <div className="text-xs text-[#737871] dark:text-neutral-400 flex items-center gap-2 pt-2 border-t border-[#E5E3DC] dark:border-neutral-800">
                  <Phone className="w-4 h-4 text-[#F97316]" />
                  <span>
                    Direct Campus Extension: <strong className="text-[#171916] dark:text-neutral-200 text-xs sm:text-sm">{selectedLocation.contact}</strong>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
