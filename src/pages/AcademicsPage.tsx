import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateSemesterSgpa, analyzeSubject, getSubjectMaxTotal, getSubjectScoredTotal } from '../utils/academicCalculations';
import { Subject } from '../types';
import {
  GraduationCap,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Sliders,
  Info,
  Calendar,
  Layers,
  Award,
  ChevronRight,
  X,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const AcademicsPage: React.FC = () => {
  const { subjects, addSubject, updateSubject, deleteSubject, gradingScale, showToast } = useApp();

  const [activeSemester, setActiveSemester] = useState<string>('Sem 2');
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state for editing or creating
  const [formSemester, setFormSemester] = useState<string>('Sem 2');
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formTheoryCredits, setFormTheoryCredits] = useState<number>(3);
  const [formPracticalCredits, setFormPracticalCredits] = useState<number>(1);
  const [formTutorialCredits, setFormTutorialCredits] = useState<number>(0);

  // Marks inputs
  const [formCaMax, setFormCaMax] = useState<number>(20);
  const [formCaScored, setFormCaScored] = useState<number>(18);
  const [formMidTermMax, setFormMidTermMax] = useState<number>(20);
  const [formMidTermScored, setFormMidTermScored] = useState<number>(17);
  const [formEndSemMax, setFormEndSemMax] = useState<number>(80);
  const [formEndSemScored, setFormEndSemScored] = useState<number>(64);
  const [formTwMax, setFormTwMax] = useState<number>(25);
  const [formTwScored, setFormTwScored] = useState<number>(22);
  const [formPrOrMax, setFormPrOrMax] = useState<number>(25);
  const [formPrOrScored, setFormPrOrScored] = useState<number>(22);

  const availableSemesters = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];

  // Calculate SGPA and summary for the selected semester
  const sgpaSummary = calculateSemesterSgpa(subjects, {}, gradingScale, activeSemester);

  // Open edit modal for an existing subject
  const handleOpenEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormSemester(subject.semester || 'Sem 2');
    setFormCode(subject.code);
    setFormName(subject.name);
    setFormTheoryCredits(subject.credits?.theory ?? 3);
    setFormPracticalCredits(subject.credits?.practical ?? 0);
    setFormTutorialCredits(subject.credits?.tutorial ?? 0);

    setFormCaMax(subject.marks.continuousAssessment?.max ?? 20);
    setFormCaScored(subject.marks.continuousAssessment?.scored ?? 0);

    setFormMidTermMax(subject.marks.midTerm?.max ?? 20);
    setFormMidTermScored(subject.marks.midTerm?.scored ?? 0);

    setFormEndSemMax(subject.marks.endSem?.max ?? 80);
    setFormEndSemScored(subject.marks.endSem?.scored ?? 0);

    setFormTwMax(subject.marks.termWork?.max ?? 25);
    setFormTwScored(subject.marks.termWork?.scored ?? 0);

    setFormPrOrMax(subject.marks.practicalOral?.max ?? 0);
    setFormPrOrScored(subject.marks.practicalOral?.scored ?? 0);
  };

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setFormSemester(activeSemester);
    setFormCode('');
    setFormName('');
    setFormTheoryCredits(3);
    setFormPracticalCredits(1);
    setFormTutorialCredits(0);

    setFormCaMax(20);
    setFormCaScored(17);
    setFormMidTermMax(20);
    setFormMidTermScored(16);
    setFormEndSemMax(80);
    setFormEndSemScored(60);
    setFormTwMax(25);
    setFormTwScored(22);
    setFormPrOrMax(25);
    setFormPrOrScored(20);

    setIsAddModalOpen(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode || !formName) return;

    const totalCredits = Number(formTheoryCredits) + Number(formPracticalCredits) + Number(formTutorialCredits);

    const updatedData: Omit<Subject, 'id' | 'userId'> = {
      semester: formSemester,
      code: formCode.toUpperCase().trim(),
      name: formName.trim(),
      credits: {
        theory: Number(formTheoryCredits),
        practical: Number(formPracticalCredits),
        tutorial: Number(formTutorialCredits),
        total: totalCredits,
      },
      marks: {
        continuousAssessment: { max: Number(formCaMax), scored: Number(formCaScored) },
        midTerm: { max: Number(formMidTermMax), scored: Number(formMidTermScored) },
        endSem: { max: Number(formEndSemMax), scored: Number(formEndSemScored) },
        termWork: { max: Number(formTwMax), scored: Number(formTwScored) },
        practicalOral: { max: Number(formPrOrMax), scored: Number(formPrOrScored) },
      },
      color: editingSubject?.color || '#F97316',
      targetGrade: editingSubject?.targetGrade || 'A',
    };

    if (editingSubject) {
      updateSubject(editingSubject.id, updatedData);
      showToast(`Updated marks & credits for ${updatedData.name}`, 'success');
      setEditingSubject(null);
    } else {
      addSubject(updatedData);
      showToast(`Added ${updatedData.name} to ${formSemester}`, 'success');
      setIsAddModalOpen(false);
    }
  };

  // Dual-Layer Chart Data: lighter bar = Actual Max Marks, vibrant bar = Achieved Marks
  const chartData = sgpaSummary.subjectAnalyses.map((item) => {
    return {
      code: item.subject.code,
      name: item.subject.name,
      actualMaxMarks: item.maxTotal,
      achievedMarks: item.scoredTotal,
      percentage: Math.round(item.currentPercentage),
      grade: item.currentGrade,
      credits: item.totalCredits,
    };
  });

  // Calculate live preview in modal
  const livePreviewMax = Number(formCaMax) + Number(formMidTermMax) + Number(formEndSemMax) + Number(formTwMax) + Number(formPrOrMax);
  const livePreviewScored = Number(formCaScored) + Number(formMidTermScored) + Number(formEndSemScored) + Number(formTwScored) + Number(formPrOrScored);
  const livePreviewPct = livePreviewMax > 0 ? (livePreviewScored / livePreviewMax) * 100 : 0;
  const livePreviewCredits = Number(formTheoryCredits) + Number(formPracticalCredits) + Number(formTutorialCredits);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#737871] mb-1">
            <span>NEP-2020 Multi-Credit System</span>
            <span>·</span>
            <span>Semester-Wise Marks Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171916] tracking-tight">
            Academics & SGPA Planner
          </h1>
          <p className="text-xs sm:text-sm text-[#555952] mt-0.5">
            Theoretical, practical & tutorial credits with Continuous Assessment, Mid-Term, End-Sem, Term Work, and Oral/Practical marks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Subject</span>
          </button>
        </div>
      </div>

      {/* SEMESTER SELECTOR TABS */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-2 bg-white rounded-2xl border border-[#E5E3DC] shadow-xs">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-[#F97316] ml-2 shrink-0" />
          <span className="text-xs font-bold text-[#171916] mr-2">Semester:</span>
          {availableSemesters.map((sem) => (
            <button
              key={sem}
              onClick={() => setActiveSemester(sem)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSemester === sem
                  ? 'bg-[#171916] text-white shadow-xs'
                  : 'text-[#555952] hover:text-[#171916] hover:bg-[#FAF9F5]'
              }`}
            >
              {sem}
            </button>
          ))}
        </div>

        <div className="text-xs text-[#737871] px-3 font-medium">
          Showing <strong>{sgpaSummary.subjectAnalyses.length}</strong> subjects for {activeSemester}
        </div>
      </div>

      {/* SEMESTER AGGREGATE SUMMARY STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Grand Total Marks */}
        <div className="p-4 rounded-2xl bg-white border border-[#E5E3DC] shadow-xs">
          <div className="text-[11px] font-semibold text-[#737871]">Grand Total Marks ({activeSemester})</div>
          <div className="text-2xl font-extrabold font-mono text-[#171916] tabular-nums mt-1">
            {sgpaSummary.grandScoredMarks}{' '}
            <span className="text-sm font-normal text-[#737871]">/ {sgpaSummary.grandMaxMarks}</span>
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-1">
            Aggregate: {sgpaSummary.currentPercentage.toFixed(1)}% Marks
          </div>
        </div>

        {/* Calculated SGPA */}
        <div className="p-4 rounded-2xl bg-[#FFF8F5] border border-[#F97316]/30 shadow-xs">
          <div className="text-[11px] font-semibold text-[#F97316]">Semester SGPA (Credit-Weighted)</div>
          <div className="text-2xl font-extrabold font-mono text-[#F97316] tabular-nums mt-1">
            {sgpaSummary.currentSgpaEstimate.toFixed(2)}{' '}
            <span className="text-xs font-normal text-[#555952]">/ 10</span>
          </div>
          <div className="text-[10px] text-[#555952] mt-1">
            Grade Point Total: {sgpaSummary.earnedGradePoints} / {sgpaSummary.totalPossibleGradePoints}
          </div>
        </div>

        {/* Total Credits Assigned */}
        <div className="p-4 rounded-2xl bg-white border border-[#E5E3DC] shadow-xs">
          <div className="text-[11px] font-semibold text-[#737871]">Total Credits Assigned</div>
          <div className="text-2xl font-extrabold font-mono text-[#171916] tabular-nums mt-1">
            {sgpaSummary.totalCredits}{' '}
            <span className="text-xs font-normal text-[#555952]">Credits</span>
          </div>
          <div className="text-[10px] text-[#555952] mt-1">
            Σ (Theory + Practical + Tutorial)
          </div>
        </div>

        {/* Passing Status */}
        <div className="p-4 rounded-2xl bg-white border border-[#E5E3DC] shadow-xs">
          <div className="text-[11px] font-semibold text-[#737871]">Semester Status</div>
          <div className="text-2xl font-extrabold font-mono text-emerald-600 tabular-nums mt-1">
            CLEAR
          </div>
          <div className="text-[10px] text-emerald-700 mt-1">
            All subjects above passing threshold
          </div>
        </div>
      </div>

      {/* DUAL-LAYER VISUAL GRAPH (Actual Marks vs Achieved Marks) */}
      <div className="p-6 rounded-2xl bg-white border border-[#E5E3DC] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-[#171916]">
              Subject Performance: Achieved Marks vs Actual Maximum Marks
            </h2>
            <p className="text-xs text-[#737871]">
              Lighter bar shows the total actual marks ceiling; vibrant upfront bar shows achieved marks.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-[#555952]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#FED7AA] border border-[#FDBA74]" />
              <span>Actual Max Marks</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#F97316]" />
              <span className="font-bold text-[#F97316]">Achieved Marks</span>
            </span>
          </div>
        </div>

        {/* Dual-Layer Bar Chart */}
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              barGap="-100%" // Directly overlaps the vibrant bar on top of the lighter ceiling bar!
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <XAxis dataKey="code" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value: any, name: any, item: any) => {
                  if (name === 'Actual Max Marks') return [`${value} marks (Max ceiling)`, 'Actual Maximum'];
                  return [`${value} marks (${item.payload.percentage}% · Grade ${item.payload.grade})`, 'Achieved'];
                }}
                labelFormatter={(label) => {
                  const sub = chartData.find(c => c.code === label);
                  return sub ? `${sub.name} (${label})` : `Course ${label}`;
                }}
              />
              {/* Layer 1 (Background): Lighter bar representing Actual Total Maximum Marks */}
              <Bar
                dataKey="actualMaxMarks"
                name="Actual Max Marks"
                fill="#FED7AA"
                radius={[6, 6, 0, 0]}
                barSize={38}
              />
              {/* Layer 2 (Upfront): Vibrant Ember bar representing Achieved Marks */}
              <Bar
                dataKey="achievedMarks"
                name="Achieved Marks"
                fill="#F97316"
                radius={[6, 6, 0, 0]}
                barSize={38}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* STRUCTURED SUBJECTS TABLE */}
      <div className="rounded-2xl border border-[#E5E3DC] bg-white overflow-hidden shadow-xs">
        <div className="p-4 bg-[#FAF9F5] border-b border-[#E5E3DC] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-[#171916]">
              {activeSemester} Subjects & Marks Breakdown
            </h2>
            <p className="text-[11px] text-[#737871]">
              Click on any subject row to edit received marks, assess components, or adjust assigned credits.
            </p>
          </div>

          <div className="text-xs text-[#555952] font-semibold">
            Grand Total: <span className="font-mono text-[#F97316] font-bold">{sgpaSummary.grandScoredMarks} / {sgpaSummary.grandMaxMarks}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF9F5] text-[#737871] font-semibold border-b border-[#E5E3DC] text-[11px]">
              <tr>
                <th className="py-3 px-4">Subject Name & Code</th>
                <th className="py-3 px-3 text-center border-l border-[#E5E3DC]">
                  <div className="text-[10px] text-[#555952] font-bold">Credits Assigned</div>
                  <div className="grid grid-cols-4 gap-1 text-[9px] mt-0.5 font-mono text-[#737871]">
                    <span>Theory</span>
                    <span>Pract</span>
                    <span>Tut</span>
                    <span className="font-bold text-[#171916]">Total</span>
                  </div>
                </th>
                <th className="py-3 px-3 text-center border-l border-[#E5E3DC]">
                  <div className="text-[10px] text-[#555952] font-bold">Continuous Assessment</div>
                  <div className="text-[9px] font-mono text-[#737871]">Scored / Max</div>
                </th>
                <th className="py-3 px-3 text-center border-l border-[#E5E3DC]">
                  <div className="text-[10px] text-[#555952] font-bold">Mid Term</div>
                  <div className="text-[9px] font-mono text-[#737871]">Scored / Max</div>
                </th>
                <th className="py-3 px-3 text-center border-l border-[#E5E3DC]">
                  <div className="text-[10px] text-[#555952] font-bold">End Sem</div>
                  <div className="text-[9px] font-mono text-[#737871]">Scored / Max</div>
                </th>
                <th className="py-3 px-3 text-center border-l border-[#E5E3DC]">
                  <div className="text-[10px] text-[#555952] font-bold">Term Work</div>
                  <div className="text-[9px] font-mono text-[#737871]">Scored / Max</div>
                </th>
                <th className="py-3 px-3 text-center border-l border-[#E5E3DC]">
                  <div className="text-[10px] text-[#555952] font-bold">Practical / Oral</div>
                  <div className="text-[9px] font-mono text-[#737871]">Scored / Max</div>
                </th>
                <th className="py-3 px-4 text-right border-l border-[#E5E3DC]">
                  <div className="text-[10px] text-[#171916] font-bold">Subject Total</div>
                  <div className="text-[9px] text-[#737871]">Marks · Grade</div>
                </th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E5E3DC]">
              {sgpaSummary.subjectAnalyses.map((item) => {
                const sub = item.subject;
                const m = sub.marks;
                const cr = sub.credits;

                return (
                  <tr
                    key={sub.id}
                    onClick={() => handleOpenEdit(sub)}
                    className="hover:bg-[#FFF8F5]/60 transition-colors cursor-pointer group"
                  >
                    {/* Subject Name & Code */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#171916] group-hover:text-[#F97316] transition-colors">
                        {sub.name}
                      </div>
                      <div className="text-[11px] font-mono text-[#737871]">{sub.code}</div>
                    </td>

                    {/* Credits Breakdown: Theory, Practical, Tutorial, Total */}
                    <td className="py-3.5 px-3 border-l border-[#E5E3DC]">
                      <div className="grid grid-cols-4 gap-1 text-center font-mono text-[11px] tabular-nums">
                        <span className="text-[#555952]">{cr?.theory ?? 0}</span>
                        <span className="text-[#555952]">{cr?.practical ?? 0}</span>
                        <span className="text-[#555952]">{cr?.tutorial ?? 0}</span>
                        <span className="font-bold text-[#171916] bg-[#FAF9F5] rounded-xs px-1">
                          {item.totalCredits}
                        </span>
                      </div>
                    </td>

                    {/* Continuous Assessment */}
                    <td className="py-3.5 px-3 text-center font-mono border-l border-[#E5E3DC] tabular-nums">
                      {m.continuousAssessment?.max > 0 ? (
                        <div>
                          <span className="font-bold text-[#171916]">{m.continuousAssessment?.scored}</span>
                          <span className="text-[#737871]"> / {m.continuousAssessment?.max}</span>
                        </div>
                      ) : (
                        <span className="text-[#A8ADA3]">-</span>
                      )}
                    </td>

                    {/* Mid Term */}
                    <td className="py-3.5 px-3 text-center font-mono border-l border-[#E5E3DC] tabular-nums">
                      {m.midTerm?.max > 0 ? (
                        <div>
                          <span className="font-bold text-[#171916]">{m.midTerm?.scored}</span>
                          <span className="text-[#737871]"> / {m.midTerm?.max}</span>
                        </div>
                      ) : (
                        <span className="text-[#A8ADA3]">-</span>
                      )}
                    </td>

                    {/* End Sem */}
                    <td className="py-3.5 px-3 text-center font-mono border-l border-[#E5E3DC] tabular-nums">
                      {m.endSem?.max > 0 ? (
                        <div>
                          <span className="font-bold text-[#171916]">{m.endSem?.scored}</span>
                          <span className="text-[#737871]"> / {m.endSem?.max}</span>
                        </div>
                      ) : (
                        <span className="text-[#A8ADA3]">-</span>
                      )}
                    </td>

                    {/* Term Work */}
                    <td className="py-3.5 px-3 text-center font-mono border-l border-[#E5E3DC] tabular-nums">
                      {m.termWork?.max > 0 ? (
                        <div>
                          <span className="font-bold text-[#171916]">{m.termWork?.scored}</span>
                          <span className="text-[#737871]"> / {m.termWork?.max}</span>
                        </div>
                      ) : (
                        <span className="text-[#A8ADA3]">-</span>
                      )}
                    </td>

                    {/* Practical / Oral */}
                    <td className="py-3.5 px-3 text-center font-mono border-l border-[#E5E3DC] tabular-nums">
                      {m.practicalOral?.max > 0 ? (
                        <div>
                          <span className="font-bold text-[#171916]">{m.practicalOral?.scored}</span>
                          <span className="text-[#737871]"> / {m.practicalOral?.max}</span>
                        </div>
                      ) : (
                        <span className="text-[#A8ADA3]">-</span>
                      )}
                    </td>

                    {/* Subject Total Marks */}
                    <td className="py-3.5 px-4 text-right border-l border-[#E5E3DC]">
                      <div className="font-mono font-bold text-xs text-[#171916] tabular-nums">
                        {item.scoredTotal} <span className="font-normal text-[#737871]">/ {item.maxTotal}</span>
                      </div>
                      <div className="text-[11px] font-semibold text-[#F97316]">
                        {item.currentPercentage.toFixed(1)}% (Grade {item.currentGrade})
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(sub);
                        }}
                        className="p-1.5 text-[#737871] hover:text-[#F97316] rounded-lg transition-colors cursor-pointer"
                        title="Edit Marks & Credits"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* GRAND TOTAL TABLE FOOTER */}
            <tfoot className="bg-[#FAF9F5] border-t-2 border-[#E5E3DC] font-bold text-[#171916]">
              <tr>
                <td className="py-3 px-4 text-xs">
                  Grand Total ({activeSemester})
                </td>
                <td className="py-3 px-3 text-center border-l border-[#E5E3DC] font-mono tabular-nums">
                  {sgpaSummary.totalCredits} Credits
                </td>
                <td colSpan={5} className="py-3 px-3 text-center text-[11px] text-[#737871] border-l border-[#E5E3DC]">
                  Aggregate Assessment Total
                </td>
                <td className="py-3 px-4 text-right border-l border-[#E5E3DC] font-mono text-xs text-[#F97316] tabular-nums">
                  {sgpaSummary.grandScoredMarks} / {sgpaSummary.grandMaxMarks}
                  <div className="text-[10px] text-emerald-700">
                    {sgpaSummary.currentPercentage.toFixed(1)}% · SGPA {sgpaSummary.currentSgpaEstimate.toFixed(2)}
                  </div>
                </td>
                <td className="py-3 px-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* EDIT / ADD SUBJECT MODAL */}
      {(editingSubject !== null || isAddModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E5E3DC] p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E3DC]">
              <div>
                <h2 className="text-base font-bold text-[#171916]">
                  {editingSubject ? `Edit Marks & Credits: ${editingSubject.code}` : 'Add New Subject'}
                </h2>
                <p className="text-xs text-[#737871]">
                  Fill in assigned credits and scored continuous/exam marks.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingSubject(null);
                  setIsAddModalOpen(false);
                }}
                className="p-1 rounded-lg text-[#737871] hover:text-[#171916]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="space-y-4">
              {/* Basic Course Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#3B4036] mb-1">Semester</label>
                  <select
                    value={formSemester}
                    onChange={(e) => setFormSemester(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#D7D4CB] bg-white"
                  >
                    {availableSemesters.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3B4036] mb-1">Subject Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FEC201"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#D7D4CB]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3B4036] mb-1">Subject Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Applied Mathematics II"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#D7D4CB]"
                  />
                </div>
              </div>

              {/* CREDITS ASSIGNED (3 Sub-columns: Theoretical, Practical, Tutorial) */}
              <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E5E3DC] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#171916]">
                    Credits Assigned (Sub-columns)
                  </span>
                  <span className="text-xs font-mono font-bold text-[#F97316] tabular-nums">
                    Total Credits: {livePreviewCredits}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#555952] mb-1">
                      Theoretical Credits (Theory)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min={0}
                      max={6}
                      value={formTheoryCredits}
                      onChange={(e) => setFormTheoryCredits(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#D7D4CB] bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#555952] mb-1">
                      Practical Credits (Lab)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min={0}
                      max={4}
                      value={formPracticalCredits}
                      onChange={(e) => setFormPracticalCredits(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#D7D4CB] bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#555952] mb-1">
                      Tutorial Credits (Tut)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min={0}
                      max={3}
                      value={formTutorialCredits}
                      onChange={(e) => setFormTutorialCredits(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#D7D4CB] bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* MARKS STRUCTURE: Continuous Assessment, Mid Term, End Sem, Term Work, Practical/Oral */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-[#171916]">
                  Marks Structure (Maximum Marks vs Received/Scored Marks)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  {/* Continuous Assessment */}
                  <div className="p-3 rounded-xl border border-[#E5E3DC] bg-white space-y-2">
                    <span className="font-bold text-[#171916]">Continuous Assessment (CA)</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-[#737871]">Max Marks</span>
                        <input
                          type="number"
                          min={0}
                          value={formCaMax}
                          onChange={(e) => setFormCaMax(Number(e.target.value))}
                          className="w-full px-2 py-1 text-xs rounded-md border border-[#D7D4CB] font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-[#737871]">Scored</span>
                        <input
                          type="number"
                          min={0}
                          max={formCaMax}
                          value={formCaScored}
                          onChange={(e) => setFormCaScored(Number(e.target.value))}
                          className="w-full px-2 py-1 text-xs rounded-md border border-[#D7D4CB] font-mono font-bold text-[#F97316]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mid Term Marks */}
                  <div className="p-3 rounded-xl border border-[#E5E3DC] bg-white space-y-2">
                    <span className="font-bold text-[#171916]">Mid Term Marks</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-[#737871]">Max Marks</span>
                        <input
                          type="number"
                          min={0}
                          value={formMidTermMax}
                          onChange={(e) => setFormMidTermMax(Number(e.target.value))}
                          className="w-full px-2 py-1 text-xs rounded-md border border-[#D7D4CB] font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-[#737871]">Scored</span>
                        <input
                          type="number"
                          min={0}
                          max={formMidTermMax}
                          value={formMidTermScored}
                          onChange={(e) => setFormMidTermScored(Number(e.target.value))}
                          className="w-full px-2 py-1 text-xs rounded-md border border-[#D7D4CB] font-mono font-bold text-[#F97316]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* End Sem Marks */}
                  <div className="p-3 rounded-xl border border-[#E5E3DC] bg-white space-y-2">
                    <span className="font-bold text-[#171916]">End Sem Marks</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-[#737871]">Max Marks</span>
                        <input
                          type="number"
                          min={0}
                          value={formEndSemMax}
                          onChange={(e) => setFormEndSemMax(Number(e.target.value))}
                          className="w-full px-2 py-1 text-xs rounded-md border border-[#D7D4CB] font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-[#737871]">Scored</span>
                        <input
                          type="number"
                          min={0}
                          max={formEndSemMax}
                          value={formEndSemScored}
                          onChange={(e) => setFormEndSemScored(Number(e.target.value))}
                          className="w-full px-2 py-1 text-xs rounded-md border border-[#D7D4CB] font-mono font-bold text-[#F97316]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Term Work */}
                  <div className="p-3 rounded-xl border border-[#E5E3DC] bg-white space-y-2">
                    <span className="font-bold text-[#171916]">Term Work (TW)</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-[#737871]">Max Marks</span>
                        <input
                          type="number"
                          min={0}
                          value={formTwMax}
                          onChange={(e) => setFormTwMax(Number(e.target.value))}
                          className="w-full px-2 py-1 text-xs rounded-md border border-[#D7D4CB] font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-[#737871]">Scored</span>
                        <input
                          type="number"
                          min={0}
                          max={formTwMax}
                          value={formTwScored}
                          onChange={(e) => setFormTwScored(Number(e.target.value))}
                          className="w-full px-2 py-1 text-xs rounded-md border border-[#D7D4CB] font-mono font-bold text-[#F97316]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Practical / Oral */}
                  <div className="p-3 rounded-xl border border-[#E5E3DC] bg-white space-y-2">
                    <span className="font-bold text-[#171916]">Practical / Oral (PR/OR)</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-[#737871]">Max Marks</span>
                        <input
                          type="number"
                          min={0}
                          value={formPrOrMax}
                          onChange={(e) => setFormPrOrMax(Number(e.target.value))}
                          className="w-full px-2 py-1 text-xs rounded-md border border-[#D7D4CB] font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-[#737871]">Scored</span>
                        <input
                          type="number"
                          min={0}
                          max={formPrOrMax}
                          value={formPrOrScored}
                          onChange={(e) => setFormPrOrScored(Number(e.target.value))}
                          className="w-full px-2 py-1 text-xs rounded-md border border-[#D7D4CB] font-mono font-bold text-[#F97316]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Calculated Subject Total Live Summary */}
                  <div className="p-3 rounded-xl border border-[#F97316]/30 bg-[#FFF8F5] flex flex-col justify-between">
                    <div>
                      <span className="font-bold text-[#F97316] text-[11px]">Calculated Subject Total</span>
                      <div className="text-xl font-mono font-bold text-[#171916] tabular-nums mt-1">
                        {livePreviewScored} <span className="text-xs font-normal text-[#737871]">/ {livePreviewMax}</span>
                      </div>
                    </div>
                    <div className="text-[11px] font-semibold text-emerald-700">
                      {livePreviewPct.toFixed(1)}% Marks
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-[#E5E3DC]">
                {editingSubject ? (
                  <button
                    type="button"
                    onClick={() => {
                      deleteSubject(editingSubject.id);
                      setEditingSubject(null);
                    }}
                    className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Subject</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSubject(null);
                      setIsAddModalOpen(false);
                    }}
                    className="px-3 py-2 text-xs font-semibold text-[#555952] hover:bg-[#FAF9F5] rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold bg-[#F97316] text-white rounded-xl hover:bg-[#EA580C] shadow-xs cursor-pointer"
                  >
                    {editingSubject ? 'Save Changes' : 'Create Subject'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
