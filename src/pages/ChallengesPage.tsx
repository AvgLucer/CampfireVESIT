import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useEmberEconomy } from '../context/EmberEconomyContext';
import { UserBadgesRow } from '../components/badges/UserBadgesRow';
import { ChallengeCategory } from '../types';
import {
  Trophy,
  Flame,
  CheckCircle2,
  Clock,
  Users,
  Code,
  BookOpen,
  MapPin,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';

export const ChallengesPage: React.FC = () => {
  const {
    user,
    challenges,
    participations,
    leaderboard,
    joinChallenge,
    completeChallenge,
  } = useApp();

  const { equippedBadge } = useEmberEconomy();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [leaderboardTimeframe, setLeaderboardTimeframe] = useState<'weekly' | 'monthly' | 'overall'>('weekly');

  const filteredChallenges = challenges.filter((c) => {
    if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
    return true;
  });

  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    if (leaderboardTimeframe === 'weekly') return b.weeklyPoints - a.weeklyPoints;
    if (leaderboardTimeframe === 'monthly') return b.monthlyPoints - a.monthlyPoints;
    return b.points - a.points;
  });

  const currentUserRank = sortedLeaderboard.findIndex(e => e.userId === user?.userId) + 1;

  const getCategoryIcon = (cat: ChallengeCategory) => {
    switch (cat) {
      case 'coding': return <Code className="w-3.5 h-3.5 text-blue-500" />;
      case 'academics': return <BookOpen className="w-3.5 h-3.5 text-[#F97316]" />;
      case 'campus': return <MapPin className="w-3.5 h-3.5 text-emerald-500" />;
      default: return <Sparkles className="w-3.5 h-3.5 text-purple-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#737871] mb-1">
            <span>First-Year Engineering Cohort</span>
            <span>·</span>
            <span>Idempotent Reward System</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171916] tracking-tight">
            Peer Challenges & Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-[#555952] mt-0.5">
            Compete with classmates, complete study milestones, and maintain attendance streaks.
          </p>
        </div>

        {/* User rank highlight */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#E5E3DC] shadow-xs self-start md:self-auto">
          <div className="w-10 h-10 rounded-xl bg-[#F97316]/10 text-[#F97316] flex items-center justify-center font-bold text-sm">
            #{currentUserRank || 4}
          </div>
          <div>
            <div className="text-xs font-bold text-[#171916]">Current Class Rank</div>
            <div className="text-[11px] text-[#555952] font-mono tabular-nums">
              {user?.challengePoints || 0} pts · {user?.streakDays || 0}-day streak
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Challenges Grid & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Challenge Cards */}
        <div className="lg:col-span-7 space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white border border-[#E5E3DC] rounded-xl text-xs">
            {[
              { id: 'all', label: 'All Challenges' },
              { id: 'coding', label: 'Coding' },
              { id: 'academics', label: 'Academics' },
              { id: 'campus', label: 'Campus' },
              { id: 'daily', label: 'Daily Streaks' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id)}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  categoryFilter === tab.id
                    ? 'bg-[#F97316] text-white shadow-2xs font-bold'
                    : 'text-[#555952] hover:text-[#171916]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredChallenges.map((challenge) => {
              const part = participations.find(p => p.challengeId === challenge.id && p.userId === user?.userId);
              const isCompleted = part?.status === 'completed';
              const isJoined = part?.status === 'joined' || part?.status === 'in_progress';

              return (
                <div
                  key={challenge.id}
                  className={`p-5 rounded-2xl bg-white border transition-all space-y-3 shadow-xs ${
                    isCompleted
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-[#E5E3DC] hover:border-[#F97316]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#FAF9F5] border border-[#E5E3DC] flex items-center justify-center shrink-0 mt-0.5">
                        {getCategoryIcon(challenge.category)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#171916]">{challenge.title}</div>
                        <p className="text-xs text-[#555952] mt-1 leading-relaxed">{challenge.description}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold font-mono text-[#F97316] tabular-nums">
                        +{challenge.pointsReward} pts
                      </span>
                      <div className="text-[10px] text-[#737871] capitalize">{challenge.difficulty}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E5E3DC] text-[11px] text-[#737871]">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {challenge.participantsCount} participants
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {challenge.deadline}
                      </span>
                    </div>

                    <div>
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Completed</span>
                        </span>
                      ) : isJoined ? (
                        <button
                          onClick={() => completeChallenge(challenge.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
                        >
                          Submit & Claim +{challenge.pointsReward} pts
                        </button>
                      ) : (
                        <button
                          onClick={() => joinChallenge(challenge.id)}
                          className="px-3 py-1 bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
                        >
                          Join Challenge
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (5 cols): Live Leaderboard */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#171916] flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Live Class Leaderboard</span>
            </h2>

            {/* Timeframe selector */}
            <div className="flex items-center gap-1 p-0.5 bg-[#FAF9F5] border border-[#E5E3DC] rounded-lg text-[11px]">
              {(['weekly', 'monthly', 'overall'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setLeaderboardTimeframe(tf)}
                  className={`px-2 py-0.5 rounded-md font-semibold capitalize transition-colors cursor-pointer ${
                    leaderboardTimeframe === tf ? 'bg-white text-[#171916] shadow-2xs' : 'text-[#737871]'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E5E3DC] shadow-xs space-y-2">
            {sortedLeaderboard.map((entry, index) => {
              const isUser = entry.userId === user?.userId;
              const pointsToShow =
                leaderboardTimeframe === 'weekly' ? entry.weeklyPoints :
                leaderboardTimeframe === 'monthly' ? entry.monthlyPoints :
                entry.points;

              return (
                <div
                  key={entry.userId}
                  className={`p-3 rounded-xl flex items-center justify-between gap-3 transition-colors ${
                    isUser
                      ? 'bg-[#FFF8F5] border border-[#F97316]/40 font-bold'
                      : 'hover:bg-[#FAF9F5] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 text-center text-xs font-mono font-bold ${
                        index === 0 ? 'text-amber-500 text-sm' :
                        index === 1 ? 'text-slate-400' :
                        index === 2 ? 'text-amber-700' :
                        'text-[#737871]'
                      }`}
                    >
                      {index + 1}
                    </span>

                    <div className="w-8 h-8 rounded-full bg-[#FAF9F5] border border-[#E5E3DC] overflow-hidden flex items-center justify-center text-xs font-bold text-[#F97316] shrink-0">
                      {entry.avatarUrl ? (
                        <img src={entry.avatarUrl} alt={entry.name} className="w-full h-full object-cover" />
                      ) : (
                        entry.name.charAt(0)
                      )}
                    </div>

                    <div>
                      <div className="flex flex-col gap-0.5">
                        <div className="text-xs text-[#171916] flex items-center gap-2">
                          <span className="font-bold">{entry.name}</span>
                          {isUser && (
                            <span className="text-[10px] text-[#F97316] font-normal">(You)</span>
                          )}
                          <UserBadgesRow userId={entry.userId} size="xs" />
                        </div>
                        <div className="text-[10px] text-[#737871] font-normal">
                          {entry.department} · {entry.streakDays}-day streak
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold font-mono text-[#171916] tabular-nums">
                      {pointsToShow} pts
                    </div>
                    <div className="text-[10px] text-[#737871] font-normal">
                      {entry.completedChallenges} completed
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
