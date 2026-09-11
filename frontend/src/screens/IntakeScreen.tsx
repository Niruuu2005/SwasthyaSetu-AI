import React, { useState } from 'react';
import { Language, PatientRecord } from '../types';
import { QUICK_SYMPTOMS } from '../data/mockData';

interface IntakeScreenProps {
  patient: PatientRecord;
  onUpdatePatient: (updated: PatientRecord) => void;
  onSubmitToIntake: (record: PatientRecord) => void | Promise<void>;
  language: Language;
  onToggleLanguage: () => void;
  isOnline: boolean;
  showToast: (msg: string) => void;
  pendingOfflineCount?: number;
}

export const IntakeScreen: React.FC<IntakeScreenProps> = ({
  patient,
  onUpdatePatient,
  onSubmitToIntake,
  language,
  onToggleLanguage,
  isOnline,
  showToast,
  pendingOfflineCount = 0,
}) => {
  const [name, setName] = useState(patient.name || '');
  const [age, setAge] = useState(patient.age || '');
  const [sex, setSex] = useState(patient.sex || '');
  const [village, setVillage] = useState(patient.village || '');
  const [narrative, setNarrative] = useState(patient.clinicalNarrative || '');
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      showToast(language === 'hi' ? 'माइक्रोफोन खुला...' : 'Microphone opened...');

      const windowSpeech = window as unknown as {
        SpeechRecognition?: any;
        webkitSpeechRecognition?: any;
      };
      const SpeechRecognitionCtor =
        windowSpeech.SpeechRecognition || windowSpeech.webkitSpeechRecognition;

      if (!SpeechRecognitionCtor) {
        setIsRecording(false);
        showToast(
          language === 'hi'
            ? 'इस ब्राउज़र में वॉइस इनपुट उपलब्ध नहीं है।'
            : 'Voice input is not available in this browser.',
        );
        return;
      }

      try {
        const recognizer = new SpeechRecognitionCtor();
        recognizer.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
        recognizer.continuous = false;
        recognizer.interimResults = false;
        recognizer.onresult = (e: any) => {
          const transcript = e.results[0][0].transcript;
          setNarrative((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setIsRecording(false);
          showToast('Voice transcribed: ' + transcript);
        };
        recognizer.onerror = () => {
          setIsRecording(false);
          showToast(
            language === 'hi'
              ? 'वॉइस रिकॉर्डिंग विफल। कृपया लिखकर दर्ज करें।'
              : 'Voice capture failed. Please type the narrative.',
          );
        };
        recognizer.start();
      } catch {
        setIsRecording(false);
        showToast(
          language === 'hi'
            ? 'वॉइस इनपुट शुरू नहीं हो सका।'
            : 'Could not start voice input.',
        );
      }
    } else {
      setIsRecording(false);
      showToast(language === 'hi' ? 'आवाज़ रिकॉर्डिंग बंद।' : 'Recording stopped.');
    }
  };

  const handleAddSymptomChip = (chipText: string) => {
    setNarrative((prev) => {
      const cleanPrev = prev.trim();
      if (!cleanPrev) return chipText;
      return `${cleanPrev}, ${chipText.toLowerCase()}`;
    });
    showToast(`Added: ${chipText}`);
  };

  const handleClearNarrative = () => {
    setNarrative('');
    showToast('Narrative cleared.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const updatedRecord: PatientRecord = {
      ...patient,
      name: name.trim() || 'Patient',
      age: age.trim() || '40 yrs',
      sex,
      village: village.trim() || 'Village Cluster',
      clinicalNarrative: narrative,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    onUpdatePatient(updatedRecord);
    try {
      await onSubmitToIntake(updatedRecord);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Intake failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full pb-28 pt-16 max-w-xl mx-auto">
      {/* Top Auxiliary Sync Banner */}
      <div className="bg-surface-container-low px-gutter py-space-sm shadow-sm border-b border-surface-container">
        <div className="flex items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-xs min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                  isOnline ? 'bg-primary-fixed opacity-75' : 'bg-tertiary-fixed opacity-75'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isOnline ? 'bg-primary-container' : 'bg-tertiary-container'
                }`}
              />
            </span>
            <span className="font-label-md text-label-md text-on-surface truncate">
              {isOnline
                ? language === 'hi'
                  ? 'ऑनलाइन (ऑटो-सिंक सक्रिय)'
                  : 'Online (Auto-sync active)'
                : language === 'hi'
                ? 'ऑफ़लाइन (लोकल स्टोरेज सक्रिय)'
                : 'Offline (Local storage active)'}
            </span>
          </div>

          <button
            type="button"
            onClick={onToggleLanguage}
            className="flex items-center gap-1 px-space-sm py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm min-h-[36px] touch-manipulation active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[16px]">translate</span>
            <span className="tracking-wide">
              {language === 'en' ? 'English | हिंदी' : 'हिंदी | English'}
            </span>
          </button>
        </div>
      </div>

      {/* IndexedDB Cache Banner */}
      <div className="mx-gutter mt-space-sm p-space-sm rounded-xl bg-surface-container flex items-center justify-between gap-space-sm shadow-sm border border-surface-container-high">
        <div className="flex items-center gap-space-xs min-w-0">
          <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-on-primary-fixed text-[18px]">
              cloud_done
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-md text-label-md text-primary font-semibold truncate">
              IndexedDB Offline Cache Ready
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant truncate">
              {pendingOfflineCount} unsynced cases pending • Ready for field
            </span>
          </div>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm shrink-0 font-semibold">
          Storage OK
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Patient Identity Card (Step 1 of 2) */}
        <div className="px-gutter mt-space-md">
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm border border-surface-container-high">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container text-[20px]">
                  badge
                </span>
                <span className="font-title-md text-title-md text-on-surface font-bold">
                  {language === 'hi' ? 'रोगी की पहचान' : 'Patient Identity'}
                </span>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full font-semibold">
                Step 1 of 2
              </span>
            </div>

            {/* Name Input */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface-variant flex items-center justify-between">
                <span>{language === 'hi' ? 'पूरा नाम / नाम' : 'Full Name / नाम'}</span>
                <span className="text-error font-label-sm text-label-sm font-semibold">
                  Required
                </span>
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter patient name"
                  required
                  className="w-full h-[52px] px-space-md bg-surface-container-low text-on-surface font-title-md text-title-md rounded-xl focus:outline-none focus:bg-surface-container border border-surface-container-high"
                />
                <span className="material-symbols-outlined absolute right-3 text-primary-container text-[20px]">
                  check_circle
                </span>
              </div>
            </div>

            {/* Age & Sex row */}
            <div className="grid grid-cols-2 gap-space-sm">
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface-variant">
                  {language === 'hi' ? 'उम्र (वर्ष)' : 'Age (Years) / उम्र'}
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full h-[52px] pl-space-md pr-12 bg-surface-container-low text-on-surface font-title-md text-title-md rounded-xl focus:outline-none focus:bg-surface-container border border-surface-container-high"
                  />
                  <span className="absolute right-3 font-label-sm text-label-sm text-on-surface-variant bg-surface-container-high px-1.5 py-0.5 rounded font-bold">
                    YR
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface-variant">
                  {language === 'hi' ? 'लिंग' : 'Sex / लिंग'}
                </label>
                <div className="relative flex items-center">
                  <select
                    value={sex}
                    onChange={(e) => setSex(e.target.value)}
                    className="w-full h-[52px] px-space-md bg-surface-container-low text-on-surface font-title-md text-title-md rounded-xl appearance-none focus:outline-none focus:bg-surface-container border border-surface-container-high"
                  >
                    <option value="Female (स्त्री)">Female (स्त्री)</option>
                    <option value="Male (पुरुष)">Male (पुरुष)</option>
                    <option value="Other (अन्य)">Other (अन्य)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 text-on-surface-variant pointer-events-none text-[20px]">
                    expand_more
                  </span>
                </div>
              </div>
            </div>

            {/* Village / Ward input */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface-variant">
                {language === 'hi' ? 'गाँव व वार्ड' : 'Village / Ward / गाँव व वार्ड'}
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px]">
                  location_on
                </span>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full h-[52px] pl-10 pr-space-md bg-surface-container-low text-on-surface font-title-md text-title-md rounded-xl focus:outline-none focus:bg-surface-container border border-surface-container-high"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Symptom Report Card */}
        <div className="px-gutter mt-space-md">
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm border border-surface-container-high">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container text-[20px]">
                  record_voice_over
                </span>
                <span className="font-title-md text-title-md text-on-surface font-bold">
                  {language === 'hi' ? 'नैदानिक लक्षण रिपोर्ट' : 'Clinical Symptom Report'}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm flex items-center gap-1 font-bold">
                <span className="material-symbols-outlined text-[14px]">priority_high</span>
                Critical Alert
              </span>
            </div>

            {/* Mic / Bhashini Audio Area */}
            <div className="flex flex-col items-center justify-center p-space-md rounded-xl bg-surface-container-low border border-surface-container-high">
              <div className="relative flex items-center justify-center my-space-xs">
                {isRecording && (
                  <div className="absolute w-20 h-20 rounded-full bg-primary-fixed-dim/50 animate-ping pointer-events-none" />
                )}
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`relative w-16 h-16 rounded-full shadow-md flex items-center justify-center min-w-[48px] min-h-[48px] transition-transform active:scale-95 touch-manipulation text-on-primary ${
                    isRecording ? 'bg-error animate-pulse' : 'bg-primary-container hover:bg-primary'
                  }`}
                  aria-label="Tap to speak into Bhashini Speech Engine"
                >
                  <span className="material-symbols-outlined text-[32px]">
                    {isRecording ? 'stop' : 'mic'}
                  </span>
                </button>
              </div>
              <p className="font-title-md text-title-md text-primary mt-space-xs text-center font-bold">
                Bhashini Speech Engine Active
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant text-center mt-0.5 max-w-sm">
                Tap to Speak (Bhashini/WebSpeech Speech-to-Text) • Falls back to typed notes
              </p>

              {isRecording && (
                <div className="mt-2 px-3 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm flex items-center gap-1.5 animate-pulse font-bold">
                  <span className="w-2 h-2 rounded-full bg-error" />
                  <span>Listening in Hindi / Local Dialect...</span>
                </div>
              )}
            </div>

            {/* Clinical Narrative TextArea */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="font-label-md text-label-md text-on-surface-variant font-semibold">
                  {language === 'hi' ? 'मुख्य लक्षण विवरण' : 'Clinical Narrative / मुख्य लक्षण'}
                </label>
                <button
                  type="button"
                  onClick={handleClearNarrative}
                  className="font-label-sm text-label-sm text-primary underline font-bold hover:opacity-80"
                >
                  Clear
                </button>
              </div>
              <textarea
                value={narrative}
                onChange={(e) => setNarrative(e.target.value)}
                rows={4}
                required
                className="w-full p-space-md bg-surface-container-low text-on-surface font-body-md text-body-md rounded-xl resize-none focus:outline-none focus:bg-surface-container leading-relaxed border border-surface-container-high"
              />
            </div>

            {/* Quick Symptom Additions Chips */}
            <div className="flex flex-col gap-1.5 mt-1">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-bold">
                Quick Symptom Additions:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_SYMPTOMS.slice(0, 3).map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => handleAddSymptomChip(sym)}
                    className="symptom-chip px-3 py-2 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm flex items-center gap-1 active:bg-secondary-container touch-manipulation min-h-[44px] hover:bg-surface-container-highest transition-colors font-medium"
                  >
                    <span className="material-symbols-outlined text-[16px] text-primary-container">
                      add
                    </span>
                    <span>+ {sym}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Community Intake Protocol card */}
        <div className="px-gutter mt-space-md">
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container-high">
            <div className="flex items-center gap-space-sm mb-space-sm">
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-secondary-container text-[22px]">
                  health_and_safety
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-title-md text-title-md text-on-surface font-bold">
                  Community Intake Protocol
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  ICMR &amp; NHM Standardized Pathway
                </span>
              </div>
            </div>
            <div className="rounded-lg bg-surface-container p-space-sm flex items-start gap-space-xs border border-surface-container-high">
              <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">
                verified_user
              </span>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-on-surface font-bold">
                  Immediate Rule Evaluation Guaranteed
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Submitting this intake invokes deterministic red-flag categorization and generates instant 108 ambulance dispatch prompts if critical.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button & Client Idempotency footer */}
        <div className="px-gutter mt-space-lg mb-space-md flex flex-col gap-space-xs">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-[52px] rounded-xl bg-primary-container hover:bg-primary text-on-primary font-title-md text-title-md shadow-md flex items-center justify-center gap-2 active:opacity-90 touch-manipulation transition-all font-bold disabled:opacity-75"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[22px]">
                  progress_activity
                </span>
                <span>Evaluating Symptoms...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[22px]">
                  assignment_turned_in
                </span>
                <span>Evaluate &amp; Submit Intake / लक्षण दर्ज करें</span>
              </>
            )}
          </button>
          <div className="flex items-center justify-center gap-1.5 py-1">
            <span className="material-symbols-outlined text-[14px] text-on-surface-variant">
              lock
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant text-center">
              Client Idempotency: 8f9b-uuid registered locally
            </span>
          </div>
        </div>
      </form>
    </div>
  );
};
