import React from 'react';
import { Lecture } from '../../types';
import { WEEKDAY_LABELS } from '../../utils/timetableCalculations';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  lecture: Lecture | null;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  lecture,
}) => {
  const [isDeleting, setIsDeleting] = React.useState(false);

  if (!isOpen || !lecture) return null;

  const subjectName = lecture.subject || lecture.subjectName || 'Lecture';
  const dayName = WEEKDAY_LABELS[lecture.day]?.name || lecture.day;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-[#E5E3DC] dark:border-neutral-800 p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
            <Trash2 className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#737871] hover:text-[#171916] dark:hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-[#171916] dark:text-neutral-100">
            Delete Lecture from Timetable?
          </h3>
          <p className="text-xs text-[#555952] dark:text-neutral-400 mt-1">
            Are you sure you want to remove this lecture from your personal schedule? This will update your timetable immediately.
          </p>
        </div>

        {/* Lecture card preview */}
        <div className="p-3.5 rounded-2xl bg-[#FAF9F5] dark:bg-neutral-800 border border-[#E5E3DC] dark:border-neutral-700 space-y-1">
          <div className="text-xs font-bold text-[#171916] dark:text-neutral-100">
            {subjectName} {lecture.subjectCode && <span className="font-mono text-[#737871]">({lecture.subjectCode})</span>}
          </div>
          <div className="text-xs text-[#555952] dark:text-neutral-400 font-mono">
            {dayName} · {lecture.startTime} – {lecture.endTime}
          </div>
          {(lecture.classroom || lecture.room) && (
            <div className="text-[11px] text-[#737871]">
              Room: {lecture.classroom || lecture.room}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl border border-[#D7D4CB] dark:border-neutral-700 hover:bg-[#FAF9F5] dark:hover:bg-neutral-800 text-xs font-bold text-[#555952] dark:text-neutral-300 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {isDeleting ? 'Deleting...' : 'Delete Lecture'}
          </button>
        </div>
      </div>
    </div>
  );
};
