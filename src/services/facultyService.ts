import { FacultyMember, FacultyDepartmentId, FacultyAvailability, DEPARTMENTS } from '../types/faculty';
import { INITIAL_FACULTY_MEMBERS } from '../data/facultySeedData';

const LOCAL_STORAGE_KEY = 'campusconnect_faculty_v1';

/**
 * Service layer boundary for the Faculty Info Directory.
 * Ready for Firestore integration while supporting resilient local demo fallback.
 */
export class FacultyService {
  /**
   * Retrieves all faculty records.
   */
  static getAllFaculty(): FacultyMember[] {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Could not read faculty from localStorage, using initial dataset:', err);
    }
    return INITIAL_FACULTY_MEMBERS;
  }

  /**
   * Retrieves faculty for a specific department.
   */
  static getFacultyByDepartment(departmentId: FacultyDepartmentId): FacultyMember[] {
    const all = this.getAllFaculty();
    return all.filter((member) => member.department === departmentId);
  }

  /**
   * Counts faculty per department.
   */
  static getDepartmentCounts(): Record<FacultyDepartmentId, number> {
    const all = this.getAllFaculty();
    return {
      AIDS: all.filter((m) => m.department === 'AIDS').length,
      CE: all.filter((m) => m.department === 'CE').length,
      IT: all.filter((m) => m.department === 'IT').length,
    };
  }

  /**
   * Allows simulated or admin updates to a faculty member's availability status.
   */
  static updateAvailability(
    facultyId: string,
    availability: FacultyAvailability,
    availabilityDetails?: string
  ): FacultyMember | null {
    const all = this.getAllFaculty();
    const index = all.findIndex((m) => m.id === facultyId);
    if (index === -1) return null;

    const updated: FacultyMember = {
      ...all[index],
      availability,
      availabilityDetails: availabilityDetails ?? all[index].availabilityDetails,
      lastUpdated: 'Just now (Updated)',
    };

    all[index] = updated;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(all));
    } catch (err) {
      console.warn('Could not persist updated faculty to localStorage:', err);
    }

    return updated;
  }

  /**
   * Resets directory to initial seed data.
   */
  static resetToDefault(): void {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }
}
