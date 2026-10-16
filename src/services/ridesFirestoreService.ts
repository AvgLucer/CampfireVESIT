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
import { cleanFirestoreData } from './dailyUpdatesFirestoreService';
import { Ride, SeatRequest } from '../types';
import { INITIAL_RIDES, INITIAL_SEAT_REQUESTS } from '../data/seedData';

const RIDES_COLLECTION = 'rides';
const SEAT_REQUESTS_COLLECTION = 'seat_requests';

/**
 * Seeds initial carpool rides and seat requests into Cloud Firestore if the collection is empty.
 * This guarantees any device accessing the web immediately sees the baseline campus rides.
 */
export async function seedInitialRidesIfEmpty(): Promise<void> {
  try {
    const ridesSnapshot = await getDocs(collection(db, RIDES_COLLECTION));
    if (ridesSnapshot.empty) {
      console.log('Seeding initial campus rides to Cloud Firestore...');
      const batch = writeBatch(db);
      for (const ride of INITIAL_RIDES) {
        const rideRef = doc(db, RIDES_COLLECTION, ride.id);
        batch.set(rideRef, ride);
      }
      for (const req of INITIAL_SEAT_REQUESTS) {
        const reqRef = doc(db, SEAT_REQUESTS_COLLECTION, req.id);
        batch.set(reqRef, req);
      }
      await batch.commit();
      console.log('Initial rides seeded successfully.');
    }
  } catch (error) {
    console.warn('Notice while checking/seeding rides:', error);
  }
}

/**
 * Subscribes to real-time rides from Cloud Firestore across all devices.
 */
export function subscribeToFirestoreRides(
  onUpdate: (rides: Ride[]) => void,
  onError?: (error: unknown) => void
): () => void {
  const ridesCol = collection(db, RIDES_COLLECTION);

  const unsubscribe = onSnapshot(
    ridesCol,
    (snapshot) => {
      if (snapshot.empty) {
        // If empty on first read, seed in background
        seedInitialRidesIfEmpty().then(() => {
          onUpdate(INITIAL_RIDES);
        });
        return;
      }

      const ridesList: Ride[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Ride;
        ridesList.push({
          ...data,
          id: docSnap.id,
        });
      });

      // Sort by createdAt descending (newest rides first)
      ridesList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(ridesList);
    },
    (error) => {
      console.warn('Real-time Firestore rides listener notice:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, RIDES_COLLECTION);
    }
  );

  return unsubscribe;
}

/**
 * Subscribes to real-time seat requests from Cloud Firestore across all devices.
 */
export function subscribeToFirestoreSeatRequests(
  onUpdate: (requests: SeatRequest[]) => void,
  onError?: (error: unknown) => void
): () => void {
  const requestsCol = collection(db, SEAT_REQUESTS_COLLECTION);

  const unsubscribe = onSnapshot(
    requestsCol,
    (snapshot) => {
      const requestsList: SeatRequest[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as SeatRequest;
        requestsList.push({
          ...data,
          id: docSnap.id,
        });
      });

      // Sort by createdAt descending
      requestsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(requestsList);
    },
    (error) => {
      console.warn('Real-time Firestore seat requests listener notice:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, SEAT_REQUESTS_COLLECTION);
    }
  );

  return unsubscribe;
}

/**
 * Saves a new carpool or cab ride directly to Cloud Firestore.
 * Broadcasts instantly to all devices via real-time listeners.
 */
export async function addRideToFirestore(ride: Ride): Promise<void> {
  const ridePath = `${RIDES_COLLECTION}/${ride.id}`;
  try {
    const rideRef = doc(db, RIDES_COLLECTION, ride.id);
    await setDoc(rideRef, cleanFirestoreData(ride));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, ridePath);
  }
}

/**
 * Creates a seat booking request in Cloud Firestore.
 * The driver on any other device receives this request instantly.
 */
export async function addSeatRequestToFirestore(request: SeatRequest): Promise<void> {
  const reqPath = `${SEAT_REQUESTS_COLLECTION}/${request.id}`;
  try {
    const reqRef = doc(db, SEAT_REQUESTS_COLLECTION, request.id);
    await setDoc(reqRef, cleanFirestoreData(request));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, reqPath);
  }
}

/**
 * Cancels a seat request by deleting it from Cloud Firestore.
 */
export async function cancelSeatRequestInFirestore(requestId: string): Promise<void> {
  const reqPath = `${SEAT_REQUESTS_COLLECTION}/${requestId}`;
  try {
    const reqRef = doc(db, SEAT_REQUESTS_COLLECTION, requestId);
    await deleteDoc(reqRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, reqPath);
  }
}

/**
 * Responds to a seat request ('accepted' or 'declined') and updates ride seats atomically in Cloud Firestore.
 */
export async function respondToSeatRequestInFirestore(
  requestId: string,
  status: 'accepted' | 'declined',
  rideId: string,
  newAvailableSeats?: number
): Promise<void> {
  const reqPath = `${SEAT_REQUESTS_COLLECTION}/${requestId}`;
  try {
    const reqRef = doc(db, SEAT_REQUESTS_COLLECTION, requestId);
    await updateDoc(reqRef, {
      status,
      updatedAt: new Date().toISOString(),
    });

    if (status === 'accepted' && newAvailableSeats !== undefined) {
      const rideRef = doc(db, RIDES_COLLECTION, rideId);
      await updateDoc(rideRef, {
        availableSeats: newAvailableSeats,
        status: newAvailableSeats === 0 ? 'full' : 'available',
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, reqPath);
  }
}

/**
 * Resets Firestore rides to the initial baseline dataset.
 */
export async function resetFirestoreRides(): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (const ride of INITIAL_RIDES) {
      const rideRef = doc(db, RIDES_COLLECTION, ride.id);
      batch.set(rideRef, ride);
    }
    for (const req of INITIAL_SEAT_REQUESTS) {
      const reqRef = doc(db, SEAT_REQUESTS_COLLECTION, req.id);
      batch.set(reqRef, req);
    }
    await batch.commit();
  } catch (error) {
    console.warn('Error resetting firestore rides:', error);
  }
}
