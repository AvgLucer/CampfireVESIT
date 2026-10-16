import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Lecture } from '../types';

const LECTURES_COLLECTION = 'lectures';

function getLocalStorageKey(studentId: string): string {
  return `campfire_timetable_${studentId}`;
}

export function loadLocalTimetable(studentId: string): Lecture[] | null {
  try {
    const raw = localStorage.getItem(getLocalStorageKey(studentId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading timetable from localStorage:', err);
  }
  return null;
}

export function saveLocalTimetable(studentId: string, lectures: Lecture[]): void {
  try {
    localStorage.setItem(getLocalStorageKey(studentId), JSON.stringify(lectures));
  } catch (err) {
    console.warn('Error saving timetable to localStorage:', err);
  }
}

/**
 * Strips undefined properties so Firestore doesn't reject document writes.
 */
function sanitizeLectureForFirestore(lecture: Lecture): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(lecture)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Seeds initial baseline timetable into Cloud Firestore if the student's timetable is empty.
 */
export async function seedInitialLecturesIfEmpty(
  studentId: string,
  initialLectures: Lecture[]
): Promise<void> {
  if (!studentId || !initialLectures || initialLectures.length === 0) return;

  try {
    const q = query(
      collection(db, LECTURES_COLLECTION),
      where('studentId', '==', studentId)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log(`Seeding initial timetable for student ${studentId} into Cloud Firestore...`);
      const batch = writeBatch(db);
      for (const lec of initialLectures) {
        const docRef = doc(db, LECTURES_COLLECTION, lec.id);
        batch.set(docRef, sanitizeLectureForFirestore(lec));
      }
      await batch.commit();
      console.log(`Initial timetable seeded successfully for ${studentId}.`);
    }
  } catch (error) {
    console.warn('Notice while checking/seeding student timetable:', error);
  }
}

/**
 * Subscribes to real-time timetable changes for a specific student from Cloud Firestore.
 */
export function subscribeToFirestoreLectures(
  studentId: string,
  onUpdate: (lectures: Lecture[]) => void,
  onError?: (error: unknown) => void
): () => void {
  const q = query(
    collection(db, LECTURES_COLLECTION),
    where('studentId', '==', studentId)
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const items: Lecture[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as Lecture;
        items.push({
          ...data,
          id: d.id,
          // Guarantee backward compatibility fields
          subject: data.subject || data.subjectName || 'Lecture',
          subjectName: data.subjectName || data.subject || 'Lecture',
          faculty: data.faculty || data.facultyName || '',
          facultyName: data.facultyName || data.faculty || '',
          room: data.room || data.classroom || '',
          classroom: data.classroom || data.room || '',
          day: data.day || (data.dayOfWeek ? (data.dayOfWeek.toLowerCase() as any) : 'monday'),
          dayOfWeek: data.dayOfWeek || (data.day ? data.day.charAt(0).toUpperCase() + data.day.slice(1) : 'Monday'),
        });
      });

      // Update LocalStorage cache for fast load & offline access
      if (items.length > 0) {
        saveLocalTimetable(studentId, items);
      }
      onUpdate(items);
    },
    (error) => {
      console.warn('Firestore timetable real-time notice:', error);
      if (onError) onError(error);
    }
  );

  return unsubscribe;
}

/**
 * Saves or updates a single lecture in Cloud Firestore.
 */
export async function saveLectureToFirestore(lecture: Lecture): Promise<void> {
  const path = `${LECTURES_COLLECTION}/${lecture.id}`;
  try {
    const lectureRef = doc(db, LECTURES_COLLECTION, lecture.id);
    await setDoc(lectureRef, sanitizeLectureForFirestore(lecture), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Deletes a lecture from Cloud Firestore.
 */
export async function deleteLectureInFirestore(lectureId: string): Promise<void> {
  const path = `${LECTURES_COLLECTION}/${lectureId}`;
  try {
    const lectureRef = doc(db, LECTURES_COLLECTION, lectureId);
    await deleteDoc(lectureRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
