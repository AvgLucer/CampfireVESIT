import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  ShieldCheck,
  Check,
  X,
  Mail,
  UserCheck,
  Sparkles,
  ArrowRight,
  School,
  Building,
} from 'lucide-react';

export const ProfileSwitcherModal: React.FC = () => {
  const {
    isProfileSwitcherOpen,
    closeProfileSwitcher,
    user,
    allProfiles,
    switchProfile,
    openAuthModal,
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'students' | 'admin'>('all');

  if (!isProfileSwitcherOpen) return null;

  const filteredProfiles = allProfiles.filter((p) => {
    if (filter === 'students') return p.role !== 'admin';
    if (filter === 'admin') return p.role === 'admin';
    return true;
  });

  const handleSelect = (profile: typeof allProfiles[0]) => {
    switchProfile(profile);
    closeProfileSwitcher();
  };

  const handleOpenAuth = () => {
    closeProfileSwitcher();
    openAuthModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E5E3DC] p-6 text-[#20231F] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={closeProfileSwitcher}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#737871] hover:text-[#20231F] hover:bg-[#F2EFE9] transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#E5E3DC]">
          <div className="w-10 h-10 rounded-xl bg-[#F97316]/10 text-[#F97316] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#171916] tracking-tight">
              Switch Profile
            </h2>
            <div className="text-xs text-[#737871]">
              Switch instantly between student accounts and administrative profile
            </div>
          </div>
        </div>

        {/* Filter Tabs & Quick Action */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#FAF9F5] border border-[#E5E3DC]">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-white text-[#171916] shadow-2xs font-bold'
                  : 'text-[#737871] hover:text-[#171916]'
              }`}
            >
              All ({allProfiles.length})
            </button>
            <button
              onClick={() => setFilter('students')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filter === 'students'
                  ? 'bg-white text-[#171916] shadow-2xs font-bold'
                  : 'text-[#737871] hover:text-[#171916]'
              }`}
            >
              Students ({allProfiles.filter(p => p.role !== 'admin').length})
            </button>
            <button
              onClick={() => setFilter('admin')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filter === 'admin'
                  ? 'bg-white text-[#171916] shadow-2xs font-bold'
                  : 'text-[#737871] hover:text-[#171916]'
              }`}
            >
              Admin & Faculty ({allProfiles.filter(p => p.role === 'admin').length})
            </button>
          </div>

          <button
            onClick={handleOpenAuth}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#F97316]/40 text-[#F97316] text-xs font-semibold hover:bg-[#FFF8F5] transition-colors cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>New VES Login</span>
          </button>
        </div>

        {/* Profiles List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 py-1">
          {filteredProfiles.map((p) => {
            const isActive = user?.userId === p.userId;
            const isAdmin = p.role === 'admin';

            return (
              <div
                key={p.userId}
                onClick={() => handleSelect(p)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isActive
                    ? 'border-[#F97316] bg-[#FFF8F5] shadow-xs'
                    : isAdmin
                    ? 'border-neutral-800 bg-[#171916] text-white hover:bg-[#20231F]'
                    : 'border-[#E5E3DC] bg-white hover:border-[#D7D4CB] hover:bg-[#FAF9F5]'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden ${
                    isAdmin
                      ? 'bg-[#F97316] text-white'
                      : isActive
                      ? 'bg-[#F97316] text-white'
                      : 'bg-[#FAF9F5] border border-[#E5E3DC] text-[#F97316]'
                  }`}>
                    {p.avatarUrl ? (
                      <img src={p.avatarUrl} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      p.name.charAt(0)
                    )}
                  </div>

                  <div className="truncate min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold truncate ${isAdmin ? 'text-white' : 'text-[#171916]'}`}>
                        {p.name}
                      </span>
                      <span className={`text-[11px] font-mono font-semibold ${isAdmin ? 'text-[#F97316]' : 'text-[#737871]'}`}>
                        {p.username}
                      </span>
                      {isAdmin && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-[#F97316] text-white uppercase tracking-wider">
                          Admin
                        </span>
                      )}
                    </div>

                    <div className={`text-[11px] font-mono truncate ${isAdmin ? 'text-neutral-300' : 'text-[#555952]'}`}>
                      {p.email}
                    </div>

                    {/* 60 characters status message */}
                    {p.statusMessage && (
                      <div className={`text-[11px] italic mt-0.5 truncate flex items-center gap-1 ${
                        isAdmin ? 'text-neutral-400' : 'text-[#737871]'
                      }`}>
                        <span>💬 &ldquo;{p.statusMessage}&rdquo;</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <div className={`text-right text-[10px] hidden sm:block ${isAdmin ? 'text-neutral-400' : 'text-[#737871]'}`}>
                    <div className="font-semibold">{isAdmin ? 'Academic Council' : p.year}</div>
                    <div>{p.department}</div>
                  </div>

                  {isActive ? (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Active</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        isAdmin
                          ? 'bg-[#F97316] text-white hover:bg-[#EA580C]'
                          : 'bg-[#FAF9F5] hover:bg-[#F2EFE9] border border-[#D7D4CB] text-[#171916]'
                      }`}
                    >
                      Switch
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info & New email trigger */}
        <div className="mt-3 pt-3 border-t border-[#E5E3DC] flex items-center justify-between text-xs">
          <div className="text-[11px] text-[#737871]">
            Active: <strong className="text-[#171916]">{user?.name}</strong> ({user?.username})
          </div>

          <button
            onClick={handleOpenAuth}
            className="text-xs font-semibold text-[#F97316] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Log in with 20XX.name.surname@ves.ac.in</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
