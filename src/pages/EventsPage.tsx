import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  XCircle,
  Tag,
  ArrowRight,
  Sparkles,
  Award,
} from 'lucide-react';
import { UserBadgesRow } from '../components/badges/UserBadgesRow';

// Event student coordinator profiles
const EVENT_COORDINATORS: Record<string, { id: string; name: string; role: string }> = {
  evt_01: { id: 'stu_neha_03', name: 'Neha Chawla', role: 'Lead Student Convener' },
  evt_02: { id: 'stu_aarav_vesit_01', name: 'Aarav Sharma', role: 'ACM Tech Lead' },
  evt_03: { id: 'admin_nupur_giri', name: 'Dr. Nupur Giri', role: 'Academic Coordinator' },
  evt_04: { id: 'stu_rohan_14', name: 'Rohan Deshmukh', role: 'Robotics Club Lead' },
};

// Sample registered student classmates per event
const EVENT_ATTENDEES: Record<string, { id: string; name: string }[]> = {
  evt_01: [
    { id: 'stu_aarav_vesit_01', name: 'Aarav Sharma' },
    { id: 'stu_tanvi_32', name: 'Tanvi Kulkarni' },
    { id: 'stu_rohan_14', name: 'Rohan Deshmukh' },
  ],
  evt_02: [
    { id: 'stu_sid_77', name: 'Siddharth Nair' },
    { id: 'stu_tanvi_32', name: 'Tanvi Kulkarni' },
  ],
  evt_03: [
    { id: 'stu_neha_03', name: 'Neha Chawla' },
    { id: 'stu_aarav_vesit_01', name: 'Aarav Sharma' },
  ],
  evt_04: [
    { id: 'stu_kabir_55', name: 'Kabir Mehta' },
    { id: 'stu_sid_77', name: 'Siddharth Nair' },
  ],
};

export const EventsPage: React.FC = () => {
  const { user, events, registrations, registerForEvent, cancelEventRegistration } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Events' },
    { id: 'technical', label: 'Technical & Hackathons' },
    { id: 'academic', label: 'Academics & Mentorship' },
    { id: 'cultural', label: 'Cultural & Music' },
    { id: 'sports', label: 'Sports & Games' },
  ];

  const filteredEvents = events.filter((e) => {
    if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#737871] mb-1">
          <span>Campus Calendar & Hackathons</span>
          <span>·</span>
          <span>VESIT Technical & Cultural Councils</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171916] tracking-tight">
          Campus Events & Hackathons
        </h1>
        <p className="text-xs sm:text-sm text-[#555952] mt-0.5">
          Register for college hackathons, robotics challenges, departmental symposiums, and cultural festivals.
        </p>
      </div>

      {/* Category Tabs */}
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

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((evt) => {
          const isRegistered = registrations.some(
            r => r.eventId === evt.id && r.userId === user?.userId
          );
          const isFull = evt.registeredCount >= evt.maxSeats;
          const remainingSeats = Math.max(0, evt.maxSeats - evt.registeredCount);

          return (
            <div
              key={evt.id}
              className={`p-6 rounded-2xl bg-white border transition-all flex flex-col justify-between gap-4 shadow-xs ${
                isRegistered
                  ? 'border-emerald-200 bg-emerald-50/15'
                  : 'border-[#E5E3DC] hover:border-[#F97316]'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FAF9F5] border border-[#E5E3DC] text-[#555952]">
                    {evt.category}
                  </span>

                  <span className={`text-[11px] font-mono font-semibold ${
                    isFull ? 'text-rose-600' : remainingSeats <= 10 ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {isFull ? 'Sold Out' : `${remainingSeats} seats left`}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#171916] leading-snug">{evt.title}</h3>
                  <div className="text-[11px] text-[#737871] mt-0.5">By {evt.organizer}</div>
                </div>

                {/* Event Lead Coordinator Profile & 5 Badges */}
                {EVENT_COORDINATORS[evt.id] && (
                  <div className="p-2 rounded-xl bg-[#FAF9F5] border border-[#E5E3DC] flex items-center justify-between gap-2 text-xs">
                    <div className="overflow-hidden">
                      <div className="text-[9px] uppercase font-bold text-[#737871]">
                        {EVENT_COORDINATORS[evt.id].role}
                      </div>
                      <div className="font-bold text-[#171916] truncate text-[11px]">
                        {EVENT_COORDINATORS[evt.id].name}
                      </div>
                    </div>
                    <UserBadgesRow userId={EVENT_COORDINATORS[evt.id].id} size="xs" />
                  </div>
                )}

                <p className="text-xs text-[#555952] leading-relaxed line-clamp-3">
                  {evt.description}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-[#E5E3DC] text-xs text-[#555952]">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#F97316] shrink-0" />
                    <span className="font-mono tabular-nums">{evt.dateTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#737871] shrink-0" />
                    <span>{evt.venue}</span>
                  </div>
                </div>

                {/* Classmates Attending & their 5 Profile Badges */}
                {EVENT_ATTENDEES[evt.id] && (
                  <div className="pt-2 border-t border-[#E5E3DC] space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-[#737871]">
                      <span className="font-bold uppercase tracking-wider flex items-center gap-1">
                        <Users className="w-3 h-3 text-[#F97316]" />
                        <span>Classmates Registered</span>
                      </span>
                      <span className="font-mono">{evt.registeredCount} total</span>
                    </div>
                    <div className="space-y-1">
                      {EVENT_ATTENDEES[evt.id].slice(0, 2).map((att) => (
                        <div
                          key={att.id}
                          className="px-2 py-1 rounded-lg bg-[#FAF9F5] border border-[#E5E3DC]/70 flex items-center justify-between gap-2 text-[11px]"
                        >
                          <span className="font-medium text-[#171916] truncate">{att.name}</span>
                          <UserBadgesRow userId={att.id} size="xs" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="pt-2">
                {isRegistered ? (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>RSVP Confirmed</span>
                      </span>
                      <button
                        onClick={() => cancelEventRegistration(evt.id)}
                        className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                      >
                        Cancel RSVP
                      </button>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-emerald-200/60 text-[10px]">
                      <span className="text-emerald-900 font-semibold">Your Profile Badges:</span>
                      <UserBadgesRow userId={user?.userId} size="xs" />
                    </div>
                  </div>
                ) : isFull ? (
                  <button
                    disabled
                    className="w-full py-2 bg-[#FAF9F5] text-[#737871] text-xs font-semibold rounded-xl border border-[#E5E3DC] cursor-not-allowed"
                  >
                    Capacity Full
                  </button>
                ) : (
                  <button
                    onClick={() => registerForEvent(evt.id)}
                    className="w-full py-2.5 bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    1-Click RSVP Registration
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
