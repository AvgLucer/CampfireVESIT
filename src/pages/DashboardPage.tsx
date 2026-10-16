import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useEmberEconomy } from '../context/EmberEconomyContext';
import { EmberToken } from '../components/common/EmberToken';
import { BadgeArtwork } from '../components/badges/BadgeArtwork';
import { UserBadgesRow } from '../components/badges/UserBadgesRow';
import { calculateSemesterSgpa } from '../utils/academicCalculations';
import {
  Clock,
  MapPin,
  Calendar,
  Car,
  Trophy,
  Users,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  ShieldCheck,
  Zap,
  Edit3,
  Building,
  UserCheck,
  Box,
  Layers,
  Award,
  Gift,
  Radio,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    user,
    lectures,
    subjects,
    rides,
    dailyUpdates,
    challenges,
    events,
    learningSessions,
    focusLocationOnMap,
    allProfiles,
    switchProfile,
    openProfileSwitcher,
    openStatusModal,
  } = useApp();

  const {
    economy,
    equippedBadge,
    isDailyRewardAvailable,
    dailyRewardCountdown,
    claimDailyReward,
    isDailyCrateAvailable,
    dailyCrateCountdown,
    openWalletModal,
    completionPercentage,
  } = useEmberEconomy();

  const [feedFilter, setFeedFilter] = useState<'all' | 'rides' | 'learning' | 'updates'>('all');

  // Academic calculation
  const sgpaSummary = calculateSemesterSgpa(subjects);

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const nextLecture = lectures.find(l => l.status === 'in_progress') || lectures.find(l => l.status === 'upcoming') || lectures[0];
  const isAdmin = user?.role === 'admin';

  const handleNavigateToLectureClassroom = (locationId?: string) => {
    if (locationId) {
      focusLocationOnMap(locationId);
      navigate('/campus');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Contextual Greeting & Daily Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[#E5E3DC] shadow-xs">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#737871]">
            <span>{dateFormatted}</span>
            <span>·</span>
            <span>{user?.college || 'VESIT Chembur'}</span>
            <span>·</span>
            <span className="text-emerald-700 flex items-center gap-1 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              {isAdmin ? 'Academic Council Administrator' : 'Verified Student'}
            </span>
          </div>

          <div className="flex flex-wrap items-baseline gap-2 pt-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171916] tracking-tight">
              {isAdmin ? 'Welcome,' : 'Good morning,'} {user?.name || 'Student'}
            </h1>
            <span className="text-sm font-mono font-bold text-[#F97316]">
              {user?.username}
            </span>
            {isAdmin && (
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#171916] text-[#F97316] uppercase tracking-wider">
                Admin Profile
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-[#555952]">
            {isAdmin
              ? 'Institutional administration mode: monitoring student cohorts, academics, and carpool transit.'
              : `Your campus, all in one place. You have ${lectures.filter(l => l.status !== 'completed').length} sessions scheduled today.`}
          </p>

          {/* Student Status Message (Max 60 letters) with Edit Action */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF9F5] border border-[#E5E3DC] text-xs text-[#20231F] shadow-2xs">
              <span className="text-sm">💬</span>
              <span className="font-medium italic truncate max-w-[240px] sm:max-w-md">
                &ldquo;{user?.statusMessage || 'Prepping for C++ lab & Genesis Hackathon 🚀'}&rdquo;
              </span>
              <button
                onClick={openStatusModal}
                className="text-[11px] font-bold text-[#F97316] hover:underline flex items-center gap-1 shrink-0 ml-1 cursor-pointer"
                title="Edit 60-character status"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit Status</span>
              </button>
            </div>

            <button
              onClick={openProfileSwitcher}
              className="px-2.5 py-1.5 rounded-xl border border-[#D7D4CB] hover:border-[#F97316] bg-white text-xs font-semibold text-[#171916] hover:bg-[#FFF8F5] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Users className="w-3.5 h-3.5 text-[#F97316]" />
              <span>Switch Profile</span>
            </button>

            {/* Student's 5 Profile Badges */}
            <div className="flex items-center gap-1.5 pl-1">
              <UserBadgesRow userId={user?.userId} size="xs" />
            </div>
          </div>
        </div>

        {/* Quick Target Indicator */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-xl bg-[#FAF9F5] border border-[#E5E3DC]">
            <div className="text-[10px] font-semibold text-[#737871] uppercase tracking-wider">
              Projected SGPA
            </div>
            <div className="text-xl font-bold font-mono text-[#F97316] tabular-nums mt-0.5">
              {sgpaSummary.projectedSgpa.toFixed(2)}{' '}
              <span className="text-xs font-normal text-[#555952]">/ 10</span>
            </div>
          </div>

          <div className="px-4 py-2.5 rounded-xl bg-[#FAF9F5] border border-[#E5E3DC]">
            <div className="text-[10px] font-semibold text-[#737871] uppercase tracking-wider">
              Time Credits
            </div>
            <div className="text-xl font-bold font-mono text-[#171916] tabular-nums mt-0.5">
              {user?.timeCredits || 0}{' '}
              <span className="text-xs font-normal text-[#555952]">hrs</span>
            </div>
          </div>
        </div>
      </div>

      {/* ADMIN COHORT MANAGEMENT PANEL (Visible when logged in as Admin) */}
      {isAdmin && (
        <div className="p-6 rounded-2xl bg-[#171916] text-white border border-neutral-800 shadow-md space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F97316] text-white flex items-center justify-center font-bold">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  Academic Council & Faculty Administration View
                </h2>
                <div className="text-xs text-neutral-400">
                  VESIT First-Year Engineering Cohort 2026 Management
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/updates?tab=admin"
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Moderation Desk ({dailyUpdates.filter(u => u.status === 'pending').length} pending)</span>
              </Link>
              <button
                onClick={openProfileSwitcher}
                className="px-3.5 py-2 bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Simulate Student Profiles ({allProfiles.filter(p => p.role !== 'admin').length})</span>
              </button>
            </div>
          </div>

          {/* Quick Institutional Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
              <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                Total Enrolled
              </div>
              <div className="text-xl font-mono font-bold text-[#F97316] mt-0.5">
                1,420
              </div>
              <div className="text-[10px] text-neutral-500 mt-0.5">First Year Batch 2026</div>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
              <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                Department Avg SGPA
              </div>
              <div className="text-xl font-mono font-bold text-white mt-0.5">
                8.42 <span className="text-xs text-neutral-400">/ 10</span>
              </div>
              <div className="text-[10px] text-emerald-400 mt-0.5">+0.31 vs Sem I</div>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
              <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                Daily Carpool Rides
              </div>
              <div className="text-xl font-mono font-bold text-white mt-0.5">
                28
              </div>
              <div className="text-[10px] text-neutral-500 mt-0.5">0 incident reports</div>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
              <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                Verified Roster
              </div>
              <div className="text-xl font-mono font-bold text-emerald-400 mt-0.5">
                99.4%
              </div>
              <div className="text-[10px] text-neutral-500 mt-0.5">Institutional ID linked</div>
            </div>
          </div>

          {/* Student Roster Table for Admin Simulation */}
          <div>
            <div className="text-xs font-bold text-neutral-300 mb-2 flex items-center justify-between">
              <span>Quick Student Inspection Roster:</span>
              <span className="text-[11px] text-neutral-500 font-normal">Click any student to switch into their profile</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {allProfiles.filter(p => p.role !== 'admin').map((stu) => (
                <div
                  key={stu.userId}
                  onClick={() => switchProfile(stu)}
                  className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-[#F97316] transition-all cursor-pointer flex items-center justify-between gap-2"
                >
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-white truncate">{stu.name}</div>
                    <div className="text-[10px] font-mono text-[#F97316] truncate">{stu.username}</div>
                    <div className="text-[9px] text-neutral-400 truncate italic">&ldquo;{stu.statusMessage}&rdquo;</div>
                  </div>
                  <span className="text-[10px] font-semibold text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded shrink-0">
                    {stu.year.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION C: "Your Next Move" Contextual Recommendations Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#FFF8F5] via-[#FFFBF9] to-white border border-[#F97316]/30 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#F97316]/10 text-[#F97316] flex items-center justify-center shrink-0 mt-0.5">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#171916] flex items-center gap-1.5">
                <span>Your Next Move</span>
                <span className="text-[10px] font-normal text-[#737871]">· Contextual Assistant</span>
              </div>
              <p className="text-xs text-[#555952] mt-0.5">
                {nextLecture.status === 'in_progress' ? (
                  <>You are in <strong>{nextLecture.subjectName}</strong> in {nextLecture.room}. Next up: Basic Electrical Engineering at 01:15 PM.</>
                ) : (
                  <>Next lecture <strong>{nextLecture.subjectName}</strong> begins at {nextLecture.startTime} in {nextLecture.room}.</>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {nextLecture.locationId && (
              <button
                onClick={() => handleNavigateToLectureClassroom(nextLecture.locationId)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-[#E5E3DC] text-[#171916] hover:bg-[#FAF9F5] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <MapPin className="w-3.5 h-3.5 text-[#F97316]" />
                <span>Locate Room</span>
              </button>
            )}
            <Link
              to="/rides"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#F97316] text-white hover:bg-[#EA580C] transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
            >
              <span>Carpool Home</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* COMPACT EMBER ECONOMY & BADGE SHOWCASE PANEL (Requested) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#E5E3DC] shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Section 1: EMBER Balance & Claim Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={openWalletModal}
              className="p-3.5 rounded-2xl bg-[#FFF8F5] border border-orange-200/80 hover:border-[#F97316] transition-colors text-left cursor-pointer shadow-2xs"
              title="Click to view full EMBER transaction history"
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#737871]">
                EMBER Vault
              </div>
              <div className="mt-1">
                <EmberToken amount={economy.emberBalance} size="lg" />
              </div>
            </button>

            <div className="space-y-1">
              <div className="text-xs font-extrabold text-[#171916]">
                24H Activity Reward
              </div>
              {isDailyRewardAvailable ? (
                <button
                  onClick={claimDailyReward}
                  className="py-1.5 px-3 bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer animate-pulse"
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>Claim 5 EMBER</span>
                </button>
              ) : (
                <div className="text-[11px] text-[#737871] font-mono flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Next reward in <strong>{dailyRewardCountdown}</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Daily Crate Status */}
          <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#E5E3DC] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base shrink-0">
              📦
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-[#737871]">
                Daily Badge Crate
              </div>
              {isDailyCrateAvailable ? (
                <Link
                  to="/crates"
                  className="text-xs font-extrabold text-emerald-700 hover:underline flex items-center gap-1 mt-0.5"
                >
                  <span>Ready to Open (Free!)</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              ) : (
                <div className="text-xs font-mono font-bold text-[#EA580C] mt-0.5">
                  Cooldown: {dailyCrateCountdown}
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Featured Profile Badge & Collection Summary */}
          <div className="flex items-center gap-3.5 border-t lg:border-t-0 lg:border-l border-[#E5E3DC] pt-3 lg:pt-0 lg:pl-5">
            <div className="shrink-0">
              {equippedBadge ? (
                <BadgeArtwork badge={equippedBadge} size="md" />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-300 flex items-center justify-center text-[#737871]">
                  <Award className="w-5 h-5" />
                </div>
              )}
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-[#737871]">
                Featured Badge ({economy.ownedBadgeIds.length}/75)
              </div>
              <div className="text-xs font-extrabold text-[#171916] truncate max-w-[140px]">
                {equippedBadge ? equippedBadge.name : 'None Equipped'}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <Link
                  to="/badges"
                  className="text-[11px] font-bold text-[#F97316] hover:underline"
                >
                  Browse Collection ({completionPercentage}%)
                </Link>
                <span>·</span>
                <Link
                  to="/crates"
                  className="text-[11px] font-bold text-[#555952] hover:text-[#171916]"
                >
                  Crate Shop
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Discovery item (if available) */}
        {economy.openingHistory.length > 0 && (
          <div className="pt-3 border-t border-[#E5E3DC] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#555952]">
              <span className="text-[11px] font-bold text-[#737871]">Recent Discovery:</span>
              <span className="font-bold text-[#171916] flex items-center gap-1">
                <span>{economy.openingHistory[0].badge.name}</span>
                <span className="text-[10px] text-[#F97316]">({economy.openingHistory[0].badge.rarity})</span>
              </span>
              {economy.openingHistory[0].isDuplicate && (
                <span className="text-[10px] font-mono text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded font-bold">
                  +{economy.openingHistory[0].compensation} EMBER
                </span>
              )}
            </div>

            <Link
              to="/crates"
              className="text-[11px] font-bold text-[#F97316] hover:underline flex items-center gap-1"
            >
              <span>Open More Crates</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}
      </div>

      {/* Main 2-Column Split: Today's Schedule & Academic Pulse */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Today's Lecture Schedule */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#171916] tracking-tight">Today's Schedule</h2>
              <div className="text-xs text-[#737871]">Monday Lecture & Lab Timetable</div>
            </div>
            <Link
              to="/campus"
              className="text-xs font-semibold text-[#F97316] hover:underline flex items-center gap-1"
            >
              <span>Campus Map</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {lectures.map((lecture, idx) => {
              const isCurrent = lecture.status === 'in_progress';
              const isCompleted = lecture.status === 'completed';

              return (
                <div
                  key={lecture.id}
                  onClick={() => handleNavigateToLectureClassroom(lecture.locationId)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-white border-[#F97316] shadow-sm shadow-[#F97316]/10'
                      : isCompleted
                      ? 'bg-[#FAF9F5]/70 border-[#E5E3DC] opacity-75'
                      : 'bg-white border-[#E5E3DC] hover:border-[#D7D4CB]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {/* Timeline status indicator */}
                      <div className="flex flex-col items-center mt-0.5">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            isCurrent
                              ? 'bg-[#F97316] ring-4 ring-[#F97316]/20'
                              : isCompleted
                              ? 'bg-emerald-500'
                              : 'bg-[#D7D4CB]'
                          }`}
                        />
                        {idx !== lectures.length - 1 && (
                          <div className="w-0.5 h-12 bg-[#E5E3DC] mt-1" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#171916]">{lecture.subjectName}</span>
                          <span className="text-[10px] font-mono text-[#737871]">({lecture.subjectCode})</span>
                          {isCurrent && (
                            <span className="text-[10px] font-bold text-[#F97316] uppercase tracking-wide">
                              In Progress
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-[#555952] mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="flex items-center gap-1 font-mono tabular-nums">
                            <Clock className="w-3 h-3 text-[#737871]" />
                            {lecture.startTime} – {lecture.endTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#F97316]" />
                            {lecture.room} · {lecture.building}
                          </span>
                        </div>

                        <div className="text-[11px] text-[#737871] mt-1">
                          Faculty: {lecture.faculty}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-medium text-[#F97316] hover:underline flex items-center gap-0.5">
                        <span>Directions</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (5 cols): Academic Pulse & Performance */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#171916] tracking-tight">Academic Pulse</h2>
              <div className="text-xs text-[#737871]">Calculated Semester Estimates</div>
            </div>
            <Link
              to="/academics"
              className="text-xs font-semibold text-[#F97316] hover:underline flex items-center gap-1"
            >
              <span>Planner</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E5E3DC] shadow-xs space-y-5">
            {/* Top metrics bar */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[#E5E3DC]">
              <div>
                <div className="text-[11px] text-[#737871] font-semibold">Total Credits</div>
                <div className="text-xl font-extrabold font-mono text-[#171916] tabular-nums mt-0.5">
                  {sgpaSummary.totalCredits} Credits
                </div>
                <div className="text-[10px] text-emerald-600 mt-0.5">6 Core Engineering Courses</div>
              </div>

              <div>
                <div className="text-[11px] text-[#737871] font-semibold">Passing Feasibility</div>
                <div className="text-xl font-extrabold font-mono text-emerald-600 tabular-nums mt-0.5">
                  100%
                </div>
                <div className="text-[10px] text-[#555952] mt-0.5">All subjects clear to pass</div>
              </div>
            </div>

            {/* Subject summary breakdown */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-[#171916]">Current Subject Standing</div>
              {sgpaSummary.subjectAnalyses.slice(0, 4).map((item) => (
                <div key={item.subject.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#20231F] truncate max-w-[200px]">
                      {item.subject.name}
                    </span>
                    <span className="font-mono font-bold text-[#F97316] tabular-nums">
                      {item.currentPercentage.toFixed(0)}% (Grade {item.currentGrade})
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-[#FAF9F5] rounded-full overflow-hidden border border-[#E5E3DC]">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, item.currentPercentage)}%`,
                        backgroundColor: item.subject.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/academics"
              className="block w-full text-center py-2 px-3 rounded-lg bg-[#FAF9F5] hover:bg-[#F2EFE9] text-xs font-semibold text-[#171916] border border-[#E5E3DC] transition-colors"
            >
              Open What-If SGPA Simulator
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION D: Quick Actions */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-[#171916] tracking-tight">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Link
            to="/academics"
            className="p-3.5 rounded-xl bg-white border border-[#E5E3DC] hover:border-[#F97316] transition-all flex flex-col gap-2 group shadow-2xs"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#F97316] flex items-center justify-center group-hover:scale-105 transition-transform">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#171916]">Calculate SGPA</div>
              <div className="text-[10px] text-[#737871]">Simulate final exams</div>
            </div>
          </Link>

          <Link
            to="/rides"
            className="p-3.5 rounded-xl bg-white border border-[#E5E3DC] hover:border-[#F97316] transition-all flex flex-col gap-2 group shadow-2xs"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#F97316] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#171916]">Kurla Carpool</div>
              <div className="text-[10px] text-[#737871]">₹30 / ₹45 split</div>
            </div>
          </Link>

          <Link
            to="/learning"
            className="p-3.5 rounded-xl bg-white border border-[#E5E3DC] hover:border-purple-500 transition-all flex flex-col gap-2 group shadow-2xs"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#171916]">1-on-1 Whiteboard</div>
              <div className="text-[10px] text-[#737871]">Peer Learning Rooms</div>
            </div>
          </Link>

          <Link
            to="/campus"
            className="p-3.5 rounded-xl bg-white border border-[#E5E3DC] hover:border-emerald-500 transition-all flex flex-col gap-2 group shadow-2xs"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#171916]">Find Classroom</div>
              <div className="text-[10px] text-[#737871]">Interactive map</div>
            </div>
          </Link>

          <Link
            to="/badges"
            className="p-3.5 rounded-xl bg-white border border-[#E5E3DC] hover:border-[#F97316] transition-all flex flex-col gap-2 group shadow-2xs"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#F97316] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#171916]">Badge Collection</div>
              <div className="text-[10px] text-[#737871]">{economy.ownedBadgeIds.length} of 75 unlocked</div>
            </div>
          </Link>

          <Link
            to="/crates"
            className="p-3.5 rounded-xl bg-white border border-[#E5E3DC] hover:border-emerald-500 transition-all flex flex-col gap-2 group shadow-2xs"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Box className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#171916]">Crate Shop</div>
              <div className="text-[10px] text-[#737871]">Daily free drops</div>
            </div>
          </Link>

          <Link
            to="/learning"
            className="p-3.5 rounded-xl bg-white border border-[#E5E3DC] hover:border-rose-500 transition-all flex flex-col gap-2 group shadow-2xs"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#171916]">Study Session</div>
            </div>
          </Link>

          <Link
            to="/updates"
            className="p-3.5 rounded-xl bg-white border border-[#E5E3DC] hover:border-[#F97316] transition-all flex flex-col gap-2 group shadow-2xs"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#F97316] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Radio className="w-4 h-4 animate-pulse text-[#F97316]" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#171916]">Daily Updates</div>
              <div className="text-[10px] text-[#737871]">Live campus bulletin</div>
            </div>
          </Link>

          <Link
            to="/faculty"
            className="p-3.5 rounded-xl bg-white border border-[#E5E3DC] hover:border-[#8B5CF6] transition-all flex flex-col gap-2 group shadow-2xs"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-[#8B5CF6] flex items-center justify-center group-hover:scale-105 transition-transform">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#171916]">Faculty Info</div>
              <div className="text-[10px] text-[#737871]">Contacts & availability</div>
            </div>
          </Link>
        </div>
      </div>

      {/* CAMPUS DAILY UPDATES SPOTLIGHT */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-orange-50/60 via-white to-amber-50/40 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-900 border border-[#E5E3DC] dark:border-neutral-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-[#F97316] flex items-center justify-center font-bold">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#171916] dark:text-neutral-100 flex items-center gap-2">
                <span>Campus Daily Updates Bulletin</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/80 text-[#F97316] font-bold">
                  LIVE
                </span>
              </h2>
              <div className="text-xs text-[#737871] dark:text-neutral-400">
                Active announcements, hackathons, lost items & opportunities
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/updates"
              className="text-xs font-bold px-3 py-1.5 rounded-xl border border-[#E5E3DC] dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-[#F97316] text-[#171916] dark:text-neutral-200 transition-colors"
            >
              + Host an Update
            </Link>
            <Link
              to="/updates"
              className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white transition-colors flex items-center gap-1 shadow-xs"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 2-Column Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dailyUpdates
            .filter((u) => u.status === 'approved' && new Date(u.expiresAt) > new Date())
            .slice(0, 2)
            .map((upd) => (
              <Link
                key={upd.id}
                to="/updates"
                className="p-4 rounded-2xl bg-white dark:bg-neutral-800/80 border border-[#E5E3DC] dark:border-neutral-700 hover:border-[#F97316] transition-all flex items-start gap-3.5 group shadow-2xs"
              >
                <img
                  src={upd.coverImageUrl}
                  alt={upd.title}
                  className="w-16 h-16 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#F97316]">
                      {upd.category}
                    </span>
                    <span className="text-[10px] text-[#737871] font-mono">
                      Expires {new Date(upd.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#171916] dark:text-neutral-100 group-hover:text-[#F97316] transition-colors line-clamp-1">
                    {upd.title}
                  </h4>
                  <p className="text-[11px] text-[#555952] dark:text-neutral-400 line-clamp-1">
                    {upd.description}
                  </p>
                  {upd.customFields && upd.customFields.length > 0 && (
                    <div className="pt-1 flex items-center gap-2 text-[10px] text-[#737871]">
                      <span className="font-semibold text-[#171916] dark:text-neutral-200">
                        {upd.customFields[0].label}: {String(upd.customFields[0].value)}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
        </div>
      </div>

      {/* SECTION E: Campus Activity Feed */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-[#171916] tracking-tight">Campus Activity Feed</h2>
            <div className="text-xs text-[#737871]">Real-time updates across carpools, 1-on-1 study rooms, and announcements</div>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#FAF9F5] border border-[#E5E3DC] rounded-xl">
            <button
              onClick={() => setFeedFilter('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                feedFilter === 'all' ? 'bg-white text-[#171916] shadow-2xs' : 'text-[#737871] hover:text-[#171916]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFeedFilter('rides')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                feedFilter === 'rides' ? 'bg-white text-[#171916] shadow-2xs' : 'text-[#737871] hover:text-[#171916]'
              }`}
            >
              Rides
            </button>
            <button
              onClick={() => setFeedFilter('learning')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                feedFilter === 'learning' ? 'bg-white text-[#171916] shadow-2xs' : 'text-[#737871] hover:text-[#171916]'
              }`}
            >
              1-on-1 Rooms
            </button>
            <button
              onClick={() => setFeedFilter('updates')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                feedFilter === 'updates' ? 'bg-white text-[#171916] shadow-2xs' : 'text-[#737871] hover:text-[#171916]'
              }`}
            >
              Daily Updates
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Feed Card 1: Rides */}
          {(feedFilter === 'all' || feedFilter === 'rides') && (
            <div className="p-4 rounded-xl bg-white border border-[#E5E3DC] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#171916] flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-blue-600" />
                  <span>Carpool Available</span>
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">2 Seats Open</span>
              </div>
              <div>
                <div className="text-xs font-bold text-[#171916]">{rides[0]?.origin} ➔ VESIT</div>
                <div className="text-[11px] text-[#555952] mt-0.5">
                  Hosted by {rides[0]?.driverName} · Departure: {rides[0]?.departureTime}
                </div>
              </div>
              <Link
                to="/rides"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#F97316] hover:underline pt-1"
              >
                <span>View & Request Seat</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Feed Card 2: 1-on-1 Peer Learning Rooms */}
          {(feedFilter === 'all' || feedFilter === 'learning') && (
            <div className="p-4 rounded-xl bg-white border border-[#E5E3DC] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#171916] flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>1-on-1 Study Room</span>
                </span>
                <span className="text-[10px] text-purple-600 font-semibold">Live Whiteboard</span>
              </div>
              <div>
                <div className="text-xs font-bold text-[#171916]">Interactive Collaborative Whiteboard</div>
                <div className="text-[11px] text-[#555952] mt-0.5">
                  Create a room, share a 6-character PIN, and draw together in real time.
                </div>
              </div>
              <Link
                to="/learning"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#F97316] hover:underline pt-1"
              >
                <span>Launch / Join Room</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Feed Card 3: Daily Campus Updates */}
          {(feedFilter === 'all' || feedFilter === 'updates') && (
            <div className="p-4 rounded-xl bg-white border border-[#E5E3DC] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#171916] flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-orange-600" />
                  <span>Campus Daily Updates</span>
                </span>
                <span className="text-[10px] text-orange-600 font-semibold">Verified</span>
              </div>
              <div>
                <div className="text-xs font-bold text-[#171916]">{dailyUpdates[0]?.title || 'Campus Announcements'}</div>
                <div className="text-[11px] text-[#555952] mt-0.5 line-clamp-1">
                  {dailyUpdates[0]?.description || 'Check verified campus opportunities & updates.'}
                </div>
              </div>
              <Link
                to="/updates"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#F97316] hover:underline pt-1"
              >
                <span>Browse Campus Feed</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
