import React, { useState, useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  DailyUpdate,
  UpdateCategory,
  UpdateApplication,
  UpdateModerationStatus,
} from '../types/dailyUpdates';
import { DailyUpdateCard } from '../components/updates/DailyUpdateCard';
import { DailyUpdateDetailModal } from '../components/updates/DailyUpdateDetailModal';
import { HostDailyUpdateModal } from '../components/updates/HostDailyUpdateModal';
import { SubmitApplicationModal } from '../components/updates/SubmitApplicationModal';
import { HostApplicationsModal } from '../components/updates/HostApplicationsModal';
import { AdminModerationQueue } from '../components/updates/AdminModerationQueue';
import {
  Search,
  Filter,
  Plus,
  Flame,
  Clock,
  Sparkles,
  Users,
  ShieldCheck,
  Calendar,
  AlertCircle,
  CheckCircle2,
  FileText,
  Layers,
  ArrowUpDown,
  Tag,
  Radio,
  ExternalLink,
} from 'lucide-react';

const CATEGORIES: UpdateCategory[] = [
  'All',
  'Hackathon',
  'Workshop',
  'Club Activity',
  'Lost & Found',
  'Opportunity',
  'Competition',
  'Academic Notice',
  'General',
];

export const DailyUpdatesPage: React.FC = () => {
  const {
    user,
    dailyUpdates,
    updateApplications,
    withdrawDailyUpdate,
    moderateDailyUpdate,
    switchProfile,
    allProfiles,
    showToast,
  } = useApp();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as 'feed' | 'hosted' | 'applications' | 'admin') || 'feed';

  const [activeTab, setActiveTab] = useState<'feed' | 'hosted' | 'applications' | 'admin'>(initialTab);
  const [selectedCategory, setSelectedCategory] = useState<UpdateCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'expiring_soon' | 'title'>('newest');

  // Modals state
  const [selectedUpdateForDetails, setSelectedUpdateForDetails] = useState<DailyUpdate | null>(null);
  const [isHostModalOpen, setIsHostModalOpen] = useState(false);
  const [updateToEdit, setUpdateToEdit] = useState<DailyUpdate | null>(null);
  const [updateToApply, setUpdateToApply] = useState<DailyUpdate | null>(null);
  const [updateForApplicationsView, setUpdateForApplicationsView] = useState<DailyUpdate | null>(null);

  // Host Dashboard filter
  const [hostStatusFilter, setHostStatusFilter] = useState<'all' | 'active' | 'pending' | 'changes_requested' | 'draft' | 'expired' | 'withdrawn'>('all');

  const isAdmin = user?.role === 'admin';
  const adminProfile = allProfiles.find((p) => p.role === 'admin');
  const studentProfile = allProfiles.find((p) => p.role === 'student');

  // Automatically check expirations and filter active feed
  const activeFeedUpdates = useMemo(() => {
    const now = new Date();
    return dailyUpdates.filter((u) => {
      // Must be approved and NOT expired
      if (u.status !== 'approved') return false;
      const isExpired = new Date(u.expiresAt) <= now;
      if (isExpired) return false;

      // Category filter
      if (selectedCategory !== 'All' && u.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = u.title.toLowerCase().includes(q);
        const matchesDesc = u.description.toLowerCase().includes(q);
        const matchesHost = u.hostName.toLowerCase().includes(q);
        const matchesCategory = u.category.toLowerCase().includes(q);
        const matchesTags = u.tags?.some((t) => t.toLowerCase().includes(q));
        const matchesFields = u.customFields?.some(
          (f) =>
            f.label.toLowerCase().includes(q) ||
            String(f.value).toLowerCase().includes(q)
        );
        return matchesTitle || matchesDesc || matchesHost || matchesCategory || matchesTags || matchesFields;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'expiring_soon') {
        return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [dailyUpdates, selectedCategory, searchQuery, sortBy]);

  // User's hosted updates
  const myHostedUpdates = useMemo(() => {
    if (!user) return [];
    return dailyUpdates.filter((u) => {
      if (u.hostId !== user.userId) return false;
      if (hostStatusFilter === 'all') return true;
      if (hostStatusFilter === 'active') {
        return u.status === 'approved' && new Date(u.expiresAt) > new Date();
      }
      return u.status === hostStatusFilter;
    });
  }, [dailyUpdates, user, hostStatusFilter]);

  // User's submitted applications
  const myApplications = useMemo(() => {
    if (!user) return [];
    return updateApplications.filter((a) => a.applicantId === user.userId);
  }, [updateApplications, user]);

  // Counts for tabs
  const pendingAdminCount = dailyUpdates.filter((u) => u.status === 'pending').length;
  const myChangesCount = dailyUpdates.filter(
    (u) => u.hostId === user?.userId && u.status === 'changes_requested'
  ).length;

  const handleOpenEdit = (update: DailyUpdate) => {
    setUpdateToEdit(update);
    setIsHostModalOpen(true);
  };

  const handleWithdraw = async (update: DailyUpdate) => {
    await withdrawDailyUpdate(update.id);
  };

  return (
    <div className="min-h-screen pb-16 space-y-6">
      {/* Top Banner & Header */}
      <div className="rounded-3xl bg-gradient-to-br from-orange-500/10 via-[#FAF9F5] to-amber-500/10 dark:from-orange-950/30 dark:via-neutral-900 dark:to-neutral-900 border border-[#E5E3DC] dark:border-neutral-800 p-6 sm:p-8 relative overflow-hidden shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 text-[#F97316] text-xs font-bold uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 animate-pulse text-[#F97316]" />
              <span>Campus Live Announcements</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171916] dark:text-neutral-100 tracking-tight">
              CampFire Daily Updates
            </h1>
            <p className="text-xs sm:text-sm text-[#555952] dark:text-neutral-400 leading-relaxed">
              Real-time student announcements, hackathons, lost & found notices, robotics boot camps, club activities, and campus opportunities. Host a bulletin in seconds with dynamic custom fields.
            </p>
          </div>

          {/* Prominent Action Button & Quick Stats */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setUpdateToEdit(null);
                setIsHostModalOpen(true);
              }}
              className="px-5 py-3 rounded-2xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Host a Daily Update</span>
            </button>
          </div>
        </div>

        {/* Quick Demo Switcher helper (Student <-> Admin testing) */}
        <div className="mt-6 pt-4 border-t border-[#E5E3DC]/70 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#737871] dark:text-neutral-400">
            <Sparkles className="w-3.5 h-3.5 text-[#F97316]" />
            <span>
              Active Profile: <strong className="text-[#171916] dark:text-neutral-200">{user?.name}</strong> (
              {isAdmin ? 'Admin Moderation Access' : 'Student Host Access'})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#737871] text-[11px]">Test Roles:</span>
            {!isAdmin && adminProfile && (
              <button
                onClick={() => {
                  switchProfile(adminProfile);
                  showToast('Switched to Faculty Admin (Dr. Nupur Giri)', 'info');
                }}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-neutral-800 border border-[#E5E3DC] dark:border-neutral-700 text-[#171916] dark:text-neutral-200 font-bold text-[11px] hover:border-[#F97316] transition-colors cursor-pointer"
              >
                Switch to Admin Mode 🛡️
              </button>
            )}
            {isAdmin && studentProfile && (
              <button
                onClick={() => {
                  switchProfile(studentProfile);
                  showToast('Switched to Student Host (Aarav Sharma)', 'info');
                }}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-neutral-800 border border-[#E5E3DC] dark:border-neutral-700 text-[#171916] dark:text-neutral-200 font-bold text-[11px] hover:border-[#F97316] transition-colors cursor-pointer"
              >
                Switch to Student Mode 🎒
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center justify-between border-b border-[#E5E3DC] dark:border-neutral-800 gap-2 overflow-x-auto pb-px">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'feed'
                ? 'border-[#F97316] text-[#F97316]'
                : 'border-transparent text-[#737871] hover:text-[#171916] dark:hover:text-neutral-200'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Campus Feed</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-neutral-100 dark:bg-neutral-800 text-[#737871]">
              {activeFeedUpdates.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('hosted')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'hosted'
                ? 'border-[#F97316] text-[#F97316]'
                : 'border-transparent text-[#737871] hover:text-[#171916] dark:hover:text-neutral-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>My Hosted Updates</span>
            {myChangesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                {myChangesCount} changes
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'applications'
                ? 'border-[#F97316] text-[#F97316]'
                : 'border-transparent text-[#737871] hover:text-[#171916] dark:hover:text-neutral-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>My Applications</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-neutral-100 dark:bg-neutral-800 text-[#737871]">
              {myApplications.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'admin'
                ? 'border-[#F97316] text-[#F97316]'
                : 'border-transparent text-[#737871] hover:text-[#171916] dark:hover:text-neutral-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Admin Moderation Desk</span>
            {pendingAdminCount > 0 && (
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                {pendingAdminCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* VIEW 1: ACTIVE CAMPUS FEED */}
      {activeTab === 'feed' && (
        <div className="space-y-6">
          {/* Search, Category Filters & Sort Controls */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#737871]" />
                <input
                  type="text"
                  placeholder="Search by title, host, prize pool, lab venue, or tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-2xl border border-[#E5E3DC] dark:border-neutral-800 bg-white dark:bg-neutral-900 text-[#171916] dark:text-neutral-100 focus:outline-none focus:border-[#F97316] shadow-2xs"
                />
              </div>

              {/* Sorting Selector */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-[#737871] dark:text-neutral-400 flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-[#E5E3DC] dark:border-neutral-800 bg-white dark:bg-neutral-900 text-[#171916] dark:text-neutral-100 focus:outline-none focus:border-[#F97316]"
                >
                  <option value="newest">Newest First</option>
                  <option value="expiring_soon">Expiring Soonest</option>
                  <option value="title">Alphabetical (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#F97316] text-white shadow-xs'
                      : 'bg-white dark:bg-neutral-900 text-[#555952] dark:text-neutral-300 border border-[#E5E3DC] dark:border-neutral-800 hover:border-[#F97316]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          {activeFeedUpdates.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-[#E5E3DC] dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-orange-100 dark:bg-orange-950/60 text-[#F97316] flex items-center justify-center">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#171916] dark:text-neutral-100">
                No active announcements found
              </h3>
              <p className="text-xs text-[#737871] dark:text-neutral-400 max-w-sm mx-auto">
                No published updates match your filters or keywords. Be the first to host an announcement today!
              </p>
              <button
                onClick={() => {
                  setUpdateToEdit(null);
                  setIsHostModalOpen(true);
                }}
                className="mt-2 px-4 py-2 rounded-xl bg-[#F97316] text-white text-xs font-bold hover:bg-[#EA580C] cursor-pointer"
              >
                Host an Announcement
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {activeFeedUpdates.map((update) => {
                const userApp = updateApplications.find(
                  (a) => a.updateId === update.id && a.applicantId === user?.userId
                );
                return (
                  <DailyUpdateCard
                    key={update.id}
                    update={update}
                    onOpenDetails={(u) => setSelectedUpdateForDetails(u)}
                    onApply={(u) => setUpdateToApply(u)}
                    hasApplied={Boolean(userApp)}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: MY HOSTED UPDATES (HOST DASHBOARD) */}
      {activeTab === 'hosted' && (
        <div className="space-y-6">
          {/* Host stats header */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-[#E5E3DC] dark:border-neutral-800 shadow-2xs">
              <div className="text-[10px] font-bold text-[#737871] uppercase">Total Hosted</div>
              <div className="text-xl font-bold font-mono text-[#171916] dark:text-neutral-100 mt-1">
                {dailyUpdates.filter((u) => u.hostId === user?.userId).length}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-[#E5E3DC] dark:border-neutral-800 shadow-2xs">
              <div className="text-[10px] font-bold text-emerald-600 uppercase">Live Active</div>
              <div className="text-xl font-bold font-mono text-emerald-600 mt-1">
                {
                  dailyUpdates.filter(
                    (u) =>
                      u.hostId === user?.userId &&
                      u.status === 'approved' &&
                      new Date(u.expiresAt) > new Date()
                  ).length
                }
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-[#E5E3DC] dark:border-neutral-800 shadow-2xs">
              <div className="text-[10px] font-bold text-amber-600 uppercase">Pending Review</div>
              <div className="text-xl font-bold font-mono text-amber-600 mt-1">
                {
                  dailyUpdates.filter(
                    (u) => u.hostId === user?.userId && u.status === 'pending'
                  ).length
                }
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-[#E5E3DC] dark:border-neutral-800 shadow-2xs">
              <div className="text-[10px] font-bold text-blue-600 uppercase">Applications In</div>
              <div className="text-xl font-bold font-mono text-blue-600 mt-1">
                {
                  updateApplications.filter((a) => {
                    const upd = dailyUpdates.find((u) => u.id === a.updateId);
                    return upd?.hostId === user?.userId;
                  }).length
                }
              </div>
            </div>
          </div>

          {/* Sub-filters for Host */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setHostStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                hostStatusFilter === 'all'
                  ? 'bg-[#F97316] text-white'
                  : 'bg-white dark:bg-neutral-900 text-[#555952] border border-[#E5E3DC] dark:border-neutral-800'
              }`}
            >
              All My Updates
            </button>
            <button
              onClick={() => setHostStatusFilter('active')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                hostStatusFilter === 'active'
                  ? 'bg-[#F97316] text-white'
                  : 'bg-white dark:bg-neutral-900 text-[#555952] border border-[#E5E3DC] dark:border-neutral-800'
              }`}
            >
              Active Live
            </button>
            <button
              onClick={() => setHostStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                hostStatusFilter === 'pending'
                  ? 'bg-[#F97316] text-white'
                  : 'bg-white dark:bg-neutral-900 text-[#555952] border border-[#E5E3DC] dark:border-neutral-800'
              }`}
            >
              Pending Review
            </button>
            <button
              onClick={() => setHostStatusFilter('changes_requested')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                hostStatusFilter === 'changes_requested'
                  ? 'bg-[#F97316] text-white'
                  : 'bg-white dark:bg-neutral-900 text-[#555952] border border-[#E5E3DC] dark:border-neutral-800'
              }`}
            >
              Changes Requested
            </button>
            <button
              onClick={() => setHostStatusFilter('draft')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                hostStatusFilter === 'draft'
                  ? 'bg-[#F97316] text-white'
                  : 'bg-white dark:bg-neutral-900 text-[#555952] border border-[#E5E3DC] dark:border-neutral-800'
              }`}
            >
              Drafts
            </button>
            <button
              onClick={() => setHostStatusFilter('expired')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                hostStatusFilter === 'expired'
                  ? 'bg-[#F97316] text-white'
                  : 'bg-white dark:bg-neutral-900 text-[#555952] border border-[#E5E3DC] dark:border-neutral-800'
              }`}
            >
              Expired
            </button>
          </div>

          {/* Hosted Updates Grid */}
          {myHostedUpdates.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-[#E5E3DC] dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
              <Layers className="w-8 h-8 text-[#737871] mx-auto" />
              <h4 className="text-sm font-bold text-[#171916] dark:text-neutral-200">
                No updates found in this view
              </h4>
              <p className="text-xs text-[#737871] dark:text-neutral-400">
                You haven&apos;t hosted any announcements matching &ldquo;{hostStatusFilter}&rdquo;.
              </p>
              <button
                onClick={() => {
                  setUpdateToEdit(null);
                  setIsHostModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#F97316] text-white text-xs font-bold hover:bg-[#EA580C] cursor-pointer"
              >
                Create an Announcement Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {myHostedUpdates.map((update) => {
                const appCount = updateApplications.filter(
                  (a) => a.updateId === update.id
                ).length;
                return (
                  <DailyUpdateCard
                    key={update.id}
                    update={update}
                    showHostControls
                    applicationsCount={appCount}
                    onOpenDetails={(u) => setSelectedUpdateForDetails(u)}
                    onEdit={handleOpenEdit}
                    onWithdraw={handleWithdraw}
                    onViewApplications={(u) => setUpdateForApplicationsView(u)}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: MY APPLICATIONS */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-[#E5E3DC] dark:border-neutral-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#171916] dark:text-neutral-100">
                My Submitted Applications
              </h3>
              <p className="text-xs text-[#737871] dark:text-neutral-400">
                Track your registrations, interviews, and team invites across campus events.
              </p>
            </div>
            <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-[#F97316]">
              {myApplications.length} Total
            </span>
          </div>

          {myApplications.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-[#E5E3DC] dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
              <FileText className="w-8 h-8 text-[#737871] mx-auto" />
              <h4 className="text-sm font-bold text-[#171916] dark:text-neutral-200">
                You haven&apos;t applied to any announcements yet
              </h4>
              <p className="text-xs text-[#737871] dark:text-neutral-400">
                Browse the Campus Feed to discover hackathons, workshop teams, and opportunities accepting applicants.
              </p>
              <button
                onClick={() => setActiveTab('feed')}
                className="px-4 py-2 rounded-xl bg-[#F97316] text-white text-xs font-bold hover:bg-[#EA580C] cursor-pointer"
              >
                Explore Campus Feed
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myApplications.map((app) => {
                const parentUpdate = dailyUpdates.find((u) => u.id === app.updateId);
                return (
                  <div
                    key={app.id}
                    className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-[#E5E3DC] dark:border-neutral-800 shadow-2xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-100 text-[#F97316]">
                            {app.updateCategory}
                          </span>
                          <h4 className="text-sm font-bold text-[#171916] dark:text-neutral-100">
                            {app.updateTitle}
                          </h4>
                        </div>
                        <div className="text-xs text-[#737871] mt-0.5">
                          Submitted on {new Date(app.submittedAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            app.status === 'accepted'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : app.status === 'declined'
                              ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                          }`}
                        >
                          Status: {app.status}
                        </span>

                        {parentUpdate && (
                          <button
                            onClick={() => setSelectedUpdateForDetails(parentUpdate)}
                            className="p-1.5 rounded-lg border border-[#E5E3DC] dark:border-neutral-700 text-[#555952] hover:text-[#171916]"
                            title="View announcement"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Feedback if any */}
                    {app.hostFeedback && (
                      <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/30 text-xs text-orange-950 dark:text-orange-200">
                        <span className="font-bold">Host Response:</span> {app.hostFeedback}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 4: ADMIN MODERATION DESK */}
      {activeTab === 'admin' && (
        <AdminModerationQueue
          onOpenPreview={(u) => setSelectedUpdateForDetails(u)}
        />
      )}

      {/* MODALS */}
      {/* 1. Host or Edit Modal */}
      <HostDailyUpdateModal
        isOpen={isHostModalOpen}
        onClose={() => {
          setIsHostModalOpen(false);
          setUpdateToEdit(null);
        }}
        existingUpdate={updateToEdit}
      />

      {/* 2. Announcement Detail Modal */}
      <DailyUpdateDetailModal
        update={selectedUpdateForDetails}
        onClose={() => setSelectedUpdateForDetails(null)}
        onApply={(u) => setUpdateToApply(u)}
        userApplication={updateApplications.find(
          (a) => a.updateId === selectedUpdateForDetails?.id && a.applicantId === user?.userId
        )}
        isHost={selectedUpdateForDetails?.hostId === user?.userId}
        isAdmin={isAdmin}
        onEdit={handleOpenEdit}
        onWithdraw={handleWithdraw}
        onModerate={moderateDailyUpdate}
      />

      {/* 3. Submit Application Modal */}
      <SubmitApplicationModal
        update={updateToApply}
        isOpen={Boolean(updateToApply)}
        onClose={() => setUpdateToApply(null)}
      />

      {/* 4. Host Review Applications Modal */}
      <HostApplicationsModal
        update={updateForApplicationsView}
        isOpen={Boolean(updateForApplicationsView)}
        onClose={() => setUpdateForApplicationsView(null)}
      />
    </div>
  );
};
