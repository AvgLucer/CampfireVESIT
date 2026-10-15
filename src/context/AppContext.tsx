import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  UserProfile,
  Subject,
  Lecture,
  Ride,
  SeatRequest,
  Challenge,
  ChallengeParticipation,
  LeaderboardEntry,
  CampusLocation,
  CampusEvent,
  EventRegistration,
  LearningSession,
  CreditTransaction,
  NotificationItem,
  GradingScaleItem,
  VerificationStatus,
} from '../types';
import {
  INITIAL_USER,
  INITIAL_SUBJECTS,
  INITIAL_LECTURES,
  INITIAL_RIDES,
  INITIAL_SEAT_REQUESTS,
  INITIAL_CHALLENGES,
  INITIAL_PARTICIPATIONS,
  INITIAL_LEADERBOARD,
  INITIAL_CAMPUS_LOCATIONS,
  INITIAL_EVENTS,
  INITIAL_REGISTRATIONS,
  INITIAL_LEARNING_SESSIONS,
  INITIAL_TRANSACTIONS,
  INITIAL_NOTIFICATIONS,
  DEFAULT_GRADING_SCALE,
  PRESET_PROFILES,
} from '../data/seedData';
import { MiniMothAdapter } from '../services/authAdapter';
import { testFirestoreConnection } from '../services/firebase';
import {
  seedInitialRidesIfEmpty,
  subscribeToFirestoreRides,
  subscribeToFirestoreSeatRequests,
  addRideToFirestore,
  addSeatRequestToFirestore,
  cancelSeatRequestInFirestore,
  respondToSeatRequestInFirestore,
  resetFirestoreRides,
} from '../services/ridesFirestoreService';

interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  subjects: Subject[];
  lectures: Lecture[];
  rides: Ride[];
  seatRequests: SeatRequest[];
  challenges: Challenge[];
  participations: ChallengeParticipation[];
  leaderboard: LeaderboardEntry[];
  locations: CampusLocation[];
  events: CampusEvent[];
  registrations: EventRegistration[];
  learningSessions: LearningSession[];
  creditTransactions: CreditTransaction[];
  notifications: NotificationItem[];
  gradingScale: GradingScaleItem[];
  isFirebaseActive: boolean;
  isAuthModalOpen: boolean;
  isProfileSwitcherOpen: boolean;
  isStatusModalOpen: boolean;
  activeLocationFocus: CampusLocation | null;
  toasts: ToastState[];

  allProfiles: UserProfile[];
  presetProfiles: UserProfile[];

  // Actions
  openAuthModal: () => void;
  closeAuthModal: () => void;
  openProfileSwitcher: () => void;
  closeProfileSwitcher: () => void;
  openStatusModal: () => void;
  closeStatusModal: () => void;
  loginDemoUser: () => void;
  switchProfile: (profile: UserProfile) => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateDisplayName: (name: string) => void;
  updateStatusMessage: (message: string) => void;
  setVerificationStatus: (status: VerificationStatus) => void;
  focusLocationOnMap: (locationId: string) => void;
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  dismissToast: (id: string) => void;

  // Academics
  addSubject: (subject: Omit<Subject, 'id' | 'userId'>) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  // Rides
  createRide: (ride: Omit<Ride, 'id' | 'driverId' | 'driverName' | 'driverAvatar' | 'driverVerified' | 'createdAt' | 'status'>) => void;
  requestSeat: (rideId: string, seats?: number) => boolean;
  cancelSeatRequest: (requestId: string) => void;
  respondToSeatRequest: (requestId: string, status: 'accepted' | 'declined') => void;

  // Challenges
  joinChallenge: (challengeId: string) => void;
  completeChallenge: (challengeId: string) => void;

  // Events
  registerForEvent: (eventId: string) => boolean;
  cancelEventRegistration: (eventId: string) => void;

  // Peer Learning
  createLearningSession: (session: Omit<LearningSession, 'id' | 'hostId' | 'hostName' | 'hostVerified' | 'enrolledUserIds' | 'status' | 'createdAt'>) => void;
  joinLearningSession: (sessionId: string) => boolean;
  completeLearningSession: (sessionId: string) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Demo state reset
  resetDemoData: () => void;
}

