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
} from 'lucide-react';

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
              </div>

              {/* Action */}
              <div className="pt-2">
                {isRegistered ? (
                  <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-emerald-50 border border-emerald-200">
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
