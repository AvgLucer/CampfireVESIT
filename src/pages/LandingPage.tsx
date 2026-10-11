import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  GraduationCap,
  Car,
  Trophy,
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  ArrowRight,
  Flame,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { openAuthModal, loginDemoUser, isAuthenticated } = useApp();

  return (
    <div className="flex flex-col min-h-full">
      {/* Hero Section */}
      <section className="relative px-6 py-16 md:py-24 max-w-7xl mx-auto w-full overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF9F5] border border-[#E5E3DC] text-xs font-semibold text-[#555952]">
              <span className="w-2 h-2 rounded-full bg-[#F97316]" />
              <span>Campus360 · GENESIS 2.0 Hackathon Entry</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#171916] leading-[1.1] text-balance">
              College is better when everything comes together<span className="text-[#F97316]">.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#555952] leading-relaxed max-w-xl">
              Your classes, your crew, your next ride, and everything happening on campus. One central place for first-year students to find their way.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="px-6 py-3.5 bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-bold rounded-xl shadow-md shadow-[#F97316]/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Open Your Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <button
                    onClick={openAuthModal}
                    className="px-6 py-3.5 bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-bold rounded-xl shadow-md shadow-[#F97316]/20 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={loginDemoUser}
                    className="px-6 py-3.5 bg-white hover:bg-[#FAF9F5] text-[#171916] border border-[#D7D4CB] text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Explore Demo as First-Year Student
                  </button>
                </>
              )}
            </div>

            {/* Trust statement */}
            <div className="flex items-center gap-3 pt-4 text-xs text-[#737871]">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Built for verified campus communities · Mumbai University credit models · Zero spam carpooling</span>
            </div>
          </div>

          {/* Right Column: Custom Visual Composition of Interconnected Cards around glowing central Campfire symbol */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md w-full aspect-square flex items-center justify-center">
              {/* Decorative radial ambient glow */}
              <div className="absolute inset-0 bg-radial from-[#F97316]/15 via-transparent to-transparent rounded-full filter blur-2xl" />

              {/* Central Glowing Campfire Core */}
              <div className="relative z-10 w-24 h-24 rounded-2xl bg-[#171916] border-2 border-[#F97316] flex flex-col items-center justify-center shadow-xl shadow-[#F97316]/30 text-white animate-pulse">
                <Flame className="w-10 h-10 text-[#F97316]" />
                <span className="text-[10px] font-bold tracking-wider uppercase mt-1 text-[#F97316]">
                  CAMPFIRE
                </span>
              </div>

              {/* Orbital Satellite Card 1: Today's Lecture (Top Left) */}
              <div className="absolute top-2 left-2 z-20 w-48 p-3 rounded-xl bg-white border border-[#E5E3DC] shadow-lg shadow-black/5 animate-in fade-in slide-in-from-top-4">
                <div className="flex items-center justify-between text-[10px] text-[#737871] mb-1">
                  <span className="font-semibold text-emerald-700">Next Lecture · 10:15 AM</span>
                  <Clock className="w-3 h-3 text-[#737871]" />
                </div>
                <div className="text-xs font-bold text-[#171916]">C++ Lab (FEC205)</div>
                <div className="text-[11px] text-[#555952]">Lab 402 · Dr. Nupur Giri</div>
              </div>

              {/* Orbital Satellite Card 2: Academic SGPA (Top Right) */}
              <div className="absolute top-4 right-2 z-20 w-44 p-3 rounded-xl bg-white border border-[#E5E3DC] shadow-lg shadow-black/5 animate-in fade-in slide-in-from-right-4">
                <div className="text-[10px] text-[#737871] font-semibold">Projected SGPA</div>
                <div className="text-xl font-extrabold font-mono text-[#F97316] mt-0.5 tabular-nums">
                  8.82 <span className="text-xs font-normal text-[#555952]">/ 10</span>
                </div>
                <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Target: 8.5+ Feasible</div>
              </div>

              {/* Orbital Satellite Card 3: Carpool Ride (Bottom Left) */}
              <div className="absolute bottom-4 left-0 z-20 w-52 p-3 rounded-xl bg-white border border-[#E5E3DC] shadow-lg shadow-black/5 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-1.5 text-[10px] text-[#737871] mb-1">
                  <Car className="w-3 h-3 text-[#F97316]" />
                  <span>Carpool Available</span>
                </div>
                <div className="text-xs font-bold text-[#171916]">Ghatkopar ➔ VESIT</div>
                <div className="text-[11px] text-[#555952] mt-0.5 flex justify-between">
                  <span>08:15 AM · Priya (FE)</span>
                  <span className="font-semibold text-[#F97316]">2 seats</span>
                </div>
              </div>

              {/* Orbital Satellite Card 4: Peer Challenge (Bottom Right) */}
              <div className="absolute bottom-2 right-0 z-20 w-48 p-3 rounded-xl bg-white border border-[#E5E3DC] shadow-lg shadow-black/5 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center gap-1.5 text-[10px] text-[#737871] mb-1">
                  <Trophy className="w-3 h-3 text-amber-500" />
                  <span>Peer Challenge</span>
                </div>
                <div className="text-xs font-bold text-[#171916]">C++ Dynamic Memory</div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">+80 points reward</div>
              </div>

              {/* Connecting Geometric SVG Web Rings */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" stroke="#E5E3DC" strokeWidth="1.2" strokeDasharray="4 4">
                <circle cx="50%" cy="50%" r="38%" fill="none" />
                <circle cx="50%" cy="50%" r="22%" fill="none" />
                <line x1="50%" y1="50%" x2="25%" y2="20%" />
                <line x1="50%" y1="50%" x2="78%" y2="22%" />
                <line x1="50%" y1="50%" x2="20%" y2="80%" />
                <line x1="50%" y1="50%" x2="80%" y2="78%" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Modules Feature Grid */}
      <section className="px-6 py-16 bg-white border-t border-[#E5E3DC]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171916] tracking-tight">
              One Operating System for Campus Life
            </h2>
            <p className="text-sm text-[#555952] leading-relaxed">
              Engineered so first-year students spend less time scrambling for directions, notes, and rides, and more time enjoying university.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Academics */}
            <div className="p-6 rounded-2xl bg-[#FAF9F5] border border-[#E5E3DC] space-y-3 hover:border-[#D7D4CB] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#F97316] flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#171916]">Academics & SGPA Simulator</h3>
              <p className="text-xs text-[#555952] leading-relaxed">
                Configure subjects, credits, and IA marks. Mathematically calculate what score is needed in final exams and visibly lock unachievable grades.
              </p>
              <div className="text-[11px] font-semibold text-[#F97316] flex items-center gap-1 pt-1">
                <span>Weighted credit calculation</span>
              </div>
            </div>

            {/* 2. Carpooling */}
            <div className="p-6 rounded-2xl bg-[#FAF9F5] border border-[#E5E3DC] space-y-3 hover:border-[#D7D4CB] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Car className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#171916]">Student Carpool Discovery</h3>
              <p className="text-xs text-[#555952] leading-relaxed">
                Connect with verified classmates traveling to and from campus. Interactive Leaflet map with anti-overbooking seat management.
              </p>
              <div className="text-[11px] font-semibold text-blue-600 flex items-center gap-1 pt-1">
                <span>Safe student carpooling</span>
              </div>
            </div>

            {/* 3. Challenges */}
            <div className="p-6 rounded-2xl bg-[#FAF9F5] border border-[#E5E3DC] space-y-3 hover:border-[#D7D4CB] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#171916]">Peer Challenges & Leaderboard</h3>
              <p className="text-xs text-[#555952] leading-relaxed">
                Participate in coding problems, campus explorations, and study streaks. Idempotent points ensure competitive integrity.
              </p>
              <div className="text-[11px] font-semibold text-amber-600 flex items-center gap-1 pt-1">
                <span>Live class competition</span>
              </div>
            </div>

            {/* 4. Campus Guide */}
            <div className="p-6 rounded-2xl bg-[#FAF9F5] border border-[#E5E3DC] space-y-3 hover:border-[#D7D4CB] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#171916]">Interactive Campus Directory</h3>
              <p className="text-xs text-[#555952] leading-relaxed">
                Never get lost looking for Lab 402 or the First-Aid room. Floor guides, opening hours, accessibility notes, and lecture classroom links.
              </p>
              <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 pt-1">
                <span>Direct classroom navigation</span>
              </div>
            </div>

            {/* 5. Campus Events */}
            <div className="p-6 rounded-2xl bg-[#FAF9F5] border border-[#E5E3DC] space-y-3 hover:border-[#D7D4CB] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#171916]">Hackathons & Campus Events</h3>
              <p className="text-xs text-[#555952] leading-relaxed">
                Discover technical hackathons like Genesis 2.0, cultural fests, and robotics showcases. 1-click RSVP with real venue seat tracking.
              </p>
              <div className="text-[11px] font-semibold text-purple-600 flex items-center gap-1 pt-1">
                <span>RSVP with capacity guards</span>
              </div>
            </div>

            {/* 6. Peer Learning */}
            <div className="p-6 rounded-2xl bg-[#FAF9F5] border border-[#E5E3DC] space-y-3 hover:border-[#D7D4CB] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#171916]">Time-Credit Peer Mentorship</h3>
              <p className="text-xs text-[#555952] leading-relaxed">
                Teach a classmate to earn study time credits; spend credits to get tutoring on difficult mathematics or programming subjects.
              </p>
              <div className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 pt-1">
                <span>Double-entry ledger model</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto px-6 py-8 border-t border-[#E5E3DC] bg-[#FAF9F5] text-xs text-[#737871]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#171916]">Campfire.</span>
            <span>·</span>
            <span>GENESIS 2.0 Hackathon Entry · Problem Statement PS-02</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={openAuthModal} className="hover:text-[#171916] transition-colors cursor-pointer">
              MiniMoth OTP Login
            </button>
            <button onClick={loginDemoUser} className="hover:text-[#171916] transition-colors cursor-pointer">
              Launch Demo Baseline
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
