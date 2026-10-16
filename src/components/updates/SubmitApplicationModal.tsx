import React, { useState } from 'react';
import { DailyUpdate } from '../../types/dailyUpdates';
import { useApp } from '../../context/AppContext';
import {
  X,
  Send,
  User,
  GraduationCap,
  Mail,
  Phone,
  FileText,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface SubmitApplicationModalProps {
  update: DailyUpdate | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SubmitApplicationModal: React.FC<SubmitApplicationModalProps> = ({
  update,
  isOpen,
  onClose,
}) => {
  const { user, submitUpdateApplication, showToast } = useApp();

  const [statement, setStatement] = useState('');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !update) return null;

  const questions = update.applicationQuestions || [];

  const handleAnswerChange = (idx: number, val: string) => {
    setAnswers((prev) => ({ ...prev, [idx]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be signed in to submit an application.');
      return;
    }

    // Check required questions
    for (let i = 0; i < questions.length; i++) {
      if (!answers[i] || !answers[i].trim()) {
        setError(`Please answer question #${i + 1}`);
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formattedAnswers = questions.map((q, idx) => ({
        question: q,
        answer: answers[idx]?.trim() || '',
      }));

      const success = await submitUpdateApplication(
        update.id,
        statement.trim(),
        formattedAnswers
      );

      if (success) {
        onClose();
      }
    } catch (err) {
      console.error(err);
      setError('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-neutral-900 rounded-3xl border border-[#E5E3DC] dark:border-neutral-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#E5E3DC] dark:border-neutral-800 flex items-center justify-between shrink-0 bg-white dark:bg-neutral-900">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#171916] dark:text-neutral-100">
              Submit Application
            </h2>
            <p className="text-xs text-[#737871] dark:text-neutral-400 truncate max-w-md">
              Applying for: <span className="font-semibold text-[#F97316]">{update.title}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#737871] hover:text-[#171916] hover:bg-[#FAF9F5] dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Applicant Info Summary Box */}
          <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-neutral-800/80 border border-[#E5E3DC] dark:border-neutral-700 space-y-2">
            <div className="text-[10px] font-bold text-[#737871] dark:text-neutral-400 uppercase tracking-wider">
              Applicant Profile (Auto-filled)
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-950/60 text-[#F97316] font-bold text-sm flex items-center justify-center overflow-hidden">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user?.name.charAt(0)
                )}
              </div>
              <div>
                <div className="text-sm font-bold text-[#171916] dark:text-neutral-100">
                  {user?.name} ({user?.username})
                </div>
                <div className="text-xs text-[#555952] dark:text-neutral-400">
                  {user?.department} · {user?.year} · Roll No: {user?.rollNumber || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Statement / Cover Note */}
          <div>
            <label className="text-xs font-bold text-[#171916] dark:text-neutral-100 flex items-center justify-between">
              <span>Why are you applying / Statement</span>
              <span className="text-[10px] text-[#737871]">Optional</span>
            </label>
            <textarea
              rows={3}
              placeholder="Introduce your team, background, goals, or motivation..."
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              className="w-full mt-1.5 px-3 py-2 text-xs rounded-xl border border-[#E5E3DC] dark:border-neutral-700 bg-[#FAF9F5] dark:bg-neutral-800 text-[#171916] dark:text-neutral-100 focus:outline-none focus:border-[#F97316]"
            />
          </div>

          {/* Custom Host Questions */}
          {questions.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-[#E5E3DC] dark:border-neutral-800">
              <div className="text-xs font-bold text-[#171916] dark:text-neutral-100">
                Host Questions
              </div>
              {questions.map((question, idx) => (
                <div key={idx} className="space-y-1">
                  <label className="text-xs font-semibold text-[#555952] dark:text-neutral-300">
                    <span className="text-[#F97316] font-bold">Q{idx + 1}.</span> {question} *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Your answer..."
                    value={answers[idx] || ''}
                    onChange={(e) => handleAnswerChange(idx, e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E3DC] dark:border-neutral-700 bg-[#FAF9F5] dark:bg-neutral-800 text-[#171916] dark:text-neutral-100 focus:outline-none focus:border-[#F97316]"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-[#E5E3DC] dark:border-neutral-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#737871] hover:text-[#171916]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold flex items-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Application'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
