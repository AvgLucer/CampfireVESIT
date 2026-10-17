import { MiniMothAdapter } from './authAdapter';

export interface EmailAuthResponse {
  success: boolean;
  mode: 'live' | 'demo';
  statusMessage: string;
  pin?: string;
  demoNote?: string;
  missingConfig?: string[];
  error?: string;
}

export interface ProviderStatus {
  isConfigured: boolean;
  provider: string;
  missing: string[];
}

export const EmailAuthService = {
  /**
   * Request server-side generation & email dispatch of 6-digit verification PIN.
   */
  async sendPinToEmail(email: string): Promise<EmailAuthResponse> {
    const cleanEmail = email.trim().toLowerCase();

    // Validate VES institutional email format
    const validation = MiniMothAdapter.validateVesEmail(cleanEmail);
    if (!validation.isValid) {
      return {
        success: false,
        mode: 'demo',
        statusMessage: 'Unable to send code. Please try again.',
        error: validation.errorMessage || 'Invalid email address',
      };
    }

    try {
      const response = await fetch('/api/auth/send-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          mode: data.mode || (data.isDemoMode ? 'demo' : 'live'),
          statusMessage: 'Verification code sent successfully!',
          pin: data.pin,
          demoNote: data.explanation || 'Demo Mode: Mailbox delivery requires SMTP credentials (SMTP_HOST/USER/PASS). PIN generated securely on the server.',
          missingConfig: data.missingConfig,
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          mode: 'demo',
          statusMessage: 'Unable to send code. Please try again.',
          error: errorData.message || 'Server error',
          missingConfig: errorData.missingConfig,
        };
      }
    } catch (networkErr) {
      // Graceful client fallback if server endpoint is initializing or running standalone Vite
      console.warn('Backend /api/auth/send-pin unavailable, using client fallback:', networkErr);
      const res = await MiniMothAdapter.sendEmailAuth(cleanEmail);
      if (res.success && res.demoOtpCode) {
        return {
          success: true,
          mode: 'demo',
          statusMessage: 'Verification code sent successfully!',
          pin: res.demoOtpCode,
          demoNote: 'Demo Mode: Mailbox delivery requires SMTP credentials. PIN generated securely for demo preview.',
        };
      }
      return {
        success: false,
        mode: 'demo',
        statusMessage: 'Unable to send code. Please try again.',
        error: 'Network error',
      };
    }
  },

  /**
   * Verify entered PIN code
   */
  async verifyPin(email: string, enteredPin: string, fallbackExpectedPin?: string) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPin = enteredPin.trim();

    try {
      const response = await fetch('/api/auth/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, pin: cleanPin }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          verified: true,
          message: data.message || 'PIN verified successfully.',
        };
      }
    } catch (e) {
      console.warn('Backend verification fallback to adapter:', e);
    }

    // Fall back to existing MiniMoth verification
    return MiniMothAdapter.verifyEmailAuth(cleanEmail, cleanPin, fallbackExpectedPin);
  },

  /**
   * Check whether real email delivery provider is configured
   */
  async checkProviderStatus(): Promise<ProviderStatus> {
    try {
      const res = await fetch('/api/auth/status');
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Ignore
    }
    return {
      isConfigured: false,
      provider: 'none',
      missing: ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'],
    };
  },
};
