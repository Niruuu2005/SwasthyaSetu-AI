import React, { useEffect, useState } from 'react';
import { PatientRecord, ReferralTokenData, UserProfile } from '../types';
import { ASSETS, INITIAL_REFERRAL_TOKEN } from '../data/mockData';

interface DispatchTrackerScreenProps {
  patient: PatientRecord;
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
  showToast: (msg: string) => void;
  referralToken?: ReferralTokenData | null;
  onConfirmArrival?: () => Promise<void>;
}

export const DispatchTrackerScreen: React.FC<DispatchTrackerScreenProps> = ({
  patient,
  currentUser,
  showToast,
  referralToken,
  onConfirmArrival,
}) => {
  const [tokenData, setTokenData] = useState<ReferralTokenData>(
    referralToken || INITIAL_REFERRAL_TOKEN,
  );
  const [isAdmitting, setIsAdmitting] = useState<boolean>(false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

  useEffect(() => {
    if (referralToken) setTokenData(referralToken);
  }, [referralToken]);

  const isFacilityStaff = currentUser.role === 'facility';

  const handleConfirmAdmission = async () => {
    if (!onConfirmArrival) {
      showToast('Confirm requires facility staff session');
      return;
    }
    setIsAdmitting(true);
    showToast('Confirming arrival with backend...');
    try {
      await onConfirmArrival();
      setTokenData((prev) => ({
        ...prev,
        isAdmitted: true,
        currentStep: 4,
        transitStatus: 'PATIENT ARRIVED & ADMITTED',
      }));
      showToast('Arrival confirmed on referral token');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Confirm failed');
    } finally {
      setIsAdmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full pb-28 pt-16 max-w-xl mx-auto">
      {/* Live Track Sub-header */}
      <div className="w-full bg-surface-container-low px-gutter py-space-sm flex items-center justify-between shadow-sm border-b border-surface-container">
        <div className="flex items-center gap-space-xs">
          <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-bold">
            ABDM Live Track
          </span>
        </div>
        <div className="flex items-center gap-space-xs bg-surface-container px-space-sm py-1 rounded-full shadow-sm border border-surface-container-high">
          <span
            className="material-symbols-outlined text-[16px] text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            wifi_tethering
          </span>
          <span className="font-label-sm text-label-sm text-primary font-bold">
            Live Sync • 12s ago
          </span>
        </div>
      </div>

      {/* Emergency Referral Token Card */}
      <div className="px-gutter pt-space-md pb-space-sm flex flex-col gap-space-sm">
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col gap-space-sm border border-surface-container-high">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide font-bold">
                Emergency Referral Token
              </span>
              <span className="font-title-lg text-title-lg text-primary tracking-tight font-bold">
                {tokenData.tokenId}
              </span>
            </div>
            <button
              onClick={() => setShowQrModal(true)}
              className="flex items-center gap-space-xs bg-surface-container-high hover:bg-surface-container-highest px-space-sm py-space-xs rounded-lg active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[20px] text-on-surface">
                qr_code_2
              </span>
              <span className="font-label-sm text-label-sm text-on-surface font-bold">
                QR PASS
              </span>
            </button>
          </div>

          <div className="flex items-center justify-between bg-surface-container-low p-space-xs rounded-lg border border-surface-container-high">
            <div className="flex items-center gap-2">
              <div className="flex gap-[2px] items-center h-5 px-1 bg-surface-container-lowest rounded">
                <div className="w-[2px] h-4 bg-on-surface"></div>
                <div className="w-[3px] h-4 bg-on-surface"></div>
                <div className="w-[1px] h-4 bg-on-surface"></div>
                <div className="w-[4px] h-4 bg-on-surface"></div>
                <div className="w-[2px] h-4 bg-on-surface"></div>
                <div className="w-[3px] h-4 bg-on-surface"></div>
                <div className="w-[1px] h-4 bg-on-surface"></div>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                BARCODE AUTH VERIFIED
              </span>
            </div>
            <span className="font-label-sm text-label-sm text-primary font-bold">
              ABHA {tokenData.abhaId}
            </span>
          </div>
        </div>
      </div>

      {/* Patient & Designated Target Facility Card */}
      <div className="px-gutter py-space-xs flex flex-col gap-space-sm">
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md border border-surface-container-high">
          <div className="flex items-start justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <img
                src={ASSETS.SUNITA_TRACKER}
                alt={patient.name}
                className="w-12 h-12 rounded-full object-cover shadow-sm shrink-0 ring-2 ring-primary/20"
              />
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-title-md text-title-md text-on-surface font-bold">
                    {patient.name}
                  </span>
                  <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                    ({patient.age})
                  </span>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  {tokenData.condition}
                </span>
              </div>
            </div>
            <div className="bg-error-container text-on-error-container px-space-sm py-1 rounded-full flex items-center gap-1 shrink-0">
              <span className="w-2 h-2 rounded-full bg-error" />
              <span className="font-label-sm text-label-sm font-bold uppercase">Red Flag</span>
            </div>
          </div>

          <div className="bg-surface-container-low p-space-sm rounded-lg flex items-start gap-space-sm border border-surface-container-high">
            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0 text-primary">
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                local_hospital
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
                Designated Target Facility
              </span>
              <span className="font-title-sm text-title-sm text-on-surface font-bold">
                {tokenData.facilityName}
              </span>
              <span className="font-body-sm text-body-sm text-primary-container font-semibold">
                {tokenData.facilityUnit}
              </span>
            </div>
          </div>

          {/* Transit Status Bar */}
          {!tokenData.isAdmitted ? (
            <div className="bg-tertiary-fixed text-on-tertiary-fixed p-space-sm rounded-lg shadow-sm flex items-center justify-between border border-tertiary-fixed-dim">
              <div className="flex items-center gap-space-sm">
                <div className="relative flex items-center justify-center w-7 h-7">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-tertiary-fixed-dim opacity-75 animate-ping" />
                  <span className="relative material-symbols-outlined text-[20px] text-tertiary">
                    ambulance
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm uppercase tracking-wide font-bold">
                    Transit Status
                  </span>
                  <span className="font-title-sm text-title-sm font-bold text-on-tertiary-fixed">
                    EN ROUTE (108 Ambulance)
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-label-sm text-label-sm uppercase opacity-80 block font-semibold">
                  ETA
                </span>
                <span className="font-title-md text-title-md font-bold text-tertiary">
                  {tokenData.etaMins} Mins
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-primary-fixed text-on-primary-fixed p-space-sm rounded-lg shadow-sm flex items-center justify-between border border-primary-fixed-dim">
              <div className="flex items-center gap-space-sm">
                <div className="w-7 h-7 rounded-full bg-primary-container flex items-center justify-center text-on-primary">
                  <span className="material-symbols-outlined text-[18px]">done_all</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm uppercase tracking-wide font-bold">
                    Facility Status
                  </span>
                  <span className="font-title-sm text-title-sm font-bold text-on-primary-fixed">
                    PATIENT ARRIVED &amp; ADMITTED
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-label-sm text-label-sm uppercase opacity-80 block font-semibold">
                  Ward 3
                </span>
                <span className="font-title-sm text-title-sm font-bold text-primary-container">
                  Bed #14
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Referral Care Pathway (Step 3 or 4 of 5) */}
      <div className="px-gutter py-space-sm">
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container-high">
          <div className="flex items-center justify-between pb-space-sm">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[20px]">
                conversion_path
              </span>
              <span className="font-title-sm text-title-sm text-on-surface font-bold">
                Referral Care Pathway
              </span>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
              Step {tokenData.isAdmitted ? '4' : '3'} of 5
            </span>
          </div>

          <div className="relative pl-6 flex flex-col gap-space-md py-space-xs">
            <div className="absolute left-2.5 top-3 bottom-3 w-[2px] bg-outline-variant" />

            {/* Step 1: Dispatched */}
            <div className="relative flex items-start gap-space-sm">
              <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm z-10">
                <span className="material-symbols-outlined text-[13px]">check</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-label-lg text-label-lg text-on-surface font-semibold">
                    Token Issued &amp; Case Dispatched
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                    10:14 AM
                  </span>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Triggered by ASHA Sunita Devi (Sub-center Belora)
                </span>
              </div>
            </div>

            {/* Step 2: Telemetry */}
            <div className="relative flex items-start gap-space-sm">
              <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm z-10">
                <span className="material-symbols-outlined text-[13px]">check</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-label-lg text-label-lg text-on-surface font-semibold">
                    Ambulance Telemetry Linked
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                    10:18 AM
                  </span>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Vehicle #{tokenData.ambulanceNumber} assigned • O2 telemetry live
                </span>
              </div>
            </div>

            {/* Step 3: Transit */}
            {!tokenData.isAdmitted ? (
              <div className="relative flex items-start gap-space-sm">
                <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary shadow-sm z-10 animate-bounce">
                  <span
                    className="material-symbols-outlined text-[13px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    near_me
                  </span>
                </div>
                <div className="flex flex-col bg-tertiary-fixed/30 p-space-xs rounded-lg w-full border border-tertiary-fixed">
                  <div className="flex items-center justify-between">
                    <span className="font-label-lg text-label-lg text-on-tertiary-fixed-variant font-bold">
                      En Route to Rampur
                    </span>
                    <span className="font-label-sm text-label-sm bg-tertiary-fixed text-on-tertiary-fixed font-bold px-1.5 py-0.5 rounded">
                      Active Now
                    </span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Patient in transit via Bypass Expressway (Speed: 54 km/h)
                  </span>
                </div>
              </div>
            ) : (
              <div className="relative flex items-start gap-space-sm">
                <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm z-10">
                  <span className="material-symbols-outlined text-[13px]">check</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-label-lg text-label-lg text-on-surface font-semibold">
                      En Route Transit Completed
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                      10:27 AM
                    </span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Ambulance arrived at Rampur Trauma Bay Gate 2
                  </span>
                </div>
              </div>
            )}

            {/* Step 4: Facility Arrival & Bed Admission */}
            <div
              className={`relative flex items-start gap-space-sm transition-all duration-300 ${
                tokenData.isAdmitted ? 'opacity-100' : 'opacity-60'
              }`}
            >
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-on-primary shadow-sm z-10 ${
                  tokenData.isAdmitted ? 'bg-primary' : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {tokenData.isAdmitted ? (
                  <span className="material-symbols-outlined text-[13px]">check</span>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-outline" />
                )}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-label-lg text-label-lg text-on-surface font-semibold">
                    Facility Arrival &amp; Bed Admission
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                    {tokenData.isAdmitted ? '10:28 AM' : 'Pending Handover'}
                  </span>
                </div>
                <span
                  className={`font-body-sm text-body-sm ${
                    tokenData.isAdmitted
                      ? 'text-primary-container font-semibold'
                      : 'text-on-surface-variant'
                  }`}
                >
                  {tokenData.isAdmitted
                    ? 'Admitted under Dr. Ramesh MO • Vitals logged in DH-EMR'
                    : 'Awaiting Hospital Triage Desk Confirmation'}
                </span>
              </div>
            </div>

            {/* Step 5: Clinical Discharge & Follow-up */}
            <div className="relative flex items-start gap-space-sm opacity-60">
              <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant z-10">
                <span className="w-2 h-2 rounded-full bg-outline" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-label-lg text-label-lg text-on-surface font-semibold">
                    Clinical Discharge &amp; Follow-up
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                    Final Stage
                  </span>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Automatic notification loop back to primary ASHA
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Admission Gate */}
      <div className="px-gutter py-space-sm">
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-md flex flex-col gap-space-md relative overflow-hidden border border-surface-container-high">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-space-xs bg-secondary-container text-on-secondary-container px-space-sm py-1 rounded-full">
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              <span className="font-label-sm text-label-sm font-semibold">
                Role View: Facility Staff
              </span>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
              Dr. Ramesh MO (DH Rampur)
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="font-title-md text-title-md text-on-surface font-bold">
              Emergency Admission Gate
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Handover verification requires direct clinical reception sign-off. This single action updates ABDM registry and alerts dispatch.
            </p>
          </div>

          {tokenData.isAdmitted ? (
            <div className="bg-primary-fixed text-on-primary-fixed p-space-sm rounded-lg flex items-center gap-space-sm transition-all border border-primary-fixed-dim">
              <span className="material-symbols-outlined text-primary-container text-[24px]">
                check_circle
              </span>
              <div className="flex flex-col">
                <span className="font-title-sm text-title-sm font-bold text-on-primary-fixed">
                  Arrival Logged &amp; Bed Confirmed
                </span>
                <span className="font-body-sm text-body-sm text-on-primary-fixed-variant">
                  POST /referral/{tokenData.tokenId}/confirm responded 200 OK.
                </span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={isAdmitting}
              onClick={handleConfirmAdmission}
              className="w-full min-h-[52px] bg-primary-container hover:bg-primary text-on-primary rounded-xl font-title-md text-title-md flex items-center justify-center gap-space-xs shadow-md active:scale-[0.98] transition-transform font-bold disabled:opacity-75 touch-manipulation"
            >
              {isAdmitting ? (
                <>
                  <span className="material-symbols-outlined text-[20px] animate-spin">
                    progress_activity
                  </span>
                  <span>Syncing with ABDM Gateway...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[22px]">domain_verification</span>
                  <span className="text-center">✓ Confirm Patient Arrival &amp; Admit (रोगी आगमन दर्ज करें)</span>
                </>
              )}
            </button>
          )}

          {!isFacilityStaff && (
            <div className="bg-surface-container-low p-space-sm rounded-lg flex items-start gap-space-xs border border-surface-container-high">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant shrink-0 mt-0.5">
                info
              </span>
              <p className="font-label-sm text-label-sm text-on-surface-variant leading-relaxed">
                <span className="font-bold text-on-surface">Role Safeguard Active:</span> When logged in as ASHA worker, this action is locked and view-only to prevent premature admission confirmations outside the hospital triage desk. (Staff override mode enabled for demo evaluation).
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ABDM Compliance Banner */}
      <div className="px-gutter py-space-sm">
        <div className="w-full bg-surface-container-high rounded-xl p-space-sm flex items-center justify-center gap-space-xs text-center border border-surface-container-highest">
          <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
          <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
            Closed-loop referral verified under Ayushman Bharat Digital Mission (ABDM)
          </span>
        </div>
      </div>

      {/* Back to top button */}
      <div className="px-gutter pb-space-xl pt-space-xs flex justify-center">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-1 text-primary hover:text-primary-container py-space-xs px-space-sm font-label-sm text-label-sm font-semibold uppercase active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
          <span>Back to Top</span>
        </button>
      </div>

      {/* QR Pass Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/70 backdrop-blur-sm flex items-center justify-center p-gutter">
          <div className="bg-surface-container-lowest rounded-xl max-w-xs w-full p-space-md shadow-2xl flex flex-col items-center text-center border border-surface-container-high">
            <span className="font-label-sm text-label-sm text-primary-container font-bold uppercase tracking-wider">
              ABDM Digital Health Token
            </span>
            <h4 className="font-title-lg font-bold text-primary mt-1">
              {tokenData.tokenId}
            </h4>

            {/* Visual QR Code Generator */}
            <div className="w-44 h-44 bg-white p-3 rounded-xl shadow-inner border border-surface-container-high my-3 flex flex-col items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* QR corner squares */}
                <rect x="5" y="5" width="28" height="28" fill="#003329" />
                <rect x="9" y="9" width="20" height="20" fill="white" />
                <rect x="13" y="13" width="12" height="12" fill="#003329" />

                <rect x="67" y="5" width="28" height="28" fill="#003329" />
                <rect x="71" y="9" width="20" height="20" fill="white" />
                <rect x="75" y="13" width="12" height="12" fill="#003329" />

                <rect x="5" y="67" width="28" height="28" fill="#003329" />
                <rect x="9" y="71" width="20" height="20" fill="white" />
                <rect x="13" y="75" width="12" height="12" fill="#003329" />

                {/* Simulated inner matrix dots */}
                <rect x="38" y="12" width="6" height="6" fill="#003329" />
                <rect x="48" y="18" width="8" height="6" fill="#003329" />
                <rect x="38" y="28" width="6" height="8" fill="#003329" />
                <rect x="48" y="38" width="8" height="8" fill="#003329" />
                <rect x="18" y="44" width="6" height="8" fill="#003329" />
                <rect x="28" y="52" width="8" height="6" fill="#003329" />
                <rect x="64" y="42" width="8" height="6" fill="#003329" />
                <rect x="76" y="50" width="6" height="8" fill="#003329" />
                <rect x="44" y="64" width="6" height="8" fill="#003329" />
                <rect x="56" y="74" width="8" height="8" fill="#003329" />
                <rect x="70" y="68" width="8" height="6" fill="#003329" />
                <rect x="82" y="78" width="6" height="6" fill="#003329" />
              </svg>
            </div>

            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Scan at reception triage kiosk for priority ICU lane clearance.
            </p>
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full mt-3 py-2.5 bg-primary-container text-on-primary rounded-lg font-bold text-sm"
            >
              Close Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
