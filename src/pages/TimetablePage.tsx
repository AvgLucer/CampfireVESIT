import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Weekday, Lecture } from '../types';
import {
  WEEKDAYS,
  WEEKDAY_LABELS,
  COLLEGE_START_MINUTES,
  COLLEGE_END_MINUTES,
  LUNCH_START_MINUTES,
  LUNCH_END_MINUTES,
  getCurrentWeekday,
  calculateLiveLectureState,
  parseTimeToMinutes,
  minutesToFormatted12h,
} from '../utils/timetableCalculations';
import { AddEditLectureModal } from '../components/timetable/AddEditLectureModal';
import { DeleteConfirmationModal } from '../components/timetable/DeleteConfirmationModal';
import {
  Calendar,
  Clock,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  User,
  Coffee,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  BookOpen,
  Info,
  CheckCircle2,
  Play,
  Moon,
  Compass,
} from 'lucide-react';

export const TimetablePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    user,
    lectures,
    currentTime,
    addLecture,
    updateLecture,
    deleteLecture,
    resetTimetableToDefault,
    focusLocationOnMap,
  } = useApp();

  // Simulated time testing state (null = real system time)
  const [simulatedTime, setSimulatedTime] = useState<{
    date: Date;
    label: string;
    weekdayOverride?: Weekday;
  } | null>(null);

  const effectiveTime = useMemo(() => {
    return simulatedTime ? simulatedTime.date : currentTime;
  }, [simulatedTime, currentTime]);

  const effectiveWeekday = useMemo(() => {
    if (simulatedTime?.weekdayOverride) return simulatedTime.weekdayOverride;
    return getCurrentWeekday(effectiveTime);
  }, [simulatedTime, effectiveTime]);

  const currentDayOfWeek = useMemo(() => getCurrentWeekday(currentTime), [currentTime]);

  // Selected day for detailed day-view (defaults to effective weekday)
  const [selectedDay, setSelectedDay] = useState<Weekday>(effectiveWeekday);

  // View mode: 'day' (compact timeline) or 'week' (full 7-day grid overview)
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  // Modal states
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [lectureToEdit, setLectureToEdit] = useState<Lecture | null>(null);
  const [lectureToDelete, setLectureToDelete] = useState<Lecture | null>(null);

  // Formatted current date e.g. "Friday, October 16, 2026"
  const formattedToday = useMemo(() => {
    return effectiveTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [effectiveTime]);

  // Group lectures by day
  const lecturesByDay = useMemo(() => {
    const map: Record<Weekday, Lecture[]> = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    };

    lectures.forEach((lec) => {
      if (map[lec.day]) {
        map[lec.day].push(lec);
      }
    });

    // Sort chronologically for each day
    Object.keys(map).forEach((d) => {
      map[d as Weekday].sort((a, b) => {
        return parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime);
      });
    });

    return map;
  }, [lectures]);

  // Calculate live tracking status for TODAY / effective weekday
  const todayLectures = lecturesByDay[effectiveWeekday] || [];
  const liveStatus = useMemo(() => {
    return calculateLiveLectureState(todayLectures, effectiveTime);
  }, [todayLectures, effectiveTime]);

  // Lectures for currently selected day
  const activeDayLectures = lecturesByDay[selectedDay] || [];

  // Total scheduled duration for selected day (excluding lunch)
  const totalDayDurationMinutes = useMemo(() => {
    return activeDayLectures.reduce((acc, lec) => {
      const startMin = parseTimeToMinutes(lec.startTime);
      const endMin = parseTimeToMinutes(lec.endTime);
      return acc + (endMin > startMin ? endMin - startMin : 0);
    }, 0);
  }, [activeDayLectures]);

  // Handlers
  const handleOpenAdd = (dayToPrefill?: Weekday) => {
    setLectureToEdit(null);
    if (dayToPrefill) {
      setSelectedDay(dayToPrefill);
    }
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (lec: Lecture) => {
    setLectureToEdit(lec);
    setIsAddEditOpen(true);
  };

  const handleNavigateToDirections = (locationId?: string) => {
    if (locationId) {
      focusLocationOnMap(locationId);
    }
    navigate('/campus');
  };

  // Day navigation helper
  const handleStepDay = (step: number) => {
    const currentIndex = WEEKDAYS.indexOf(selectedDay);
    const nextIndex = (currentIndex + step + 7) % 7;
    setSelectedDay(WEEKDAYS[nextIndex]);
  };

  // Simulation presets for easy testing of all 6 tracker states
  const activateSimulation = (hours: number, minutes: number, label: string, day: Weekday) => {
    const d = new Date(currentTime);
    d.setHours(hours, minutes, 0, 0);
    setSimulatedTime({ date: d, label, weekdayOverride: day });
    setSelectedDay(day);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#737871] mb-1">
            <span className="px-2 py-0.5 rounded-md bg-orange-100 text-[#EA580C] dark:bg-orange-950/80 dark:text-orange-300 font-extrabold border border-orange-200 dark:border-neutral-800">
              College Hours: 8:30 AM – 3:30 PM
            </span>
            <span>·</span>
            <span className="font-bold text-[#171916] dark:text-white">{formattedToday}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#171916] dark:text-white tracking-tight">
            My Timetable
          </h1>
          <p className="text-xs sm:text-sm text-[#444] dark:text-neutral-200 mt-0.5 max-w-2xl font-medium">
            Plan your lectures, track your day, and stay prepared.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0 flex-wrap">
          <button
            onClick={() => handleOpenAdd(selectedDay)}
            className="px-4 py-2.5 bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lecture</span>
          </button>

          <button
            onClick={resetTimetableToDefault}
            className="p-2.5 bg-white dark:bg-neutral-800 border border-[#E5E3DC] dark:border-neutral-700 hover:border-[#F97316] text-[#171916] dark:text-white rounded-xl transition-colors cursor-pointer text-xs font-bold flex items-center gap-1.5 shadow-2xs"
            title="Reset to default VESIT syllabus timetable"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#F97316]" />
            <span className="hidden sm:inline">Reset Schedule</span>
          </button>
        </div>
      </div>

      {/* 2. LIVE LECTURE TRACKER HERO (Current Time Awareness) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-orange-50/80 via-white to-amber-50/80 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-900 border border-orange-200/80 dark:border-neutral-800 shadow-xs space-y-4">
        {/* Simulation Notice Banner if simulated time is active */}
        {simulatedTime && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-orange-100/80 dark:bg-orange-950/70 border border-orange-300 dark:border-orange-800 text-xs text-orange-950 dark:text-orange-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#F97316]" />
              <span>
                <strong>Simulated Test Time:</strong> {simulatedTime.label} ({WEEKDAY_LABELS[effectiveWeekday].name})
              </span>
            </div>
            <button
              onClick={() => setSimulatedTime(null)}
              className="px-2 py-0.5 rounded bg-white dark:bg-neutral-800 text-[#F97316] font-bold text-[11px] shadow-2xs hover:underline cursor-pointer"
            >
              Revert to Real Clock
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Status Badge & Current Lecture Detail */}
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider font-mono shadow-2xs border ${
                  liveStatus.state === 'IN_PROGRESS'
                    ? 'bg-[#F97316] text-white border-orange-500'
                    : liveStatus.state === 'LUNCH_BREAK'
                    ? 'bg-amber-600 text-white border-amber-700'
                    : liveStatus.state === 'UP_NEXT'
                    ? 'bg-blue-600 text-white border-blue-700'
                    : liveStatus.state === 'COLLEGE_OVER'
                    ? 'bg-neutral-700 text-white border-neutral-800'
                    : 'bg-emerald-600 text-white border-emerald-700'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                <span>{liveStatus.stateLabel}</span>
              </span>

              <span className="text-xs text-[#737871] font-mono">
                {effectiveTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} ·{' '}
                {WEEKDAY_LABELS[effectiveWeekday].name}
              </span>
            </div>

            {liveStatus.currentLecture ? (
              <div className="space-y-1">
                <div className="text-lg sm:text-xl font-black text-[#171916] dark:text-white flex items-center gap-2 flex-wrap">
                  <span>{liveStatus.currentLecture.subject || liveStatus.currentLecture.subjectName}</span>
                  {liveStatus.currentLecture.subjectCode && (
                    <span className="text-xs font-mono font-bold text-[#F97316]">
                      ({liveStatus.currentLecture.subjectCode})
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#333] dark:text-neutral-200">
                  <span className="flex items-center gap-1 font-mono font-bold">
                    <Clock className="w-3.5 h-3.5 text-[#F97316]" />
                    {liveStatus.currentLecture.startTime} – {liveStatus.currentLecture.endTime}
                  </span>
                  {(liveStatus.currentLecture.classroom || liveStatus.currentLecture.room) && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#F97316]" />
                      {liveStatus.currentLecture.classroom || liveStatus.currentLecture.room}
                    </span>
                  )}
                  {(liveStatus.currentLecture.facultyName || liveStatus.currentLecture.faculty) && (
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-[#737871] dark:text-neutral-400" />
                      {liveStatus.currentLecture.facultyName || liveStatus.currentLecture.faculty}
                    </span>
                  )}
                </div>

                <div className="text-xs font-mono font-extrabold text-[#EA580C] dark:text-orange-400">
                  ⏳ {liveStatus.formattedTimeRemaining}
                </div>
              </div>
            ) : liveStatus.state === 'LUNCH_BREAK' ? (
              <div className="space-y-1">
                <div className="text-base sm:text-lg font-black text-amber-900 dark:text-amber-200 flex items-center gap-2">
                  <Coffee className="w-5 h-5 text-amber-600" />
                  <span>College Lunch Break Active (12:30 PM – 1:30 PM)</span>
                </div>
                <p className="text-xs text-[#444] dark:text-neutral-200 font-medium">
                  {liveStatus.formattedTimeRemaining}. Permanent campus interval. Enjoy your break!
                </p>
              </div>
            ) : liveStatus.state === 'COLLEGE_OVER' ? (
              <div className="space-y-1">
                <div className="text-base sm:text-lg font-black text-[#171916] dark:text-white flex items-center gap-2">
                  <Moon className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
                  <span>College Hours Concluded for Today (3:30 PM)</span>
                </div>
                <p className="text-xs text-[#444] dark:text-neutral-200 font-medium">
                  All scheduled lectures have finished. Check carpools for a ride home or visit Peer Learning rooms.
                </p>
              </div>
            ) : liveStatus.state === 'NO_LECTURES_TODAY' ? (
              <div className="space-y-1">
                <div className="text-base sm:text-lg font-black text-[#171916] dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>No Lectures Scheduled Today</span>
                </div>
                <p className="text-xs text-[#444] dark:text-neutral-200 font-medium">
                  You have a free schedule today. Relax, self-study, or schedule a custom study block.
                </p>
              </div>
            ) : liveStatus.state === 'UP_NEXT' && liveStatus.nextLecture ? (
              <div className="space-y-1">
                <div className="text-base sm:text-lg font-black text-[#171916] dark:text-white flex items-center gap-2">
                  <Play className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Up Next: {liveStatus.nextLecture.subject || liveStatus.nextLecture.subjectName}</span>
                </div>
                <p className="text-xs text-[#444] dark:text-neutral-200 font-mono">
                  {liveStatus.formattedTimeRemaining} · Begins at {liveStatus.nextLecture.startTime}
                  {(liveStatus.nextLecture.classroom || liveStatus.nextLecture.room) && (
                    <span> in {liveStatus.nextLecture.classroom || liveStatus.nextLecture.room}</span>
                  )}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-base sm:text-lg font-black text-[#171916] dark:text-white">
                  Free Study Period
                </div>
                <p className="text-xs text-[#444] dark:text-neutral-200 font-medium">
                  {liveStatus.formattedTimeRemaining || 'No active lecture currently underway.'}
                </p>
              </div>
            )}
          </div>

          {/* Up Next & Daily Summary Pill */}
          <div className="p-4 rounded-2xl bg-white dark:bg-neutral-800 border border-[#E5E3DC] dark:border-neutral-700 space-y-2 min-w-[260px] lg:max-w-xs shrink-0 shadow-2xs">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#737871] dark:text-neutral-400">
              <span>Next Up Today</span>
              <span className="font-mono text-[#F97316] font-bold">
                {liveStatus.remainingLecturesCount} remaining
              </span>
            </div>

            {liveStatus.nextLecture ? (
              <div className="text-xs">
                <div className="font-extrabold text-[#171916] dark:text-white truncate">
                  {liveStatus.nextLecture.subject || liveStatus.nextLecture.subjectName}
                </div>
                <div className="text-[11px] text-[#444] dark:text-neutral-200 font-mono mt-0.5">
                  {liveStatus.nextLecture.startTime} – {liveStatus.nextLecture.endTime}
                  {(liveStatus.nextLecture.classroom || liveStatus.nextLecture.room) && (
                    <span> · {liveStatus.nextLecture.classroom || liveStatus.nextLecture.room}</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-xs text-[#737871] dark:text-neutral-400 italic">
                No further lectures scheduled for today.
              </div>
            )}

            <div className="pt-2 border-t border-[#E5E3DC] dark:border-neutral-700 flex items-center justify-between text-[10px] text-[#737871]">
              <span>Permanent Lunch</span>
              <span className="font-mono font-bold text-amber-700 dark:text-amber-400">12:30 PM – 1:30 PM</span>
            </div>
          </div>
        </div>

        {/* Interactive Live Tracker Test Bench / State Simulation */}
        <div className="pt-2 border-t border-orange-200/60 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#737871]">
            <Sparkles className="w-3.5 h-3.5 text-[#F97316]" />
            <span>Test Tracker States:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSimulatedTime(null)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                simulatedTime === null
                  ? 'bg-[#171916] text-white dark:bg-white dark:text-neutral-900 shadow-2xs'
                  : 'bg-white dark:bg-neutral-800 text-[#555952] dark:text-neutral-400 border border-[#E5E3DC] dark:border-neutral-700 hover:text-[#171916]'
              }`}
            >
              Real Clock ({currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
            </button>
            <button
              onClick={() => activateSimulation(9, 15, '9:15 AM (In Progress)', 'monday')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-neutral-800 text-[#555952] dark:text-neutral-400 border border-[#E5E3DC] dark:border-neutral-700 hover:border-[#F97316] cursor-pointer"
            >
              9:15 AM (In Progress)
            </button>
            <button
              onClick={() => activateSimulation(10, 10, '10:10 AM (Up Next / Free)', 'monday')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-neutral-800 text-[#555952] dark:text-neutral-400 border border-[#E5E3DC] dark:border-neutral-700 hover:border-[#F97316] cursor-pointer"
            >
              10:10 AM (Up Next)
            </button>
            <button
              onClick={() => activateSimulation(12, 45, '12:45 PM (Lunch Break)', 'monday')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-neutral-800 text-[#555952] dark:text-neutral-400 border border-[#E5E3DC] dark:border-neutral-700 hover:border-amber-500 cursor-pointer"
            >
              ☕ 12:45 PM (Lunch)
            </button>
            <button
              onClick={() => activateSimulation(16, 0, '4:00 PM (College Over)', 'monday')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-neutral-800 text-[#555952] dark:text-neutral-400 border border-[#E5E3DC] dark:border-neutral-700 hover:border-neutral-700 cursor-pointer"
            >
              4:00 PM (College Over)
            </button>
            <button
              onClick={() => activateSimulation(11, 0, 'Sunday (No Lectures)', 'sunday')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-neutral-800 text-[#555952] dark:text-neutral-400 border border-[#E5E3DC] dark:border-neutral-700 hover:border-purple-500 cursor-pointer"
            >
              Sunday (No Lectures)
            </button>
          </div>
        </div>
      </div>

      {/* 3. WEEKLY NAVIGATION TABS (Monday – Sunday) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Day Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 bg-[#FAF9F5] dark:bg-neutral-900 border border-[#E5E3DC] dark:border-neutral-800 rounded-2xl overflow-x-auto w-full sm:w-auto">
            {WEEKDAYS.map((w) => {
              const count = lecturesByDay[w].length;
              const isSelected = selectedDay === w;
              const isToday = currentDayOfWeek === w;

              return (
                <button
                  key={w}
                  onClick={() => setSelectedDay(w)}
                  className={`flex-1 sm:flex-initial py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'bg-white dark:bg-neutral-800 text-[#171916] dark:text-white shadow-xs border border-[#E5E3DC] dark:border-neutral-700 font-extrabold'
                      : 'text-[#333] dark:text-white hover:text-[#F97316] dark:hover:text-[#F97316]'
                  }`}
                >
                  <span>{WEEKDAY_LABELS[w].short}</span>
                  {isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]" title="Today" />
                  )}
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                      count > 0
                        ? isSelected
                          ? 'bg-orange-100 text-[#F97316] font-extrabold'
                          : 'bg-neutral-200/80 dark:bg-neutral-700 text-[#171916] dark:text-white font-bold'
                        : 'text-neutral-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle (Day View vs All Week Grid) */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={() => setSelectedDay(currentDayOfWeek)}
              className="px-3 py-1.5 bg-white dark:bg-neutral-800 border border-[#E5E3DC] dark:border-neutral-700 rounded-xl text-xs font-bold text-[#F97316] hover:bg-[#FFF8F5] transition-colors cursor-pointer shadow-2xs"
            >
              Jump to Today
            </button>

            <div className="flex items-center gap-1 p-1 bg-[#FAF9F5] dark:bg-neutral-900 border border-[#E5E3DC] dark:border-neutral-800 rounded-xl text-xs">
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  viewMode === 'day'
                    ? 'bg-white dark:bg-neutral-800 text-[#171916] dark:text-white shadow-2xs font-extrabold'
                    : 'text-[#666] dark:text-neutral-300'
                }`}
              >
                Day Timeline
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  viewMode === 'week'
                    ? 'bg-white dark:bg-neutral-800 text-[#171916] dark:text-white shadow-2xs font-extrabold'
                    : 'text-[#666] dark:text-neutral-300'
                }`}
              >
                Week Grid
              </button>
            </div>
          </div>
        </div>

        {/* 4. DAY SCHEDULE VIEW (Default) */}
        {viewMode === 'day' ? (
          <div className="space-y-4">
            {/* Day Subheader with Quick Navigation Arrows */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-[#E5E3DC] dark:border-neutral-800 shadow-xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleStepDay(-1)}
                  className="p-1.5 rounded-lg border border-[#E5E3DC] dark:border-neutral-700 hover:bg-[#FAF9F5] dark:hover:bg-neutral-800 text-[#171916] dark:text-white cursor-pointer"
                  title="Previous Day"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="text-base font-black text-[#171916] dark:text-white flex items-center gap-2">
                    <span>{WEEKDAY_LABELS[selectedDay].name}&rsquo;s Timetable</span>
                    {selectedDay === currentDayOfWeek && (
                      <span className="text-[10px] font-extrabold text-[#F97316] bg-orange-100 dark:bg-orange-950/80 px-2 py-0.5 rounded-md border border-orange-200 dark:border-orange-800">
                        Today
                      </span>
                    )}
                  </h3>
                  <div className="text-xs text-[#555] dark:text-neutral-200 font-medium">
                    {activeDayLectures.length === 0
                      ? 'No lectures scheduled · Free day for self-study'
                      : `${activeDayLectures.length} scheduled lecture${activeDayLectures.length === 1 ? '' : 's'} · ${Math.floor(totalDayDurationMinutes / 60)}h ${totalDayDurationMinutes % 60}m instruction total`}
                  </div>
                </div>
                <button
                  onClick={() => handleStepDay(1)}
                  className="p-1.5 rounded-lg border border-[#E5E3DC] dark:border-neutral-700 hover:bg-[#FAF9F5] dark:hover:bg-neutral-800 text-[#171916] dark:text-white cursor-pointer"
                  title="Next Day"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => handleOpenAdd(selectedDay)}
                className="px-3.5 py-1.5 bg-[#FAF9F5] dark:bg-neutral-800 hover:bg-[#FFF8F5] border border-[#D7D4CB] dark:border-neutral-700 hover:border-[#F97316] text-xs font-bold text-[#171916] dark:text-white hover:text-[#F97316] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 text-[#F97316]" />
                <span>Add Lecture</span>
              </button>
            </div>

            {/* TIMELINE WITH INTEGRATED PERMANENT LUNCH BREAK & EXPLICIT FREE PERIODS */}
            <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-[#E5E3DC] dark:border-neutral-800 shadow-xs space-y-4">
              {/* College Opening Marker */}
              <div className="flex items-center gap-3 text-[11px] font-mono text-[#737871] dark:text-neutral-300 pb-1 border-b border-[#E5E3DC] dark:border-neutral-800">
                <span className="font-bold text-[#171916] dark:text-white">08:30 AM</span>
                <span className="h-px bg-neutral-200 dark:bg-neutral-800 flex-1" />
                <span className="font-semibold text-[#171916] dark:text-white">College Opens</span>
              </div>

              {/* MORNING SESSIONS (8:30 AM to 12:30 PM) */}
              {renderSchedulePeriod(
                activeDayLectures.filter((l) => parseTimeToMinutes(l.endTime) <= LUNCH_START_MINUTES),
                COLLEGE_START_MINUTES,
                LUNCH_START_MINUTES,
                'Morning'
              )}

              {/* PERMANENT LUNCH BREAK (12:30 PM to 1:30 PM) — FIXED & SYSTEM-DEFINED */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50/90 via-amber-100/50 to-amber-50/90 dark:from-amber-950/40 dark:via-amber-900/30 dark:to-amber-950/40 border-2 border-amber-300 dark:border-amber-700/60 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-amber-200/80 dark:bg-amber-800/60 text-amber-900 dark:text-amber-200 flex items-center justify-center font-bold text-lg shadow-2xs">
                      <Coffee className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-extrabold text-amber-950 dark:text-amber-200 uppercase tracking-wider flex items-center gap-2 flex-wrap">
                        <span>LUNCH BREAK | 12:30 PM–1:30 PM</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-300/80 dark:bg-amber-800 text-amber-950 dark:text-amber-100 font-extrabold">
                          Permanent Fixed Block
                        </span>
                      </div>
                      <p className="text-xs text-amber-900/90 dark:text-amber-300/90 mt-0.5">
                        Campus lunch interval. System-defined; no lectures may be scheduled or overlap during this hour.
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-mono font-bold text-amber-800 dark:text-amber-300 bg-white/80 dark:bg-neutral-900 px-3 py-1 rounded-xl border border-amber-300 dark:border-amber-800 shadow-2xs">
                      60 Min Daily Recess
                    </span>
                  </div>
                </div>
              </div>

              {/* AFTERNOON SESSIONS (1:30 PM to 3:30 PM) */}
              {renderSchedulePeriod(
                activeDayLectures.filter((l) => parseTimeToMinutes(l.startTime) >= LUNCH_END_MINUTES),
                LUNCH_END_MINUTES,
                COLLEGE_END_MINUTES,
                'Afternoon'
              )}

              {/* College Closing Marker */}
              <div className="flex items-center gap-3 text-[11px] font-mono text-[#737871] pt-1 border-t border-[#E5E3DC] dark:border-neutral-800">
                <span className="font-bold text-[#171916] dark:text-neutral-200">03:30 PM</span>
                <span className="h-px bg-neutral-200 dark:bg-neutral-800 flex-1" />
                <span>College Closes</span>
              </div>
            </div>
          </div>
        ) : (
          /* 5. ALL WEEK TIME-GRID VIEW */
          <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-[#E5E3DC] dark:border-neutral-800 shadow-xs space-y-4 overflow-x-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E3DC] dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#F97316]" />
                <span className="text-xs font-bold text-[#171916] dark:text-neutral-100">
                  Complete Weekly Schedule (Monday – Sunday)
                </span>
              </div>
              <span className="text-[11px] text-[#737871] font-mono">8:30 AM – 3:30 PM Daily</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-3 min-w-[700px]">
              {WEEKDAYS.map((w) => {
                const dayLectures = lecturesByDay[w];
                const isToday = currentDayOfWeek === w;

                return (
                  <div
                    key={w}
                    className={`rounded-2xl p-3 border space-y-2.5 transition-all ${
                      isToday
                        ? 'bg-orange-50/40 dark:bg-orange-950/20 border-[#F97316] ring-1 ring-[#F97316]/30'
                        : 'bg-[#FAF9F5] dark:bg-neutral-800/50 border-[#E5E3DC] dark:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-1.5 border-b border-[#E5E3DC] dark:border-neutral-700">
                      <div>
                        <div className="text-xs font-extrabold text-[#171916] dark:text-neutral-100 flex items-center gap-1">
                          <span>{WEEKDAY_LABELS[w].short}</span>
                          {isToday && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]" />
                          )}
                        </div>
                        <div className="text-[10px] text-[#737871] font-mono">
                          {dayLectures.length} lecture{dayLectures.length === 1 ? '' : 's'}
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenAdd(w)}
                        className="p-1 text-[#F97316] hover:bg-orange-100 dark:hover:bg-neutral-700 rounded-md transition-colors cursor-pointer"
                        title={`Add lecture to ${WEEKDAY_LABELS[w].name}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {/* Morning items */}
                      {dayLectures
                        .filter((l) => parseTimeToMinutes(l.endTime) <= LUNCH_START_MINUTES)
                        .map((l) => (
                          <div
                            key={l.id}
                            className="p-2 rounded-xl bg-white dark:bg-neutral-800 border border-[#E5E3DC] dark:border-neutral-700 text-[11px] space-y-1 shadow-2xs group relative"
                          >
                            <div className="font-bold text-[#171916] dark:text-neutral-100 truncate">
                              {l.subject || l.subjectName}
                            </div>
                            <div className="text-[10px] text-[#555952] dark:text-neutral-400 font-mono">
                              {l.startTime} – {l.endTime}
                            </div>
                            {(l.classroom || l.room) && (
                              <div className="text-[9px] text-[#737871] truncate">
                                {l.classroom || l.room}
                              </div>
                            )}

                            {/* Hover Edit/Delete Action Buttons */}
                            <div className="flex items-center gap-1 pt-1 border-t border-[#E5E3DC] dark:border-neutral-700">
                              <button
                                onClick={() => handleOpenEdit(l)}
                                className="p-1 text-[#737871] hover:text-[#F97316] cursor-pointer"
                                title="Edit"
                              >
                                <Edit2 className="w-2.5 h-2.5" />
                              </button>
                              <button
                                onClick={() => setLectureToDelete(l)}
                                className="p-1 text-[#737871] hover:text-rose-600 cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>
                        ))}

                      {dayLectures.filter((l) => parseTimeToMinutes(l.endTime) <= LUNCH_START_MINUTES).length === 0 && (
                        <div className="p-1.5 rounded-lg border border-dashed border-[#D7D4CB] dark:border-neutral-700 text-[10px] text-[#737871] text-center italic">
                          Free morning
                        </div>
                      )}

                      {/* FIXED LUNCH BREAK IN WEEKLY GRID */}
                      <div className="p-1.5 rounded-lg bg-amber-100/90 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 text-[10px] font-bold text-amber-950 dark:text-amber-200 text-center shadow-2xs">
                        ☕ LUNCH BREAK
                        <div className="text-[9px] font-mono text-amber-800 dark:text-amber-400 font-semibold">
                          12:30 – 1:30 PM
                        </div>
                      </div>

                      {/* Afternoon items */}
                      {dayLectures
                        .filter((l) => parseTimeToMinutes(l.startTime) >= LUNCH_END_MINUTES)
                        .map((l) => (
                          <div
                            key={l.id}
                            className="p-2 rounded-xl bg-white dark:bg-neutral-800 border border-[#E5E3DC] dark:border-neutral-700 text-[11px] space-y-1 shadow-2xs group relative"
                          >
                            <div className="font-bold text-[#171916] dark:text-neutral-100 truncate">
                              {l.subject || l.subjectName}
                            </div>
                            <div className="text-[10px] text-[#555952] dark:text-neutral-400 font-mono">
                              {l.startTime} – {l.endTime}
                            </div>
                            {(l.classroom || l.room) && (
                              <div className="text-[9px] text-[#737871] truncate">
                                {l.classroom || l.room}
                              </div>
                            )}

                            <div className="flex items-center gap-1 pt-1 border-t border-[#E5E3DC] dark:border-neutral-700">
                              <button
                                onClick={() => handleOpenEdit(l)}
                                className="p-1 text-[#737871] hover:text-[#F97316] cursor-pointer"
                                title="Edit"
                              >
                                <Edit2 className="w-2.5 h-2.5" />
                              </button>
                              <button
                                onClick={() => setLectureToDelete(l)}
                                className="p-1 text-[#737871] hover:text-rose-600 cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>
                        ))}

                      {dayLectures.filter((l) => parseTimeToMinutes(l.startTime) >= LUNCH_END_MINUTES).length === 0 && (
                        <div className="p-1.5 rounded-lg border border-dashed border-[#D7D4CB] dark:border-neutral-700 text-[10px] text-[#737871] text-center italic">
                          Free afternoon
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      <AddEditLectureModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        onSave={async (data) => {
          if (lectureToEdit) {
            return await updateLecture(lectureToEdit.id, data);
          } else {
            return await addLecture(data);
          }
        }}
        initialDay={selectedDay}
        lectureToEdit={lectureToEdit}
        existingLectures={lectures}
      />

      <DeleteConfirmationModal
        isOpen={Boolean(lectureToDelete)}
        onClose={() => setLectureToDelete(null)}
        onConfirm={async () => {
          if (lectureToDelete) {
            await deleteLecture(lectureToDelete.id);
          }
        }}
        lecture={lectureToDelete}
      />
    </div>
  );

  /**
   * Renders a schedule period (Morning or Afternoon) with explicit free period gaps
   */
  function renderSchedulePeriod(
    periodLectures: Lecture[],
    periodStartMin: number,
    periodEndMin: number,
    periodLabel: 'Morning' | 'Afternoon'
  ) {
    if (periodLectures.length === 0) {
      const durationHours = (periodEndMin - periodStartMin) / 60;
      return (
        <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-neutral-800/40 border border-dashed border-[#D7D4CB] dark:border-neutral-700 text-xs text-[#737871] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>
              <strong>Free {periodLabel} Period</strong> ({minutesToFormatted12h(periodStartMin)} –{' '}
              {minutesToFormatted12h(periodEndMin)} · {durationHours} hours free for study or rest)
            </span>
          </div>
          <button
            onClick={() => handleOpenAdd(selectedDay)}
            className="text-[#F97316] font-bold hover:underline self-start sm:self-auto cursor-pointer"
          >
            + Add {periodLabel.toLowerCase()} lecture
          </button>
        </div>
      );
    }

    // Build timeline items with gaps
    const elements: React.ReactNode[] = [];
    let currentCursor = periodStartMin;

    periodLectures.forEach((lecture) => {
      const startMin = parseTimeToMinutes(lecture.startTime);
      const endMin = parseTimeToMinutes(lecture.endTime);

      // If gap before this lecture
      if (startMin > currentCursor) {
        const gapDuration = startMin - currentCursor;
        elements.push(
          <div
            key={`gap_${currentCursor}_${startMin}`}
            className="py-2.5 px-3.5 rounded-xl bg-[#FAF9F5] dark:bg-neutral-800/30 border border-dashed border-[#E5E3DC] dark:border-neutral-700/60 text-xs text-[#737871] flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>
                <strong>Free Period:</strong> {minutesToFormatted12h(currentCursor)} –{' '}
                {minutesToFormatted12h(startMin)} ({gapDuration} mins)
              </span>
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              Free Study Time
            </span>
          </div>
        );
      }

      // Add lecture card
      elements.push(renderLectureCard(lecture));
      currentCursor = Math.max(currentCursor, endMin);
    });

    // If gap after last lecture in period
    if (currentCursor < periodEndMin) {
      const gapDuration = periodEndMin - currentCursor;
      elements.push(
        <div
          key={`gap_${currentCursor}_${periodEndMin}`}
          className="py-2.5 px-3.5 rounded-xl bg-[#FAF9F5] dark:bg-neutral-800/30 border border-dashed border-[#E5E3DC] dark:border-neutral-700/60 text-xs text-[#737871] flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>
              <strong>Free Period:</strong> {minutesToFormatted12h(currentCursor)} –{' '}
              {minutesToFormatted12h(periodEndMin)} ({gapDuration} mins)
            </span>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Free Study Time
          </span>
        </div>
      );
    }

    return <div className="space-y-3">{elements}</div>;
  }

  // Helper render function for each lecture card in Day View
  function renderLectureCard(lecture: Lecture) {
    const isToday = selectedDay === effectiveWeekday;
    const startMin = parseTimeToMinutes(lecture.startTime);
    const endMin = parseTimeToMinutes(lecture.endTime);
    const currentMin = effectiveTime.getHours() * 60 + effectiveTime.getMinutes();

    const isActiveNow = isToday && startMin <= currentMin && currentMin < endMin;
    const isCompleted = isToday && endMin <= currentMin;

    const duration = endMin > startMin ? endMin - startMin : 60;
    const subjectTitle = lecture.subject || lecture.subjectName || 'Lecture';
    const room = lecture.classroom || lecture.room;
    const faculty = lecture.facultyName || lecture.faculty;

    return (
      <div
        key={lecture.id}
        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isActiveNow
            ? 'bg-white dark:bg-neutral-800 border-[#F97316] shadow-md shadow-[#F97316]/10 ring-2 ring-[#F97316]/20'
            : isCompleted
            ? 'bg-[#FAF9F5]/80 dark:bg-neutral-900/50 border-[#E5E3DC] dark:border-neutral-800 opacity-80'
            : 'bg-white dark:bg-neutral-800/90 border-[#E5E3DC] dark:border-neutral-700 hover:border-[#D7D4CB]'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-start gap-3.5">
            {/* Status dot / duration chip */}
            <div className="flex flex-col items-center mt-1 shrink-0">
              <div
                className={`w-3.5 h-3.5 rounded-full ${
                  isActiveNow
                    ? 'bg-[#F97316] ring-4 ring-[#F97316]/20 animate-pulse'
                    : isCompleted
                    ? 'bg-emerald-500'
                    : 'bg-[#D7D4CB] dark:bg-neutral-600'
                }`}
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-black text-[#171916] dark:text-white">
                  {subjectTitle}
                </span>
                {lecture.subjectCode && (
                  <span className="text-xs font-mono font-bold text-[#F97316] bg-orange-100 dark:bg-orange-950/80 px-2 py-0.5 rounded border border-orange-200 dark:border-orange-900">
                    {lecture.subjectCode}
                  </span>
                )}
                {isActiveNow && (
                  <span className="text-[10px] font-extrabold uppercase tracking-wide bg-[#F97316] text-white px-2 py-0.5 rounded-full shadow-xs">
                    In Progress Now
                  </span>
                )}
              </div>

              {/* Time and location details */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#333] dark:text-neutral-200 font-medium">
                <span className="flex items-center gap-1 font-mono font-bold text-[#171916] dark:text-white">
                  <Clock className="w-3.5 h-3.5 text-[#F97316]" />
                  <span>
                    {lecture.startTime} – {lecture.endTime} ({duration} mins)
                  </span>
                </span>

                {room && (
                  <span className="flex items-center gap-1 font-semibold text-[#171916] dark:text-white">
                    <MapPin className="w-3.5 h-3.5 text-[#F97316]" />
                    <span>
                      {room}
                      {lecture.building && <span> · {lecture.building}</span>}
                    </span>
                  </span>
                )}

                {faculty && (
                  <span className="flex items-center gap-1 text-[#555] dark:text-neutral-300">
                    <User className="w-3.5 h-3.5 text-[#737871] dark:text-neutral-400" />
                    <span>{faculty}</span>
                  </span>
                )}
              </div>

              {lecture.notes && (
                <div className="text-xs text-[#737871] dark:text-neutral-400 italic pt-1">
                  &ldquo;{lecture.notes}&rdquo;
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons: Edit, Delete, Directions */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E5E3DC] dark:border-neutral-800">
            {lecture.locationId && (
              <button
                onClick={() => handleNavigateToDirections(lecture.locationId)}
                className="px-2.5 py-1.5 rounded-xl bg-[#FAF9F5] dark:bg-neutral-700 hover:bg-[#FFF8F5] text-xs font-bold text-[#F97316] transition-colors flex items-center gap-1 cursor-pointer"
                title="View classroom location on campus curved building map"
              >
                <MapPin className="w-3 h-3" />
                <span>Map</span>
              </button>
            )}

            <button
              onClick={() => handleOpenEdit(lecture)}
              className="p-2 rounded-xl text-[#555952] dark:text-neutral-400 hover:text-[#171916] dark:hover:text-white hover:bg-[#FAF9F5] dark:hover:bg-neutral-700 transition-colors cursor-pointer"
              title="Edit lecture schedule"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setLectureToDelete(lecture)}
              className="p-2 rounded-xl text-[#737871] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              title="Delete lecture"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }
};
