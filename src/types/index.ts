export type VerificationStatus = 'phone_verified' | 'pending_review' | 'verified';
export type UserRole = 'student' | 'admin';

export interface UserProfile {
  userId: string;
  name: string;
  username: string; // e.g. "@aaravsharma"
  email: string;    // e.g. "2026.aarav.sharma@ves.ac.in"
  statusMessage?: string; // Max 60 characters
  role: UserRole;   // 'student' | 'admin'
  phone: string;
  college: string;
  department: string;
  year: string;
  division: string;
  rollNumber: string;
  semester: string;
  verificationStatus: VerificationStatus;
  avatarUrl?: string;
  timeCredits: number;
  challengePoints: number;
  streakDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface GradingScaleItem {
  grade: string;
  gradePoint: number;
  minPercentage: number;
  maxPercentage: number;
  description: string;
}

export interface SubjectCredits {
  theory: number;     // Theoretical credits
  practical: number;  // Practical credits
  tutorial: number;   // Tutorial credits
  total: number;      // sum of all 3
}

export interface SubjectMarksComponent {
  max: number;
  scored: number;
}

export interface SubjectMarks {
  continuousAssessment: SubjectMarksComponent; // Continuous Assessment total marks
  midTerm: SubjectMarksComponent;              // Mid Term marks
  endSem: SubjectMarksComponent;               // End Sem marks
  termWork: SubjectMarksComponent;             // Term Work column
  practicalOral: SubjectMarksComponent;        // Practical / Oral column
}

export interface Subject {
  id: string;
  userId: string;
  semester: string; // e.g. "Sem 1", "Sem 2", "Sem 3", "Sem 4"
  code: string;
  name: string;
  credits: SubjectCredits;
  marks: SubjectMarks;
  color: string;
  targetGrade?: string;
}

export interface Lecture {
  id: string;
  subjectCode: string;
  subjectName: string;
  faculty: string;
  room: string;
  building: string;
  startTime: string; // "09:00 AM"
  endTime: string;   // "10:00 AM"
  dayOfWeek: string; // "Monday"
  status: 'upcoming' | 'in_progress' | 'completed';
  locationId?: string; // Corresponds to CampusLocation.id
}

export interface Ride {
  id: string;
  driverId: string;
  driverName: string;
  driverPhone?: string;
  driverAvatar?: string;
  driverVerified: boolean;
  origin: string;
  destination: string;
  originCoords: [number, number];
  destCoords: [number, number];
  direction: 'to_campus' | 'from_campus';
  departureTime: string;
  departureDate: string;
  totalSeats: number;
  availableSeats: number;
  fareContribution: number;
  vehicleInfo: string;
  status: 'available' | 'full' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface SeatRequest {
  id: string;
  rideId: string;
  passengerId: string;
  passengerName: string;
  passengerUsername?: string;
  passengerAvatar?: string;
  passengerPhone?: string;
  passengerVerified: boolean;
  seatsRequested: number;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export type ChallengeCategory = 'coding' | 'academics' | 'campus' | 'teamwork' | 'daily' | 'peer_learning';
export type ChallengeDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  pointsReward: number;
  deadline: string;
  participantsCount: number;
  maxParticipants?: number;
  criteria: string;
  createdAt: string;
}

export interface ChallengeParticipation {
  id: string;
  challengeId: string;
  userId: string;
  status: 'joined' | 'in_progress' | 'completed';
  pointsAwarded: boolean;
  completedAt?: string;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  avatarUrl?: string;
  department: string;
  year: string;
  points: number;
  completedChallenges: number;
  streakDays: number;
  weeklyPoints: number;
  monthlyPoints: number;
  isCurrentUser?: boolean;
}

export interface CampusLocation {
  id: string;
  name: string;
  category: 'department' | 'lab' | 'classroom' | 'library' | 'admin' | 'canteen' | 'auditorium' | 'activity' | 'amenity';
  building: string;
  floor: string;
  roomNumber?: string;
  coords: [number, number];
  openingHours: string;
  accessibility: string;
  instructions: string;
  contact?: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  organizer: string;
  category: 'technical' | 'cultural' | 'sports' | 'academic' | 'social';
  dateTime: string;
  venue: string;
  description: string;
  maxSeats: number;
  registeredCount: number;
  registrationDeadline: string;
  status: 'upcoming' | 'open' | 'closing_soon' | 'full' | 'completed';
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  registeredAt: string;
}

export interface LearningSession {
  id: string;
  topic: string;
  subjectCode: string;
  hostId: string;
  hostName: string;
  hostVerified: boolean;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  durationMinutes: number;
  dateTime: string;
  venue: string;
  maxParticipants: number;
  enrolledUserIds: string[];
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  creditsReward: number; // typically 1 or 2 credits
  createdAt: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'earned' | 'spent' | 'bonus';
  description: string;
  relatedSessionId?: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'academic' | 'ride' | 'challenge' | 'event' | 'learning' | 'system';
  link: string;
  isRead: boolean;
  createdAt: string;
}
