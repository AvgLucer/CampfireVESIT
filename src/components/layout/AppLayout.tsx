import React, { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { MobileNav } from './MobileNav';
import { ToastContainer } from '../common/ToastContainer';
import { MiniMothAuthModal } from '../common/MiniMothAuthModal';
import { JudgeGuideModal } from '../common/JudgeGuideModal';
import { ProfileSwitcherModal } from '../common/ProfileSwitcherModal';
import { StatusEditorModal } from '../common/StatusEditorModal';
import { ShieldCheck, Users } from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, openProfileSwitcher } = useApp();
  const isLandingPage = location.pathname === '/';
  const isAdmin = user?.role === 'admin';

  if (isLandingPage) {
    return (
      <div className="min-h-screen bg-[#F7F6F2] flex flex-col font-sans">
        {isAdmin && (
          <div className="bg-[#171916] text-white px-4 py-1.5 text-xs flex items-center justify-between border-b border-black">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-[#F97316] text-white uppercase tracking-wider">
                Admin
              </span>
              <span>Institution Admin Session: <strong>{user?.name}</strong> ({user?.username})</span>
            </div>
            <button
              onClick={openProfileSwitcher}
              className="text-[11px] font-semibold text-[#F97316] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Users className="w-3 h-3" />
              <span>Switch Profile</span>
            </button>
          </div>
        )}
        <Navbar />
        <main className="flex-1">{children}</main>
        <ToastContainer />
        <MiniMothAuthModal />
        <ProfileSwitcherModal />
        <StatusEditorModal />
        <JudgeGuideModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col font-sans">
      {isAdmin && (
        <div className="bg-[#171916] text-white px-4 py-2 text-xs flex items-center justify-between border-b border-neutral-800 shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-2.5">
            <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-[#F97316] text-white uppercase tracking-wider">
              ADMIN MODE
            </span>
            <span className="font-medium text-neutral-200">
              Logged in as <strong>{user?.name}</strong> ({user?.username}) · Academic Council
            </span>
            {user?.statusMessage && (
              <span className="hidden md:inline text-neutral-400 italic text-[11px]">
                &ldquo;{user.statusMessage}&rdquo;
              </span>
            )}
          </div>
          <button
            onClick={openProfileSwitcher}
            className="text-xs font-bold text-[#F97316] hover:text-[#EA580C] bg-white/10 hover:bg-white/15 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Switch to Student</span>
          </button>
        </div>
      )}

      <div className="flex-1 flex min-w-0">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
          <Navbar />
          <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto animate-in fade-in">
            {children}
          </main>
        </div>
      </div>

      <MobileNav />
      <ToastContainer />
      <MiniMothAuthModal />
      <ProfileSwitcherModal />
      <StatusEditorModal />
      <JudgeGuideModal />
    </div>
  );
};
