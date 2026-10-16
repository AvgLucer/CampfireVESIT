import { Weekday, Lecture } from '../types';

export const COLLEGE_START_MINUTES = 8 * 60 + 30;  // 08:30 AM -> 510 minutes
export const COLLEGE_END_MINUTES = 15 * 60 + 30;   // 03:30 PM -> 930 minutes
export const LUNCH_START_MINUTES = 12 * 60 + 30;   // 12:30 PM -> 750 minutes
export const LUNCH_END_MINUTES = 13 * 60 + 30;     // 01:30 PM -> 810 minutes

export const COLLEGE_HOURS_LABEL = '8:30 AM – 3:30 PM';
export const LUNCH_BREAK_LABEL = '12:30 PM – 1:30 PM';

export const WEEKDAYS: Weekday[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export const WEEKDAY_LABELS: Record<Weekday, { name: string; short: string }> = {
  monday: { name: 'Monday', short: 'Mon' },
  tuesday: { name: 'Tuesday', short: 'Tue' },
  wednesday: { name: 'Wednesday', short: 'Wed' },
  thursday: { name: 'Thursday', short: 'Thu' },
  friday: { name: 'Friday', short: 'Fri' },
  saturday: { name: 'Saturday', short: 'Sat' },
  sunday: { name: 'Sunday', short: 'Sun' },
};

/**
 * Parses time string (e.g. "08:30", "8:30", "08:30 AM", "1:30 PM", "14:00")
 * into total minutes from midnight (0 to 1440).
 * Returns NaN if string is invalid.
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr || typeof timeStr !== 'string') return NaN;
  const trimmed = timeStr.trim();

  // Match 12-hour format e.g. "08:30 AM" or "1:30 PM"
  const match12 = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const meridiem = match12[3].toUpperCase();

    if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return NaN;
    if (meridiem === 'PM' && hours !== 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  // Match 24-hour format e.g. "08:30" or "14:15"
  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return NaN;
    return hours * 60 + minutes;
  }

  return NaN;
}

/**
 * Converts minutes from midnight into 12-hour AM/PM string, e.g. 510 -> "08:30 AM"
 */
export function minutesToFormatted12h(totalMinutes: number): string {
  if (isNaN(totalMinutes)) return '';
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  const meridiem = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const mm = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const hh = displayHours < 10 ? `0${displayHours}` : `${displayHours}`;
  return `${hh}:${mm} ${meridiem}`;
}

/**
 * Converts minutes from midnight into 24-hour HH:mm string for <input type="time">
 */
export function minutesToInputTime(totalMinutes: number): string {
  if (isNaN(totalMinutes)) return '08:30';
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  const hh = hours < 10 ? `0${hours}` : `${hours}`;
  const mm = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hh}:${mm}`;
}

/**
 * Checks whether two half-open intervals [startA, endA) and [startB, endB) overlap.
 * Adjacent intervals where endA === startB do NOT overlap.
 */
export function intervalsOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number
): boolean {
  return Math.max(startA, startB) < Math.min(endA, endB);
}

/**
 * Validates lecture scheduling parameters against college rules and existing timetable.
 */
export function validateLectureSchedule(
  lecture: {
    day: Weekday;
    startTime: string;
    endTime: string;
    subject: string;
  },
  existingLectures: Lecture[],
  excludeLectureId?: string
): { isValid: boolean; error?: string } {
  // 1. Subject required
  if (!lecture.subject || !lecture.subject.trim()) {
    return { isValid: false, error: 'Subject name is required.' };
  }

  // 2. Day required
  if (!WEEKDAYS.includes(lecture.day)) {
    return { isValid: false, error: 'A valid day of the week (Monday – Sunday) is required.' };
  }

  // 3. Time parsing
  const startMin = parseTimeToMinutes(lecture.startTime);
  const endMin = parseTimeToMinutes(lecture.endTime);

  if (isNaN(startMin)) {
    return { isValid: false, error: 'Start time is invalid.' };
  }
  if (isNaN(endMin)) {
    return { isValid: false, error: 'End time is invalid.' };
  }

  // 4. End must be later than start
  if (endMin <= startMin) {
    return {
      isValid: false,
      error: `End time (${minutesToFormatted12h(endMin)}) must be later than start time (${minutesToFormatted12h(startMin)}).`,
    };
  }

  // 5. Must be at or after 8:30 AM
  if (startMin < COLLEGE_START_MINUTES) {
    return {
      isValid: false,
      error: `Start time (${minutesToFormatted12h(startMin)}) cannot be earlier than college opening time (8:30 AM).`,
    };
  }

  // 6. Must be at or before 3:30 PM
  if (endMin > COLLEGE_END_MINUTES) {
    return {
      isValid: false,
      error: `End time (${minutesToFormatted12h(endMin)}) cannot extend past college closing time (3:30 PM).`,
    };
  }

  // 7. Overlap with Lunch Break (12:30 PM to 1:30 PM)
  if (intervalsOverlap(startMin, endMin, LUNCH_START_MINUTES, LUNCH_END_MINUTES)) {
    return {
      isValid: false,
      error: `Lecture interval (${minutesToFormatted12h(startMin)} – ${minutesToFormatted12h(endMin)}) overlaps with the permanent Lunch Break (12:30 PM – 1:30 PM). Lectures must end by 12:30 PM or begin at 1:30 PM.`,
    };
  }

  // 8. Overlap with other lectures on the same day
  const sameDayLectures = existingLectures.filter(
    (l) => l.day === lecture.day && l.id !== excludeLectureId
  );

  for (const existing of sameDayLectures) {
    const exStart = parseTimeToMinutes(existing.startTime);
    const exEnd = parseTimeToMinutes(existing.endTime);
    if (!isNaN(exStart) && !isNaN(exEnd)) {
      if (intervalsOverlap(startMin, endMin, exStart, exEnd)) {
        const exSubject = existing.subject || existing.subjectName || 'Scheduled Lecture';
        return {
          isValid: false,
          error: `Lecture interval (${minutesToFormatted12h(startMin)} – ${minutesToFormatted12h(endMin)}) overlaps with existing lecture "${exSubject}" (${minutesToFormatted12h(exStart)} – ${minutesToFormatted12h(exEnd)}).`,
        };
      }
    }
  }

  return { isValid: true };
}

/**
 * Gets the current weekday in lowercase ('monday', 'tuesday', etc.)
 */
export function getCurrentWeekday(date: Date = new Date()): Weekday {
  const dayIndex = date.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
  const map: Record<number, Weekday> = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
  };
  return map[dayIndex] || 'monday';
}

export type LiveTrackerState =
  | 'IN_PROGRESS'
  | 'UP_NEXT'
  | 'FREE_PERIOD'
  | 'LUNCH_BREAK'
  | 'COLLEGE_OVER'
  | 'NO_LECTURES_TODAY';

export interface LiveLectureTrackerStatus {
  state: LiveTrackerState;
  stateLabel: string;
  currentLecture: Lecture | null;
  nextLecture: Lecture | null;
  remainingLecturesCount: number;
  totalLecturesToday: number;
  timeRemainingMinutes: number;
  formattedTimeRemaining: string;
  isLunchBreak: boolean;
  currentMinutes: number;
}

/**
 * Computes live lecture tracking state based on real local time and today's schedule.
 */
export function calculateLiveLectureState(
  lecturesForToday: Lecture[],
  currentDate: Date = new Date()
): LiveLectureTrackerStatus {
  const currentMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();

  // Sort today's lectures chronologically
  const sortedLectures = [...lecturesForToday].sort((a, b) => {
    return parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime);
  });

  const totalLecturesToday = sortedLectures.length;

  // 1. If no lectures scheduled today
  if (totalLecturesToday === 0) {
    const isLunch = currentMinutes >= LUNCH_START_MINUTES && currentMinutes < LUNCH_END_MINUTES;
    return {
      state: isLunch ? 'LUNCH_BREAK' : 'NO_LECTURES_TODAY',
      stateLabel: isLunch ? 'Lunch Break' : 'No Lectures Today',
      currentLecture: null,
      nextLecture: null,
      remainingLecturesCount: 0,
      totalLecturesToday: 0,
      timeRemainingMinutes: 0,
      formattedTimeRemaining: '',
      isLunchBreak: isLunch,
      currentMinutes,
    };
  }

  // Count remaining lectures (lectures whose end time is strictly in the future)
  const remainingLectures = sortedLectures.filter((l) => {
    const endMin = parseTimeToMinutes(l.endTime);
    return endMin > currentMinutes;
  });

  const remainingLecturesCount = remainingLectures.length;

  // 2. Check if current time is past college hours (3:30 PM)
  if (currentMinutes >= COLLEGE_END_MINUTES) {
    return {
      state: 'COLLEGE_OVER',
      stateLabel: 'College Over',
      currentLecture: null,
      nextLecture: null,
      remainingLecturesCount: 0,
      totalLecturesToday,
      timeRemainingMinutes: 0,
      formattedTimeRemaining: 'Classes finished for the day',
      isLunchBreak: false,
      currentMinutes,
    };
  }

  // 3. Check if current time is inside Lunch Break (12:30 PM to 1:30 PM)
  if (currentMinutes >= LUNCH_START_MINUTES && currentMinutes < LUNCH_END_MINUTES) {
    const lunchEndsIn = LUNCH_END_MINUTES - currentMinutes;
    // Find next lecture after lunch
    const nextAfterLunch = sortedLectures.find((l) => parseTimeToMinutes(l.startTime) >= LUNCH_END_MINUTES) || null;

    return {
      state: 'LUNCH_BREAK',
      stateLabel: 'Lunch Break (12:30 PM – 1:30 PM)',
      currentLecture: null,
      nextLecture: nextAfterLunch,
      remainingLecturesCount,
      totalLecturesToday,
      timeRemainingMinutes: lunchEndsIn,
      formattedTimeRemaining: `Lunch break ends in ${lunchEndsIn} min${lunchEndsIn === 1 ? '' : 's'}`,
      isLunchBreak: true,
      currentMinutes,
    };
  }

  // 4. Check if any lecture is currently IN PROGRESS
  // Interval rule: lecture.startTime <= currentTime < lecture.endTime
  const activeLecture = sortedLectures.find((l) => {
    const startMin = parseTimeToMinutes(l.startTime);
    const endMin = parseTimeToMinutes(l.endTime);
    return !isNaN(startMin) && !isNaN(endMin) && startMin <= currentMinutes && currentMinutes < endMin;
  });

  if (activeLecture) {
    const endMin = parseTimeToMinutes(activeLecture.endTime);
    const remainingTime = Math.max(0, endMin - currentMinutes);
    // Next lecture is the first one starting at or after this one ends
    const nextLecture = sortedLectures.find((l) => parseTimeToMinutes(l.startTime) >= endMin) || null;

    return {
      state: 'IN_PROGRESS',
      stateLabel: 'In Progress',
      currentLecture: activeLecture,
      nextLecture,
      remainingLecturesCount,
      totalLecturesToday,
      timeRemainingMinutes: remainingTime,
      formattedTimeRemaining: remainingTime === 1 ? 'Ends in 1 min' : `Ends in ${remainingTime} mins`,
      isLunchBreak: false,
      currentMinutes,
    };
  }

  // 5. If no lecture is currently active, find upcoming lectures today
  const upcomingLectures = sortedLectures.filter((l) => {
    return parseTimeToMinutes(l.startTime) > currentMinutes;
  });

  if (upcomingLectures.length > 0) {
    const nextLecture = upcomingLectures[0];
    const nextStartMin = parseTimeToMinutes(nextLecture.startTime);
    const startsIn = Math.max(0, nextStartMin - currentMinutes);

    // If before college start or within 15 minutes of lecture start
    const isUpNextSoon = startsIn <= 15 || currentMinutes < COLLEGE_START_MINUTES;

    return {
      state: isUpNextSoon ? 'UP_NEXT' : 'FREE_PERIOD',
      stateLabel: isUpNextSoon ? 'Up Next' : 'Free Period',
      currentLecture: null,
      nextLecture,
      remainingLecturesCount,
      totalLecturesToday,
      timeRemainingMinutes: startsIn,
      formattedTimeRemaining: startsIn >= 60
        ? `Starts in ${Math.floor(startsIn / 60)}h ${startsIn % 60}m`
        : `Starts in ${startsIn} min${startsIn === 1 ? '' : 's'}`,
      isLunchBreak: false,
      currentMinutes,
    };
  }

  // 6. No more lectures remaining today, but still before 3:30 PM
  return {
    state: 'FREE_PERIOD',
    stateLabel: 'All Lectures Completed',
    currentLecture: null,
    nextLecture: null,
    remainingLecturesCount: 0,
    totalLecturesToday,
    timeRemainingMinutes: 0,
    formattedTimeRemaining: 'No further lectures scheduled today',
    isLunchBreak: false,
    currentMinutes,
  };
}
