import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { FacultyMember, FacultyDepartmentId, FacultyAvailability, DEPARTMENTS } from '../types/faculty';
import { FacultyService } from '../services/facultyService';
import {
  Search,
  Phone,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  BookOpen,
  XCircle,
  Calendar,
  MapPin,
  Mail,
  ShieldAlert,
  GraduationCap,
  Sparkles,
  Users,
  Filter,
  X,
  ExternalLink,
} from 'lucide-react';

export const FacultyPage: React.FC = () => {
  const { showToast } = useApp();

  // Active department selection
  const [selectedDept, setSelectedDept] = useState<FacultyDepartmentId>('AIDS');

  // Search and availability filters
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | FacultyAvailability>('all');

  // Copied phone state tracking
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Faculty dataset
  const [facultyList] = useState<FacultyMember[]>(() => FacultyService.getAllFaculty());

  // Department counts
  const departmentCounts = useMemo(() => {
    return {
      AIDS: facultyList.filter((m) => m.department === 'AIDS').length,
      CE: facultyList.filter((m) => m.department === 'CE').length,
      IT: facultyList.filter((m) => m.department === 'IT').length,
    };
  }, [facultyList]);

  // Filtered faculty list
  const filteredFaculty = useMemo(() => {
    return facultyList.filter((member) => {
      // 1. Department match
      if (member.department !== selectedDept) return false;

      // 2. Availability filter
      if (availabilityFilter !== 'all' && member.availability !== availabilityFilter) {
        return false;
      }

      // 3. Search query match (name, designation, office, subjects)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = member.name.toLowerCase().includes(query);
        const matchesDesignation = member.designation.toLowerCase().includes(query);
        const matchesOffice = member.officeLocation?.toLowerCase().includes(query) ?? false;
        const matchesSubjects = member.subjectsTaught?.some((s) => s.toLowerCase().includes(query)) ?? false;

        if (!matchesName && !matchesDesignation && !matchesOffice && !matchesSubjects) {
          return false;
        }
      }

      return true;
    });
  }, [facultyList, selectedDept, availabilityFilter, searchQuery]);

  // Copy contact number handler
  const handleCopyNumber = (member: FacultyMember) => {
    if (!member.contactNumber) {
      showToast('No contact number provided for this profile.', 'info');
      return;
    }

    navigator.clipboard.writeText(member.contactNumber);
    setCopiedId(member.id);
    showToast(`Copied ${member.name}'s contact: ${member.contactNumber}`, 'success');
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Helper for availability badge & text
  const getAvailabilityConfig = (status: FacultyAvailability) => {
    switch (status) {
      case 'available':
        return {
          label: 'Available',
          icon: CheckCircle2,
          bgClass: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
          dotClass: 'bg-emerald-500',
        };
      case 'busy':
        return {
          label: 'Busy',
          icon: Clock,
          bgClass: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
          dotClass: 'bg-amber-500',
        };
      case 'in_class':
        return {
          label: 'In Class',
          icon: BookOpen,
          bgClass: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
          dotClass: 'bg-blue-500',
        };
      case 'office_hours':
        return {
          label: 'Office Hours',
          icon: Calendar,
          bgClass: 'bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300',
          dotClass: 'bg-purple-500',
        };
      case 'unavailable':
      default:
        return {
          label: 'Unavailable',
          icon: XCircle,
          bgClass: 'bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400',
          dotClass: 'bg-neutral-400',
        };
    }
  };

  const currentDeptInfo = DEPARTMENTS[selectedDept];

  return (
    <div className="space-y-8 select-none">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-[#E5E3DC] dark:border-neutral-800 shadow-xs">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 text-[#F97316] text-[11px] font-bold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" />
              <span>Campus Directory</span>
            </span>

            {/* Demo indicator pill */}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-[10px] font-semibold">
              <ShieldAlert className="w-3 h-3 shrink-0" />
              <span>Demo Mode · Fictional Profiles</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#171916] dark:text-neutral-100 tracking-tight">
            Faculty Info
          </h1>
          <p className="text-xs sm:text-sm text-[#555952] dark:text-neutral-400 max-w-2xl leading-relaxed">
            Find faculty contacts and check their availability across departments.
          </p>
        </div>

        {/* Informational Callout */}
        <div className="shrink-0 flex items-center gap-2 p-3 rounded-2xl bg-[#FAF9F5] dark:bg-neutral-800 border border-[#E5E3DC] dark:border-neutral-700 text-xs text-[#555952] dark:text-neutral-300">
          <Sparkles className="w-4 h-4 text-[#F97316] shrink-0" />
          <span className="text-[11px]">
            Ready to link with verified college ERP directory
          </span>
        </div>
      </div>

      {/* 2. DEPARTMENT TABS (CoLegion [AIDS], CODE CELL ++ [CE], QuestIT [IT]) */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-[#737871] dark:text-neutral-400 px-1">
          Select Academic Department
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.keys(DEPARTMENTS) as FacultyDepartmentId[]).map((deptKey) => {
            const dept = DEPARTMENTS[deptKey];
            const isSelected = selectedDept === deptKey;
            const count = departmentCounts[deptKey];

            return (
              <button
                key={dept.id}
                type="button"
                onClick={() => {
                  setSelectedDept(dept.id);
                  setSearchQuery('');
                  setAvailabilityFilter('all');
                }}
                className={`relative p-5 rounded-2xl text-left border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white dark:bg-neutral-850 border-[#F97316] ring-2 ring-[#F97316]/20 shadow-md'
                    : 'bg-white dark:bg-neutral-900 border-[#E5E3DC] dark:border-neutral-800 hover:border-[#D7D4CB] hover:bg-[#FAF9F5] dark:hover:bg-neutral-800/60 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-black uppercase tracking-wider ${
                      isSelected
                        ? 'bg-[#F97316] text-white'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-[#555952] dark:text-neutral-300'
                    }`}
                  >
                    {dept.badgeTag}
                  </span>

                  <span className="text-xs font-mono font-bold text-[#737871] dark:text-neutral-400">
                    {count} {count === 1 ? 'Faculty' : 'Faculty Members'}
                  </span>
                </div>

                <div className="text-base font-extrabold text-[#171916] dark:text-neutral-100 tracking-tight">
                  {dept.name}
                </div>
                <div className="text-xs font-medium text-[#555952] dark:text-neutral-400 mt-0.5 line-clamp-1">
                  {dept.fullName}
                </div>

                {isSelected && (
                  <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-[#F97316] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. SEARCH & AVAILABILITY FILTER BAR */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-[#E5E3DC] dark:border-neutral-800 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737871] dark:text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${currentDeptInfo.name} faculty by name, designation, subjects or room...`}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#E5E3DC] dark:border-neutral-700 bg-[#FAF9F5] dark:bg-neutral-800 text-xs sm:text-sm font-medium text-[#171916] dark:text-neutral-100 placeholder-[#737871] focus:outline-none focus:border-[#F97316] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#737871] hover:text-[#171916] dark:hover:text-neutral-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Active Results Count */}
          <div className="text-xs font-semibold text-[#737871] dark:text-neutral-400 shrink-0">
            Showing <strong>{filteredFaculty.length}</strong> of {departmentCounts[selectedDept]} in {currentDeptInfo.shortName}
          </div>
        </div>

        {/* Availability Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#E5E3DC] dark:border-neutral-800">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#737871] dark:text-neutral-400 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Availability:</span>
          </div>

          {[
            { id: 'all', label: 'All Statuses' },
            { id: 'available', label: 'Available' },
            { id: 'busy', label: 'Busy' },
            { id: 'in_class', label: 'In Class' },
            { id: 'office_hours', label: 'Office Hours' },
            { id: 'unavailable', label: 'Unavailable' },
          ].map((statusOption) => {
            const isFilterActive = availabilityFilter === statusOption.id;
            return (
              <button
                key={statusOption.id}
                type="button"
                onClick={() => setAvailabilityFilter(statusOption.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isFilterActive
                    ? 'bg-[#171916] dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-2xs'
                    : 'bg-[#FAF9F5] dark:bg-neutral-800 border border-[#E5E3DC] dark:border-neutral-700 text-[#555952] dark:text-neutral-300 hover:text-[#171916] dark:hover:text-neutral-100 hover:border-[#D7D4CB]'
                }`}
              >
                {statusOption.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. FACULTY PROFILE CARDS */}
      {filteredFaculty.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredFaculty.map((faculty) => {
            const availConfig = getAvailabilityConfig(faculty.availability);
            const AvailIcon = availConfig.icon;
            const hasPhone = Boolean(faculty.contactNumber);
            const isCopied = copiedId === faculty.id;

            return (
              <div
                key={faculty.id}
                className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-[#E5E3DC] dark:border-neutral-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                {/* Top Row: Initials Avatar + Name & Designation + Availability Status */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      {/* Initials Avatar */}
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-[#F97316] text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
                        {faculty.name
                          .replace('Dr. ', '')
                          .replace('Prof. ', '')
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          {/* Mandatory 1: Name */}
                          <h2 className="text-base font-extrabold text-[#171916] dark:text-neutral-100 tracking-tight group-hover:text-[#F97316] transition-colors">
                            {faculty.name}
                          </h2>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-[#737871] dark:text-neutral-400 font-semibold">
                            Demo
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-[#555952] dark:text-neutral-400">
                          {faculty.designation}
                        </p>
                        <p className="text-[11px] font-medium text-[#737871] dark:text-neutral-500">
                          {currentDeptInfo.name}
                        </p>
                      </div>
                    </div>

                    {/* Mandatory 2: Availability Status Badge */}
                    <div
                      className={`px-2.5 py-1 rounded-xl border flex items-center gap-1.5 text-xs font-bold shrink-0 ${availConfig.bgClass}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${availConfig.dotClass} animate-pulse`} />
                      <AvailIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>{availConfig.label}</span>
                    </div>
                  </div>

                  {/* Availability Details Pill */}
                  {faculty.availabilityDetails && (
                    <div className="px-3.5 py-2 rounded-xl bg-[#FAF9F5] dark:bg-neutral-800/80 border border-[#E5E3DC] dark:border-neutral-700 text-xs text-[#555952] dark:text-neutral-300 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#F97316] shrink-0" />
                      <span className="italic">{faculty.availabilityDetails}</span>
                    </div>
                  )}

                  {/* Secondary Details: Office Location & Subjects */}
                  <div className="space-y-1.5 text-xs text-[#555952] dark:text-neutral-400 pt-1">
                    {faculty.officeLocation && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#737871] shrink-0" />
                        <span>Office: <strong className="text-[#171916] dark:text-neutral-200">{faculty.officeLocation}</strong></span>
                      </div>
                    )}

                    {faculty.subjectsTaught && faculty.subjectsTaught.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        <GraduationCap className="w-3.5 h-3.5 text-[#737871] shrink-0" />
                        <span className="text-[11px] text-[#737871]">Subjects:</span>
                        {faculty.subjectsTaught.map((sub, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF9F5] dark:bg-neutral-800 border border-[#E5E3DC] dark:border-neutral-700 font-medium text-[#171916] dark:text-neutral-300"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Row: Mandatory 3: Contact Number & Copy/Call Actions */}
                <div className="pt-3 border-t border-[#E5E3DC] dark:border-neutral-800 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#737871] dark:text-neutral-400">
                      Contact Number
                    </span>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#F97316]" />
                      {hasPhone ? (
                        <span className="text-xs sm:text-sm font-mono font-bold text-[#171916] dark:text-neutral-100">
                          {faculty.contactNumber}
                        </span>
                      ) : (
                        <span className="text-xs italic text-[#737871] dark:text-neutral-500">
                          Demo contact (Not provided)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions: Copy Number & Optional Call */}
                  <div className="flex items-center gap-2 shrink-0">
                    {hasPhone ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleCopyNumber(faculty)}
                          className="px-3 py-1.5 rounded-xl bg-[#FAF9F5] hover:bg-[#F2EFE9] dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-[#E5E3DC] dark:border-neutral-700 text-[#171916] dark:text-neutral-100 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                          title="Copy contact number"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700 dark:text-emerald-400 font-bold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Number</span>
                            </>
                          )}
                        </button>

                        <a
                          href={`tel:${faculty.contactNumber?.replace(/\s+/g, '')}`}
                          className="p-2 rounded-xl bg-orange-100 hover:bg-orange-200 dark:bg-orange-950 dark:hover:bg-orange-900 text-[#F97316] text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                          title={`Call ${faculty.name}`}
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </>
                    ) : (
                      <span className="text-[11px] text-[#737871] bg-[#FAF9F5] dark:bg-neutral-800 px-2.5 py-1 rounded-xl border border-[#E5E3DC] dark:border-neutral-700">
                        No phone listed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty Filter State */
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-neutral-900 border border-[#E5E3DC] dark:border-neutral-800 shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-950 text-[#F97316] flex items-center justify-center font-black text-xl mx-auto shadow-xs">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-[#171916] dark:text-neutral-100">
              No Faculty Profiles Match
            </h3>
            <p className="text-xs text-[#737871] dark:text-neutral-400 max-w-sm mx-auto">
              We couldn't find any profiles in {currentDeptInfo.name} matching your search or availability filter.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setAvailabilityFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            Reset Search & Filters
          </button>
        </div>
      )}

      {/* 5. DISCLAIMER & UPGRADE FOOTNOTE */}
      <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 leading-relaxed">
          <span className="font-bold">Fictional Demo Directory Policy:</span>{' '}
          All faculty records, availability windows, and phone numbers shown above are fictional placeholders configured for prototyping the CampusConnect directory interface. No real personal phone numbers or unverified identities are published. When integrated with VESIT ERP or Firestore, verified contact records will automatically populate.
        </div>
      </div>
    </div>
  );
};
