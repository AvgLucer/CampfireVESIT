import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MiniMothAdapter } from '../services/authAdapter';
import { CampfireLogo } from '../components/common/CampfireLogo';
import {
  Mail,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  School,
  Info,
  Lock,
  ArrowLeft,
  Building,
} from 'lucide-react';

const PRESET_QUICK_EMAILS = [
  {
    label: 'Aarav Sharma',
    detail: 'FE Computer Engg (Student)',
    email: '2026.aarav.sharma@ves.ac.in',
    role: 'student',
  },
  {
    label: 'Tanvi Kulkarni',
    detail: 'FE IT (Student)',
    email: '2026.tanvi.kulkarni@ves.ac.in',
    role: 'student',
  },
  {
    label: 'Dev Deshmukh',
    detail: 'SE Electronics (Senior)',
    email: '2025.dev.deshmukh@ves.ac.in',
    role: 'student',
  },
  {
    label: 'Dr. Nupur Giri',
    detail: 'Faculty Administrator (Academic Council)',
    email: '2020.nupur.giri@ves.ac.in',
    role: 'admin',
  },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, switchProfile, showToast } = useApp();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const [step, setStep] = useState<'email' | 'pin'>('email');
  const [vesEmail, setVesEmail] = useState('2026.aarav.sharma@ves.ac.in');
  const [pinDigits, setPinDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [generatedPin, setGeneratedPin] = useState<string>('482910');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedPin, setCopiedPin] = useState(false);
  const [countdown, setCountdown] = useState<number>(30);

  // References to the 6 PIN input boxes
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown for resending PIN
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'pin' && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  // Focus first PIN input when transitioning to PIN step
  useEffect(() => {
    if (step === 'pin') {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  // 1. Submit Email & Request 6-Digit PIN
  const handleRequestPin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const validation = MiniMothAdapter.validateVesEmail(vesEmail);
    if (!validation.isValid) {
      setErrorMessage(
        validation.errorMessage ||
          'Email must be an official @ves.ac.in institutional address (e.g. 2026.name.surname@ves.ac.in)'
      );
      return;
    }

    setIsLoading(true);
    try {
      const res = await MiniMothAdapter.sendEmailAuth(vesEmail);
      if (res.success && res.demoOtpCode) {
        setGeneratedPin(res.demoOtpCode);
        setPinDigits(['', '', '', '', '', '']);
        setStep('pin');
        setCountdown(30);
        showToast(
          `Verification PIN generated and simulated to ${vesEmail}!`,
          'info'
        );
      } else {
        setErrorMessage(res.message);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to send verification PIN. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. PIN Digit Inputs Handlers
  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1); // Only keep single digit
    const updated = [...pinDigits];
    updated[index] = digit;
    setPinDigits(updated);
    setErrorMessage(null);

    // Auto-advance focus to next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!pinDigits[index] && index > 0) {
        // Move to previous box if current is empty
        inputRefs.current[index - 1]?.focus();
        const updated = [...pinDigits];
        updated[index - 1] = '';
        setPinDigits(updated);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const updated = [...pinDigits];
    for (let i = 0; i < 6; i++) {
      updated[i] = pastedData[i] || '';
    }
    setPinDigits(updated);

    // Focus last filled index or next empty
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  // 3. Auto-fill Demo PIN
  const handleAutofillPin = () => {
    const digits = generatedPin.split('').slice(0, 6);
    setPinDigits(digits);
    setErrorMessage(null);
    inputRefs.current[5]?.focus();
  };

  // 4. Copy PIN
  const handleCopyPin = () => {
    navigator.clipboard.writeText(generatedPin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  // 5. Verify PIN & Log In
  const handleVerifyPin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const fullEnteredPin = pinDigits.join('');
    if (fullEnteredPin.length !== 6) {
      setErrorMessage('Please enter all 6 digits of the verification PIN.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await MiniMothAdapter.verifyEmailAuth(
        vesEmail,
        fullEnteredPin,
        generatedPin
      );

      if (res.success && res.user) {
        switchProfile(res.user);
        if (res.isNewUser) {
          showToast(
            `🎉 Welcome to CampFire, ${res.user.name}! Profile initialized.`,
            'success'
          );
        } else {
          showToast(
            `👋 Welcome back, ${res.user.name}! Access clearance verified.`,
            'success'
          );
        }
        const from = (location.state as any)?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else {
        setErrorMessage(
          res.message || 'Invalid PIN code. Please use the simulated 6-digit PIN.'
        );
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Verification failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] dark:bg-neutral-950 flex flex-col justify-between selection:bg-[#F97316] selection:text-white">
      {/* Top institution bar */}
      <div className="bg-[#171916] text-white px-4 py-2 text-xs flex items-center justify-between border-b border-black">
        <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
          <School className="w-3.5 h-3.5 text-[#F97316]" />
          <span className="font-semibold text-neutral-300">
            Vivekanand Education Society&apos;s Institute of Technology (VESIT)
          </span>
          <span className="hidden sm:inline text-neutral-500">· Chembur, Mumbai</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-xl">
          {/* Card Wrapper */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-[#E5E3DC] dark:border-neutral-800 shadow-xl overflow-hidden">
            {/* Header / Brand */}
            <div className="p-6 sm:p-8 border-b border-[#E5E3DC] dark:border-neutral-800 bg-[#FAF9F5]/80 dark:bg-neutral-900/60">
              <div className="flex items-center justify-between gap-4">
                <div className="p-3 rounded-2xl bg-[#171916] text-white shadow-xs border border-neutral-800 inline-block">
                  <CampfireLogo size="lg" showTagline />
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-orange-100 text-[#F97316] dark:bg-orange-950 dark:text-orange-300 border border-orange-200 dark:border-orange-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>VESIT Portal</span>
                </span>
              </div>
              <h1 className="mt-4 text-xl sm:text-2xl font-black text-[#171916] dark:text-neutral-100 tracking-tight">
                {step === 'email'
                  ? 'Official Campus Single Sign-On'
                  : 'Enter 6-Digit Verification PIN'}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#555952] dark:text-neutral-400">
                {step === 'email'
                  ? 'Compulsory Authentication Gate: An official @ves.ac.in email is required. Without this login, you cannot view the website.'
                  : `6-Digit verification code generated for ${vesEmail}. Verify your PIN below to unlock the website.`}
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mx-6 sm:mx-8 mt-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/80 flex items-start gap-3 text-xs text-rose-800 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium leading-relaxed">
                  {errorMessage}
                </div>
              </div>
            )}

            {/* STEP 1: EMAIL ENTRY */}
            {step === 'email' && (
              <div className="p-6 sm:p-8 space-y-6">
                {/* How We Bring It In Dev Explainer Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-transparent border border-orange-200 dark:border-orange-900/60 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#F97316] text-white flex items-center justify-center font-bold text-xs">
                      ℹ️
                    </span>
                    <span className="text-xs font-bold text-[#171916] dark:text-neutral-100">
                      How We Bring It In Dev Mode
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-[#F97316] text-white px-1.5 py-0.2 rounded ml-auto">
                      Demo Architecture
                    </span>
                  </div>
                  <p className="text-[11px] text-[#555952] dark:text-neutral-300 leading-relaxed">
                    The <strong>@ves.ac.in</strong> email is strictly compulsory. In production, a secure 6-digit one-time PIN is sent to your official mailbox via college Google Workspace SMTP. In this dev environment, the 6-digit PIN is <strong>generated live on the next screen</strong> with an Auto-Fill button so you can test the access gate immediately!
                  </p>
                </div>

                <form onSubmit={handleRequestPin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#171916] dark:text-neutral-200 uppercase tracking-wider mb-2">
                      Official VES Institutional Email <span className="text-[#F97316]">* (Compulsory @ves.ac.in)</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-[#737871]" />
                      <input
                        type="email"
                        required
                        value={vesEmail}
                        onChange={(e) => {
                          setVesEmail(e.target.value);
                          setErrorMessage(null);
                        }}
                        placeholder="2026.name.surname@ves.ac.in"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#E5E3DC] dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-medium text-[#171916] dark:text-neutral-100 focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 transition-all shadow-2xs"
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-[#737871] dark:text-neutral-400">
                      <span>Must end with <strong className="text-[#F97316]">@ves.ac.in</strong> (Required)</span>
                      <span className="font-mono">Format: 20XX.name.surname@ves.ac.in</span>
                    </div>
                  </div>

                  {/* Dev / Quick Test Accounts Selector */}
                  <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-neutral-800/60 border border-[#E5E3DC] dark:border-neutral-800 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#171916] dark:text-neutral-200 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#F97316]" />
                        <span>Quick Demo Profiles (1-Click Fill)</span>
                      </span>
                      <span className="text-[10px] text-[#737871] font-mono">Development Mode</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {PRESET_QUICK_EMAILS.map((preset) => (
                        <button
                          key={preset.email}
                          type="button"
                          onClick={() => {
                            setVesEmail(preset.email);
                            setErrorMessage(null);
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            vesEmail === preset.email
                              ? 'bg-orange-50 border-[#F97316] ring-1 ring-[#F97316] dark:bg-orange-950/40 dark:border-[#F97316]'
                              : 'bg-white dark:bg-neutral-900 border-[#E5E3DC] dark:border-neutral-700 hover:border-[#F97316]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#171916] dark:text-neutral-200 truncate">
                              {preset.label}
                            </span>
                            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                              preset.role === 'admin'
                                ? 'bg-[#171916] text-[#F97316]'
                                : 'bg-neutral-100 dark:bg-neutral-800 text-[#737871]'
                            }`}>
                              {preset.role === 'admin' ? 'Admin' : 'Student'}
                            </span>
                          </div>
                          <div className="text-[10px] text-[#737871] truncate mt-0.5">
                            {preset.detail}
                          </div>
                          <div className="text-[10px] font-mono text-[#F97316] truncate mt-1">
                            {preset.email}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-6 rounded-2xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Generating 6-Digit PIN...</span>
                      </>
                    ) : (
                      <>
                        <span>Generate & Send 6-Digit PIN</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* STEP 2: 6-DIGIT PIN VERIFICATION */}
            {step === 'pin' && (
              <div className="p-6 sm:p-8 space-y-6">
                {/* SIMULATED CAMPUS MAIL EXPLANATION BANNER */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-transparent border border-orange-200 dark:border-orange-900/60 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#F97316] text-white flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                        📬
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#171916] dark:text-neutral-100 flex items-center gap-1.5">
                          <span>Developer Simulation: Campus Mail Dispatch</span>
                          <span className="text-[10px] font-mono font-bold bg-[#F97316] text-white px-1.5 py-0.2 rounded">
                            Dev Preview
                          </span>
                        </div>
                        <p className="text-[11px] text-[#555952] dark:text-neutral-400 mt-1 leading-relaxed">
                          In production, this 6-digit authentication PIN is securely dispatched to your VESIT Gmail mailbox (<strong>{vesEmail}</strong>) via Google Workspace SMTP. For preview testing, your generated PIN is displayed right here:
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Big PIN Display Badges & Copy/Autofill Controls */}
                  <div className="p-3 bg-white dark:bg-neutral-800 rounded-xl border border-orange-200 dark:border-neutral-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                      {generatedPin.split('').map((d, i) => (
                        <span
                          key={i}
                          className="w-9 h-10 rounded-lg bg-orange-100 dark:bg-orange-950/70 border border-orange-300 dark:border-orange-800 text-lg font-black font-mono text-[#F97316] flex items-center justify-center shadow-2xs"
                        >
                          {d}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-end gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleCopyPin}
                        className="px-2.5 py-1.5 rounded-lg border border-[#E5E3DC] dark:border-neutral-700 text-[#555952] dark:text-neutral-300 hover:text-[#171916] text-xs font-semibold hover:bg-[#FAF9F5] transition-colors flex items-center gap-1 cursor-pointer"
                        title="Copy PIN"
                      >
                        {copiedPin ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleAutofillPin}
                        className="px-3 py-1.5 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                        title="Auto-fill all 6 digits"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Auto-Fill PIN</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 6 Digit Input Boxes */}
                <form onSubmit={handleVerifyPin} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-[#171916] dark:text-neutral-200 uppercase tracking-wider mb-3 text-center">
                      Enter 6-Digit Security PIN
                    </label>

                    {/* 6 Individual Digit Inputs */}
                    <div
                      className="flex items-center justify-center gap-2 sm:gap-3"
                      onPaste={handlePaste}
                    >
                      {pinDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => {
                            inputRefs.current[idx] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleDigitChange(idx, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(idx, e)}
                          className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-black font-mono rounded-2xl border transition-all focus:outline-none ${
                            digit
                              ? 'border-[#F97316] ring-2 ring-[#F97316]/20 bg-orange-50/50 dark:bg-orange-950/20 text-[#171916] dark:text-neutral-100'
                              : 'border-[#E5E3DC] dark:border-neutral-700 bg-white dark:bg-neutral-800 text-[#171916] dark:text-neutral-100 focus:border-[#F97316]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Resend & Back controls */}
                  <div className="flex items-center justify-between text-xs text-[#737871] pt-2">
                    <button
                      type="button"
                      onClick={() => setStep('email')}
                      className="flex items-center gap-1 text-[#555952] dark:text-neutral-400 hover:text-[#171916] cursor-pointer font-semibold"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Change Email</span>
                    </button>

                    {countdown > 0 ? (
                      <span className="font-mono text-[#737871]">
                        Resend PIN in <strong className="text-[#F97316]">{countdown}s</strong>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRequestPin()}
                        className="text-[#F97316] font-bold hover:underline cursor-pointer"
                      >
                        Resend New PIN
                      </button>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading || pinDigits.join('').length !== 6}
                    className="w-full py-3.5 px-6 rounded-2xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying Security Clearance...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify PIN & Enter CampFire</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="mt-6 text-center text-xs text-[#737871] dark:text-neutral-500 space-y-1">
            <div>
              Protected by VESIT Campus Identity Services & Single Sign-On Architecture
            </div>
            <div className="text-[11px] text-[#A8ADA3]">
              Only authenticated @ves.ac.in members can access academic schedules, announcements, and carpool rides.
            </div>
          </div>
        </div>
      </div>

      {/* Bottom subtle bar */}
      <div className="p-4 text-center text-[11px] text-[#737871] dark:text-neutral-500 border-t border-[#E5E3DC] dark:border-neutral-800">
        CampFire Campus Ecosystem · Built for First-Year Students at VESIT Chembur
      </div>
    </div>
  );
};
