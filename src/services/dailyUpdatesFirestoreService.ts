import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  DailyUpdate,
  UpdateApplication,
  UpdateModerationStatus,
  UpdateApplicationStatus,
  AuditLogEntry,
} from '../types/dailyUpdates';
import {
  INITIAL_DAILY_UPDATES,
  INITIAL_UPDATE_APPLICATIONS,
} from '../data/dailyUpdatesSeedData';

const UPDATES_COLLECTION = 'daily_updates';
const APPLICATIONS_COLLECTION = 'update_applications';
const LOCAL_STORAGE_UPDATES_KEY = 'campfire_v2_daily_updates';
const LOCAL_STORAGE_APPLICATIONS_KEY = 'campfire_v2_update_applications';

function getLocalUpdates(): DailyUpdate[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_UPDATES_KEY);
    return raw ? JSON.parse(raw) : INITIAL_DAILY_UPDATES;
  } catch {
    return INITIAL_DAILY_UPDATES;
  }
}

function saveLocalUpdates(updates: DailyUpdate[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_UPDATES_KEY, JSON.stringify(updates));
  } catch (e) {
    console.warn('Could not save updates to local storage', e);
  }
}

function getLocalApplications(): UpdateApplication[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_APPLICATIONS_KEY);
    return raw ? JSON.parse(raw) : INITIAL_UPDATE_APPLICATIONS;
  } catch {
    return INITIAL_UPDATE_APPLICATIONS;
  }
}

function saveLocalApplications(apps: UpdateApplication[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_APPLICATIONS_KEY, JSON.stringify(apps));
  } catch (e) {
    console.warn('Could not save applications to local storage', e);
  }
}

/**
 * Checks and automatically marks expired updates based on current timestamp
 */
export function checkAndTagExpirations(updates: DailyUpdate[]): {
  processed: DailyUpdate[];
  expiredIds: string[];
} {
  const now = new Date();
  const expiredIds: string[] = [];

  const processed = updates.map((u) => {
    const exp = new Date(u.expiresAt);
    if (exp <= now && u.status === 'approved') {
      expiredIds.push(u.id);
      return {
        ...u,
        status: 'expired' as UpdateModerationStatus,
      };
    }
    return u;
  });

  return { processed, expiredIds };
}

/**
 * Seeds initial daily updates into Cloud Firestore if the collection is empty.
 */
export async function seedInitialDailyUpdatesIfEmpty(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, UPDATES_COLLECTION));
    if (snap.empty) {
      console.log('Seeding initial Daily Updates to Cloud Firestore...');
      const batch = writeBatch(db);
      for (const update of INITIAL_DAILY_UPDATES) {
        const updateRef = doc(db, UPDATES_COLLECTION, update.id);
        batch.set(updateRef, update);
      }
      for (const app of INITIAL_UPDATE_APPLICATIONS) {
        const appRef = doc(db, APPLICATIONS_COLLECTION, app.id);
        batch.set(appRef, app);
      }
      await batch.commit();
      console.log('Daily Updates seeded successfully to Firestore.');
    }
  } catch (error) {
    console.warn('Notice while checking/seeding daily updates:', error);
  }
}

/**
 * Subscribes to real-time daily updates from Cloud Firestore with local cache fallback.
 */
export function subscribeToFirestoreDailyUpdates(
  onUpdate: (updates: DailyUpdate[]) => void,
  onError?: (error: unknown) => void
): () => void {
  const colRef = collection(db, UPDATES_COLLECTION);

  const unsubscribe = onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        seedInitialDailyUpdatesIfEmpty().then(() => {
          onUpdate(INITIAL_DAILY_UPDATES);
          saveLocalUpdates(INITIAL_DAILY_UPDATES);
        });
        return;
      }

      const updates: DailyUpdate[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as DailyUpdate;
        updates.push({
          ...data,
          id: docSnap.id,
        });
      });

      const { processed, expiredIds } = checkAndTagExpirations(updates);

      // Async write back expired status if any transitioned
      if (expiredIds.length > 0) {
        expiredIds.forEach((id) => {
          updateDoc(doc(db, UPDATES_COLLECTION, id), { status: 'expired' }).catch(
            () => {}
          );
        });
      }

      saveLocalUpdates(processed);
      onUpdate(processed);
    },
    (error) => {
      console.warn('Daily updates subscription fell back to local cache:', error);
      const cached = getLocalUpdates();
      const { processed } = checkAndTagExpirations(cached);
      onUpdate(processed);
      if (onError) onError(error);
    }
  );

  return unsubscribe;
}

/**
 * Subscribes to real-time applications from Cloud Firestore.
 */
