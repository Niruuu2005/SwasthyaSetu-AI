import React, { useState } from 'react';
import { PatientRecord } from '../types';
import { ASSETS } from '../data/mockData';

interface TriageScreenProps {
  patient: PatientRecord;
  onNavigateToReferrals: () => void;
  showToast: (msg: string) => void;
}

export const TriageScreen: React.FC<TriageScreenProps> = ({
  patient,
  onNavigateToReferrals,
  showToast
}) => {
  const [isIssuing, setIsIssuing] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const handleIssueToken = () => {
    setIsIssuing(true);
    showToast('Validating Rules & Routing to Emergency Referral Hub...');

    setTimeout(() => {
      setIsIssuing(false);
      onNavigateToReferrals();
    }, 600);
  };

  return (
    <div className="flex flex-col w-full pb-28 pt-16 max-w-xl mx-auto">
      {/* Offline / Field Status Band */}
      <div className="w-full bg-tertiary-fixed text-on-tertiary-fixed px-gutter py-space-xs flex items-center justify-between shadow-sm border-b border-tertiary-fixed-dim">
        <div className="flex items-center gap-space-xs min-w-0">
          <span className="material-symbols-outlined text-[18px] text-tertiary">
            cloud_done
          </span>
          <span className="font-label-sm text-label-sm truncate font-semibold">
            Field Station: Rampur Sector Sub-Center (Block 4)
          </span>
        </div>
        <span className="font-label-sm text-label-sm bg-surface-container-lowest text-tertiary px-2 py-0.5 rounded-full shrink-0 font-bold">
          Protocol Active
        </span>
      </div>

      <div className="p-gutter flex flex-col gap-space-md">
        {/* Patient Identifier Card with Visual Thumbnail */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-center justify-between gap-space-sm border border-surface-container-high">
          <div className="flex items-center gap-space-sm min-w-0">
            <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 bg-surface-container-high ring-2 ring-primary/20">
              <img
                src={ASSETS.SUNITA_TRIAGE}
                alt={patient.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-error flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-surface-container-lowest animate-ping" />
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">
                  #{patient.caseId}
                </span>
                <span className="font-label-sm text-label-sm text-primary bg-primary-fixed px-1.5 py-0.5 rounded font-bold">
                  ABHA Linked
                </span>
              </div>
              <h2 className="font-title-lg text-title-lg text-on-surface font-bold truncate">
                {patient.name} ({patient.age})
              </h2>
              <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">pin_drop</span>
                {patient.village} • Anganwadi 03
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowHistoryModal(true)}
            aria-label="View Patient History"
            className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant active:scale-95 transition-transform shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">folder_shared</span>
          </button>
        </div>

        {/* HIGH-CONTRAST CLINICAL EMERGENCY BADGE (RED FLAG) */}
        <div className="bg-error text-on-error rounded-xl p-space-md shadow-md flex flex-col gap-space-sm relative overflow-hidden">
          {/* Ambient alert glow backdrop */}
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-surface-container-lowest/10 pointer-events-none" />
          <div className="flex items-start justify-between gap-space-xs z-10">
            <div className="flex items-center gap-space-xs">
              <div className="w-10 h-10 rounded-lg bg-surface-container-lowest/20 flex items-center justify-center shrink-0">
                <span
                  className="material-symbols-outlined text-[26px] text-surface-container-lowest"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  crisis_alert
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm tracking-wider uppercase text-surface-container-lowest/90 font-bold">
                  Immediate Statutory Escalation
                </span>
                <h1 className="font-headline-sm text-headline-sm leading-tight font-bold text-surface-container-lowest">
                  {patient.triageTitleEn}
                </h1>
                <span className="font-title-md text-title-md text-surface-container-lowest/95 font-semibold">
                  {patient.triageTitleHi}
                </span>
              </div>
            </div>
            <div className="h-8 px-2.5 rounded-full bg-surface-container-lowest text-error flex items-center gap-1 font-label-sm text-label-sm font-bold shadow-sm shrink-0">
              <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
              LEVEL 1 CRITICAL
            </div>
          </div>

          {/* Non-negotiable Legal Authority Mandate */}
          <div className="z-10 mt-space-xs bg-surface-container-lowest/15 backdrop-blur-sm rounded-lg p-space-xs flex items-center gap-space-xs">
            <span
              className="material-symbols-outlined text-[18px] text-surface-container-lowest shrink-0"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              gavel
            </span>
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm text-surface-container-lowest uppercase font-bold tracking-wide">
                Legal Compliance Attestation
              </span>
              <p className="font-body-sm text-body-sm text-surface-container-lowest font-medium leading-snug">
                Decided by:{' '}
                <span className="underline font-bold">
                  {patient.decisionSource === 'llm_assist'
                    ? 'LLM assist (advisory only — not safety authority)'
                    : 'Clinical Rule Engine (authoritative)'}
                </span>
                . AI never has legal triage authority for red-flag decisions.
              </p>
            </div>
          </div>
        </div>

        {/* Immediate Vitals Snapshot Graphic */}
        <div className="grid grid-cols-3 gap-space-xs">
          <div className="bg-surface-container-lowest p-space-sm rounded-xl flex flex-col shadow-sm border border-surface-container-high">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px]">favorite</span>
              <span className="font-label-sm text-label-sm bg-surface-container text-on-surface-variant px-1 py-0.2 rounded font-bold">
                {patient.vitals.hr ? patient.vitals.hrStatus : 'N/A'}
              </span>
            </div>
            <span className="font-headline-sm text-headline-sm text-on-surface font-bold mt-1">
              {patient.vitals.hr || '—'}
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
              HR (BPM)
            </span>
          </div>

          <div className="bg-surface-container-lowest p-space-sm rounded-xl flex flex-col shadow-sm border border-surface-container-high">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px]">air</span>
              <span className="font-label-sm text-label-sm bg-surface-container text-on-surface-variant px-1 py-0.2 rounded font-bold">
                {patient.vitals.spo2 ? patient.vitals.spo2Status : 'N/A'}
              </span>
            </div>
            <span className="font-headline-sm text-headline-sm text-on-surface font-bold mt-1">
              {patient.vitals.spo2 ? `${patient.vitals.spo2}%` : '—'}
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
              SpO₂ (if recorded)
            </span>
          </div>

          <div className="bg-surface-container-lowest p-space-sm rounded-xl flex flex-col shadow-sm border border-surface-container-high">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px]">speed</span>
              <span className="font-label-sm text-label-sm bg-surface-container text-on-surface-variant px-1 py-0.2 rounded font-bold">
                {patient.vitals.bp !== '—' ? patient.vitals.bpStatus : 'N/A'}
              </span>
            </div>
            <span className="font-headline-sm text-headline-sm text-on-surface font-bold mt-1">
              {patient.vitals.bp || '—'}
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
              BP (mmHg)
            </span>
          </div>
        </div>

        {/* Statutory Rule Hits Breakdown Card */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm border border-surface-container-high">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary-container text-[20px]">
                fact_check
              </span>
              <h3 className="font-title-md text-title-md text-on-surface font-bold">
                Deterministic Rule Hits
              </h3>
            </div>
            <span className="font-label-sm text-label-sm bg-surface-container text-on-surface-variant px-2 py-0.5 rounded-full font-semibold">
              {patient.rulesTriggered.length} Rules Triggered
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {patient.rulesTriggered.length === 0 ? (
              <p className="font-body-sm text-body-sm text-on-surface-variant px-1">
                No deterministic rule hits returned for this triage result.
              </p>
            ) : (
              patient.rulesTriggered.map((rule) => (
                <div
                  key={rule.code}
                  className={`${
                    rule.severity === 'critical'
                      ? 'bg-error-container text-on-error-container'
                      : 'bg-tertiary-fixed text-on-tertiary-fixed'
                  } p-space-xs rounded-lg flex items-center justify-between`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="material-symbols-outlined text-[18px] text-error shrink-0">
                      emergency
                    </span>
                    <span className="font-label-sm text-label-sm font-bold truncate">
                      {rule.code}: {rule.title}
                    </span>
                  </div>
                  <span className="font-label-sm text-label-sm bg-surface-container-lowest text-error px-2 py-0.5 rounded shrink-0 font-bold">
                    {rule.badge}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="bg-surface-container-low p-space-sm rounded-lg flex items-start gap-space-xs mt-1 border border-surface-container-high">
            <span className="material-symbols-outlined text-on-surface-variant text-[18px] shrink-0 mt-0.5">
              verified_user
            </span>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-bold uppercase">
                Clinical Justification &amp; Action Required
              </span>
              <p className="font-body-sm text-body-sm text-on-surface mt-0.5">
                Patient demonstrates sudden loss of consciousness with shallow respiration. Immediate tertiary care / oxygen stabilization mandated by National Triage Matrix 2024.
              </p>
            </div>
          </div>
        </div>

        {/* AI Field Advisory Synthesis (Strictly Non-Authoritative) */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm relative border border-surface-container-high">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded bg-secondary-container flex items-center justify-center text-on-secondary-container">
                <span className="material-symbols-outlined text-[16px]">psychology</span>
              </div>
              <span className="font-title-md text-title-md text-on-surface font-bold">
                AI Field Advisory Synthesis
              </span>
            </div>
            <span className="font-label-sm text-label-sm bg-surface-container text-secondary px-2 py-0.5 rounded-full font-bold">
              ASSIST ONLY
            </span>
          </div>

          <div className="bg-secondary-container/40 p-space-sm rounded-lg flex flex-col gap-space-xs border border-secondary-container">
            <div className="flex items-center gap-1 text-on-secondary-container">
              <span className="material-symbols-outlined text-[16px]">lightbulb</span>
              <span className="font-label-sm text-label-sm font-bold uppercase">
                Advisory LLM Assist (Non-Authoritative)
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface leading-relaxed">
              {patient.aiSummaryUnavailable
                ? 'AI summary unavailable, manual review needed'
                : patient.aiAdvisory}
            </p>
          </div>

          {/* Legal Honesty Disclaimer */}
          <div className="flex items-center gap-1.5 px-space-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-[14px] shrink-0 text-secondary">
              info
            </span>
            <p className="font-label-sm text-label-sm italic leading-tight">
              AI summary is advisory assist only. Clinical Rule Engine holds sole statutory referral authority under MoHFW digital protocol guidelines.
            </p>
          </div>
        </div>

        {/* Pathway notice — Tier-2 108 is simulated */}
        <div className="bg-surface-container-high rounded-xl p-space-md shadow-sm flex flex-col gap-space-xs border border-surface-container-highest">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-space-xs">
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">local_shipping</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-primary-container uppercase font-bold tracking-wider">
                  Referral pathway
                </span>
                <span className="font-title-md text-title-md text-on-surface font-bold">
                  {patient.triageLevel === 'RED_FLAG'
                    ? 'Escalate via facility referral token'
                    : 'Continue clinical workflow'}
                </span>
              </div>
            </div>
            <span className="font-label-sm text-label-sm bg-primary-fixed text-on-primary-fixed px-2 py-1 rounded font-bold shrink-0">
              {patient.decisionSource === 'rule_engine' ? 'RULE ENGINE' : 'ADVISORY'}
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            {patient.dispatchAlert.desk}. Live 108 / EMS dispatch is not connected in this build
            ({patient.dispatchAlert.ambulanceTag}).
          </p>
          <div className="mt-2 flex items-center justify-between pt-2 text-on-surface-variant border-t border-surface-container">
            <div className="flex items-center gap-1 font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px] text-primary">
                fact_check
              </span>
              <span>Source: {patient.reasoningSummary || patient.aiAdvisory || 'triage result'}</span>
            </div>
          </div>
        </div>

        {/* Field Companion Card / Photo Preview of Facility Handover Target */}
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm flex flex-col border border-surface-container-high">
          <div className="relative w-full h-32 bg-surface-container-high">
            <img
              src={ASSETS.HOSPITAL_TRAUMA}
              alt="District Civil Hospital Trauma Center"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent flex items-end p-space-sm">
              <div className="flex items-center justify-between w-full text-white">
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-white/80">
                    Primary Destination
                  </span>
                  <span className="font-title-md text-title-md font-bold text-white leading-tight">
                    District Civil Hospital Trauma Center
                  </span>
                </div>
                <span className="font-label-sm text-label-sm bg-error px-2 py-0.5 rounded font-bold text-white">
                  ICU Beds: 3 Avail
                </span>
              </div>
            </div>
          </div>
          <div className="p-space-sm flex items-center justify-between">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Transit Distance: 11.2 km via State Hwy 4
            </span>
            <button
              type="button"
              onClick={() => showToast('Opening GIS NH-31 Bypass Route Map...')}
              className="font-label-sm text-label-sm text-primary-container font-bold flex items-center gap-0.5 py-1 px-2 rounded hover:bg-surface-container active:scale-95 transition-all"
            >
              Route Map <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Sticky Primary Bottom Action */}
        <div className="mt-space-sm pb-space-lg flex flex-col gap-2">
          <button
            type="button"
            disabled={isIssuing}
            onClick={handleIssueToken}
            className="w-full min-h-[52px] bg-primary-container hover:bg-primary text-on-primary rounded-xl flex items-center justify-center gap-space-xs font-title-md text-title-md font-bold shadow-md active:scale-[0.98] transition-transform touch-manipulation disabled:opacity-75"
          >
            {isIssuing ? (
              <>
                <span className="material-symbols-outlined text-[20px] animate-spin">
                  progress_activity
                </span>
                <span>Connecting to Hospital Dispatch...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[22px]">
                  assignment_turned_in
                </span>
                <span>Select Facility &amp; Issue Referral Token →</span>
              </>
            )}
          </button>
          <div className="flex items-center justify-center gap-space-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-tertiary">lock</span>
            <span className="font-label-sm text-label-sm text-center">
              Tamper-evident audit log recorded under NDHM Ayushman Bharat
            </span>
          </div>
        </div>
      </div>

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/70 backdrop-blur-sm flex items-center justify-center p-gutter">
          <div className="bg-surface-container-lowest rounded-xl max-w-sm w-full p-space-md shadow-2xl border border-surface-container-high animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">medical_information</span>
                <h3 className="font-title-md font-bold text-on-surface">ABHA Patient Card</h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="py-3 text-sm flex flex-col gap-2">
              <p><strong>Name:</strong> {patient.name} ({patient.age})</p>
              <p><strong>ABHA Number:</strong> {patient.abhaId}</p>
              <p><strong>Village:</strong> {patient.village}</p>
              <p><strong>Obstetric History:</strong> G2P1 • 34 Weeks Gestation</p>
              <p><strong>Allergies:</strong> Nil known drug allergies recorded</p>
              <p><strong>Prior ANC:</strong> 3 visits recorded at Pipra Sub-Center</p>
            </div>
            <button
              onClick={() => setShowHistoryModal(false)}
              className="w-full mt-2 py-2 bg-primary-container text-on-primary rounded-lg font-bold text-sm"
            >
              Close History Card
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
