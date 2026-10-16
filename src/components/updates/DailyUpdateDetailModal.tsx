import React, { useState } from 'react';
import { DailyUpdate, UpdateApplication } from '../../types/dailyUpdates';
import { CustomFieldRenderer } from './CustomFieldRenderer';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Share2,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Check,
  Users,
  Copy,
  Info,
} from 'lucide-react';

interface DailyUpdateDetailModalProps {
  update: DailyUpdate | null;
  onClose: () => void;
  onApply?: (update: DailyUpdate) => void;
  userApplication?: UpdateApplication | null;
  isHost?: boolean;
  isAdmin?: boolean;
  onEdit?: (update: DailyUpdate) => void;
  onWithdraw?: (update: DailyUpdate) => void;
  onModerate?: (
    updateId: string,
    action: 'approved' | 'declined' | 'changes_requested' | 'expired',
    feedback?: string
  ) => void;
}

export const DailyUpdateDetailModal: React.FC<DailyUpdateDetailModalProps> = ({
  update,
  onClose,
  onApply,
  userApplication,
  isHost = false,
  isAdmin = false,
  onEdit,
  onWithdraw,
  onModerate,
}) => {
  const [copied, setCopied] = useState(false);
  const [adminFeedback, setAdminFeedback] = useState('');
  const [showFeedbackInput, setShowFeedbackInput] = useState<
    'declined' | 'changes_requested' | null
  >(null);

  if (!update) return null;

  const isExpired =
    update.status === 'expired' || new Date(update.expiresAt) <= new Date();

  // Expiration countdown
  const getRemainingText = () => {
    if (isExpired) return 'Announcement Expired';
    const diff = new Date(update.expiresAt).getTime() - new Date().getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} and ${hours} hours left`;
    if (hours > 0) return `${hours} hours and ${mins} mins left`;
    return `${mins} minutes left`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + `/updates?id=${update.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-3xl border border-[#E5E3DC] dark:border-neutral-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header Cover Image */}
        <div className="relative h-56 sm:h-64 w-full bg-neutral-900 shrink-0">
          <img
            src={update.coverImageUrl}
            alt={update.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/30" />

          {/* Close & Share Buttons */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/80 transition-colors"
              title="Share update link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Top category & status */}
          <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/20">
              {update.category}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md ${
                isExpired
                  ? 'bg-neutral-800 text-neutral-300'
                  : update.status === 'approved'
                  ? 'bg-emerald-600 text-white'
                  : update.status === 'pending'
                  ? 'bg-amber-600 text-white'
                  : 'bg-rose-600 text-white'
              }`}
            >
              {isExpired ? 'Expired' : update.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          {/* Title & Expiration on Cover */}
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white drop-shadow-md leading-snug">
              {update.title}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-white/90">
              <span className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-orange-400" />
                <span>{getRemainingText()}</span>
              </span>
              {update.location && (
                <span className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                  <MapPin className="w-3.5 h-3.5 text-orange-400" />
                  <span>{update.location}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Moderation Feedback Banner (if changes requested or declined) */}
          {update.moderationFeedback && (
            <div
              className={`p-4 rounded-2xl border flex items-start gap-3 ${
                update.status === 'changes_requested'
                  ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                  : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
              }`}
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#F97316]" />
              <div className="text-xs space-y-1">
                <div className="font-bold">Moderator Notice</div>
                <div>{update.moderationFeedback}</div>
              </div>
            </div>
          )}

          {/* Full Description */}
          <div>
            <h4 className="text-xs font-bold text-[#737871] dark:text-neutral-400 uppercase tracking-wider mb-2">
              Announcement Overview
            </h4>
            <p className="text-sm text-[#171916] dark:text-neutral-200 leading-relaxed whitespace-pre-wrap">
              {update.description}
            </p>
          </div>

          {/* Dynamic Custom Fields Section */}
          {update.customFields && update.customFields.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-[#737871] dark:text-neutral-400 uppercase tracking-wider mb-3">
                Key Information & Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {update.customFields.map((field) => (
                  <CustomFieldRenderer
                    key={field.id}
                    field={field}
                    variant="detailed"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Host & Contact Card */}
          <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-neutral-800/80 border border-[#E5E3DC] dark:border-neutral-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-950/60 text-[#F97316] font-bold text-base flex items-center justify-center overflow-hidden shrink-0">
                {update.hostAvatarUrl ? (
                  <img
                    src={update.hostAvatarUrl}
                    alt={update.hostName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  update.hostName.charAt(0)
                )}
              </div>
              <div>
                <div className="text-sm font-bold text-[#171916] dark:text-neutral-100 flex items-center gap-1.5">
                  <span>{update.hostName}</span>
                  {update.hostRole === 'admin' && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
                      Faculty / Admin
                    </span>
                  )}
                </div>
                <div className="text-xs text-[#737871] dark:text-neutral-400">
                  {update.hostDepartment} · {update.hostUsername}
                </div>
              </div>
            </div>

            {/* Contact Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {update.contactEmail && (
                <a
                  href={`mailto:${update.contactEmail}`}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-700 border border-[#E5E3DC] dark:border-neutral-600 text-xs font-semibold text-[#171916] dark:text-neutral-200 hover:border-[#F97316] flex items-center gap-1.5 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#F97316]" />
                  <span>Email Host</span>
                </a>
              )}
              {update.contactPhone && (
                <a
                  href={`tel:${update.contactPhone}`}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-700 border border-[#E5E3DC] dark:border-neutral-600 text-xs font-semibold text-[#171916] dark:text-neutral-200 hover:border-[#F97316] flex items-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#F97316]" />
                  <span>Call / WhatsApp</span>
                </a>
              )}
            </div>
          </div>

          {/* External Link if present */}
          {update.externalLink && (
            <div className="p-3.5 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#171916] dark:text-neutral-200 min-w-0">
                <ExternalLink className="w-4 h-4 text-[#F97316] shrink-0" />
                <span className="truncate">Official Registration / Documentation URL</span>
              </div>
              <a
                href={
                  update.externalLink.startsWith('http')
                    ? update.externalLink
                    : `https://${update.externalLink}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-[#F97316] text-white text-xs font-bold hover:bg-[#EA580C] shrink-0"
              >
                Visit Site ↗
              </a>
            </div>
          )}

          {/* Expiration & Timeline Details */}
          <div className="p-3.5 rounded-xl bg-[#FAF9F5] dark:bg-neutral-800/50 border border-[#E5E3DC] dark:border-neutral-700 text-xs text-[#555952] dark:text-neutral-400 space-y-1">
            <div className="flex items-center justify-between">
              <span>Submitted / Created:</span>
              <span className="font-semibold text-[#171916] dark:text-neutral-200">
                {new Date(update.createdAt).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Host Expiration Deadline:</span>
              <span className="font-semibold text-[#F97316]">
                {new Date(update.expiresAt).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Actions Footer */}
        <div className="p-4 sm:p-5 border-t border-[#E5E3DC] dark:border-neutral-800 bg-[#FAF9F5]/80 dark:bg-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-[#737871] dark:text-neutral-400">
            {update.acceptsApplications ? (
              <span className="flex items-center gap-1.5 font-medium">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  Applications open · {update.maxApplicants ? `Limit ${update.maxApplicants}` : 'Open Batch'}
                </span>
              </span>
            ) : (
              <span>Informational announcement only</span>
            )}
          </div>

          {/* Action buttons based on role / status */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* Admin Moderation controls */}
            {isAdmin && onModerate && update.status === 'pending' && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onModerate(update.id, 'approved')}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                >
                  Approve Update
                </button>
                <button
                  type="button"
                  onClick={() => setShowFeedbackInput('changes_requested')}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer"
                >
                  Request Changes
                </button>
                <button
                  type="button"
                  onClick={() => setShowFeedbackInput('declined')}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                >
                  Decline
                </button>
              </div>
            )}

            {/* Host Controls */}
            {isHost && (
              <>
                {onEdit && (update.status === 'draft' || update.status === 'changes_requested' || update.status === 'approved') && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onEdit(update);
                    }}
                    className="px-4 py-2 rounded-xl border border-[#E5E3DC] dark:border-neutral-700 text-[#171916] dark:text-neutral-100 hover:bg-[#FAF9F5] text-xs font-bold cursor-pointer"
                  >
                    Edit Announcement
                  </button>
                )}
                {onWithdraw && update.status !== 'withdrawn' && update.status !== 'expired' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Withdraw this announcement from campus feed?')) {
                        onWithdraw(update);
                        onClose();
                      }
                    }}
                    className="px-4 py-2 rounded-xl border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 text-xs font-bold cursor-pointer"
                  >
                    Withdraw
                  </button>
                )}
              </>
            )}

            {/* Student Application Action */}
            {update.acceptsApplications && onApply && (
              <>
                {userApplication ? (
                  <div className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>Applied: {userApplication.status.toUpperCase()}</span>
                  </div>
                ) : isExpired ? (
                  <span className="text-xs font-semibold text-neutral-400">
                    Applications closed (Expired)
                  </span>
                ) : update.status === 'approved' ? (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onApply(update);
                    }}
                    className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                  >
                    Submit Application
                  </button>
                ) : (
                  <span className="text-xs text-neutral-400">
                    Awaiting admin approval
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Admin Feedback Prompt Overlay */}
        {showFeedbackInput && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950 border-t border-amber-200 dark:border-amber-800 space-y-2">
            <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
              Provide feedback for host ({showFeedbackInput.replace('_', ' ')}):
            </div>
            <textarea
              rows={2}
              value={adminFeedback}
              onChange={(e) => setAdminFeedback(e.target.value)}
              placeholder="Specify requirements or reason..."
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-neutral-900 text-[#171916] dark:text-neutral-100"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowFeedbackInput(null)}
                className="px-3 py-1 rounded-lg text-xs font-semibold text-neutral-600 hover:text-neutral-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onModerate) {
                    onModerate(update.id, showFeedbackInput, adminFeedback);
                    setShowFeedbackInput(null);
                    onClose();
                  }
                }}
                className="px-4 py-1.5 rounded-lg bg-[#F97316] text-white text-xs font-bold"
              >
                Confirm {showFeedbackInput.replace('_', ' ')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
