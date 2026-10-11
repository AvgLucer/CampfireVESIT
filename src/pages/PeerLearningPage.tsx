import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Coins,
  Clock,
  MapPin,
  CheckCircle2,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';

export const PeerLearningPage: React.FC = () => {
  const {
    user,
    learningSessions,
    creditTransactions,
    createLearningSession,
    joinLearningSession,
    completeLearningSession,
  } = useApp();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [subjectCode, setSubjectCode] = useState('FEC205');
  const [skillLevel, setSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [dateTime, setDateTime] = useState('Today, 05:30 PM');
  const [venue, setVenue] = useState('Central Library Discussion Room 2B');
  const [maxParticipants, setMaxParticipants] = useState(4);

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;

    createLearningSession({
      topic,
      subjectCode,
      skillLevel,
      durationMinutes: Number(durationMinutes),
      dateTime,
      venue,
      maxParticipants: Number(maxParticipants),
      creditsReward: 1,
    });

    setIsCreateModalOpen(false);
    setTopic('');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#737871] mb-1">
            <span>VESIT Student Knowledge Exchange</span>
            <span>·</span>
            <span>Time-Credit Ledger Protocol</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171916] tracking-tight">
            Peer Learning & Time Credits
          </h1>
          <p className="text-xs sm:text-sm text-[#555952] mt-0.5">
            Teach what you know to earn study time credits; spend credits to learn difficult engineering concepts.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Host a Study Session</span>
        </button>
      </div>

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#E5E3DC] shadow-xs">
          <div className="text-[11px] font-semibold text-[#737871] flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            <span>Available Balance</span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-[#171916] tabular-nums mt-1">
            {user?.timeCredits || 0}{' '}
            <span className="text-xs font-normal text-[#555952]">Hours</span>
          </div>
          <div className="text-[10px] text-emerald-600 mt-1">Verified student credit allowance</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E5E3DC] shadow-xs">
          <div className="text-[11px] font-semibold text-[#737871]">Sessions Completed</div>
          <div className="text-3xl font-extrabold font-mono text-[#171916] tabular-nums mt-1">
            2{' '}
            <span className="text-xs font-normal text-[#555952]">Sessions</span>
          </div>
          <div className="text-[10px] text-[#555952] mt-1">+2 Credits earned teaching C++ & Math</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E5E3DC] shadow-xs">
          <div className="text-[11px] font-semibold text-[#737871]">Study Network</div>
          <div className="text-3xl font-extrabold font-mono text-[#171916] tabular-nums mt-1">
            18{' '}
            <span className="text-xs font-normal text-[#555952]">Classmates</span>
          </div>
          <div className="text-[10px] text-[#555952] mt-1">Active peer tutors across FE departments</div>
        </div>
      </div>

      {/* MAIN 2-COLUMN SPLIT: Study Sessions & Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Available Study Sessions */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#171916]">Active Study Circles & Sessions</h2>
            <span className="text-xs text-[#737871]">Join to revise or get help</span>
          </div>

          <div className="space-y-3">
            {learningSessions.map((session) => {
              const isHost = session.hostId === user?.userId;
              const isEnrolled = session.enrolledUserIds.includes(user?.userId || '');
              const isFull = session.enrolledUserIds.length >= session.maxParticipants;
              const isCompleted = session.status === 'completed';

              return (
                <div
                  key={session.id}
                  className={`p-5 rounded-2xl bg-white border transition-all space-y-3 shadow-xs ${
                    isCompleted
                      ? 'border-neutral-200 bg-[#FAF9F5]/70 opacity-80'
                      : 'border-[#E5E3DC] hover:border-[#F97316]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#171916]">{session.topic}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-[#FAF9F5] border border-[#E5E3DC] text-[#555952]">
                          {session.subjectCode}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#555952] mt-0.5">
                        Hosted by <strong>{session.hostName}</strong> ({session.skillLevel})
                      </div>
                    </div>

                    <span className="text-xs font-mono font-bold text-amber-600 tabular-nums">
                      +{session.creditsReward} Credit
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#555952]">
                    <span className="flex items-center gap-1 font-mono tabular-nums">
                      <Clock className="w-3.5 h-3.5 text-[#737871]" />
                      {session.dateTime} ({session.durationMinutes} min)
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#F97316]" />
                      {session.venue}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#737871]" />
                      {session.enrolledUserIds.length}/{session.maxParticipants} students
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[#E5E3DC] flex items-center justify-between">
                    <span className="text-[11px] text-[#737871]">
                      {isCompleted ? 'Session concluded' : isHost ? 'You are tutoring' : 'Available for enrollment'}
                    </span>

                    <div>
                      {isCompleted ? (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Finished</span>
                        </span>
                      ) : isHost ? (
                        <button
                          onClick={() => completeLearningSession(session.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
                        >
                          Mark Session Done & Earn +{session.creditsReward} Credit
                        </button>
                      ) : isEnrolled ? (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Enrolled</span>
                        </span>
                      ) : isFull ? (
                        <span className="text-xs text-[#737871]">Full</span>
                      ) : (
                        <button
                          onClick={() => joinLearningSession(session.id)}
                          className="px-3 py-1 bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
                        >
                          Join Study Session
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (5 cols): Double-Entry Time Credit Ledger */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#171916]">Credit Ledger Transactions</h2>
            <span className="text-xs font-mono text-[#737871]">Idempotent records</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E5E3DC] shadow-xs space-y-3">
            {creditTransactions.map((tx) => (
              <div
                key={tx.id}
                className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E5E3DC] flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    tx.type === 'earned' || tx.type === 'bonus'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}>
                    {tx.type === 'earned' || tx.type === 'bonus' ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-[#171916]">{tx.description}</div>
                    <div className="text-[10px] text-[#737871] mt-0.5">
                      {new Date(tx.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })} · {tx.type.toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`font-mono font-bold ${
                    tx.type === 'earned' || tx.type === 'bonus' ? 'text-emerald-700' : 'text-rose-700'
                  }`}>
                    {tx.type === 'earned' || tx.type === 'bonus' ? `+${tx.amount}` : `-${tx.amount}`} hrs
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CREATE SESSION MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-[#E5E3DC] p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#171916]">Host a Peer Study Session</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-[#737871] hover:text-[#171916]">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#3B4036] mb-1">Topic or Subject Area</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. C++ Pointers & Dynamic Memory Workshop"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#D7D4CB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#3B4036] mb-1">Course Code</label>
                  <input
                    type="text"
                    required
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#D7D4CB]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3B4036] mb-1">Skill Level</label>
                  <select
                    value={skillLevel}
                    onChange={(e) => setSkillLevel(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#D7D4CB] bg-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#3B4036] mb-1">Duration (min)</label>
                  <input
                    type="number"
                    min={30}
                    max={120}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#D7D4CB]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3B4036] mb-1">Participant Limit</label>
                  <input
                    type="number"
                    min={2}
                    max={8}
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#D7D4CB]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3B4036] mb-1">Meeting Venue / Room</label>
                <input
                  type="text"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#D7D4CB]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-[#555952] hover:bg-[#FAF9F5] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-[#F97316] text-white rounded-lg hover:bg-[#EA580C]"
                >
                  Schedule Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
