import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { CampfireLogo } from '../common/CampfireLogo';
import {
  Bell,
  User,
  Check,
  Users,
  MessageSquare,
  Edit3,
  ShieldCheck,
  ChevronDown,
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

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Academics', path: '/academics' },
    { label: 'Rides', path: '/rides' },
    { label: 'Challenges', path: '/challenges' },
    { label: 'Campus Guide', path: '/campus' },
  ];

  const isAdmin = user?.role === 'admin';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-6 px-4 sm:px-6 py-3 bg-white/95 backdrop-blur-md border-b border-[#E5E3DC]">
      {/* Zone 1: Brand wordmark */}
      <Link to="/" className="whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity">
        <CampfireLogo size="md" />
      </Link>

      {/* Zone 2: Concise single-line nav links */}
      <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-[#555952]">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 relative ${
                isActive ? 'text-[#F97316]' : 'hover:text-[#171916]'
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

      {/* Zone 3: Profile Switcher, Notifications & User Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Quick Profile Switcher Button */}
        <button
          onClick={openProfileSwitcher}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E5E3DC] hover:border-[#F97316] text-[#555952] hover:text-[#F97316] text-xs font-semibold hover:bg-[#FFF8F5] transition-colors cursor-pointer"
          title="Switch between Students & Admin profiles"
        >
          <Users className="w-3.5 h-3.5 text-[#F97316]" />
          <span className="hidden sm:inline">Switch Profile</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-lg text-[#555952] hover:text-[#171916] hover:bg-[#FAF9F5] transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F97316]" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#E5E3DC] p-3 text-xs text-[#20231F] z-50 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E5E3DC]">
                <span className="font-bold text-[#171916]">Notifications ({unreadCount} unread)</span>
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
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${
                      notif.isRead ? 'bg-[#FAF9F5] text-[#555952]' : 'bg-[#FFF8F5] text-[#171916] font-medium border border-[#F97316]/20'
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
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-lg border border-[#E5E3DC] hover:border-[#D7D4CB] hover:bg-[#FAF9F5] transition-colors cursor-pointer"
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
              <div className="text-left hidden sm:block max-w-[130px] truncate">
                <div className="text-xs font-bold text-[#171916] truncate leading-tight">
                  {user.name}
                </div>
                <div className="text-[10px] font-mono text-[#F97316] truncate leading-none mt-0.5">
                  {user.username}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#737871]" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-[#E5E3DC] p-3 text-xs text-[#20231F] z-50 animate-in fade-in">
                {/* Profile Identity Box */}
                <div className="pb-3 border-b border-[#E5E3DC] mb-2.5">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-[#171916] text-sm truncate">{user.name}</span>
                    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                      isAdmin ? 'bg-[#171916] text-[#F97316]' : 'bg-[#FAF9F5] border border-[#E5E3DC] text-[#737871]'
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
                  <div className="text-[10px] text-[#555952] mt-0.5">
                    {user.department} {user.rollNumber ? `· Roll: ${user.rollNumber}` : ''}
                  </div>
                </div>

                {/* Status Message (Max 60 chars) */}
                <div className="p-2.5 rounded-lg bg-[#FAF9F5] border border-[#E5E3DC] mb-2.5">
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
                  <div className="text-[11px] text-[#20231F] italic leading-snug break-words">
                    &ldquo;{user.statusMessage || 'No status set'}&rdquo;
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      openProfileSwitcher();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#FFF8F5] text-[#F97316] font-semibold transition-colors cursor-pointer"
                  >
                    <Users className="w-4 h-4" />
                    <span>Switch Active Profile</span>
                  </button>

                  <Link
                    to="/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#FAF9F5] transition-colors text-[#555952]"
                  >
                    <User className="w-4 h-4" />
                    <span>Student Profile & Settings</span>
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
            className="px-4 py-2 text-xs font-semibold text-white bg-[#F97316] hover:bg-[#EA580C] rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>VES Sign-In</span>
          </button>
        )}
      </div>
    </header>
  );
};
