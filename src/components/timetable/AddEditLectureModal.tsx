import React, { useState, useEffect, useMemo } from 'react';
import { Weekday, Lecture } from '../../types';
import {
  WEEKDAYS,
  WEEKDAY_LABELS,
  COLLEGE_START_MINUTES,
  COLLEGE_END_MINUTES,
  LUNCH_START_MINUTES,
  LUNCH_END_MINUTES,
  parseTimeToMinutes,
  minutesToFormatted12h,
  minutesToInputTime,
  validateLectureSchedule,
} from '../../utils/timetableCalculations';
import {
  X,
  Clock,
  BookOpen,
  User,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

interface AddEditLectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lectureData: {
    day: Weekday;
    subject: string;
    subjectCode?: string;
    startTime: string;
    endTime: string;
    facultyName?: string;
    classroom?: string;
    notes?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  initialDay?: Weekday;
  lectureToEdit?: Lecture | null;
  existingLectures: Lecture[];
}

const COMMON_START_TIMES = [
  { label: '8:30 AM', time: '08:30' },
  { label: '9:00 AM', time: '09:00' },
  { label: '9:30 AM', time: '09:30' },
  { label: '10:30 AM', time: '10:30' },
  { label: '11:30 AM', time: '11:30' },
  { label: '1:30 PM', time: '13:30' },
  { label: '2:30 PM', time: '14:30' },
];

const DURATION_PRESETS = [
  { label: '45 mins', minutes: 45 },
  { label: '60 mins (Default)', minutes: 60 },
  { label: '90 mins', minutes: 90 },
  { label: '120 mins (Lab)', minutes: 120 },
];

export const AddEditLectureModal: React.FC<AddEditLectureModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialDay = 'monday',
  lectureToEdit,
  existingLectures,
}) => {
  const isEditing = Boolean(lectureToEdit);

  const [day, setDay] = useState<Weekday>(initialDay);
  const [subject, setSubject] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [facultyName, setFacultyName] = useState('');
  const [classroom, setClassroom] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Synchronize state when modal opens or initial values change
  useEffect(() => {
    if (isOpen) {
      if (lectureToEdit) {
        setDay(lectureToEdit.day || 'monday');
        setSubject(lectureToEdit.subject || lectureToEdit.subjectName || '');
        setSubjectCode(lectureToEdit.subjectCode || '');
        const startMin = parseTimeToMinutes(lectureToEdit.startTime);
        const endMin = parseTimeToMinutes(lectureToEdit.endTime);
        setStartTime(!isNaN(startMin) ? minutesToInputTime(startMin) : '09:00');
        setEndTime(!isNaN(endMin) ? minutesToInputTime(endMin) : '10:00');
        setFacultyName(lectureToEdit.facultyName || lectureToEdit.faculty || '');
        setClassroom(lectureToEdit.classroom || lectureToEdit.room || '');
        setNotes(lectureToEdit.notes || '');
      } else {
        setDay(initialDay);
        setSubject('');
        setSubjectCode('');
        setStartTime('09:00');
        setEndTime('10:00'); // default 60 min duration
        setFacultyName('');
        setClassroom('');
        setNotes('');
      }
      setFormError(null);
    }
  }, [isOpen, lectureToEdit, initialDay]);

  // Quick preset: when user selects a duration, recalculate end time from start time
  const applyDurationPreset = (durationMinutes: number) => {
    const startMin = parseTimeToMinutes(startTime);
    if (!isNaN(startMin)) {
      const calculatedEnd = startMin + durationMinutes;
      setEndTime(minutesToInputTime(calculatedEnd));
    }
  };

  // Quick preset: select start time and maintain 60 minute default duration
  const applyStartTimePreset = (time24: string) => {
    setStartTime(time24);
    const startMin = parseTimeToMinutes(time24);
    if (!isNaN(startMin)) {
      // Default to 60 minute duration
      setEndTime(minutesToInputTime(startMin + 60));
    }
  };

  // Live validation computation
  const validationStatus = useMemo(() => {
    if (!subject.trim()) {
      return { isValid: false, message: 'Please enter a subject name.' };
    }

    const startMin = parseTimeToMinutes(startTime);
    const endMin = parseTimeToMinutes(endTime);

    if (isNaN(startMin) || isNaN(endMin)) {
      return { isValid: false, message: 'Enter valid start and end times.' };
    }

    const startFormatted = minutesToFormatted12h(startMin);
    const endFormatted = minutesToFormatted12h(endMin);

    const validation = validateLectureSchedule(
      {
        day,
        subject,
        startTime: startFormatted,
        endTime: endFormatted,
      },
      existingLectures,
      lectureToEdit?.id
    );

    const duration = endMin - startMin;
    return {
      isValid: validation.isValid,
      message: validation.error || null,
      durationMinutes: duration,
      formattedInterval: `${startFormatted} – ${endFormatted}`,
    };
  }, [day, subject, startTime, endTime, existingLectures, lectureToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!subject.trim()) {
      setFormError('Subject name is required.');
      return;
    }

    const startMin = parseTimeToMinutes(startTime);
    const endMin = parseTimeToMinutes(endTime);
    const startFormatted = minutesToFormatted12h(startMin);
    const endFormatted = minutesToFormatted12h(endMin);

    const check = validateLectureSchedule(
      {
        day,
        subject: subject.trim(),
        startTime: startFormatted,
        endTime: endFormatted,
      },
      existingLectures,
      lectureToEdit?.id
    );

    if (!check.isValid) {
      setFormError(check.error || 'Invalid lecture schedule');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onSave({
        day,
        subject: subject.trim(),
        subjectCode: subjectCode.trim() || undefined,
        startTime: startFormatted,
        endTime: endFormatted,
        facultyName: facultyName.trim() || undefined,
        classroom: classroom.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      if (!result.success) {
        setFormError(result.error || 'Failed to save lecture');
      } else {
        onClose();
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#141514] text-white rounded-3xl shadow-2xl border border-neutral-700 overflow-hidden my-8 timetable-modal">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-[#191b19]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F97316]/20 text-[#F97316] flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                {isEditing ? 'Edit Lecture' : 'Add New Lecture'}
              </h2>
              <p className="text-xs text-neutral-300">
                College hours: 8:30 AM – 3:30 PM · Lunch: 12:30 PM – 1:30 PM
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto bg-[#141514]">
          {/* Day of Week Selector */}
          <div>
            <label className="block text-xs font-bold text-white mb-1.5">
              Day of the Week <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
              {WEEKDAYS.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setDay(w)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                    day === w
                      ? 'bg-[#F97316] text-white shadow-xs ring-2 ring-[#F97316]/40'
                      : 'bg-[#222422] text-white hover:bg-neutral-700 border border-neutral-700'
                  }`}
                >
                  <span className="block">{WEEKDAY_LABELS[w].short}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Subject Name and Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-white mb-1">
                Subject Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Applied Mathematics II"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-700 bg-[#222422] text-xs text-white font-semibold focus:outline-hidden focus:border-[#F97316] placeholder:text-neutral-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-white mb-1">
                Subject Code
              </label>
              <input
                type="text"
                placeholder="e.g. FEC201"
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-700 bg-[#222422] text-xs font-mono text-white font-semibold focus:outline-hidden focus:border-[#F97316] placeholder:text-neutral-400"
              />
            </div>
          </div>

          {/* Time Scheduling Rules Box */}
          <div className="p-4 rounded-2xl bg-[#1c1e1c] border border-neutral-700 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#F97316]" />
                <span className="text-white">Lecture Timing (8:30 AM – 3:30 PM)</span>
              </div>
              <span className="text-[10px] font-bold text-amber-200 bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-600">
                Lunch 12:30–1:30 PM Protected
              </span>
            </div>

            {/* Start Time Presets */}
            <div>
              <span className="text-[11px] font-bold text-white block mb-1.5">
                Popular Start Times:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_START_TIMES.map((preset) => (
                  <button
                    key={preset.time}
                    type="button"
                    onClick={() => applyStartTimePreset(preset.time)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer border ${
                      startTime === preset.time
                        ? 'bg-[#F97316] text-white border-transparent shadow-xs'
                        : 'bg-[#222422] text-white border-neutral-700 hover:border-[#F97316]'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Pickers (Start & End) */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-white mb-1">
                  Start Time <span className="text-rose-400">*</span>
                </label>
                <input
                  type="time"
                  required
                  min="08:30"
                  max="15:30"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-700 bg-[#222422] text-xs font-mono font-bold text-white"
                />
                <span className="text-[11px] text-neutral-200 mt-0.5 block font-mono font-bold">
                  {minutesToFormatted12h(parseTimeToMinutes(startTime))}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">
                  End Time <span className="text-rose-400">*</span>
                </label>
                <input
                  type="time"
                  required
                  min="08:30"
                  max="15:30"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-700 bg-[#222422] text-xs font-mono font-bold text-white"
                />
                <span className="text-[11px] text-neutral-200 mt-0.5 block font-mono font-bold">
                  {minutesToFormatted12h(parseTimeToMinutes(endTime))}
                </span>
              </div>
            </div>

            {/* Duration presets */}
            <div>
              <span className="text-[11px] font-bold text-white block mb-1.5">
                Quick Duration Presets:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {DURATION_PRESETS.map((p) => (
                  <button
                    key={p.minutes}
                    type="button"
                    onClick={() => applyDurationPreset(p.minutes)}
                    className="px-2 py-1.5 rounded-lg bg-[#222422] border border-neutral-700 hover:border-[#F97316] text-[11px] font-bold text-white text-center cursor-pointer transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Interval Validation Status Notice */}
            <div className="pt-1">
              {validationStatus.isValid ? (
                <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500 text-white text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="flex-1">
                    <span className="font-bold">Schedule Valid: </span>
                    <span className="text-neutral-100">
                      {validationStatus.formattedInterval} ({validationStatus.durationMinutes} mins) on{' '}
                      {WEEKDAY_LABELS[day].name}
                    </span>
                  </div>
                </div>
              ) : (
                validationStatus.message && (
                  <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500 text-white text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span className="leading-snug text-neutral-100">{validationStatus.message}</span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Faculty and Room details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-white mb-1">
                Faculty Name (Optional)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Prof. S. R. Kulkarni"
                  value={facultyName}
                  onChange={(e) => setFacultyName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-700 bg-[#222422] text-xs text-white font-semibold focus:outline-hidden focus:border-[#F97316] placeholder:text-neutral-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-white mb-1">
                Classroom or Room (Optional)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Classroom 302"
                  value={classroom}
                  onChange={(e) => setClassroom(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-700 bg-[#222422] text-xs text-white font-semibold focus:outline-hidden focus:border-[#F97316] placeholder:text-neutral-400"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-white mb-1">
              Lecture Notes or Topics (Optional)
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <textarea
                rows={2}
                placeholder="e.g. Bring scientific calculator; chapter 4 assignment due."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-700 bg-[#222422] text-xs text-white font-medium focus:outline-hidden focus:border-[#F97316] placeholder:text-neutral-400"
              />
            </div>
          </div>

          {/* Error Banner if any */}
          {formError && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500 text-white text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-neutral-700 bg-[#222422] hover:bg-neutral-700 text-xs font-bold text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !validationStatus.isValid}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs transition-all flex items-center gap-2 ${
                isSubmitting || !validationStatus.isValid
                  ? 'bg-neutral-600 cursor-not-allowed opacity-50'
                  : 'bg-[#F97316] hover:bg-[#EA580C] cursor-pointer'
              }`}
            >
              {isSubmitting ? (
                <span>Saving Lecture...</span>
              ) : (
                <span>{isEditing ? 'Save Changes' : 'Save Lecture'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