export function subscribeToFirestoreApplications(
  onUpdate: (applications: UpdateApplication[]) => void,
  onError?: (error: unknown) => void
): () => void {
  const colRef = collection(db, APPLICATIONS_COLLECTION);

  const unsubscribe = onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate(INITIAL_UPDATE_APPLICATIONS);
        saveLocalApplications(INITIAL_UPDATE_APPLICATIONS);
        return;
      }

      const apps: UpdateApplication[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as UpdateApplication;
        apps.push({
          ...data,
          id: docSnap.id,
        });
      });

      saveLocalApplications(apps);
      onUpdate(apps);
    },
    (error) => {
      console.warn('Applications subscription fell back to local cache:', error);
      onUpdate(getLocalApplications());
      if (onError) onError(error);
    }
  );

  return unsubscribe;
}

/**
 * Recursively strips keys with undefined values so that Firestore's setDoc/updateDoc
 * does not throw "Unsupported field value: undefined".
 */
export function cleanFirestoreData<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => cleanFirestoreData(item)) as unknown as T;
  }
  if (typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, val] of Object.entries(obj)) {
      if (val !== undefined) {
        cleaned[key] = cleanFirestoreData(val);
      }
    }
    return cleaned as T;
  }
  return obj;
}

/**
 * Create or save draft Daily Update
 */
export async function saveDailyUpdateToFirestore(
  update: DailyUpdate
): Promise<void> {
  const sanitized = cleanFirestoreData(update);
  try {
    const docRef = doc(db, UPDATES_COLLECTION, update.id);
    await setDoc(docRef, sanitized, { merge: true });

    // Update local cache
    const current = getLocalUpdates().filter((u) => u.id !== update.id);
    saveLocalUpdates([update, ...current]);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `daily_updates/${update.id}`);
    const current = getLocalUpdates().filter((u) => u.id !== update.id);
    saveLocalUpdates([update, ...current]);
  }
}

/**
 * Withdraw an update
 */
export async function withdrawDailyUpdateInFirestore(
  updateId: string,
  actor: { id: string; name: string; role: string }
): Promise<void> {
  const auditEntry: AuditLogEntry = {
    id: `aud_${Date.now()}`,
    action: 'withdrawn',
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    timestamp: new Date().toISOString(),
    feedback: 'Announcement withdrawn by host.',
  };

  try {
    const docRef = doc(db, UPDATES_COLLECTION, updateId);
    await updateDoc(docRef, {
      status: 'withdrawn',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `daily_updates/${updateId}`);
    const current = getLocalUpdates().map((u) =>
      u.id === updateId ? { ...u, status: 'withdrawn' as const, auditLog: [...(u.auditLog || []), auditEntry] } : u
    );
    saveLocalUpdates(current);
  }
}

/**
 * Admin Moderation Action (Approve, Decline, Request Changes, Expire)
 */
export async function moderateDailyUpdateInFirestore(
  updateId: string,
  action: 'approved' | 'declined' | 'changes_requested' | 'expired',
  feedback: string | undefined,
  admin: { id: string; name: string; role: string }
): Promise<void> {
  const now = new Date().toISOString();
  const auditEntry: AuditLogEntry = {
    id: `aud_${Date.now()}`,
    action,
    actorId: admin.id,
    actorName: admin.name,
    actorRole: admin.role,
    timestamp: now,
    feedback,
  };

  const patch: Partial<DailyUpdate> = {
    status: action,
    moderationFeedback: feedback || '',
    moderatedBy: admin.id,
    moderatedAt: now,
    updatedAt: now,
    ...(action === 'approved' ? { publishedAt: now } : {}),
  };

  try {
    const docRef = doc(db, UPDATES_COLLECTION, updateId);
    await updateDoc(docRef, patch);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `daily_updates/${updateId}`);
    const current = getLocalUpdates().map((u) => {
      if (u.id === updateId) {
        return {
          ...u,
          ...patch,
          auditLog: [...(u.auditLog || []), auditEntry],
        };
      }
      return u;
    });
    saveLocalUpdates(current);
  }
}

/**
 * Submit an application to a Daily Update
 */
export async function submitApplicationToFirestore(
  application: UpdateApplication
): Promise<void> {
  const sanitized = cleanFirestoreData(application);
  try {
    const docRef = doc(db, APPLICATIONS_COLLECTION, application.id);
    await setDoc(docRef, sanitized);

    const current = getLocalApplications().filter((a) => a.id !== application.id);
    saveLocalApplications([application, ...current]);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `update_applications/${application.id}`);
    const current = getLocalApplications().filter((a) => a.id !== application.id);
    saveLocalApplications([application, ...current]);
  }
}

/**
 * Host Review Application (Accept, Decline, Request Changes)
 */
export async function reviewApplicationInFirestore(
  applicationId: string,
  status: UpdateApplicationStatus,
  hostFeedback?: string
): Promise<void> {
  const patch = cleanFirestoreData({
    status,
    hostFeedback: hostFeedback || '',
    reviewedAt: new Date().toISOString(),
  });

  try {
    const docRef = doc(db, APPLICATIONS_COLLECTION, applicationId);
    await updateDoc(docRef, patch);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `update_applications/${applicationId}`);
    const current = getLocalApplications().map((a) =>
      a.id === applicationId ? { ...a, ...patch } : a
    );
    saveLocalApplications(current);
  }
}
