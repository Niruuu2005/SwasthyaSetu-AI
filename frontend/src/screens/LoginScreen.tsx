import React, { useState } from 'react';
import { Language, UserProfile } from '../types';
import { ASSETS } from '../data/mockData';
import { login } from '../api/auth';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  language: Language;
  onToggleLanguage: () => void;
  isOnline: boolean;
  onToggleOnline: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  language,
  onToggleLanguage,
  isOnline,
  onToggleOnline
}) => {
  const [selectedRoleKey, setSelectedRoleKey] = useState<'asha' | 'facility' | 'cdmo'>('asha');
  const [phone, setPhone] = useState('9000000001');
  const [password, setPassword] = useState('ChangeMeDemo123!');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const selectRole = (roleKey: 'asha' | 'facility' | 'cdmo') => {
    setSelectedRoleKey(roleKey);
    // Passwords match backend SEED_DEMO_PASSWORD default
    const demoPassword = 'ChangeMeDemo123!';
    if (roleKey === 'asha') {
      setPhone('9000000001');
      setPassword(demoPassword);
    } else if (roleKey === 'facility') {
      setPhone('9000000003');
      setPassword(demoPassword);
    } else if (roleKey === 'cdmo') {
      setPhone('9000000004');
      setPassword(demoPassword);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedbackMessage('Verifying credentials with backend...');
    try {
      const user = await login(phone.trim(), password);
      setFeedbackMessage(null);
      onLoginSuccess(user);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setFeedbackMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBannerText = () => {
    if (selectedRoleKey === 'asha') {
      return 'Logging in as: ASHA Sunita Devi (Field Triage)';
    } else if (selectedRoleKey === 'facility') {
      return 'Logging in as: Ramesh Medical Officer (PHC Triage & Bed Bedding)';
    } else {
      return 'Logging in as: Dr. Verma, CDMO (District Overview & Resource Allocation)';
    }
  };

  return (
    <main className="flex flex-col relative w-full bg-surface min-h-screen pt-safe pb-safe max-w-xl mx-auto px-margin-mobile">
      <div className="flex flex-col w-full pb-space-xl">
        {/* Top Auxiliary Row: Offline Banner & Language Chip */}
        <div className="flex items-center justify-between py-space-sm mb-space-xs">
          <button
            onClick={onToggleOnline}
            className="flex items-center gap-space-xs bg-tertiary-fixed text-on-tertiary-fixed px-space-sm py-1 rounded-full shadow-sm active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[16px] text-tertiary-container animate-pulse">
              {isOnline ? 'cloud_done' : 'cloud_off'}
            </span>
            <span className="font-label-sm text-label-sm font-semibold">
              {isOnline ? 'Online Sync Active' : 'Offline Ready • Local Sync Active'}
            </span>
          </button>

          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1 bg-surface-container-high px-space-sm py-1 rounded-full text-on-surface-variant shadow-sm active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[15px] text-primary">translate</span>
            <span className="font-label-sm text-label-sm font-semibold uppercase">
              {language === 'en' ? 'हिन्दी / ENG' : 'ENG / हिन्दी'}
            </span>
          </button>
        </div>

        {/* Hero Header & Institutional Emblem */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm mb-space-md flex flex-col items-center text-center border border-surface-container-high">
          <div className="relative w-16 h-16 mb-space-xs bg-surface-container-low rounded-xl p-1 flex items-center justify-center shadow-sm">
            <img
              src={ASSETS.BRAND_LOGO}
              alt="SwasthyaSetu AI Brand Emblem"
              className="w-full h-full object-contain"
            />
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-primary-container text-[8px] font-bold text-on-primary items-center justify-center">
                ✓
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 justify-center mb-0.5">
            <h1 className="font-headline-md text-headline-md text-primary tracking-tight font-bold">
              SwasthyaSetu AI
            </h1>
            <span className="bg-primary-fixed text-on-primary-fixed text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase">
              MoHFW Pilot
            </span>
          </div>
          <p className="font-label-md text-label-md text-on-surface-variant font-medium">
            Rural Health Triage &amp; Verified Referral Network
          </p>
          <p className="font-label-sm text-label-sm text-primary-container font-semibold mt-0.5">
            (स्वास्थ्य सेतु - राष्ट्रीय स्वास्थ्य मिशन)
          </p>
        </div>

        {/* Quick Demo Profiles Pill Selector */}
        <div className="bg-surface-container-low rounded-xl p-space-sm mb-space-md shadow-sm border border-surface-container-high">
          <div className="flex items-center justify-between mb-space-xs px-1">
            <div className="flex items-center gap-1 text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px] text-primary">badge</span>
              <span className="font-label-sm text-label-sm uppercase tracking-wide font-bold">
                Quick Demo Profiles (त्वरित चयन)
              </span>
            </div>
            <span className="font-label-sm text-label-sm text-primary font-bold">1-Tap Fill</span>
          </div>

          <div className="grid grid-cols-1 gap-space-xs" id="role-selector-group">
            {/* Role 1: ASHA */}
            <button
              type="button"
              onClick={() => selectRole('asha')}
              className={`w-full text-left p-space-xs rounded-lg transition-all flex items-center justify-between touch-manipulation ${
                selectedRoleKey === 'asha'
                  ? 'bg-primary-container text-on-primary shadow-sm'
                  : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
              }`}
            >
              <div className="flex items-center gap-space-xs min-w-0">
                <div className="w-8 h-8 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center flex-shrink-0 font-bold text-sm">
                  <span className="material-symbols-outlined text-[18px]">medical_services</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-label-md text-label-md font-bold truncate">
                      ASHA Worker: Sunita Devi
                    </span>
                    <span className="bg-primary-fixed-dim text-on-primary-fixed-variant text-[9px] px-1 py-0.2 rounded font-bold uppercase">
                      Field
                    </span>
                  </div>
                  <p className="font-label-sm text-label-sm opacity-90 truncate">
                    +91 9000000001 • Sub-Center Pipra
                  </p>
                </div>
              </div>
              <span
                className={`material-symbols-outlined text-[20px] ml-1 flex-shrink-0 transition-opacity ${
                  selectedRoleKey === 'asha' ? 'text-primary-fixed opacity-100' : 'opacity-0'
                }`}
              >
                check_circle
              </span>
            </button>

            {/* Role 2: Facility MO */}
            <button
              type="button"
              onClick={() => selectRole('facility')}
              className={`w-full text-left p-space-xs rounded-lg transition-all flex items-center justify-between touch-manipulation ${
                selectedRoleKey === 'facility'
                  ? 'bg-primary-container text-on-primary shadow-sm'
                  : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
              }`}
            >
              <div className="flex items-center gap-space-xs min-w-0">
                <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-fixed flex items-center justify-center flex-shrink-0 font-bold text-sm">
                  <span className="material-symbols-outlined text-[18px]">local_hospital</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-label-md text-label-md font-bold truncate">
                      Facility Staff: Ramesh MO
                    </span>
                    <span className="bg-surface-container-high text-on-surface-variant text-[9px] px-1 py-0.2 rounded font-bold uppercase">
                      PHC
                    </span>
                  </div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant truncate">
                    +91 9000000003 • PHC Rampur
                  </p>
                </div>
              </div>
              <span
                className={`material-symbols-outlined text-[20px] ml-1 flex-shrink-0 transition-opacity ${
                  selectedRoleKey === 'facility' ? 'text-primary-fixed opacity-100' : 'opacity-0'
                }`}
              >
                check_circle
              </span>
            </button>

            {/* Role 3: CDMO */}
            <button
              type="button"
              onClick={() => selectRole('cdmo')}
              className={`w-full text-left p-space-xs rounded-lg transition-all flex items-center justify-between touch-manipulation ${
                selectedRoleKey === 'cdmo'
                  ? 'bg-primary-container text-on-primary shadow-sm'
                  : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
              }`}
            >
              <div className="flex items-center gap-space-xs min-w-0">
                <div className="w-8 h-8 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center flex-shrink-0 font-bold text-sm">
                  <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-label-md text-label-md font-bold truncate">
                      CDMO: Dr. Verma
                    </span>
                    <span className="bg-surface-container-high text-on-surface-variant text-[9px] px-1 py-0.2 rounded font-bold uppercase">
                      District
                    </span>
                  </div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant truncate">
                    +91 9000000004 • District HQ
                  </p>
                </div>
              </div>
              <span
                className={`material-symbols-outlined text-[20px] ml-1 flex-shrink-0 transition-opacity ${
                  selectedRoleKey === 'cdmo' ? 'text-primary-fixed opacity-100' : 'opacity-0'
                }`}
              >
                check_circle
              </span>
            </button>
          </div>
        </div>

        {/* Login Form Box */}
        <form
          onSubmit={handleSubmit}
          className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm mb-space-md flex flex-col gap-space-md border border-surface-container-high"
        >
          {/* Active Role Context Banner */}
          <div className="bg-primary-fixed text-on-primary-fixed rounded-lg p-space-xs flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary-container text-[20px]">
              assignment_ind
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-label-sm text-label-sm font-bold leading-tight">
                {getRoleBannerText()}
              </p>
              <p className="font-label-sm text-[10px] text-on-primary-fixed-variant leading-tight">
                Authenticating on National Health Protocol Engine v3.2
              </p>
            </div>
          </div>

          {/* Phone Number Field */}
          <div className="flex flex-col gap-1">
            <label className="font-label-md text-label-md text-on-surface font-bold flex items-center justify-between">
              <span>Mobile Number / मोबाइल नंबर</span>
              <span className="font-label-sm text-label-sm text-primary font-semibold">Registered ID</span>
            </label>
            <div className="relative flex items-center bg-surface-container-low rounded-lg overflow-hidden border border-surface-container-high focus-within:bg-surface-bright">
              <div className="px-space-sm py-3 bg-surface-container-high text-on-surface-variant font-label-md text-label-md font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">call</span>
                <span>+91</span>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={10}
                placeholder="9000000000"
                required
                className="w-full h-12 bg-transparent px-space-sm font-title-md text-title-md font-bold tracking-wider text-on-surface focus:outline-none placeholder:text-outline"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="font-label-md text-label-md text-on-surface font-bold flex items-center gap-1">
                <span>Password / पासवर्ड</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-primary hover:underline font-label-sm text-label-sm font-semibold flex items-center gap-0.5"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
                <span>{showPassword ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            <div className="relative flex items-center bg-surface-container-low rounded-lg overflow-hidden border border-surface-container-high focus-within:bg-surface-bright">
              <div className="px-space-sm py-3 text-on-surface-variant flex items-center">
                <span className="material-symbols-outlined text-[18px]">lock</span>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-12 bg-transparent px-space-xs font-body-lg text-body-lg tracking-wider text-on-surface focus:outline-none placeholder:text-outline"
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="font-label-sm text-[10px] text-on-surface-variant">
                Demo password: ChangeMeDemo123! (SEED_DEMO_PASSWORD)
              </span>
              <button
                type="button"
                onClick={() => alert('Demo SMS OTP sent: 4402 (Validated for test pilot)')}
                className="font-label-sm text-label-sm text-primary font-bold hover:underline"
              >
                Use SMS OTP
              </button>
            </div>
          </div>

          {/* Feedback message */}
          {feedbackMessage && (
            <p className="text-xs font-medium text-primary text-center animate-pulse">
              {feedbackMessage}
            </p>
          )}

          {/* Primary Action Button */}
          <div className="pt-space-xs">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 bg-primary-container hover:bg-primary text-on-primary rounded-lg font-headline-sm text-headline-sm font-bold flex items-center justify-center gap-space-sm shadow-md active:scale-[0.99] transition-all touch-manipulation disabled:opacity-75"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[24px]">
                    progress_activity
                  </span>
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[24px]">login</span>
                  <span>Sign In to Portal / प्रवेश करें</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-space-xs pt-1 text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
            <span className="font-label-sm text-label-sm text-center">
              Secured via National Health Stack (ABDM / ABDM-Ready)
            </span>
          </div>
        </form>

        {/* Key Field Metrics / Context Badges */}
        <div className="grid grid-cols-3 gap-space-xs mb-space-md">
          <div className="bg-surface-container rounded-lg p-2.5 text-center shadow-sm border border-surface-container-high">
            <div className="font-label-sm text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">
              Sync Buffer
            </div>
            <div className="font-headline-sm text-headline-sm text-primary font-bold mt-0.5">
              18 Rec
            </div>
            <div className="text-[10px] text-on-surface-variant font-medium mt-0.5">
              Local Storage
            </div>
          </div>
          <div className="bg-surface-container rounded-lg p-2.5 text-center shadow-sm border border-surface-container-high">
            <div className="font-label-sm text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">
              Triage Level
            </div>
            <div className="font-headline-sm text-headline-sm text-primary font-bold mt-0.5">
              ICD-11
            </div>
            <div className="text-[10px] text-on-surface-variant font-medium mt-0.5">
              Rule Engine
            </div>
          </div>
          <div className="bg-surface-container rounded-lg p-2.5 text-center shadow-sm border border-surface-container-high">
            <div className="font-label-sm text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">
              Dispatch
            </div>
            <div className="font-headline-sm text-headline-sm text-error font-bold mt-0.5">
              108 Link
            </div>
            <div className="text-[10px] text-on-surface-variant font-medium mt-0.5">
              Simulated
            </div>
          </div>
        </div>

        {/* Mandatory Honesty Tier Notice & Institutional Footer */}
        <div className="bg-surface-container-high text-on-surface-variant rounded-xl p-space-sm shadow-sm flex flex-col gap-1.5 text-center mb-space-sm border border-surface-container-highest">
          <div className="flex items-center justify-center gap-1 text-on-surface font-bold text-label-sm uppercase">
            <span className="material-symbols-outlined text-[16px] text-primary">shield_moon</span>
            <span>Official Demo Build • Field Test Environment</span>
          </div>
          <p className="font-label-sm text-[11px] leading-snug">
            Official Demo Build • Simulated 108 Emergency Dispatch &amp; Demo Facility Registry • MoHFW / NHM Field Pilot.
          </p>
          <div className="pt-1 flex items-center justify-center gap-space-md text-[10px] text-on-surface-variant font-semibold">
            <span>Version 3.4.2-pilot</span>
            <span>•</span>
            <span>Device ID: ASHA-UP-4491</span>
            <span>•</span>
            <span>Secured AES-256</span>
          </div>
        </div>
      </div>
    </main>
  );
};
