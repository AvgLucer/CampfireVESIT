import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CampusLocation } from '../types';
import {
  MapPin,
  Search,
  Clock,
  Navigation,
  Phone,
  Building,
  CheckCircle2,
  SlidersHorizontal,
  Compass,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

const campusLocIcon = L.divIcon({
  html: `<div style="background-color: #F97316; color: white; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.25); border: 2px solid white; font-size: 13px;">📍</div>`,
  className: 'custom-campus-marker',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

// Helper component to center map on selection
const MapRecenter: React.FC<{ coords: [number, number] }> = ({ coords }) => {
  const map = useMap();
  map.setView(coords, 18, { animate: true });
  return null;
};

export const CampusGuidePage: React.FC = () => {
  const { locations, activeLocationFocus } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<CampusLocation>(
    activeLocationFocus || locations[0]
  );

  const categories = [
    { id: 'all', label: 'All Places' },
    { id: 'classroom', label: 'Classrooms' },
    { id: 'lab', label: 'Laboratories' },
    { id: 'library', label: 'Library' },
    { id: 'canteen', label: 'Canteen' },
    { id: 'auditorium', label: 'Auditorium' },
    { id: 'admin', label: 'Administration' },
    { id: 'activity', label: 'Student Activity' },
    { id: 'amenity', label: 'First Aid / Health' },
  ];

  const filteredLocations = locations.filter((loc) => {
    if (selectedCategory !== 'all' && loc.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        loc.name.toLowerCase().includes(q) ||
        loc.building.toLowerCase().includes(q) ||
        loc.instructions.toLowerCase().includes(q) ||
        loc.roomNumber?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#737871] mb-1">
          <span>Hashu Advani Memorial Complex, Chembur</span>
          <span>·</span>
          <span>First-Year Campus Navigation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171916] tracking-tight">
          Campus Directory & Floor Guide
        </h1>
        <p className="text-xs sm:text-sm text-[#555952] mt-0.5">
          Find lecture halls, laboratories, canteen counters, administrative desks, and first-aid amenities.
        </p>
      </div>

      {/* SEARCH AND CATEGORY BAR */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#737871] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by room name, lab number, or building (e.g. Lab 402, Canteen, Classroom 302)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white border border-[#E5E3DC] shadow-xs text-[#20231F] focus:outline-hidden focus:border-[#F97316]"
          />
        </div>

        {/* Category Pill Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#F97316] text-white shadow-2xs font-bold'
                  : 'bg-white text-[#555952] border border-[#E5E3DC] hover:text-[#171916]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN 2-COLUMN SPLIT: Directory List & Map / Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (5 cols): Searchable Location List */}
        <div className="lg:col-span-5 space-y-3 max-h-[600px] overflow-y-auto pr-1">
          <div className="text-xs font-bold text-[#737871] px-1">
            Found {filteredLocations.length} Campus Facilities
          </div>

          {filteredLocations.map((loc) => {
            const isSelected = selectedLocation.id === loc.id;
            return (
              <div
                key={loc.id}
                onClick={() => setSelectedLocation(loc)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white border-[#F97316] shadow-sm'
                    : 'bg-white border-[#E5E3DC] hover:border-[#D7D4CB]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#FAF9F5] border border-[#E5E3DC] flex items-center justify-center text-[#F97316] shrink-0 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#171916]">{loc.name}</div>
                      <div className="text-[11px] text-[#555952] mt-0.5">
                        {loc.building} · {loc.floor}
                      </div>
                      <div className="text-[10px] text-[#737871] mt-1 line-clamp-1">
                        {loc.instructions}
                      </div>
                    </div>
                  </div>

                  {loc.roomNumber && (
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-[#FAF9F5] border border-[#E5E3DC] text-[#555952] rounded-md shrink-0">
                      {loc.roomNumber}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column (7 cols): Leaflet Interactive Map & Selected Details */}
        <div className="lg:col-span-7 space-y-5">
          {/* Map Preview */}
          <div className="rounded-2xl border border-[#E5E3DC] overflow-hidden bg-white shadow-xs">
            <div className="h-64 w-full z-10">
              <MapContainer
                center={selectedLocation.coords}
                zoom={17}
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
                      <div className="text-[10px] text-[#555952]">{loc.floor} · {loc.building}</div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          {/* Location Detail Card */}
          {selectedLocation && (
            <div className="p-6 rounded-2xl bg-white border border-[#E5E3DC] shadow-xs space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold text-[#F97316] uppercase tracking-wider">
                    {selectedLocation.category.toUpperCase()}
                  </div>
                  <h2 className="text-base font-extrabold text-[#171916] mt-0.5">
                    {selectedLocation.name}
                  </h2>
                  <div className="text-xs text-[#555952] mt-0.5">
                    {selectedLocation.building} · {selectedLocation.floor} {selectedLocation.roomNumber ? `(${selectedLocation.roomNumber})` : ''}
                  </div>
                </div>

                <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Open Today
                </span>
              </div>

              {/* Walking Directions / Instructions */}
              <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E5E3DC] space-y-1 text-xs">
                <div className="font-semibold text-[#171916] flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-[#F97316]" />
                  <span>How to Reach from Main Entrance</span>
                </div>
                <p className="text-xs text-[#555952] leading-relaxed">
                  {selectedLocation.instructions}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#555952]">
                <div className="p-3 rounded-xl border border-[#E5E3DC] bg-white">
                  <div className="text-[10px] text-[#737871] font-semibold flex items-center gap-1 mb-0.5">
                    <Clock className="w-3 h-3" />
                    <span>Operating Timings</span>
                  </div>
                  <div className="font-semibold text-[#171916]">{selectedLocation.openingHours}</div>
                </div>

                <div className="p-3 rounded-xl border border-[#E5E3DC] bg-white">
                  <div className="text-[10px] text-[#737871] font-semibold flex items-center gap-1 mb-0.5">
                    <Building className="w-3 h-3" />
                    <span>Accessibility</span>
                  </div>
                  <div className="font-semibold text-[#171916]">{selectedLocation.accessibility}</div>
                </div>
              </div>

              {selectedLocation.contact && (
                <div className="text-[11px] text-[#737871] flex items-center gap-1.5 pt-1">
                  <Phone className="w-3.5 h-3.5 text-[#737871]" />
                  <span>Direct Contact: <strong>{selectedLocation.contact}</strong></span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
