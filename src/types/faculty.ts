export type FacultyAvailability =
  | 'available'
  | 'busy'
  | 'in_class'
  | 'unavailable'
  | 'office_hours';

export type FacultyDepartmentId = 'AIDS' | 'CE' | 'IT';

export interface DepartmentInfo {
  id: FacultyDepartmentId;
  name: string; // Exact: "CoLegion [AIDS]", "CODE CELL ++ [CE]", "QuestIT [IT]"
  fullName: string;
  shortName: string;
  description: string;
  accentColor: string;
  badgeTag: string;
}

export interface FacultyMember {
  id: string;
  name: string;
  department: FacultyDepartmentId;
  designation: string;
  contactNumber: string | null;
  availability: FacultyAvailability;
  availabilityDetails?: string;
  officeLocation?: string;
  avatarUrl?: string;
  email?: string;
  subjectsTaught?: string[];
  isDemo: boolean;
  lastUpdated?: string;
}

export const DEPARTMENTS: Record<FacultyDepartmentId, DepartmentInfo> = {
  AIDS: {
    id: 'AIDS',
    name: 'CoLegion [AIDS]',
    fullName: 'Artificial Intelligence and Data Science',
    shortName: 'AIDS',
    description: 'Specializing in Machine Learning, Deep Neural Networks, Big Data Analytics & NLP',
    accentColor: '#8B5CF6',
    badgeTag: 'CoLegion',
  },
  CE: {
    id: 'CE',
    name: 'CODE CELL ++ [CE]',
    fullName: 'Computer Engineering',
    shortName: 'CE',
    description: 'Foundations of Algorithms, Distributed Computing, Systems Programming & Software Eng.',
    accentColor: '#F97316',
    badgeTag: 'CODE CELL ++',
  },
  IT: {
    id: 'IT',
    name: 'QuestIT [IT]',
    fullName: 'Information Technology',
    shortName: 'IT',
    description: 'Cloud Infrastructure, Cybersecurity, Enterprise Networks & Modern Web Platforms',
    accentColor: '#0EA5E9',
    badgeTag: 'QuestIT',
  },
};
