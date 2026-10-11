import { Subject, GradingScaleItem } from '../types';
import { DEFAULT_GRADING_SCALE } from '../data/seedData';

export interface SubjectAnalysis {
  subject: Subject;
  theoryCredits: number;
  practicalCredits: number;
  tutorialCredits: number;
  totalCredits: number;
  maxTotal: number;
  scoredTotal: number;
  currentPercentage: number;
  currentGrade: string;
  currentGradePoint: number;
  minMarksToPass: number;
  isPassing: boolean;
  projectedExternalMarks: number;
  projectedTotal: number;
  projectedPercentage: number;
  projectedGrade: string;
  projectedGradePoint: number;
}

export interface SgpaSummary {
  semester: string;
  totalCredits: number;
  grandMaxMarks: number;
  grandScoredMarks: number;
  currentPercentage: number;
  currentSgpaEstimate: number;
  projectedSgpa: number;
  earnedGradePoints: number;
  totalPossibleGradePoints: number;
  subjectAnalyses: SubjectAnalysis[];
}

export function getGradeFromPercentage(
  percentage: number,
  scale: GradingScaleItem[] = DEFAULT_GRADING_SCALE
): GradingScaleItem {
  for (const item of scale) {
    if (percentage >= item.minPercentage && percentage <= item.maxPercentage) {
      return item;
    }
  }
  return scale[scale.length - 1]; // Default to lowest / Fail
}

// Ensure subject has valid credits and marks structure even if loaded from older storage
export function normalizeSubject(subject: Subject): Subject {
  const credits = typeof subject.credits === 'object' && subject.credits !== null ? subject.credits : {
    theory: Number(subject.credits) || 3,
    practical: 0,
    tutorial: 0,
    total: Number(subject.credits) || 3,
  };

  const legacyInternal = (subject as any).internalCurrent ?? 16;
  const legacyInternalMax = (subject as any).internalMax ?? 20;
  const legacyExternal = (subject as any).externalCurrent ?? 60;
  const legacyExternalMax = (subject as any).externalMax ?? 80;

  const marks = subject.marks || {
    continuousAssessment: { max: legacyInternalMax, scored: legacyInternal },
    midTerm: { max: legacyInternalMax, scored: Math.min(legacyInternalMax, legacyInternal) },
    endSem: { max: legacyExternalMax, scored: legacyExternal },
    termWork: { max: 25, scored: 22 },
    practicalOral: { max: 0, scored: 0 },
  };

  return {
    ...subject,
    semester: subject.semester || 'Sem 2',
    credits: {
      theory: credits.theory ?? 3,
      practical: credits.practical ?? 0,
      tutorial: credits.tutorial ?? 0,
      total: (credits.theory ?? 3) + (credits.practical ?? 0) + (credits.tutorial ?? 0) || credits.total || 3,
    },
    marks: {
      continuousAssessment: marks.continuousAssessment || { max: 20, scored: 17 },
      midTerm: marks.midTerm || { max: 20, scored: 16 },
      endSem: marks.endSem || { max: 80, scored: 60 },
      termWork: marks.termWork || { max: 25, scored: 22 },
      practicalOral: marks.practicalOral || { max: 0, scored: 0 },
    },
  };
}

export function getSubjectMaxTotal(subject: Subject): number {
  const norm = normalizeSubject(subject);
  const m = norm.marks;
  return (
    (m.continuousAssessment?.max || 0) +
    (m.midTerm?.max || 0) +
    (m.endSem?.max || 0) +
    (m.termWork?.max || 0) +
    (m.practicalOral?.max || 0)
  );
}

export function getSubjectScoredTotal(subject: Subject, customEndSemScored?: number): number {
  const norm = normalizeSubject(subject);
  const m = norm.marks;
  const endSemScore = customEndSemScored !== undefined ? customEndSemScored : (m.endSem?.scored || 0);
  return (
    (m.continuousAssessment?.scored || 0) +
    (m.midTerm?.scored || 0) +
    endSemScore +
    (m.termWork?.scored || 0) +
    (m.practicalOral?.scored || 0)
  );
}

