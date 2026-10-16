import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { PeerLearningRoom, WhiteboardStroke } from '../types/peerLearning';
import { cleanFirestoreData } from './dailyUpdatesFirestoreService';

const ROOMS_COLLECTION = 'peer_learning_rooms';
const PIN_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Unambiguous characters

export function generateRoomPin(): string {
  let pin = '';
  for (let i = 0; i < 6; i++) {
    pin += PIN_CHARS.charAt(Math.floor(Math.random() * PIN_CHARS.length));
  }
  return pin;
}

/**
 * Creates a new 1-on-1 collaborative study room in Firebase Firestore.
 */
export async function createPeerLearningRoom(params: {
  hostId: string;
  hostName: string;
  hostUsername: string;
  hostAvatarUrl?: string;
  title: string;
  subjectCode: string;
}): Promise<PeerLearningRoom> {
  const pin = generateRoomPin();
  const roomId = `room_${pin.toLowerCase()}_${Date.now()}`;
  const now = new Date().toISOString();

  const room: PeerLearningRoom = {
    id: roomId,
    pin,
    title: params.title.trim() || 'Collaborative Whiteboard Session',
    subjectCode: params.subjectCode.trim() || 'FEC201',
    hostId: params.hostId,
    hostName: params.hostName,
    hostUsername: params.hostUsername,
    hostAvatarUrl: params.hostAvatarUrl || null,
    joinerId: null,
    joinerName: null,
    joinerUsername: null,
    joinerAvatarUrl: null,
    status: 'waiting',
    createdAt: now,
    updatedAt: now,
    lastActivityAt: now,
    endedAt: null,
    clearedAt: null,
  };

  const sanitized = cleanFirestoreData(room);
  try {
    const docRef = doc(db, ROOMS_COLLECTION, roomId);
    await setDoc(docRef, sanitized);
    return room;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${ROOMS_COLLECTION}/${roomId}`);
    return room;
  }
}

/**
 * Searches for an active or waiting room matching the given 6-character PIN.
 */
export async function findRoomByPin(rawPin: string): Promise<PeerLearningRoom | null> {
  const normalized = rawPin.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (normalized.length !== 6) return null;

  try {
    const colRef = collection(db, ROOMS_COLLECTION);
    const q = query(colRef, where('pin', '==', normalized));
    const querySnap = await getDocs(q);

    if (querySnap.empty) return null;

    // Find the newest room that is not ended
    let foundRoom: PeerLearningRoom | null = null;
    querySnap.forEach((docSnap) => {
      const data = docSnap.data() as PeerLearningRoom;
      if (data.status !== 'ended') {
        foundRoom = { ...data, id: docSnap.id };
      }
    });

    return foundRoom;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${ROOMS_COLLECTION}/query_pin_${normalized}`);
    return null;
  }
}

/**
 * Join an existing 1-on-1 room with capacity checks.
 */
export async function joinPeerLearningRoom(
  roomId: string,
  user: { userId: string; name: string; username: string; avatarUrl?: string }
): Promise<{ success: boolean; message: string; room?: PeerLearningRoom }> {
  try {
    const docRef = doc(db, ROOMS_COLLECTION, roomId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, message: 'Room not found or session has expired.' };
    }

    const room = docSnap.data() as PeerLearningRoom;

    if (room.status === 'ended') {
      return { success: false, message: 'This study room has ended and is no longer active.' };
    }

    if (room.hostId === user.userId) {
      return { success: false, message: 'You are the host of this room. Reconnect using the host interface.' };
    }

    if (room.joinerId && room.joinerId !== user.userId) {
      return { success: false, message: 'Room capacity reached (Strictly 1-on-1: Maximum 2 participants allowed).' };
    }

    const now = new Date().toISOString();
    const patch = {
      joinerId: user.userId,
      joinerName: user.name,
      joinerUsername: user.username,
      joinerAvatarUrl: user.avatarUrl || null,
      status: 'active' as const,
      updatedAt: now,
      lastActivityAt: now,
    };

    await updateDoc(docRef, cleanFirestoreData(patch));

    return {
      success: true,
      message: `Joined room hosted by ${room.hostName}!`,
      room: { ...room, ...patch },
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ROOMS_COLLECTION}/${roomId}`);
    return { success: false, message: 'Failed to join room due to connection error.' };
  }
}

/**
 * Real-time listener for room document updates.
 */
export function subscribeToRoom(
  roomId: string,
  onUpdate: (room: PeerLearningRoom | null) => void,
  onError?: (err: unknown) => void
): () => void {
  const docRef = doc(db, ROOMS_COLLECTION, roomId);

  return onSnapshot(
    docRef,
    (snap) => {
      if (!snap.exists()) {
        // Document deleted / shredded!
        onUpdate(null);
      } else {
        const data = snap.data() as PeerLearningRoom;
        onUpdate({ ...data, id: snap.id });
      }
    },
    (error) => {
      console.warn(`Room subscription notice for ${roomId}:`, error);
      if (onError) onError(error);
    }
  );
}

/**
 * Real-time listener for whiteboard drawing strokes.
 */
export function subscribeToWhiteboardStrokes(
  roomId: string,
  onUpdate: (strokes: WhiteboardStroke[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const colRef = collection(db, ROOMS_COLLECTION, roomId, 'strokes');

  return onSnapshot(
    colRef,
    (snap) => {
      const strokes: WhiteboardStroke[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data() as WhiteboardStroke;
        strokes.push({ ...data, id: docSnap.id });
      });

      // Sort by creation time
      strokes.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      onUpdate(strokes);
    },
    (error) => {
      console.warn(`Strokes subscription notice for ${roomId}:`, error);
      if (onError) onError(error);
    }
  );
}

/**
 * Saves a completed drawing stroke to Firestore.
 */
export async function addWhiteboardStroke(
  roomId: string,
  stroke: WhiteboardStroke
): Promise<void> {
  const sanitized = cleanFirestoreData(stroke);
  try {
    const strokeDocRef = doc(db, ROOMS_COLLECTION, roomId, 'strokes', stroke.id);
    await setDoc(strokeDocRef, sanitized);

    // Update room last activity
    const roomDocRef = doc(db, ROOMS_COLLECTION, roomId);
    await updateDoc(roomDocRef, {
      lastActivityAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${ROOMS_COLLECTION}/${roomId}/strokes/${stroke.id}`);
  }
}

