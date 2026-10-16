import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useEmberEconomy } from '../../context/EmberEconomyContext';
import { CampfireLogo } from '../common/CampfireLogo';
import { EmberToken } from '../common/EmberToken';
import { BadgeArtwork } from '../badges/BadgeArtwork';
import { UserBadgesRow } from '../badges/UserBadgesRow';
import { WalletModal } from '../wallet/WalletModal';
import { ThemeSelector } from '../common/ThemeSelector';
import {
  Bell,
  User,
  Check,
  Users,
  MessageSquare,
  Edit3,
  ShieldCheck,
  ChevronDown,
  Box,
  Award,
  Layers,
  Coins,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const {
    user,
    isAuthenticated,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    openAuthModal,
    openProfileSwitcher,
    openStatusModal,
    logout,
  } = useApp();

  const {
    economy,
    equippedBadge,
    isWalletModalOpen,
    openWalletModal,
    closeWalletModal,
    isDailyRewardAvailable,
    dailyRewardCountdown,
    claimDailyReward,
  } = useEmberEconomy();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Daily Updates', path: '/updates' },
    { label: 'Peer Learning', path: '/learning' },
    { label: 'Academics', path: '/academics' },
    { label: 'Rides', path: '/rides' },
    { label: 'Badges', path: '/badges' },
    { label: 'Crates', path: '/crates' },
    { label: 'Campus Guide', path: '/campus' },
    { label: 'Faculty Info', path: '/faculty' },
  ];

  const isAdmin = user?.role === 'admin';

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between gap-4 sm:gap-6 px-4 sm:px-6 py-3 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-[#E5E3DC] dark:border-neutral-800">
        {/* Zone 1: Brand wordmark */}
        <Link to="/" className="whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity">
          <CampfireLogo size="md" />
        </Link>

        {/* Zone 2: Concise single-line nav links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-[#555952] dark:text-neutral-400">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`whitespace-nowrap shrink-0 transition-colors py-1 relative ${
                  isActive ? 'text-[#F97316] font-bold' : 'hover:text-[#171916] dark:hover:text-neutral-100'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F97316] rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: EMBER Currency, Profile Switcher, Notifications & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* PROMINENT EMBER CURRENCY BUTTON (Requested) */}
          <button
            onClick={openWalletModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-orange-200/80 dark:border-neutral-700 bg-[#FFF8F5] dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-900/50 hover:border-[#F97316] transition-all cursor-pointer shadow-2xs group"
            title="Open EMBER Currency Vault & Ledger"
          >
            <EmberToken amount={economy.emberBalance} size="sm" />
          </button>

          {/* Theme Selector (Classic, Tron Ares, Smooth White & Blue) */}
          <ThemeSelector />

          {/* Quick Profile Switcher Button */}
          <button
            onClick={openProfileSwitcher}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#E5E3DC] dark:border-neutral-700 hover:border-[#F97316] text-[#555952] dark:text-neutral-300 hover:text-[#F97316] text-xs font-semibold hover:bg-[#FFF8F5] dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Switch between Students & Admin profiles"
          >
            <Users className="w-3.5 h-3.5 text-[#F97316]" />
            <span>Switch Profile</span>
          </button>

          {/* Notifications Popover */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-xl text-[#555952] dark:text-neutral-400 hover:text-[#171916] dark:hover:text-neutral-100 hover:bg-[#FAF9F5] dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F97316]" />
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-[#E5E3DC] dark:border-neutral-800 p-3 text-xs text-[#20231F] dark:text-neutral-200 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E5E3DC] dark:border-neutral-800">
                  <span className="font-bold text-[#171916] dark:text-neutral-100">Notifications ({unreadCount} unread)</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[11px] text-[#F97316] hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {notifications.slice(0, 6).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotificationRead(notif.id);
                        setIsNotifOpen(false);
                      }}
                      className={`p-2 rounded-xl transition-colors cursor-pointer ${
                        notif.isRead
                          ? 'bg-[#FAF9F5] dark:bg-neutral-800 text-[#555952] dark:text-neutral-400'
                          : 'bg-[#FFF8F5] dark:bg-orange-950/40 text-[#171916] dark:text-neutral-100 font-medium border border-[#F97316]/20'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-0.5">
                        <span className="font-semibold">{notif.title}</span>
                        <span className="text-[10px] text-[#737871]">{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-[11px] leading-snug">{notif.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Auth Action */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl border border-[#E5E3DC] dark:border-neutral-700 hover:border-[#D7D4CB] hover:bg-[#FAF9F5] dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <div className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center overflow-hidden shrink-0 ${
                  isAdmin ? 'bg-[#171916] text-[#F97316]' : 'bg-[#F97316]/10 text-[#F97316]'
                }`}>
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0)
                  )}
                </div>

                <div className="text-left hidden sm:block max-w-[120px] truncate">
                  <div className="text-xs font-bold text-[#171916] dark:text-neutral-100 truncate leading-tight flex items-center gap-1">
                    <span>{user.name}</span>
                  </div>
                  <div className="text-[10px] font-mono text-[#F97316] truncate leading-none mt-0.5">
                    {user.username}
                  </div>
                </div>

                {/* 5 Profile Badges miniature preview */}
                <UserBadgesRow userId={user.userId} size="xs" className="hidden lg:inline-flex" />

                <ChevronDown className="w-3.5 h-3.5 text-[#737871]" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-[#E5E3DC] dark:border-neutral-800 p-3.5 text-xs text-[#20231F] dark:text-neutral-200 z-50 animate-in fade-in">
                  {/* Profile Identity Box */}
                  <div className="pb-3 border-b border-[#E5E3DC] dark:border-neutral-800 mb-2.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-[#171916] dark:text-neutral-100 text-sm truncate">{user.name}</span>
                      <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                        isAdmin ? 'bg-[#171916] text-[#F97316]' : 'bg-[#FAF9F5] dark:bg-neutral-800 border border-[#E5E3DC] dark:border-neutral-700 text-[#737871]'
                      }`}>
                        {isAdmin ? 'ADMIN' : user.year?.split(' ')[0] || 'STUDENT'}
                      </span>
                    </div>
                    <div className="text-xs font-mono font-semibold text-[#F97316] mt-0.5">
                      {user.username}
                    </div>
                    <div className="text-[11px] text-[#737871] font-mono truncate mt-0.5">
                      {user.email}
                    </div>
                  </div>

                  {/* 5 Profile Badges Loadout */}
                  <div className="p-2.5 rounded-xl bg-[#FAF9F5] dark:bg-neutral-800 border border-[#E5E3DC] dark:border-neutral-700 mb-2.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase font-bold text-[#737871]">
                        Profile Badges (5)
                      </span>
                      <Link
                        to="/badges"
                        onClick={() => setIsProfileOpen(false)}
                        className="text-[10px] font-bold text-[#F97316] hover:underline"
                      >
                        Customize
                      </Link>
                    </div>
                    <UserBadgesRow userId={user.userId} size="sm" showLabels={true} />
                  </div>

                  {/* Status Message (Max 60 chars) */}
                  <div className="p-2.5 rounded-xl bg-[#FAF9F5] dark:bg-neutral-800 border border-[#E5E3DC] dark:border-neutral-700 mb-2.5">
                    <div className="flex items-center justify-between text-[10px] text-[#737871] mb-1">
                      <span className="font-semibold uppercase tracking-wider flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-[#F97316]" />
                        Status (Max 60 Chars)
                      </span>
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          openStatusModal();
                        }}
                        className="text-[#F97316] hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                      >
                        <Edit3 className="w-2.5 h-2.5" />
                        <span>Edit</span>
                      </button>
                    </div>
                    <div className="text-[11px] text-[#20231F] dark:text-neutral-200 italic leading-snug break-words">
                      &ldquo;{user.statusMessage || 'No status set'}&rdquo;
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-1">
                    <Link
                      to="/badges"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#FAF9F5] dark:hover:bg-neutral-800 transition-colors text-[#171916] dark:text-neutral-200 font-semibold"
                    >
                      <Layers className="w-4 h-4 text-[#F97316]" />
                      <span>Badge Collection ({economy.ownedBadgeIds.length}/75)</span>
                    </Link>

                    <Link
                      to="/crates"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#FAF9F5] dark:hover:bg-neutral-800 transition-colors text-[#171916] dark:text-neutral-200 font-semibold"
                    >
                      <Box className="w-4 h-4 text-emerald-600" />
                      <span>Crate Shop & Drops</span>
                    </Link>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        openWalletModal();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#FAF9F5] dark:hover:bg-neutral-800 transition-colors text-[#171916] dark:text-neutral-200 font-semibold cursor-pointer text-left"
                    >
                      <Coins className="w-4 h-4 text-amber-500" />
                      <span>EMBER Vault & Ledger</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        openProfileSwitcher();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#FFF8F5] text-[#F97316] font-semibold transition-colors cursor-pointer"
                    >
                      <Users className="w-4 h-4" />
                      <span>Switch Active Profile</span>
                    </button>

                    <Link
                      to="/settings"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#FAF9F5] dark:hover:bg-neutral-800 transition-colors text-[#555952] dark:text-neutral-400"
                    >
                      <User className="w-4 h-4" />
                      <span>Student Profile & Settings</span>
                    </Link>

                    <button
                      onClick={() => {
                        logout();
                        setIsProfileOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer font-medium"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#F97316] hover:bg-[#EA580C] rounded-xl transition-colors whitespace-nowrap shrink-0 shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>VES Sign-In</span>
            </button>
          )}
        </div>
      </header>

      {/* GLOBAL WALLET MODAL */}
      <WalletModal
        economy={economy}
        isOpen={isWalletModalOpen}
        onClose={closeWalletModal}
        onClaimDaily={claimDailyReward}
        isDailyClaimAvailable={isDailyRewardAvailable}
        dailyCountdown={dailyRewardCountdown}
      />
    </>
  );
};
