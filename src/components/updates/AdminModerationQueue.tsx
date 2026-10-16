import React, { useState } from 'react';
import { DailyUpdate, UpdateModerationStatus } from '../../types/dailyUpdates';
import { CustomFieldRenderer } from './CustomFieldRenderer';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Eye,
  FileText,
  Filter,
  History,
  Send,
  MessageSquare,
  Users,
  MapPin,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

interface AdminModerationQueueProps {
  onOpenPreview: (update: DailyUpdate) => void;
}

export const AdminModerationQueue: React.FC<AdminModerationQueueProps> = ({
  onOpenPreview,
}) => {
  const { dailyUpdates, moderateDailyUpdate, user } = useApp();

  const [filter, setFilter] = useState<'pending' | 'changes_requested' | 'approved' | 'declined' | 'expired' | 'all'>('pending');
  const [selectedUpdateId, setSelectedUpdateId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'approved' | 'declined' | 'changes_requested' | null>(null);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user?.role !== 'admin') {
    return (
      <div className="p-8 sm:p-12 rounded-3xl border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/20 text-center space-y-3">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-red-100 dark:bg-red-900/40 text-red-600 flex items-center justify-center">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-red-900 dark:text-red-200">
          Access Restricted to Admin Role Members
        </h3>
        <p className="text-xs text-red-700 dark:text-red-400 max-w-md mx-auto">
          The Campus Announcement Moderation Desk is reserved strictly for authenticated Academic Council members and faculty administrators.
        </p>
      </div>
    );
  }

  // Categorized counts
  const pendingCount = dailyUpdates.filter((u) => u.status === 'pending').length;
  const changesCount = dailyUpdates.filter((u) => u.status === 'changes_requested').length;
  const approvedCount = dailyUpdates.filter((u) => u.status === 'approved').length;
  const declinedCount = dailyUpdates.filter((u) => u.status === 'declined').length;
  const expiredCount = dailyUpdates.filter((u) => u.status === 'expired').length;

  const filteredUpdates = dailyUpdates.filter((u) => {
    if (filter === 'all') return true;
    return u.status === filter;
  });

  const handleActionClick = (
    updateId: string,
    action: 'approved' | 'declined' | 'changes_requested'
  ) => {
    if (action === 'approved') {
      moderateDailyUpdate(updateId, 'approved');
      setSelectedUpdateId(null);
    } else {
      setSelectedUpdateId(updateId);
      setActionType(action);
      setFeedbackNote('');
    }
  };

  const submitActionWithFeedback = async () => {
    if (!selectedUpdateId || !actionType) return;
    setIsSubmitting(true);
    try {
      await moderateDailyUpdate(selectedUpdateId, actionType, feedbackNote.trim() || undefined);
      setSelectedUpdateId(null);
      setActionType(null);
      setFeedbackNote('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Admin Banner & Role indicator */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/10 via-orange-500/10 to-transparent border border-blue-200 dark:border-blue-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#171916] dark:text-neutral-100 flex items-center gap-1.5">
              <span>Campus Announcement Moderation Desk</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-mono font-bold">
                Admin Council
              </span>
            </h3>
            <p className="text-xs text-[#737871] dark:text-neutral-400">
              Logged in as <strong className="text-[#171916] dark:text-neutral-200">{user?.name}</strong>. Screen submissions for campus policy, clarity, safety, and deadlines.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-neutral-800 border border-[#E5E3DC] dark:border-neutral-700 font-bold text-amber-600">
            {pendingCount} Pending
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-neutral-800 border border-[#E5E3DC] dark:border-neutral-700 font-bold text-emerald-600">
            {approvedCount} Active Live
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setFilter('pending')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            filter === 'pending'
              ? 'bg-[#F97316] text-white shadow-xs'
              : 'bg-white dark:bg-neutral-800 text-[#555952] dark:text-neutral-300 border border-[#E5E3DC] dark:border-neutral-700'
          }`}
        >
          <span>Pending Review</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 dark:bg-white/20">
            {pendingCount}
          </span>
        </button>

        <button
          onClick={() => setFilter('changes_requested')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            filter === 'changes_requested'
              ? 'bg-[#F97316] text-white shadow-xs'
              : 'bg-white dark:bg-neutral-800 text-[#555952] dark:text-neutral-300 border border-[#E5E3DC] dark:border-neutral-700'
          }`}
        >
          <span>Changes Requested</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 dark:bg-white/20">
            {changesCount}
          </span>
        </button>

        <button
          onClick={() => setFilter('approved')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            filter === 'approved'
              ? 'bg-[#F97316] text-white shadow-xs'
              : 'bg-white dark:bg-neutral-800 text-[#555952] dark:text-neutral-300 border border-[#E5E3DC] dark:border-neutral-700'
          }`}
        >
          <span>Approved / Active</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 dark:bg-white/20">
            {approvedCount}
          </span>
        </button>

        <button
          onClick={() => setFilter('declined')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            filter === 'declined'
              ? 'bg-[#F97316] text-white shadow-xs'
              : 'bg-white dark:bg-neutral-800 text-[#555952] dark:text-neutral-300 border border-[#E5E3DC] dark:border-neutral-700'
          }`}
        >
          <span>Declined</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 dark:bg-white/20">
            {declinedCount}
          </span>
        </button>

        <button
          onClick={() => setFilter('expired')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            filter === 'expired'
              ? 'bg-[#F97316] text-white shadow-xs'
              : 'bg-white dark:bg-neutral-800 text-[#555952] dark:text-neutral-300 border border-[#E5E3DC] dark:border-neutral-700'
          }`}
        >
          <span>Expired Archive</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 dark:bg-white/20">
            {expiredCount}
          </span>
        </button>

        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-colors cursor-pointer ${
            filter === 'all'
              ? 'bg-[#F97316] text-white shadow-xs'
              : 'bg-white dark:bg-neutral-800 text-[#555952] dark:text-neutral-300 border border-[#E5E3DC] dark:border-neutral-700'
          }`}
        >
          All Updates ({dailyUpdates.length})
        </button>
      </div>

      {/* Queue items */}
      {filteredUpdates.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-[#E5E3DC] dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2">
          <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
          <h4 className="text-sm font-bold text-[#171916] dark:text-neutral-200">
            Moderation Queue is Clear
          </h4>
          <p className="text-xs text-[#737871] dark:text-neutral-400">
            No announcements currently match the selected filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUpdates.map((item) => {
            const isActing = selectedUpdateId === item.id;
            return (
              <div
                key={item.id}
                className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-[#E5E3DC] dark:border-neutral-800 space-y-4 shadow-xs hover:border-[#F97316]/40 transition-all"
              >
                {/* Top Row: Cover Thumb, Title, Host & Status */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <img
                      src={item.coverImageUrl}
                      alt={item.title}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 cursor-pointer"
                      onClick={() => onOpenPreview(item)}
                    />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-100 dark:bg-orange-950/60 text-[#F97316]">
                          {item.category}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-700'
                              : item.status === 'pending'
                              ? 'bg-amber-100 text-amber-700'
                              : item.status === 'changes_requested'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          {item.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>

                      <h3
                        onClick={() => onOpenPreview(item)}
                        className="text-base font-bold text-[#171916] dark:text-neutral-100 hover:text-[#F97316] cursor-pointer"
                      >
                        {item.title}
                      </h3>

                      <div className="text-xs text-[#737871] dark:text-neutral-400 flex flex-wrap items-center gap-3">
                        <span>Host: <strong>{item.hostName}</strong> ({item.hostUsername})</span>
                        <span>•</span>
                        <span>Expires: {new Date(item.expiresAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Submitted: {new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenPreview(item)}
                    className="self-start px-3 py-1.5 rounded-xl border border-[#E5E3DC] dark:border-neutral-700 text-xs font-bold text-[#555952] dark:text-neutral-200 hover:text-[#171916] hover:bg-[#FAF9F5] flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#F97316]" />
                    <span>Full Preview</span>
                  </button>
                </div>

                {/* Excerpt */}
                <p className="text-xs text-[#555952] dark:text-neutral-300 line-clamp-2 leading-relaxed bg-[#FAF9F5] dark:bg-neutral-800/50 p-3 rounded-xl border border-[#E5E3DC]/60 dark:border-neutral-800">
                  {item.description}
                </p>

                {/* Dynamic Custom Fields Summary */}
                {item.customFields && item.customFields.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {item.customFields.map((f) => (
                      <CustomFieldRenderer key={f.id} field={f} variant="pill" />
                    ))}
                  </div>
                )}

                {/* Moderation note if present */}
                {item.moderationFeedback && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                    <span className="font-bold">Latest Review Note:</span> {item.moderationFeedback}
                  </div>
                )}

                {/* Audit Log history trail */}
                {item.auditLog && item.auditLog.length > 0 && (
                  <div className="pt-2 border-t border-[#E5E3DC]/50 dark:border-neutral-800 flex items-center gap-2 text-[11px] text-[#737871]">
                    <History className="w-3.5 h-3.5 text-[#F97316]" />
                    <span>
                      Audit History: {item.auditLog.length} event(s) recorded · Last action by{' '}
                      <strong>{item.auditLog[item.auditLog.length - 1].actorName}</strong> (
                      {item.auditLog[item.auditLog.length - 1].action})
                    </span>
                  </div>
                )}

                {/* Feedback Input Drawer when declining or requesting changes */}
                {isActing && actionType && (
                  <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 space-y-3">
                    <div className="text-xs font-bold text-[#171916] dark:text-neutral-100 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-[#F97316]" />
                      <span>
                        Provide Specific Guidance for Host ({actionType === 'declined' ? 'Decline Reason' : 'Changes Requested'}):
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={feedbackNote}
                      onChange={(e) => setFeedbackNote(e.target.value)}
                      placeholder={
                        actionType === 'changes_requested'
                          ? 'e.g. Please specify lab room number and attach faculty sign-off...'
                          : 'Reason for declining this update...'
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-orange-300 dark:border-orange-700 bg-white dark:bg-neutral-900 text-[#171916] dark:text-neutral-100 focus:outline-none focus:border-[#F97316]"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUpdateId(null);
                          setActionType(null);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={submitActionWithFeedback}
                        className="px-4 py-1.5 rounded-xl bg-[#F97316] text-white text-xs font-bold hover:bg-[#EA580C] cursor-pointer"
                      >
                        Confirm & Send Notification
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Buttons Row */}
                {!isActing && (
                  <div className="pt-2 border-t border-[#E5E3DC] dark:border-neutral-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs text-[#737871]">
                      {item.acceptsApplications && (
                        <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                          <Users className="w-3.5 h-3.5" /> Applications Enabled
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {item.status !== 'approved' && (
                        <button
                          type="button"
                          onClick={() => handleActionClick(item.id, 'approved')}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Approve & Publish</span>
                        </button>
                      )}

                      {item.status !== 'changes_requested' && item.status !== 'expired' && (
                        <button
                          type="button"
                          onClick={() => handleActionClick(item.id, 'changes_requested')}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Request Changes</span>
                        </button>
                      )}

                      {item.status !== 'declined' && item.status !== 'expired' && (
                        <button
                          type="button"
                          onClick={() => handleActionClick(item.id, 'declined')}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
