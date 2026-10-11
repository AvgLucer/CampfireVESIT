import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { CampfireLogo } from '../common/CampfireLogo';
import {
  LayoutDashboard,
  GraduationCap,
  Car,
  Trophy,
  MapPin,
  Calendar,
  Users,
  Settings,
  ShieldCheck,
  Coins,
  Flame,
  Cloud,
  Edit3,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, isFirebaseActive, openProfileSwitcher, openStatusModal } = useApp();
  const isAdmin = user?.role === 'admin';

  const links = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Academics', path: '/academics', icon: GraduationCap },
    { label: 'Rides & Carpools', path: '/rides', icon: Car },
    { label: 'Challenges', path: '/challenges', icon: Trophy },
    { label: 'Campus Guide', path: '/campus', icon: MapPin },
    { label: 'Campus Events', path: '/events', icon: Calendar },
    { label: 'Peer Learning', path: '/learning', icon: Users },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#E5E3DC] h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#E5E3DC]">
        <NavLink to="/dashboard" className="block">
          <CampfireLogo size="md" showTagline />
        </NavLink>

        {/* Campus & Semester Selector */}
        <div className="mt-4 px-3 py-2 rounded-xl bg-[#FAF9F5] border border-[#E5E3DC]">
          <div className="text-[10px] font-semibold tracking-wider uppercase text-[#737871]">
            Active Campus
          </div>
          <div className="text-xs font-bold text-[#171916] truncate">
            VESIT Chembur, Mumbai
          </div>
          <div className="text-[11px] text-[#555952] flex items-center justify-between mt-0.5">
            <span>{isAdmin ? 'Academic Council' : `${user?.year?.split(' ')[0] || 'FE'} · ${user?.semester || 'Semester II'}`}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#FFF8F5] text-[#F97316] font-bold shadow-xs'
                    : 'text-[#555952] hover:text-[#171916] hover:bg-[#FAF9F5]'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom User Profile & Stats */}
      <div className="p-3 border-t border-[#E5E3DC] bg-[#FAF9F5]/70 space-y-2.5">
        {user && (
          <>
            {/* Quick Balance Indicators */}
            <div className="grid grid-cols-2 gap-2">
              <div className="px-2.5 py-1.5 rounded-lg bg-white border border-[#E5E3DC]">
                <div className="flex items-center gap-1 text-[10px] text-[#737871]">
                  <Coins className="w-3 h-3 text-amber-500" />
                  <span>Time Credits</span>
                </div>
                <div className="text-sm font-bold font-mono text-[#171916] tabular-nums">
                  {user.timeCredits} hrs
                </div>
              </div>

              <div className="px-2.5 py-1.5 rounded-lg bg-white border border-[#E5E3DC]">
                <div className="flex items-center gap-1 text-[10px] text-[#737871]">
                  <Flame className="w-3 h-3 text-[#F97316]" />
                  <span>Points</span>
                </div>
                <div className="text-sm font-bold font-mono text-[#171916] tabular-nums">
                  {user.challengePoints}
                </div>
              </div>
            </div>

            {/* User Mini Bar with Name & @username */}
            <div className="p-2 rounded-xl bg-white border border-[#E5E3DC] space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                    isAdmin ? 'bg-[#171916] text-[#F97316]' : 'bg-[#F97316]/10 text-[#F97316]'
                  }`}>
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </div>
                  <div className="truncate min-w-0">
                    <div className="text-xs font-bold text-[#171916] truncate">{user.name}</div>
                    <div className="text-[10px] font-mono text-[#F97316] truncate font-semibold">
                      {user.username}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={openStatusModal}
                    className="p-1 text-[#737871] hover:text-[#F97316] rounded-md transition-colors cursor-pointer"
                    title="Edit Name & Status"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <NavLink
                    to="/settings"
                    className="p-1 text-[#737871] hover:text-[#171916] rounded-md transition-colors"
                    title="Settings"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </NavLink>
                </div>
              </div>

              {/* Status Message (Max 60 letters) */}
              {user.statusMessage && (
                <div
                  onClick={openStatusModal}
                  className="text-[10px] text-[#555952] italic truncate bg-[#FAF9F5] px-2 py-1 rounded border border-[#E5E3DC] cursor-pointer hover:border-[#F97316] transition-colors"
                  title={`Status: "${user.statusMessage}" (Click to edit)`}
                >
                  💬 &ldquo;{user.statusMessage}&rdquo;
                </div>
              )}

              {/* Profile Switcher Trigger Button */}
              <button
                onClick={openProfileSwitcher}
                className="w-full py-1.5 px-2 bg-[#FAF9F5] hover:bg-[#FFF8F5] border border-[#D7D4CB] hover:border-[#F97316] text-[#171916] hover:text-[#F97316] text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Users className="w-3 h-3 text-[#F97316]" />
                <span>Switch Profile</span>
              </button>
            </div>
          </>
        )}

        {/* Backend & Cloud Status */}
        <div className="flex items-center justify-between px-2 pt-1 border-t border-[#E5E3DC] text-[10px] text-[#737871]">
          <span className="flex items-center gap-1 font-mono">
            <Cloud className="w-3 h-3 text-[#F97316]" />
            Firestore Cloud Sync
          </span>
          <span className="font-semibold text-emerald-600">Active</span>
        </div>
      </div>
    </aside>
  );
};
