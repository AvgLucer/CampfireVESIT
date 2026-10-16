import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useEmberEconomy } from '../../context/EmberEconomyContext';
import { CampfireLogo } from '../common/CampfireLogo';
import { EmberToken } from '../common/EmberToken';
import { BadgeArtwork } from '../badges/BadgeArtwork';
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
  Layers,
  Box,
  Award,
  Radio,
  LogOut,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, openProfileSwitcher, openStatusModal, logout } = useApp();
  const { economy, equippedBadge, openWalletModal } = useEmberEconomy();
  const isAdmin = user?.role === 'admin';

  const links = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Daily Updates', path: '/updates', icon: Radio, badgeCount: 'Live' },
    { label: 'Peer Learning', path: '/learning', icon: Users, badgeCount: '1-on-1' },
    { label: 'Badge Collection', path: '/badges', icon: Layers, badgeCount: `${economy.ownedBadgeIds.length}/75` },
    { label: 'Crate Shop', path: '/crates', icon: Box },
    { label: 'Academics', path: '/academics', icon: GraduationCap },
    { label: 'Rides & Carpools', path: '/rides', icon: Car },
    { label: 'Campus Guide', path: '/campus', icon: MapPin },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-neutral-900 border-r border-[#E5E3DC] dark:border-neutral-800 h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#E5E3DC] dark:border-neutral-800">
        <NavLink to="/dashboard" className="block">
          <CampfireLogo size="md" showTagline />
        </NavLink>

        {/* Campus & Semester Selector */}
        <div className="mt-4 px-3 py-2 rounded-xl bg-[#FAF9F5] dark:bg-neutral-800 border border-[#E5E3DC] dark:border-neutral-700">
          <div className="text-[10px] font-semibold tracking-wider uppercase text-[#737871]">
            Active Campus
          </div>
          <div className="text-xs font-bold text-[#171916] dark:text-neutral-100 truncate">
            VESIT Chembur, Mumbai
          </div>
          <div className="text-[11px] text-[#555952] dark:text-neutral-400 flex items-center justify-between mt-0.5">
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
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#FFF8F5] dark:bg-orange-950/40 text-[#F97316] font-bold shadow-xs'
                    : 'text-[#555952] dark:text-neutral-400 hover:text-[#171916] dark:hover:text-neutral-100 hover:bg-[#FAF9F5] dark:hover:bg-neutral-800'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </div>
              {link.badgeCount && (
                <span className="text-[10px] font-mono font-bold bg-[#FAF9F5] dark:bg-neutral-800 px-1.5 py-0.2 rounded border border-[#E5E3DC] dark:border-neutral-700 text-[#737871]">
                  {link.badgeCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom User Profile & Stats */}
      <div className="p-3 border-t border-[#E5E3DC] dark:border-neutral-800 bg-[#FAF9F5]/70 dark:bg-neutral-900 space-y-2.5">
        {user && (
          <>
            {/* Quick Balance Indicators */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={openWalletModal}
                className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-neutral-800 border border-[#E5E3DC] dark:border-neutral-700 hover:border-[#F97316] transition-colors text-left cursor-pointer"
                title="Click to open EMBER Vault"
              >
                <div className="flex items-center gap-1 text-[10px] text-[#737871]">
                  <span className="text-orange-500 font-bold">🔥</span>
                  <span>EMBER</span>
                </div>
                <div className="text-sm font-bold font-mono text-[#171916] dark:text-neutral-100 tabular-nums">
                  {economy.emberBalance}
                </div>
              </button>

              <div className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-neutral-800 border border-[#E5E3DC] dark:border-neutral-700">
                <div className="flex items-center gap-1 text-[10px] text-[#737871]">
                  <Flame className="w-3 h-3 text-[#F97316]" />
                  <span>Points</span>
                </div>
                <div className="text-sm font-bold font-mono text-[#171916] dark:text-neutral-100 tabular-nums">
                  {user.challengePoints}
                </div>
              </div>
            </div>

            {/* User Mini Bar with Name & @username */}
            <div className="p-2.5 rounded-2xl bg-white dark:bg-neutral-800 border border-[#E5E3DC] dark:border-neutral-700 space-y-2">
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
                    <div className="text-xs font-bold text-[#171916] dark:text-neutral-100 truncate">{user.name}</div>
                    <div className="text-[10px] font-mono text-[#F97316] truncate font-semibold">
                      {user.username}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {equippedBadge && (
                    <div title={`Equipped: ${equippedBadge.name}`}>
                      <BadgeArtwork badge={equippedBadge} size="sm" />
                    </div>
                  )}
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
                  className="text-[10px] text-[#555952] dark:text-neutral-400 italic truncate bg-[#FAF9F5] dark:bg-neutral-900 px-2 py-1 rounded-lg border border-[#E5E3DC] dark:border-neutral-700 cursor-pointer hover:border-[#F97316] transition-colors"
                  title={`Status: "${user.statusMessage}" (Click to edit)`}
                >
                  💬 &ldquo;{user.statusMessage}&rdquo;
                </div>
              )}

              {/* Profile Switcher & Logout Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={openProfileSwitcher}
                  className="flex-1 py-1.5 px-2 bg-[#FAF9F5] dark:bg-neutral-900 hover:bg-[#FFF8F5] border border-[#D7D4CB] dark:border-neutral-700 hover:border-[#F97316] text-[#171916] dark:text-neutral-200 hover:text-[#F97316] text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  title="Simulate or switch profile"
                >
                  <Users className="w-3 h-3 text-[#F97316]" />
                  <span>Switch</span>
                </button>
                <button
                  onClick={logout}
                  className="py-1.5 px-2.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  title="Sign out of CampFire"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};