export function analyzeSubject(
  rawSubject: Subject,
  projectedEndSem?: number,
  scale: GradingScaleItem[] = DEFAULT_GRADING_SCALE
): SubjectAnalysis {
  const subject = normalizeSubject(rawSubject);
  const theoryCredits = subject.credits.theory;
  const practicalCredits = subject.credits.practical;
  const tutorialCredits = subject.credits.tutorial;
  const totalCredits = subject.credits.total || (theoryCredits + practicalCredits + tutorialCredits) || 1;

  const maxTotal = getSubjectMaxTotal(subject);
  const scoredTotal = getSubjectScoredTotal(subject);
  const currentPercentage = maxTotal > 0 ? (scoredTotal / maxTotal) * 100 : 0;
  const currentGradeItem = getGradeFromPercentage(currentPercentage, scale);

  // Passing threshold: 40%
  const minMarksToPass = Math.ceil(0.40 * maxTotal);
  const isPassing = scoredTotal >= minMarksToPass;

  // Projected calculation
  const activeProjectedEndSem = projectedEndSem !== undefined
    ? projectedEndSem
    : (subject.marks?.endSem?.scored || 0);

  const projectedTotal = getSubjectScoredTotal(subject, activeProjectedEndSem);
  const projectedPercentage = maxTotal > 0 ? (projectedTotal / maxTotal) * 100 : 0;
  const projectedGradeItem = getGradeFromPercentage(projectedPercentage, scale);

  return {
    subject,
    theoryCredits,
    practicalCredits,
    tutorialCredits,
    totalCredits,
    maxTotal,
    scoredTotal,
    currentPercentage,
    currentGrade: currentGradeItem.grade,
    currentGradePoint: currentGradeItem.gradePoint,
    minMarksToPass,
    isPassing,
    projectedExternalMarks: activeProjectedEndSem,
    projectedTotal,
    projectedPercentage,
    projectedGrade: projectedGradeItem.grade,
    projectedGradePoint: projectedGradeItem.gradePoint,
  };
}

export function calculateSemesterSgpa(
  subjects: Subject[],
  projectedEndSemMap: Record<string, number> = {},
  scale: GradingScaleItem[] = DEFAULT_GRADING_SCALE,
  targetSemester: string = 'All'
): SgpaSummary {
  if (!subjects || subjects.length === 0) {
    return {
      semester: targetSemester,
      totalCredits: 0,
      grandMaxMarks: 0,
      grandScoredMarks: 0,
      currentPercentage: 0,
      currentSgpaEstimate: 0,
      projectedSgpa: 0,
      earnedGradePoints: 0,
      totalPossibleGradePoints: 0,
      subjectAnalyses: [],
    };
  }

  // Filter by semester if specified (and not 'All')
  const filteredSubjects = targetSemester === 'All'
    ? subjects
    : subjects.filter(s => (s.semester || 'Sem 2') === targetSemester);

  const activeList = filteredSubjects.length > 0 ? filteredSubjects : subjects;

  let totalCredits = 0;
  let totalCurrentPoints = 0;
  let totalProjectedPoints = 0;
  let grandMaxMarks = 0;
  let grandScoredMarks = 0;

  const subjectAnalyses: SubjectAnalysis[] = activeList.map((rawSub) => {
    const sub = normalizeSubject(rawSub);
    const projectedEndSem = projectedEndSemMap[sub.id] !== undefined
      ? projectedEndSemMap[sub.id]
      : (sub.marks?.endSem?.scored ?? Math.round((sub.marks?.endSem?.max || 60) * 0.75));

    const analysis = analyzeSubject(sub, projectedEndSem, scale);

    totalCredits += analysis.totalCredits;
    totalCurrentPoints += analysis.totalCredits * analysis.currentGradePoint;
    totalProjectedPoints += analysis.totalCredits * analysis.projectedGradePoint;
    grandMaxMarks += analysis.maxTotal;
    grandScoredMarks += analysis.scoredTotal;

    return analysis;
  });

  const currentSgpaEstimate = totalCredits > 0 ? Number((totalCurrentPoints / totalCredits).toFixed(2)) : 0;
  const projectedSgpa = totalCredits > 0 ? Number((totalProjectedPoints / totalCredits).toFixed(2)) : 0;
  const currentPercentage = grandMaxMarks > 0 ? Number(((grandScoredMarks / grandMaxMarks) * 100).toFixed(1)) : 0;

  return {
    semester: targetSemester,
    totalCredits,
    grandMaxMarks,
    grandScoredMarks,
    currentPercentage,
    currentSgpaEstimate,
    projectedSgpa,
    earnedGradePoints: totalProjectedPoints,
    totalPossibleGradePoints: totalCredits * 10,
    subjectAnalyses,
  };
}
