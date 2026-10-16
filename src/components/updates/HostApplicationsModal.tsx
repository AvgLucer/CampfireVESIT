import React, { useState } from 'react';
import {
  DailyUpdate,
  UpdateApplication,
  UpdateApplicationStatus,
} from '../../types/dailyUpdates';
import { useApp } from '../../context/AppContext';
import {
  X,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Phone,
  MessageSquare,
  AlertCircle,
  Send,
  Sparkles,
  Check,
  ChevronDown,
  Info,
} from 'lucide-react';

interface HostApplicationsModalProps {
  update: DailyUpdate | null;
  isOpen: boolean;
  onClose: () => void;
}

const APPROVAL_PRESET_MESSAGES = [
  'Welcome to the team! Orientation meeting is this Friday at 4 PM in Lab 402.',
  'Your application is approved! Please join our WhatsApp group: https://chat.whatsapp.com/vesit-team',
  'Congratulations! Your registration is confirmed. Please carry your student ID card.',
  'Approved! Excited to collaborate with your team.',
];

const DENIAL_PRESET_MESSAGES = [
  'Thank you for your interest! Unfortunately, all slots for this cohort have been filled.',
  'Thank you for applying. We are unable to accommodate your application for this round.',
  'Prerequisites could not be validated. Feel free to connect for the next study jam!',
];

