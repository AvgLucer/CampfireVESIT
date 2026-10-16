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
} from 'lucide-react';

interface HostApplicationsModalProps {
  update: DailyUpdate | null;
  isOpen: boolean;
  onClose: () => void;
}

export const HostApplicationsModal: React.FC<HostApplicationsModalProps> = ({
  update,
  isOpen,
  onClose,
}) => {
  const { updateApplications, reviewUpdateApplication } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'accepted' | 'declined'>('all');
  const [feedbackInput, setFeedbackInput] = useState<{ [id: string]: string }>({});
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  if (!isOpen || !update) return null;

  const relevantApplications = updateApplications.filter(
    (a) => a.updateId === update.id
  );

  const filtered = relevantApplications.filter((a) => {
    if (activeFilter === 'all') return true;
    return a.status === activeFilter;
  });

  const handleReview = async (
    appId: string,
    status: UpdateApplicationStatus,
    feedback?: string
  ) => {
    await reviewUpdateApplication(appId, status, feedback);
    setSelectedAppId(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-3xl border border-[#E5E3DC] dark:border-neutral-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#E5E3DC] dark:border-neutral-800 flex items-center justify-between shrink-0 bg-white dark:bg-neutral-900">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#F97316]" />
              <h2 className="text-base sm:text-lg font-bold text-[#171916] dark:text-neutral-100">
                Applicants: {update.title}
              </h2>
            </div>
            <p className="text-xs text-[#737871] dark:text-neutral-400 mt-0.5">
              Review submissions, interview notes, and manage participant roster.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#737871] hover:text-[#171916] hover:bg-[#FAF9F5] dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="px-5 py-2.5 border-b border-[#E5E3DC] dark:border-neutral-800 bg-[#FAF9F5]/60 dark:bg-neutral-900/40 flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-[#F97316] text-white'
                : 'text-[#555952] hover:bg-[#FAF9F5] dark:text-neutral-300'
            }`}
          >
            All ({relevantApplications.length})
          </button>
          <button
            onClick={() => setActiveFilter('pending')}
            className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
              activeFilter === 'pending'
                ? 'bg-[#F97316] text-white'
                : 'text-[#555952] hover:bg-[#FAF9F5] dark:text-neutral-300'
            }`}
          >
            Pending ({relevantApplications.filter((a) => a.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveFilter('accepted')}
            className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
              activeFilter === 'accepted'
                ? 'bg-[#F97316] text-white'
                : 'text-[#555952] hover:bg-[#FAF9F5] dark:text-neutral-300'
            }`}
          >
            Accepted ({relevantApplications.filter((a) => a.status === 'accepted').length})
          </button>
          <button
            onClick={() => setActiveFilter('declined')}
            className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
              activeFilter === 'declined'
                ? 'bg-[#F97316] text-white'
                : 'text-[#555952] hover:bg-[#FAF9F5] dark:text-neutral-300'
            }`}
          >
            Declined ({relevantApplications.filter((a) => a.status === 'declined').length})
          </button>
        </div>

        {/* Applicant list */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#737871] dark:text-neutral-400">
              No applications in this view.
            </div>
          ) : (
            filtered.map((app) => {
              const isSelected = selectedAppId === app.id;
              return (
                <div
                  key={app.id}
                  className="p-4 rounded-2xl border border-[#E5E3DC] dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3 shadow-xs"
                >
                  {/* Applicant Info Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-950/60 text-[#F97316] font-bold text-xs flex items-center justify-center overflow-hidden shrink-0">
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
                        <div className="text-xs font-bold text-[#171916] dark:text-neutral-100">
                          {app.applicantName} ({app.applicantUsername})
                        </div>
                        <div className="text-[11px] text-[#737871] dark:text-neutral-400">
                          {app.applicantDepartment} · {app.applicantYear} · Roll: {app.applicantRollNumber || 'N/A'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          app.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : app.status === 'declined'
                            ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                  </div>

                  {/* Statement note */}
                  {app.statement && (
                    <div className="p-3 rounded-xl bg-[#FAF9F5] dark:bg-neutral-800 text-xs text-[#171916] dark:text-neutral-200">
                      <span className="font-bold text-[#737871] block text-[10px] uppercase">
                        Applicant Note:
                      </span>
                      &ldquo;{app.statement}&rdquo;
                    </div>
                  )}

                  {/* Answers to custom questions */}
                  {app.answers && app.answers.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-[#E5E3DC]/60 dark:border-neutral-800">
                      <div className="text-[10px] font-bold text-[#737871] dark:text-neutral-400 uppercase tracking-wider">
                        Question Answers
                      </div>
                      {app.answers.map((qa, i) => (
                        <div
                          key={i}
                          className="text-xs p-2.5 rounded-xl bg-[#FAF9F5] dark:bg-neutral-800 space-y-1"
                        >
                          <div className="font-semibold text-[#555952] dark:text-neutral-300">
                            {qa.question}
                          </div>
                          <div className="font-bold text-[#171916] dark:text-neutral-100">
                            {qa.answer}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Host note if already reviewed */}
                  {app.hostFeedback && (
                    <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/30 text-xs text-orange-950 dark:text-orange-200">
                      <span className="font-bold">Your Feedback:</span> {app.hostFeedback}
                    </div>
                  )}

                  {/* Actions / Review controls */}
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
                      {isSelected ? (
                        <div className="w-full space-y-2">
                          <input
                            type="text"
                            placeholder="Optional response / note for applicant..."
                            value={feedbackInput[app.id] || ''}
                            onChange={(e) =>
                              setFeedbackInput({ ...feedbackInput, [app.id]: e.target.value })
                            }
                            className="w-full px-3 py-1 text-xs rounded-xl border border-[#E5E3DC] dark:border-neutral-700 bg-white dark:bg-neutral-800"
                          />
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedAppId(null)}
                              className="px-2.5 py-1 text-xs text-neutral-500 hover:text-neutral-800"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleReview(app.id, 'accepted', feedbackInput[app.id])
                              }
                              className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                            >
                              Confirm Accept
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleReview(app.id, 'declined', feedbackInput[app.id])
                              }
                              className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700"
                            >
                              Confirm Decline
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => setSelectedAppId(app.id)}
                            className="px-3 py-1.5 rounded-xl border border-[#E5E3DC] dark:border-neutral-700 text-xs font-bold text-[#171916] dark:text-neutral-200 hover:bg-[#FAF9F5] transition-colors"
                          >
                            Update Decision
                          </button>
                          {app.status === 'pending' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleReview(app.id, 'accepted')}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Accept</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReview(app.id, 'declined')}
                                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Decline</span>
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