const STORAGE_KEY_PREFIX = 'campfire_v2_';

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Storage save error for ${key}:`, err);
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const session = MiniMothAdapter.getCurrentSession();
    return session || loadFromStorage<UserProfile>('user', INITIAL_USER);
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const loaded = loadFromStorage<Subject[]>('subjects', INITIAL_SUBJECTS);
    if (!Array.isArray(loaded) || loaded.length === 0 || !loaded[0]?.marks) {
      return INITIAL_SUBJECTS;
    }
    return loaded;
  });
  const [lectures] = useState<Lecture[]>(INITIAL_LECTURES);
  const [rides, setRides] = useState<Ride[]>(() => {
    const loaded = loadFromStorage<Ride[]>('rides', INITIAL_RIDES);
    if (!Array.isArray(loaded) || loaded.length === 0 || loaded.some(r => r.origin.includes('Ghatkopar') || r.origin.includes('Vashi') || r.origin.includes('Dadar') || r.origin.includes('Thane'))) {
      return INITIAL_RIDES;
    }
    return loaded;
  });
  const [seatRequests, setSeatRequests] = useState<SeatRequest[]>(() => {
    const loaded = loadFromStorage<SeatRequest[]>('seatRequests', INITIAL_SEAT_REQUESTS);
    if (!Array.isArray(loaded) || loaded.length <= 2) {
      return INITIAL_SEAT_REQUESTS;
    }
    return loaded;
  });
  const [challenges, setChallenges] = useState<Challenge[]>(() => loadFromStorage('challenges', INITIAL_CHALLENGES));
  const [participations, setParticipations] = useState<ChallengeParticipation[]>(() => loadFromStorage('participations', INITIAL_PARTICIPATIONS));
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => loadFromStorage('leaderboard', INITIAL_LEADERBOARD));
  const [locations] = useState<CampusLocation[]>(INITIAL_CAMPUS_LOCATIONS);
  const [events, setEvents] = useState<CampusEvent[]>(() => loadFromStorage('events', INITIAL_EVENTS));
  const [registrations, setRegistrations] = useState<EventRegistration[]>(() => loadFromStorage('registrations', INITIAL_REGISTRATIONS));
  const [learningSessions, setLearningSessions] = useState<LearningSession[]>(() => loadFromStorage('learningSessions', INITIAL_LEARNING_SESSIONS));
  const [creditTransactions, setCreditTransactions] = useState<CreditTransaction[]>(() => loadFromStorage('transactions', INITIAL_TRANSACTIONS));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => loadFromStorage('notifications', INITIAL_NOTIFICATIONS));
  const [gradingScale] = useState<GradingScaleItem[]>(DEFAULT_GRADING_SCALE);

  const [allProfiles, setAllProfiles] = useState<UserProfile[]>(() => MiniMothAdapter.getAllStoredUsers());
  const [isFirebaseActive, setIsFirebaseActive] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isProfileSwitcherOpen, setIsProfileSwitcherOpen] = useState<boolean>(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);
  const [activeLocationFocus, setActiveLocationFocus] = useState<CampusLocation | null>(null);
  const [toasts, setToasts] = useState<ToastState[]>([]);

  // Check Firebase connectivity on boot and subscribe to real-time rides across all devices
  useEffect(() => {
    testFirestoreConnection().then(active => {
      setIsFirebaseActive(active);
      if (active) {
        seedInitialRidesIfEmpty();
      }
    });

    // Real-time synchronization for rides across any device
    const unsubRides = subscribeToFirestoreRides(
      (firestoreRides) => {
        if (firestoreRides && firestoreRides.length > 0) {
          setRides(firestoreRides);
          setIsFirebaseActive(true);
        }
      },
      (err) => {
        console.warn('Real-time Firestore rides subscription notice:', err);
      }
    );

    // Real-time synchronization for passenger seat requests across any device
    const unsubRequests = subscribeToFirestoreSeatRequests(
      (firestoreRequests) => {
        if (firestoreRequests) {
          setSeatRequests(firestoreRequests);
        }
      },
      (err) => {
        console.warn('Real-time Firestore seat requests subscription notice:', err);
      }
    );

    return () => {
      unsubRides();
      unsubRequests();
    };
  }, []);

  // Save changes to localStorage for demonstration resilience
  useEffect(() => { if (user) saveToStorage('user', user); }, [user]);
  useEffect(() => { saveToStorage('subjects', subjects); }, [subjects]);
  useEffect(() => { saveToStorage('rides', rides); }, [rides]);
  useEffect(() => { saveToStorage('seatRequests', seatRequests); }, [seatRequests]);
  useEffect(() => { saveToStorage('challenges', challenges); }, [challenges]);
  useEffect(() => { saveToStorage('participations', participations); }, [participations]);
  useEffect(() => { saveToStorage('leaderboard', leaderboard); }, [leaderboard]);
  useEffect(() => { saveToStorage('events', events); }, [events]);
  useEffect(() => { saveToStorage('registrations', registrations); }, [registrations]);
  useEffect(() => { saveToStorage('learningSessions', learningSessions); }, [learningSessions]);
  useEffect(() => { saveToStorage('transactions', creditTransactions); }, [creditTransactions]);
  useEffect(() => { saveToStorage('notifications', notifications); }, [notifications]);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAllProfiles(MiniMothAdapter.getAllStoredUsers());
  }, []);

  const openProfileSwitcher = useCallback(() => {
    setAllProfiles(MiniMothAdapter.getAllStoredUsers());
    setIsProfileSwitcherOpen(true);
  }, []);
  const closeProfileSwitcher = useCallback(() => setIsProfileSwitcherOpen(false), []);

  const openStatusModal = useCallback(() => setIsStatusModalOpen(true), []);
  const closeStatusModal = useCallback(() => setIsStatusModalOpen(false), []);

  const loginDemoUser = useCallback(() => {
    setUser(INITIAL_USER);
    MiniMothAdapter.saveSession(INITIAL_USER);
    setAllProfiles(MiniMothAdapter.getAllStoredUsers());
    showToast('Signed in as Aarav Sharma (VESIT FE Computer Engg)', 'success');
  }, [showToast]);

  const logout = useCallback(() => {
    MiniMothAdapter.clearSession();
    setUser(null);
    showToast('Signed out of Campfire session.', 'info');
  }, [showToast]);

  const switchProfile = useCallback((profile: UserProfile) => {
    setUser(profile);
    MiniMothAdapter.saveSession(profile);
    setAllProfiles(MiniMothAdapter.getAllStoredUsers());
    showToast(`Switched profile to ${profile.name} (${profile.username})`, 'success');
  }, [showToast]);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates, updatedAt: new Date().toISOString() };
      MiniMothAdapter.saveSession(updated);
      setAllProfiles(prevList =>
        prevList.map(p => (p.userId === updated.userId ? updated : p))
      );
      return updated;
    });
    showToast('Profile updated successfully', 'success');
  }, [showToast]);

  const updateDisplayName = useCallback((name: string) => {
    updateProfile({ name });
  }, [updateProfile]);

  const updateStatusMessage = useCallback((statusMessage: string) => {
    const trimmed = statusMessage.slice(0, 60);
    updateProfile({ statusMessage: trimmed });
  }, [updateProfile]);

  const setVerificationStatus = useCallback((status: VerificationStatus) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, verificationStatus: status, updatedAt: new Date().toISOString() };
      MiniMothAdapter.saveSession(updated);
      return updated;
    });
    const label = status === 'verified' ? 'Student Verified' : status === 'pending_review' ? 'Verification Pending Review' : 'Phone Verified';
    showToast(`Status updated to: ${label}`, 'info');
  }, [showToast]);

  const focusLocationOnMap = useCallback((locationId: string) => {
    const loc = locations.find(l => l.id === locationId);
    if (loc) {
      setActiveLocationFocus(loc);
    }
  }, [locations]);

  // ACADEMICS ACTIONS
  const addSubject = useCallback((subjectData: Omit<Subject, 'id' | 'userId'>) => {
    const newSubject: Subject = {
      ...subjectData,
      id: `sub_${Date.now()}`,
      userId: user?.userId || 'stu_guest',
    };
    setSubjects(prev => [...prev, newSubject]);
    showToast(`Added ${newSubject.name} (${newSubject.code})`, 'success');
  }, [user, showToast]);

  const updateSubject = useCallback((id: string, updates: Partial<Subject>) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    showToast('Subject updated', 'success');
  }, [showToast]);

  const deleteSubject = useCallback((id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    showToast('Subject deleted', 'info');
  }, [showToast]);

  // RIDES ACTIONS (Cloud Firestore Persisted across all devices)
  const createRide = useCallback((rideData: Omit<Ride, 'id' | 'driverId' | 'driverName' | 'driverAvatar' | 'driverVerified' | 'createdAt' | 'status'>) => {
    if (!user) {
      showToast('Please sign in to publish a carpool', 'warning');
      return;
    }
    const newRide: Ride = {
      ...rideData,
      id: `ride_${Date.now()}`,
      driverId: user.userId,
      driverName: `${user.name} (You)`,
      driverAvatar: user.avatarUrl,
      driverVerified: user.verificationStatus === 'verified',
      status: 'available',
      createdAt: new Date().toISOString(),
    };

    // Immediate optimistic update
    setRides(prev => [newRide, ...prev]);

    // Persist to Cloud Firestore so it syncs instantly to all devices
    addRideToFirestore(newRide).catch(err => {
      console.warn('Notice saving ride to Firestore:', err);
    });

    // Create activity notification
    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: user.userId,
      title: 'Carpool Published',
      message: `Your ride from ${newRide.origin} to ${newRide.destination} is now live across devices with ${newRide.availableSeats} open seats.`,
      type: 'ride',
      link: '/rides',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [notif, ...prev]);

    showToast('Your carpool ride has been published live across all devices!', 'success');
  }, [user, showToast]);

  const requestSeat = useCallback((rideId: string, seats: number = 1): boolean => {
    if (!user) {
      showToast('Please sign in to request a carpool seat', 'warning');
      return false;
    }
    const targetRide = rides.find(r => r.id === rideId);
    if (!targetRide) {
      showToast('Ride not found', 'error');
      return false;
    }
    if (targetRide.availableSeats < seats) {
      showToast('Sorry, not enough seats available on this ride.', 'warning');
      return false;
    }
    if (targetRide.driverId === user.userId) {
      showToast('You are the host of this ride.', 'warning');
      return false;
    }

    // Check if already requested
    const existingReq = seatRequests.find(r => r.rideId === rideId && r.passengerId === user.userId && r.status === 'pending');
    if (existingReq) {
      showToast('You already have a pending seat request for this ride.', 'info');
      return false;
    }

    const newRequest: SeatRequest = {
      id: `req_${Date.now()}`,
      rideId,
      passengerId: user.userId,
      passengerName: user.name,
      passengerUsername: user.username,
      passengerAvatar: user.avatarUrl,
      passengerPhone: user.phone,
      passengerVerified: user.verificationStatus === 'verified',
      seatsRequested: seats,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Immediate optimistic update
    setSeatRequests(prev => [newRequest, ...prev]);

    // Persist to Cloud Firestore so driver receives it on any device in real time
    addSeatRequestToFirestore(newRequest).catch(err => {
      console.warn('Notice saving seat request to Firestore:', err);
    });

    // Add notification
    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: user.userId,
      title: 'Seat Request Sent',
      message: `Your seat request for ${targetRide.driverName}'s ride has been broadcast.`,
      type: 'ride',
      link: '/rides',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [notif, ...prev]);

    showToast(`Seat request sent to ${targetRide.driverName}!`, 'success');
    return true;
  }, [user, rides, seatRequests, showToast]);

  const cancelSeatRequest = useCallback((requestId: string) => {
    setSeatRequests(prev => prev.filter(r => r.id !== requestId));
    // Remove from Cloud Firestore
    cancelSeatRequestInFirestore(requestId).catch(err => {
      console.warn('Notice removing seat request from Firestore:', err);
    });
    showToast('Seat request cancelled', 'info');
  }, [showToast]);

  const respondToSeatRequest = useCallback((requestId: string, status: 'accepted' | 'declined') => {
    const req = seatRequests.find(r => r.id === requestId);
    if (!req) return;

    let updatedAvailable: number | undefined;

    if (status === 'accepted') {
      // Concurrency and seat count guard
      const ride = rides.find(r => r.id === req.rideId);
      if (!ride || ride.availableSeats < req.seatsRequested) {
        showToast('Cannot accept: Not enough seats remaining on this carpool.', 'error');
        return;
      }

      // Decrement available seats
      updatedAvailable = ride.availableSeats - req.seatsRequested;
      setRides(prev => prev.map(r => {
        if (r.id === req.rideId) {
          return {
            ...r,
            availableSeats: updatedAvailable!,
            status: updatedAvailable === 0 ? 'full' : r.status,
          };
        }
        return r;
      }));
    }

    setSeatRequests(prev => prev.map(r => r.id === requestId ? { ...r, status, updatedAt: new Date().toISOString() } : r));

    // Update in Cloud Firestore so all devices see the new seat count and request status
    respondToSeatRequestInFirestore(requestId, status, req.rideId, updatedAvailable).catch(err => {
      console.warn('Notice updating seat request in Firestore:', err);
    });

    // Notify passenger
    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: req.passengerId,
      title: status === 'accepted' ? 'Seat Request Approved!' : 'Seat Request Declined',
      message: status === 'accepted'
        ? `Your carpool seat has been confirmed for ${req.seatsRequested} seat(s).`
        : 'The ride host was unable to accept your carpool seat request.',
      type: 'ride',
      link: '/rides',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [notif, ...prev]);

    showToast(`Request ${status === 'accepted' ? 'accepted and seat reserved' : 'declined'}.`, status === 'accepted' ? 'success' : 'info');
  }, [seatRequests, rides, showToast]);

  // CHALLENGES ACTIONS
  const joinChallenge = useCallback((challengeId: string) => {
    if (!user) {
      showToast('Please sign in to join challenges', 'warning');
      return;
    }
    const ch = challenges.find(c => c.id === challengeId);
    if (!ch) return;

    const existing = participations.find(p => p.challengeId === challengeId && p.userId === user.userId);
    if (existing) {
      showToast('You have already joined this challenge.', 'info');
      return;
    }

    const newPart: ChallengeParticipation = {
      id: `part_${Date.now()}`,
      challengeId,
      userId: user.userId,
      status: 'joined',
      pointsAwarded: false,
    };

    setParticipations(prev => [...prev, newPart]);
    setChallenges(prev => prev.map(c => c.id === challengeId ? { ...c, participantsCount: c.participantsCount + 1 } : c));

    showToast(`Joined challenge: "${ch.title}"!`, 'success');
  }, [user, challenges, participations, showToast]);

  const completeChallenge = useCallback((challengeId: string) => {
    if (!user) {
      showToast('Please sign in to complete challenges', 'warning');
      return;
    }
    const ch = challenges.find(c => c.id === challengeId);
    if (!ch) return;

    const part = participations.find(p => p.challengeId === challengeId && p.userId === user.userId);
    if (part?.pointsAwarded) {
      showToast('Points for this challenge have already been claimed.', 'info');
      return;
    }

    // Idempotent point reward: Tied strictly to valid completion record
    const pointsToAdd = ch.pointsReward;

    setParticipations(prev => {
      const existing = prev.find(p => p.challengeId === challengeId && p.userId === user.userId);
      if (existing) {
        return prev.map(p => p.id === existing.id ? { ...p, status: 'completed', pointsAwarded: true, completedAt: new Date().toISOString() } : p);
      }
      return [...prev, {
        id: `part_${Date.now()}`,
        challengeId,
        userId: user.userId,
        status: 'completed',
        pointsAwarded: true,
        completedAt: new Date().toISOString(),
      }];
    });

    // Update user points and streak
    setUser(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        challengePoints: prev.challengePoints + pointsToAdd,
        streakDays: prev.streakDays + 1,
        updatedAt: new Date().toISOString(),
      };
      MiniMothAdapter.saveSession(updated);
      return updated;
    });

    // Update leaderboard
    setLeaderboard(prev => {
      return prev.map(entry => {
        if (entry.userId === user.userId) {
          return {
            ...entry,
            points: entry.points + pointsToAdd,
            completedChallenges: entry.completedChallenges + 1,
            weeklyPoints: entry.weeklyPoints + pointsToAdd,
            streakDays: entry.streakDays + 1,
          };
        }
        return entry;
      }).sort((a, b) => b.points - a.points);
    });

    // Notification
    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: user.userId,
      title: 'Challenge Completed! 🎉',
      message: `You earned +${pointsToAdd} points for completing "${ch.title}". Streak increased to ${user.streakDays + 1} days!`,
      type: 'challenge',
      link: '/challenges',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [notif, ...prev]);

    showToast(`Challenge Completed! +${pointsToAdd} points earned!`, 'success');
  }, [user, challenges, participations, showToast]);

  // EVENTS ACTIONS
  const registerForEvent = useCallback((eventId: string): boolean => {
    if (!user) {
      showToast('Please sign in to register for events', 'warning');
      return false;
    }
    const evt = events.find(e => e.id === eventId);
    if (!evt) return false;

    const alreadyReg = registrations.some(r => r.eventId === eventId && r.userId === user.userId);
    if (alreadyReg) {
      showToast('You are already registered for this event.', 'info');
      return false;
    }

    if (evt.registeredCount >= evt.maxSeats) {
      showToast('This event has reached full capacity.', 'warning');
      return false;
    }

    const newReg: EventRegistration = {
      id: `reg_${Date.now()}`,
      eventId,
      userId: user.userId,
      registeredAt: new Date().toISOString(),
    };

    setRegistrations(prev => [...prev, newReg]);
    setEvents(prev => prev.map(e => e.id === eventId ? {
      ...e,
      registeredCount: e.registeredCount + 1,
      status: e.registeredCount + 1 >= e.maxSeats ? 'full' : e.status,
    } : e));

    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: user.userId,
      title: 'Event RSVP Confirmed',
      message: `You are booked for "${evt.title}" at ${evt.venue}.`,
      type: 'event',
      link: '/events',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [notif, ...prev]);

    showToast(`RSVP Confirmed for ${evt.title}!`, 'success');
    return true;
  }, [user, events, registrations, showToast]);

  const cancelEventRegistration = useCallback((eventId: string) => {
    if (!user) return;
    setRegistrations(prev => prev.filter(r => !(r.eventId === eventId && r.userId === user.userId)));
    setEvents(prev => prev.map(e => e.id === eventId ? {
      ...e,
      registeredCount: Math.max(0, e.registeredCount - 1),
      status: e.status === 'full' ? 'open' : e.status,
    } : e));
    showToast('Event registration cancelled.', 'info');
  }, [user, showToast]);

  // PEER LEARNING ACTIONS
  const createLearningSession = useCallback((sessionData: Omit<LearningSession, 'id' | 'hostId' | 'hostName' | 'hostVerified' | 'enrolledUserIds' | 'status' | 'createdAt'>) => {
    if (!user) {
      showToast('Please sign in to host a peer study session', 'warning');
      return;
    }
    const newSession: LearningSession = {
      ...sessionData,
      id: `ls_${Date.now()}`,
      hostId: user.userId,
      hostName: user.name,
      hostVerified: user.verificationStatus === 'verified',
      enrolledUserIds: [],
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    setLearningSessions(prev => [newSession, ...prev]);
    showToast(`Study session "${newSession.topic}" scheduled!`, 'success');
  }, [user, showToast]);

  const joinLearningSession = useCallback((sessionId: string): boolean => {
    if (!user) {
      showToast('Please sign in to join learning sessions', 'warning');
      return false;
    }
    const session = learningSessions.find(s => s.id === sessionId);
    if (!session) return false;

    if (session.hostId === user.userId) {
      showToast('You are the host of this study session.', 'info');
      return false;
    }

    if (session.enrolledUserIds.includes(user.userId)) {
      showToast('You are already enrolled in this session.', 'info');
      return false;
    }

    if (session.enrolledUserIds.length >= session.maxParticipants) {
      showToast('This study session is full.', 'warning');
      return false;
    }

    setLearningSessions(prev => prev.map(s => s.id === sessionId ? {
      ...s,
      enrolledUserIds: [...s.enrolledUserIds, user.userId],
    } : s));

    showToast(`Enrolled in "${session.topic}"!`, 'success');
    return true;
  }, [user, learningSessions, showToast]);

  const completeLearningSession = useCallback((sessionId: string) => {
    if (!user) return;
    const session = learningSessions.find(s => s.id === sessionId);
    if (!session) return;
    if (session.status === 'completed') {
      showToast('This session has already been completed.', 'info');
      return;
    }

    setLearningSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: 'completed' } : s));

    // Award time credits to host
    if (session.hostId === user.userId) {
      const reward = session.creditsReward || 1;
      setUser(prev => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          timeCredits: prev.timeCredits + reward,
          updatedAt: new Date().toISOString(),
        };
        MiniMothAdapter.saveSession(updated);
        return updated;
      });

      // Record in ledger
      const tx: CreditTransaction = {
        id: `tx_${Date.now()}`,
        userId: user.userId,
        amount: reward,
        type: 'earned',
        description: `Taught "${session.topic}" (${session.durationMinutes} min)`,
        relatedSessionId: sessionId,
        timestamp: new Date().toISOString(),
      };
      setCreditTransactions(prev => [tx, ...prev]);

      showToast(`Session completed! You earned +${reward} Time Credit!`, 'success');
    } else {
      showToast('Session marked as completed.', 'info');
    }
  }, [user, learningSessions, showToast]);

  // NOTIFICATION ACTIONS
  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    showToast('All notifications marked as read', 'info');
  }, [showToast]);

  // RESET DEMO DATA
  const resetDemoData = useCallback(() => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(STORAGE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    setUser(INITIAL_USER);
    MiniMothAdapter.saveSession(INITIAL_USER);
    setSubjects(INITIAL_SUBJECTS);
    setRides(INITIAL_RIDES);
    setSeatRequests(INITIAL_SEAT_REQUESTS);
    resetFirestoreRides().catch(err => console.warn('Notice resetting Firestore rides:', err));
    setChallenges(INITIAL_CHALLENGES);
    setParticipations(INITIAL_PARTICIPATIONS);
    setLeaderboard(INITIAL_LEADERBOARD);
    setEvents(INITIAL_EVENTS);
    setRegistrations(INITIAL_REGISTRATIONS);
    setLearningSessions(INITIAL_LEARNING_SESSIONS);
    setCreditTransactions(INITIAL_TRANSACTIONS);
    setNotifications(INITIAL_NOTIFICATIONS);
    showToast('Demo data restored to initial baseline successfully across cloud & local storage!', 'success');
  }, [showToast]);

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        subjects,
        lectures,
        rides,
        seatRequests,
        challenges,
        participations,
        leaderboard,
        locations,
        events,
        registrations,
        learningSessions,
        creditTransactions,
        notifications,
        gradingScale,
        isFirebaseActive,
        isAuthModalOpen,
        isProfileSwitcherOpen,
        isStatusModalOpen,
        activeLocationFocus,
        toasts,
        allProfiles,
        presetProfiles: allProfiles,
        openAuthModal,
        closeAuthModal,
        openProfileSwitcher,
        closeProfileSwitcher,
        openStatusModal,
        closeStatusModal,
        loginDemoUser,
        switchProfile,
        logout,
        updateProfile,
        updateDisplayName,
        updateStatusMessage,
        setVerificationStatus,
        focusLocationOnMap,
        showToast,
        dismissToast,
        addSubject,
        updateSubject,
        deleteSubject,
        createRide,
        requestSeat,
        cancelSeatRequest,
        respondToSeatRequest,
        joinChallenge,
        completeChallenge,
        registerForEvent,
        cancelEventRegistration,
        createLearningSession,
        joinLearningSession,
        completeLearningSession,
        markNotificationRead,
        markAllNotificationsRead,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