export const HostApplicationsModal: React.FC<HostApplicationsModalProps> = ({
  update,
  isOpen,
  onClose,
}) => {
  const { updateApplications, reviewUpdateApplication, showToast } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'accepted' | 'declined'>('all');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'accepted' | 'declined' | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !update) return null;

  const relevantApplications = updateApplications.filter(
    (a) => a.updateId === update.id
  );

  const pendingCount = relevantApplications.filter((a) => a.status === 'pending').length;
  const acceptedCount = relevantApplications.filter((a) => a.status === 'accepted').length;
  const declinedCount = relevantApplications.filter((a) => a.status === 'declined').length;

  const filtered = relevantApplications.filter((a) => {
    if (activeFilter === 'all') return true;
    return a.status === activeFilter;
  });

  const handleStartReview = (app: UpdateApplication, decision: 'accepted' | 'declined') => {
    setSelectedAppId(app.id);
    setReviewDecision(decision);
    setMessageText(app.hostFeedback || (decision === 'accepted' ? APPROVAL_PRESET_MESSAGES[0] : DENIAL_PRESET_MESSAGES[0]));
  };

  const handleConfirmDecision = async (appId: string) => {
    if (!reviewDecision) return;
    setIsSubmitting(true);
    try {
      await reviewUpdateApplication(appId, reviewDecision, messageText.trim() || undefined);
      setSelectedAppId(null);
      setReviewDecision(null);
      setMessageText('');
    } catch (err) {
      console.error(err);
      showToast('Failed to update application decision.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelReview = () => {
    setSelectedAppId(null);
    setReviewDecision(null);
    setMessageText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-3xl border border-[#E5E3DC] dark:border-neutral-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#E5E3DC] dark:border-neutral-800 flex items-center justify-between shrink-0 bg-white dark:bg-neutral-900">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-[#F97316] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#171916] dark:text-neutral-100">
                  Applications Review
                </h2>
                <p className="text-xs text-[#737871] dark:text-neutral-400 truncate max-w-sm sm:max-w-md">
                  Update: <strong className="text-[#F97316]">{update.title}</strong>
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#737871] hover:text-[#171916] hover:bg-[#FAF9F5] dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar and counters */}
        <div className="px-5 py-2.5 border-b border-[#E5E3DC] dark:border-neutral-800 bg-[#FAF9F5]/70 dark:bg-neutral-900/40 flex items-center justify-between gap-2 shrink-0 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-[#F97316] text-white shadow-2xs'
                  : 'text-[#555952] hover:bg-[#FAF9F5] dark:text-neutral-300'
              }`}
            >
              All ({relevantApplications.length})
            </button>
            <button
              onClick={() => setActiveFilter('pending')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                activeFilter === 'pending'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
              }`}
            >
              <span>Pending</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 text-white">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveFilter('accepted')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                activeFilter === 'accepted'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              }`}
            >
              <span>Approved</span>
              <span className="text-[10px] font-mono">({acceptedCount})</span>
            </button>
            <button
              onClick={() => setActiveFilter('declined')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                activeFilter === 'declined'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
              }`}
            >
              <span>Denied</span>
              <span className="text-[10px] font-mono">({declinedCount})</span>
            </button>
          </div>

          <div className="text-[11px] font-semibold text-[#737871] hidden sm:block">
            {pendingCount} awaiting decision
          </div>
        </div>

        {/* Applicant list */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#737871] dark:text-neutral-400 space-y-2">
              <Users className="w-8 h-8 text-neutral-300 mx-auto" />
              <div className="font-bold text-sm text-[#171916] dark:text-neutral-200">
                No applications in this category
              </div>
              <p>There are no submissions matching your current filter.</p>
            </div>
          ) : (
            filtered.map((app) => {
              const isCurrentReview = selectedAppId === app.id;
              const isAccepted = app.status === 'accepted';
              const isDeclined = app.status === 'declined';
              const isPending = app.status === 'pending';

              return (
                <div
                  key={app.id}
                  className={`p-4 rounded-2xl border transition-all space-y-3.5 shadow-xs ${
                    isCurrentReview
                      ? 'border-[#F97316] ring-2 ring-[#F97316]/20 bg-white dark:bg-neutral-900'
                      : isAccepted
                      ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/10'
                      : isDeclined
                      ? 'border-rose-200 dark:border-rose-800/60 bg-rose-50/20 dark:bg-rose-950/10'
                      : 'border-[#E5E3DC] dark:border-neutral-800 bg-white dark:bg-neutral-900'
                  }`}
                >
                  {/* Row 1: Applicant profile header & current status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-950/60 text-[#F97316] font-bold text-sm flex items-center justify-center overflow-hidden shrink-0">
                        {app.applicantAvatarUrl ? (
                          <img
                            src={app.applicantAvatarUrl}
                            alt={app.applicantName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          app.applicantName.charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#171916] dark:text-neutral-100">
                          {app.applicantName}{' '}
                          <span className="text-xs font-mono font-semibold text-[#F97316]">
                            {app.applicantUsername}
                          </span>
                        </div>
                        <div className="text-xs text-[#737871] dark:text-neutral-400">
                          {app.applicantDepartment} · {app.applicantYear} · Roll No: {app.applicantRollNumber || 'N/A'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                          isAccepted
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : isDeclined
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {isAccepted && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {isDeclined && <XCircle className="w-3.5 h-3.5" />}
                        {isPending && <Clock className="w-3.5 h-3.5" />}
                        <span>{isAccepted ? 'Approved' : isDeclined ? 'Denied' : 'Pending Review'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Statement note */}
                  {app.statement && (
                    <div className="p-3 rounded-xl bg-[#FAF9F5] dark:bg-neutral-800 text-xs text-[#171916] dark:text-neutral-200">
                      <span className="font-bold text-[#737871] block text-[10px] uppercase mb-0.5">
                        Applicant Motivation / Statement:
                      </span>
                      &ldquo;{app.statement}&rdquo;
                    </div>
                  )}

                  {/* Answers to custom questions */}
                  {app.answers && app.answers.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-[#E5E3DC]/60 dark:border-neutral-800">
                      <div className="text-[10px] font-bold text-[#737871] dark:text-neutral-400 uppercase tracking-wider">
                        Applicant Answers to Host Questions
                      </div>
                      {app.answers.map((qa, i) => (
                        <div
                          key={i}
                          className="text-xs p-2.5 rounded-xl bg-[#FAF9F5] dark:bg-neutral-800 space-y-1"
                        >
                          <div className="font-semibold text-[#555952] dark:text-neutral-300">
                            <span className="text-[#F97316] font-bold">Q{i + 1}.</span> {qa.question}
                          </div>
                          <div className="font-bold text-[#171916] dark:text-neutral-100">
                            {qa.answer}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Existing Host Feedback / Message Sent */}
                  {app.hostFeedback && !isCurrentReview && (
                    <div className={`p-3 rounded-xl text-xs space-y-1 ${
                      isAccepted
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                        : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                    }`}>
                      <div className="font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Message Sent to Student:</span>
                      </div>
                      <p className="font-medium italic">&ldquo;{app.hostFeedback}&rdquo;</p>
                    </div>
                  )}

                  {/* APPROVAL / DENIAL MESSAGE INTERACTIVE BOX */}
                  {isCurrentReview && reviewDecision && (
                    <div className={`p-4 rounded-2xl border space-y-3 ${
                      reviewDecision === 'accepted'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100'
                        : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 text-rose-950 dark:text-rose-100'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          {reviewDecision === 'accepted' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-600" />
                          )}
                          <span>
                            {reviewDecision === 'accepted'
                              ? `Approve ${app.applicantName} & Send Message`
                              : `Deny ${app.applicantName}'s Application`}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-[#737871]">
                          Student will receive this message
                        </span>
                      </div>

                      {/* Textarea for Host's Message */}
                      <div>
                        <textarea
                          rows={2}
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          placeholder={
                            reviewDecision === 'accepted'
                              ? 'Write an acceptance note (e.g. WhatsApp invite, room meeting info, expectations)...'
                              : 'Write reason or polite note for student...'
                          }
                          className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-[#171916] dark:text-neutral-100 focus:outline-none focus:border-[#F97316]"
                        />
                      </div>

                      {/* Quick message presets chips */}
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-[#737871] uppercase tracking-wide flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#F97316]" /> Quick Suggestions:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {(reviewDecision === 'accepted' ? APPROVAL_PRESET_MESSAGES : DENIAL_PRESET_MESSAGES).map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setMessageText(preset)}
                              className="text-[11px] px-2 py-1 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:border-[#F97316] text-neutral-700 dark:text-neutral-200 text-left cursor-pointer"
                            >
                              &ldquo;{preset.slice(0, 48)}...&rdquo;
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Decision submit buttons */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                        <button
                          type="button"
                          onClick={handleCancelReview}
                          className="px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleConfirmDecision(app.id)}
                          className={`px-4 py-1.5 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                            reviewDecision === 'accepted'
                              ? 'bg-emerald-600 hover:bg-emerald-700'
                              : 'bg-rose-600 hover:bg-rose-700'
                          }`}
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>
                            {isSubmitting
                              ? 'Sending...'
                              : reviewDecision === 'accepted'
                              ? 'Confirm Approval & Notify Student'
                              : 'Confirm Denial & Notify Student'}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons Row */}
                  {!isCurrentReview && (
                    <div className="pt-2 border-t border-[#E5E3DC]/60 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3 text-xs text-[#737871]">
                        {app.applicantEmail && (
                          <a
                            href={`mailto:${app.applicantEmail}`}
                            className="hover:text-[#F97316] flex items-center gap-1"
                          >
                            <Mail className="w-3 h-3" />
                            <span>{app.applicantEmail}</span>
                          </a>
                        )}
                        {app.applicantPhone && (
                          <a
                            href={`tel:${app.applicantPhone}`}
                            className="hover:text-[#F97316] flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{app.applicantPhone}</span>
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Primary action buttons */}
                        <button
                          type="button"
                          onClick={() => handleStartReview(app, 'accepted')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isAccepted
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isAccepted ? 'Update Approval Message' : 'Approve & Message'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStartReview(app, 'declined')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isDeclined
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                              : 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{isDeclined ? 'Update Denial Note' : 'Deny Application'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