/**
 * Undo last active stroke in room.
 */
export async function undoLastStroke(
  roomId: string,
  strokes: WhiteboardStroke[],
  userId: string
): Promise<void> {
  const activeStrokes = strokes.filter((s) => !s.isUndone);
  if (activeStrokes.length === 0) return;

  // Prefer undoing the user's own stroke, or last stroke
  const strokeToUndo = [...activeStrokes].reverse().find((s) => s.userId === userId) || activeStrokes[activeStrokes.length - 1];
  if (!strokeToUndo) return;

  try {
    const docRef = doc(db, ROOMS_COLLECTION, roomId, 'strokes', strokeToUndo.id);
    await updateDoc(docRef, { isUndone: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ROOMS_COLLECTION}/${roomId}/strokes/${strokeToUndo.id}`);
  }
}

/**
 * Redo last undone stroke in room.
 */
export async function redoLastStroke(
  roomId: string,
  strokes: WhiteboardStroke[],
  userId: string
): Promise<void> {
  const undoneStrokes = strokes.filter((s) => s.isUndone);
  if (undoneStrokes.length === 0) return;

  // Prefer redoing user's own stroke or last undone
  const strokeToRedo = [...undoneStrokes].reverse().find((s) => s.userId === userId) || undoneStrokes[undoneStrokes.length - 1];
  if (!strokeToRedo) return;

  try {
    const docRef = doc(db, ROOMS_COLLECTION, roomId, 'strokes', strokeToRedo.id);
    await updateDoc(docRef, { isUndone: false });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ROOMS_COLLECTION}/${roomId}/strokes/${strokeToRedo.id}`);
  }
}

/**
 * Clears the shared whiteboard board.
 */
export async function clearWhiteboard(roomId: string): Promise<void> {
  try {
    const colRef = collection(db, ROOMS_COLLECTION, roomId, 'strokes');
    const snapshot = await getDocs(colRef);

    const batch = writeBatch(db);
    snapshot.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    batch.update(roomRef, {
      clearedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
    });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${ROOMS_COLLECTION}/${roomId}/clear`);
  }
}

/**
 * Handles participant leaving the room.
 */
export async function leavePeerLearningRoom(
  roomId: string,
  userId: string,
  isHost: boolean
): Promise<void> {
  try {
    const docRef = doc(db, ROOMS_COLLECTION, roomId);
    if (isHost) {
      await updateDoc(docRef, {
        status: 'ended',
        endedAt: new Date().toISOString(),
      });
    } else {
      await updateDoc(docRef, {
        joinerId: null,
        joinerName: null,
        joinerUsername: null,
        joinerAvatarUrl: null,
        status: 'waiting',
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ROOMS_COLLECTION}/${roomId}/leave`);
  }
}

/**
 * Shreds and permanently deletes the room and all whiteboard strokes from Firebase.
 * Per specification: "as soon as the meeting is over, host can shred the meeting delete it
 * totally like it should be connection based and disappear after it peer to peer".
 */
export async function shredAndEndRoom(roomId: string): Promise<void> {
  try {
    // 1. Delete all stroke documents in subcollection
    const strokesColRef = collection(db, ROOMS_COLLECTION, roomId, 'strokes');
    const strokesSnap = await getDocs(strokesColRef);

    const batch = writeBatch(db);
    strokesSnap.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    // 2. Delete the room document
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    batch.delete(roomRef);

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${ROOMS_COLLECTION}/${roomId}`);
  }
}
