import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MiniMothAdapter } from '../../services/authAdapter';
import { EmailAuthService } from '../../services/emailAuthService';
import {
  ShieldCheck,
  Mail,
  KeyRound,
  User,
  ArrowRight,
  X,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  School,
  Users,
  Copy,
  RefreshCw,
} from 'lucide-react';

export const MiniMothAuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    switchProfile,
    allProfiles,
    showToast,
  } = useApp();

  const [step, setStep] = useState<'email' | 'pin' | 'quick_switch'>('email');
  const [vesEmail, setVesEmail] = useState('2026.aarav.sharma@ves.ac.in');
  const [enteredPin, setEnteredPin] = useState('');
  const [generatedPin, setGeneratedPin] = useState('482910');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSendingPin, setIsSendingPin] = useState(false);
  const [sendPinStatus, setSendPinStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [sendPinMode, setSendPinMode] = useState<'live' | 'demo'>('demo');
  const [missingConfigList, setMissingConfigList] = useState<string[]>([]);

  if (!isAuthModalOpen) return null;

  const emailValidation = MiniMothAdapter.validateVesEmail(vesEmail);

  const handleSendPinToEmail = async () => {
    if (isSendingPin) return;
    setErrorMessage(null);
    setSendPinStatus('sending');
    setIsSendingPin(true);

    try {
      const res = await EmailAuthService.sendPinToEmail(vesEmail);
      if (res.success) {
        setSendPinStatus('success');
        setSendPinMode(res.mode);
        if (res.pin) {
          setGeneratedPin(res.pin);
        }
        if (res.missingConfig) {
          setMissingConfigList(res.missingConfig);
        }
        showToast('Verification code sent successfully!', 'success');
      } else {
        setSendPinStatus('error');
        setErrorMessage(res.error || 'Unable to send code. Please try again.');
        if (res.missingConfig) {
          setMissingConfigList(res.missingConfig);
        }
      }
    } catch (err) {
      console.error(err);
      setSendPinStatus('error');
    } finally {
      setIsSendingPin(false);
    }
  };

  const handleSendAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const validation = MiniMothAdapter.validateVesEmail(vesEmail);
    if (!validation.isValid) {
      setErrorMessage(validation.errorMessage || 'Invalid VES email format. Must be 20XX.name.surname@ves.ac.in');
      return;
    }

    setIsLoading(true);
    const res = await MiniMothAdapter.sendEmailAuth(vesEmail);
    setIsLoading(false);

    if (res.success) {
      const pinCode = res.demoOtpCode || '482910';
      setGeneratedPin(pinCode);
      setEnteredPin('');
      setStep('pin');
      showToast(res.message, 'info');
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (enteredPin.trim().length !== 6) {
      setErrorMessage('Please enter the complete 6-digit PIN.');
      return;
    }

    setIsLoading(true);
    await EmailAuthService.verifyPin(vesEmail, enteredPin, generatedPin);
    const res = await MiniMothAdapter.verifyEmailAuth(vesEmail, enteredPin, generatedPin);
    setIsLoading(false);

    if (res.success && res.user) {
      switchProfile(res.user);
      if (res.isNewUser) {
        showToast(`🎉 New student profile created for ${res.user.name} (${res.user.username})!`, 'success');
      } else {
        showToast(`Welcome back, ${res.user.name} (${res.user.username})!`, 'success');
      }
      closeAuthModal();
      setStep('email');
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleAutofillPin = () => {
    setEnteredPin(generatedPin);
  };

  const handleQuickSwitch = (profile: typeof allProfiles[0]) => {
    switchProfile(profile);
    closeAuthModal();
    setStep('email');
  };

  const sampleEmails = [
    { label: 'Aarav Sharma (FE Comps)', email: '2026.aarav.sharma@ves.ac.in', desc: 'Existing Student' },
    { label: 'Neha Chawla (SE Comps)', email: '2025.neha.chawla@ves.ac.in', desc: 'Existing Student' },
    { label: 'Priya Mehta (New FE)', email: '2026.priya.mehta@ves.ac.in', desc: 'Creates New Profile' },
    { label: 'Dr. Nupur Giri (Faculty)', email: '2020.nupur.giri@ves.ac.in', desc: 'Admin Profile' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E5E3DC] p-6 text-[#20231F] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#737871] hover:text-[#20231F] hover:bg-[#F2EFE9] transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title & Header */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-[#F97316]/10 flex items-center justify-center text-[#F97316] shrink-0">
            {step === 'pin' ? <KeyRound className="w-5 h-5" /> : step === 'quick_switch' ? <Users className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-[#171916]">
              {step === 'email' && 'VES Institutional Sign-In'}
              {step === 'pin' && 'Enter Verification PIN'}
              {step === 'quick_switch' && 'Switch Active Profile'}
            </h2>
            <div className="text-xs text-[#737871]">
              {step === 'pin' ? 'Step 2 of 2 · Demo Verification PIN' : 'Official VESIT Campus Authentication'}
            </div>
          </div>
        </div>

        {/* Format Guidance Banner */}
        {step === 'email' && (
          <div className="my-3 px-3.5 py-3 rounded-xl bg-[#FAF9F5] border border-[#E5E3DC] text-xs text-[#555952] space-y-1.5">
            <div className="font-semibold text-[#171916] flex items-center gap-1.5 text-xs">
              <School className="w-3.5 h-3.5 text-[#F97316]" />
              <span>Strict Institutional Email Format:</span>
            </div>
            <div className="p-2 rounded-lg bg-white border border-[#E5E3DC] font-mono text-[11px] text-[#F97316] font-bold flex items-center justify-between">
              <span>20XX.name.surname@ves.ac.in</span>
              <span className="text-[10px] text-[#737871] font-sans font-normal">VESIT Domain</span>
            </div>
            <p className="text-[11px] text-[#737871] leading-relaxed">
              Only the year in 2000s (e.g. 2024, 2025, 2026), first name, and surname are negotiable. Other email domains cannot enter the portal.
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-3 px-3.5 py-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Email Form */}
        {step === 'email' && (
          <form onSubmit={handleSendAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#3B4036] mb-1.5">
                Institutional Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8C9187] absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="2026.name.surname@ves.ac.in"
                  value={vesEmail}
                  onChange={(e) => setVesEmail(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border bg-white font-mono text-[#20231F] focus:outline-hidden transition-colors ${
                    vesEmail && !emailValidation.isValid
                      ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                      : 'border-[#D7D4CB] focus:border-[#F97316]'
                  }`}
                />
              </div>

              {/* Validation Status Indicator */}
              <div className="mt-1.5 min-h-[20px]">
                {vesEmail ? (
                  emailValidation.isValid ? (
                    <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>
                        Valid format: <strong>{emailValidation.fullName}</strong> ({emailValidation.username}) · Batch {emailValidation.year}
                      </span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-rose-600 flex items-center gap-1.5 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>Must match format: 20XX.name.surname@ves.ac.in</span>
                    </div>
                  )
                ) : (
                  <div className="text-[11px] text-[#737871]">
                    Enter your 20XX.name.surname@ves.ac.in credentials to continue
                  </div>
                )}
              </div>
            </div>

            {/* Quick Demo Pre-fills */}
            <div>
              <div className="text-[11px] font-semibold text-[#737871] mb-1.5">
                Quick Demo Presets:
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {sampleEmails.map((sample) => (
                  <button
                    key={sample.email}
                    type="button"
                    onClick={() => {
                      setVesEmail(sample.email);
                      setErrorMessage(null);
                    }}
                    className={`px-2 py-1.5 text-left rounded-lg border text-[10px] transition-colors cursor-pointer ${
                      vesEmail === sample.email
                        ? 'border-[#F97316] bg-[#FFF8F5] text-[#F97316] font-bold'
                        : 'border-[#E5E3DC] hover:border-[#F97316] bg-white text-[#555952]'
                    }`}
                  >
                    <div className="font-semibold truncate">{sample.label}</div>
                    <div className="text-[9px] text-[#737871] truncate">{sample.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !emailValidation.isValid}
              className="w-full py-2.5 px-4 bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? 'Sending Auth...' : 'Send Auth'}
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Switch Profiles Footer Button */}
            <div className="pt-2 border-t border-[#E5E3DC]">
              <button
                type="button"
                onClick={() => setStep('quick_switch')}
                className="w-full py-2 px-3 border border-[#D7D4CB] hover:bg-[#FAF9F5] text-xs font-medium text-[#20231F] rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-[#F97316]" />
                <span>Switch between Students & Admin Profiles</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: PIN Verification */}
        {step === 'pin' && (
          <form onSubmit={handleVerifyPin} className="space-y-4">
            {/* The 6-digit PIN is displayed prominently right on top of the input place */}
            <div className="p-4 rounded-xl bg-gradient-to-b from-[#FFF8F5] to-white border-2 border-[#F97316]/40 text-center space-y-2 shadow-xs">
              <div className="text-[11px] font-semibold text-[#737871] flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F97316]" />
                <span>Demo Verification PIN for:</span>
              </div>
              <div className="font-mono text-xs font-bold text-[#171916] truncate px-2">
                {vesEmail}
              </div>

              {/* The 6 digit PIN visible right on the top */}
              <div className="py-1">
                <span className="text-3xl font-mono font-black tracking-widest text-[#F97316] select-all bg-white px-4 py-1.5 rounded-xl border border-[#F97316]/20 shadow-2xs inline-block">
                  {generatedPin}
                </span>
              </div>

              {/* Autofill Button right on top */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleAutofillPin}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#F97316] text-white text-xs font-bold hover:bg-[#EA580C] transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Autofill PIN ({generatedPin})</span>
                </button>
              </div>
            </div>

            {/* Input Place for 6-Digit PIN */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-[#3B4036]">
                  Enter 6-Digit PIN
                </label>
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-[11px] text-[#F97316] hover:underline cursor-pointer"
                >
                  Change email
                </button>
              </div>

              {/* Six-digit PIN input with Send PIN to Email button beside */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  required
                  placeholder="------"
                  value={enteredPin}
                  onChange={(e) => setEnteredPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="flex-1 text-center tracking-[0.5em] text-2xl font-mono py-2.5 rounded-lg border-2 border-[#D7D4CB] bg-white text-[#20231F] focus:outline-hidden focus:border-[#F97316] font-bold"
                />

                {/* Send PIN to Email Button beside PIN field */}
                <button
                  type="button"
                  onClick={handleSendPinToEmail}
                  disabled={isSendingPin}
                  className="px-3.5 py-2.5 rounded-lg bg-white hover:bg-orange-50 border-2 border-[#F97316] text-xs font-bold text-[#F97316] transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
                  title={`Send 6-digit verification code to ${vesEmail}`}
                >
                  {isSendingPin ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#F97316]" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-3.5 h-3.5 text-[#F97316]" />
                      <span>Send PIN to Email</span>
                    </>
                  )}
                </button>
              </div>

              {/* Status message near the button */}
              {sendPinStatus !== 'idle' && (
                <div className="mt-2 text-center transition-all">
                  {sendPinStatus === 'sending' && (
                    <div className="inline-flex items-center gap-1 text-xs text-[#555952] font-medium">
                      <RefreshCw className="w-3 h-3 animate-spin text-[#F97316]" />
                      <span>Sending verification code...</span>
                    </div>
                  )}
                  {sendPinStatus === 'success' && (
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Verification code sent successfully!</span>
                      </span>
                      {sendPinMode === 'demo' && (
                        <span className="text-[10px] text-[#737871]">
                          <span className="font-semibold text-amber-600">[Demo Mode]</span> Real delivery requires SMTP. Code simulated for preview.
                        </span>
                      )}
                    </div>
                  )}
                  {sendPinStatus === 'error' && (
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="inline-flex items-center gap-1 text-xs text-rose-600 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Unable to send code. Please try again.</span>
                      </span>
                      {missingConfigList.length > 0 && (
                        <span className="text-[10px] text-[#737871]">
                          Missing configuration: {missingConfigList.join(', ')}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="text-[10px] text-center text-[#737871] mt-1">
                {enteredPin.length}/6 digits entered
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || enteredPin.length !== 6}
              className="w-full py-2.5 px-4 bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? 'Verifying & Entering...' : 'Submit PIN & Enter Campfire'}
              <ShieldCheck className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 3: Quick Switch Profiles (Students & Admin) */}
        {step === 'quick_switch' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#555952]">Choose an active profile:</span>
              <button
                type="button"
                onClick={() => setStep('email')}
                className="text-[11px] text-[#F97316] hover:underline cursor-pointer"
              >
                ← Back to email sign-in
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {allProfiles.map((p) => {
                const isAdmin = p.role === 'admin';
                return (
                  <button
                    key={p.userId}
                    type="button"
                    onClick={() => handleQuickSwitch(p)}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isAdmin
                        ? 'bg-[#171916] text-white border-black hover:bg-[#20231F]'
                        : 'bg-white border-[#E5E3DC] hover:border-[#F97316] hover:bg-[#FFF8F5]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isAdmin ? 'bg-[#F97316] text-white' : 'bg-[#FAF9F5] border border-[#E5E3DC] text-[#F97316]'
                      }`}>
                        {p.avatarUrl ? (
                          <img src={p.avatarUrl} alt={p.name} className="w-full h-full object-cover rounded-full" />
                        ) : p.name.charAt(0)}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold truncate flex items-center gap-1.5">
                          <span>{p.name}</span>
                          <span className={`text-[10px] font-mono ${isAdmin ? 'text-[#F97316]' : 'text-[#737871]'}`}>
                            {p.username}
                          </span>
                        </div>
                        <div className={`text-[10px] truncate ${isAdmin ? 'text-[#A8ADA3]' : 'text-[#555952]'}`}>
                          {p.statusMessage || p.department}
                        </div>
                        <div className={`text-[9px] font-mono truncate ${isAdmin ? 'text-neutral-400' : 'text-[#8C9187]'}`}>
                          {p.email}
                        </div>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      isAdmin ? 'bg-[#F97316] text-white' : 'bg-[#FAF9F5] border border-[#E5E3DC] text-[#555952]'
                    }`}>
                      {isAdmin ? 'ADMIN' : p.year?.split(' ')[0] || 'STUDENT'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
