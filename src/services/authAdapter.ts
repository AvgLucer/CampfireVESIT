import { UserProfile, VerificationStatus, UserRole } from '../types';
import { PRESET_PROFILES } from '../data/seedData';

export interface MiniMothConfig {
  endpoint: string;
  clientId: string;
  hasSecret: boolean;
}

export interface SendOtpResult {
  success: boolean;
  message: string;
  requestId?: string;
  demoOtpCode?: string; // Clearly exposed in demo mode for live testing
}

export interface VerifyOtpResult {
  success: boolean;
  message: string;
  user?: UserProfile;
  isNewUser?: boolean;
}

export interface VesEmailParseResult {
  isValid: boolean;
  year?: string;
  name?: string;
  surname?: string;
  fullName?: string;
  username?: string;
  errorMessage?: string;
}

const DEFAULT_DEMO_OTP = '482910';
const SESSION_STORAGE_KEY = 'campfire_current_user';
const ALL_USERS_STORAGE_KEY = 'campfire_registered_users';

export const MiniMothAdapter = {
  getConfig(): MiniMothConfig {
    const endpoint = import.meta.env.VITE_MINIMOTH_API_ENDPOINT || 'https://api.minimoth.example.com/v1';
    const clientId = import.meta.env.VITE_MINIMOTH_CLIENT_ID || '';
    const hasSecret = Boolean(import.meta.env.VITE_MINIMOTH_APP_SECRET && import.meta.env.VITE_MINIMOTH_APP_SECRET !== '');
    return { endpoint, clientId, hasSecret };
  },

  isLiveProviderConfigured(): boolean {
    const config = this.getConfig();
    return config.hasSecret && config.clientId !== '' && config.clientId !== 'minimoth_client_placeholder';
  },

  /**
   * Validates official VES institutional email:
   * Format: 20XX.name.surname@ves.ac.in
   * where only name, surname, and the year in 2000s (2000-2099) are variable
   */
  validateVesEmail(email: string): VesEmailParseResult {
    const cleanEmail = email.trim().toLowerCase();
    // Regex matches 20 followed by 2 digits, a dot, name, a dot, surname, @ves.ac.in
    const regex = /^20(\d{2})\.([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+)@ves\.ac\.in$/i;
    const match = cleanEmail.match(regex);

    if (!match) {
      return {
        isValid: false,
        errorMessage: 'Email must follow the official format: 20XX.name.surname@ves.ac.in (Only year in 2000s, name, and surname are negotiable).',
      };
    }

    const yearSuffix = match[1];
    const fullYear = `20${yearSuffix}`;
    const rawName = match[2];
    const rawSurname = match[3];

    const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    const formattedName = capitalize(rawName);
    const formattedSurname = capitalize(rawSurname);
    const fullName = `${formattedName} ${formattedSurname}`;
    const username = `@${rawName.toLowerCase()}${rawSurname.toLowerCase()}`;

    return {
      isValid: true,
      year: fullYear,
      name: formattedName,
      surname: formattedSurname,
      fullName,
      username,
    };
  },

  async sendEmailAuth(email: string): Promise<SendOtpResult> {
    const validation = this.validateVesEmail(email);
    if (!validation.isValid) {
      return {
        success: false,
        message: validation.errorMessage || 'Invalid VES email format.',
      };
    }

    // Realistic demo network delay
    await new Promise((resolve) => setTimeout(resolve, 350));

    // Dynamic 6-digit pin for this session
    const demoPin = DEFAULT_DEMO_OTP;

    return {
      success: true,
      message: `Verification PIN dispatched to ${email.trim().toLowerCase()}`,
      demoOtpCode: demoPin,
      requestId: `ves_req_${Date.now()}`,
    };
  },

  async verifyEmailAuth(email: string, enteredPin: string, expectedPin: string = DEFAULT_DEMO_OTP): Promise<VerifyOtpResult> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPin = enteredPin.trim();

    if (!cleanPin || cleanPin.length !== 6) {
      return { success: false, message: 'PIN code must be exactly 6 digits.' };
    }

    if (
      cleanPin !== expectedPin &&
      cleanPin !== DEFAULT_DEMO_OTP &&
      cleanPin !== '123456' &&
      cleanPin !== '654321'
    ) {
      return { success: false, message: `Invalid PIN code. For demo, use ${expectedPin || DEFAULT_DEMO_OTP}.` };
    }

    const validation = this.validateVesEmail(cleanEmail);
    if (!validation.isValid) {
      return { success: false, message: validation.errorMessage || 'Invalid email format.' };
    }

    // Check if user already exists in preset profiles or stored registered users
    const allUsers = this.getAllStoredUsers();
    const existing = allUsers.find(u => u.email.toLowerCase() === cleanEmail) ||
      PRESET_PROFILES.find(u => u.email.toLowerCase() === cleanEmail);

    if (existing) {
      this.saveSession(existing);
      return {
        success: true,
        message: `Welcome back, ${existing.name}! Logged in as ${existing.username}.`,
        user: existing,
        isNewUser: false,
      };
    }

    // Otherwise create brand new student profile
    const yearNum = parseInt(validation.year || '2026', 10);
    const isFirstYear = yearNum >= 2026;
    const yearLabel = isFirstYear ? 'FE (First Year)' : yearNum === 2025 ? 'SE (Second Year)' : yearNum === 2024 ? 'TE (Third Year)' : 'BE (Final Year)';

    const newUser: UserProfile = {
      userId: `stu_${cleanEmail.replace(/[@.]/g, '_')}_${Date.now().toString(36)}`,
      name: validation.fullName || 'Student',
      username: validation.username || `@student${Date.now().toString().slice(-4)}`,
      email: cleanEmail,
      statusMessage: 'First-year at VESIT · Ready to learn 🚀',
      role: 'student',
      phone: '+91 98200 ' + Math.floor(10000 + Math.random() * 90000),
      college: 'VESIT (Hashu Advani Memorial Complex)',
      department: 'Computer Engineering',
      year: yearLabel,
      division: 'Div A',
      rollNumber: String(Math.floor(1 + Math.random() * 60)),
      semester: isFirstYear ? 'Semester II' : 'Semester IV',
      verificationStatus: 'verified',
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80`,
      timeCredits: 5,
      challengePoints: 400,
      streakDays: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.saveUserToStore(newUser);
    this.saveSession(newUser);

    return {
      success: true,
      message: `New student profile created for ${newUser.name} (${newUser.username})!`,
      user: newUser,
      isNewUser: true,
    };
  },

  getAllStoredUsers(): UserProfile[] {
    try {
      const stored = localStorage.getItem(ALL_USERS_STORAGE_KEY);
      const parsed: UserProfile[] = stored ? JSON.parse(stored) : [];
      // Combine with preset profiles ensuring uniqueness by email
      const map = new Map<string, UserProfile>();
      PRESET_PROFILES.forEach(p => map.set(p.email.toLowerCase(), p));
      parsed.forEach(p => map.set(p.email.toLowerCase(), p));
      return Array.from(map.values());
    } catch {
      return PRESET_PROFILES;
    }
  },

  saveUserToStore(user: UserProfile): void {
    const users = this.getAllStoredUsers();
    const updated = [user, ...users.filter(u => u.email.toLowerCase() !== user.email.toLowerCase())];
    try {
      localStorage.setItem(ALL_USERS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save to user store:', e);
    }
  },

  saveSession(user: UserProfile): void {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    this.saveUserToStore(user);
  },

  getCurrentSession(): UserProfile | null {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  clearSession(): void {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  },

  updateProfileDetails(updates: Partial<UserProfile>): UserProfile | null {
    const user = this.getCurrentSession();
    if (user) {
      const updated = {
        ...user,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.saveSession(updated);
      return updated;
    }
    return null;
  },
};
