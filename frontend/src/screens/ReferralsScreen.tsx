import React, { useEffect, useState } from 'react';
import { Facility, PatientRecord } from '../types';
import { FACILITIES } from '../data/mockData';

interface ReferralsScreenProps {
  patient: PatientRecord;
  facilities?: Facility[];
  onOpenTracker: (facilityId: string, tokenId: string) => void;
  onIssueReferral: (facilityId: string) => Promise<{ tokenId: string }>;
  showToast: (msg: string) => void;
}

export const ReferralsScreen: React.FC<ReferralsScreenProps> = ({
  patient,
  facilities,
  onOpenTracker,
  onIssueReferral,
  showToast
}) => {
  const list = facilities && facilities.length > 0 ? facilities : FACILITIES;
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(list[0]?.id || '');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [issuedTokenId, setIssuedTokenId] = useState<string>('');

  useEffect(() => {
    if (list[0]?.id) setSelectedFacilityId(list[0].id);
  }, [list]);

  const selectedFacility = list.find((f) => f.id === selectedFacilityId) || list[0];

  const handleIssueToken = async () => {
    if (!selectedFacility) {
      showToast('No facility available');
      return;
    }
    setIsSubmitting(true);
    showToast('Issuing referral token via backend...');
    try {
      const { tokenId } = await onIssueReferral(selectedFacility.id);
      setIssuedTokenId(tokenId);
      setShowModal(true);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Referral failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProceedToTracker = () => {
    setShowModal(false);
    onOpenTracker(selectedFacilityId, issuedTokenId);
  };

  return (
    <div className="flex flex-col w-full pb-28 pt-16 max-w-xl mx-auto">
      {/* Offline / Sync Micro-bar */}
      <div className="bg-surface-container-high px-gutter py-space-xs flex items-center justify-between shadow-sm border-b border-surface-container-highest">
        <div className="flex items-center gap-space-xs">
          <span className="w-2 h-2 rounded-full bg-primary-container animate-ping" />
          <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
            Live Dispatch Link Active
          </span>
        </div>
        <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
          GPS: NH-31 Corridor
        </span>
      </div>

      {/* Critical Patient Context Strip (Red Flag Emergency) */}
      <div className="px-gutter pt-space-sm pb-space-xs">
        <div className="bg-error-container rounded-xl p-space-md shadow-sm border border-error/20">
          <div className="flex items-start justify-between gap-space-xs mb-space-xs">
            <div className="flex items-center gap-space-xs min-w-0">
              <span
                className="material-symbols-outlined text-error text-[22px] shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                e911_emergency
              </span>
              <span className="font-label-sm text-label-sm bg-error text-on-error px-space-xs py-0.5 rounded uppercase tracking-wider font-bold">
                Red Flag Emergency
              </span>
            </div>
            <span className="font-label-sm text-label-sm text-on-error-container font-semibold tracking-wide shrink-0">
              #{patient.caseId}
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <h2 className="font-title-lg text-title-lg text-on-error-container font-bold truncate">
              {patient.name}, {patient.age}
            </h2>
            <span className="font-label-md text-label-md text-on-error-container font-medium">
              G2P1 • 34 Wks
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-error-container mt-0.5 line-clamp-1 opacity-90">
            BP {patient.vitals.bp} mmHg • Severe Eclampsia with Hyperreflexia • Urgent tertiary ICU bed required
          </p>
        </div>
      </div>

      {/* Filter & Strategy Ribbon */}
      <div className="px-gutter py-space-xs flex items-center justify-between">
        <div className="flex items-center gap-space-xs min-w-0">
          <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
            tune
          </span>
          <p className="font-label-sm text-label-sm text-on-surface-variant truncate">
            District: <span className="text-on-surface font-bold">demo-district</span> • Sorted by Clinical Readiness
          </p>
        </div>
        <span className="font-label-sm text-label-sm text-primary-container bg-primary-fixed px-space-xs py-0.5 rounded-full font-bold shrink-0">
          3 Centers
        </span>
      </div>

      {/* Route Overview Map Panel */}
      <div className="px-gutter pt-space-xs pb-space-sm">
        <div className="relative w-full h-28 rounded-xl overflow-hidden shadow-sm bg-[#22443a] border border-surface-container-high flex flex-col justify-end">
          {/* Simulated highway graphic background */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#114b3e] via-[#1a3830] to-[#255245] opacity-95 flex items-center justify-center">
            {/* Map highway line drawing */}
            <svg className="w-full h-full opacity-30 pointer-events-none" viewBox="0 0 300 100" preserveAspectRatio="none">
              <path d="M 10,80 Q 80,20 150,50 T 290,20" fill="none" stroke="#b6eedc" strokeWidth="4" strokeDasharray="6,4" />
              <circle cx="20" cy="75" r="5" fill="#ffdcc3" />
              <circle cx="280" cy="22" r="7" fill="#b6eedc" />
            </svg>
          </div>

          <div className="relative z-10 p-space-sm bg-gradient-to-t from-inverse-surface/90 via-inverse-surface/50 to-transparent">
            <div className="flex items-center justify-between text-surface-bright">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary-fixed-dim text-[18px]">
                  navigation
                </span>
                <span className="font-label-sm text-label-sm font-semibold">
                  Priority Transit Route: NH-31 Green Corridor
                </span>
              </div>
              <span className="font-label-sm text-label-sm bg-inverse-surface/90 text-primary-fixed px-1.5 py-0.5 rounded font-bold">
                Fastest 24m
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Facilities Interactive Selection List */}
      <div className="px-gutter flex flex-col gap-space-sm">
        {list.map((facility: Facility) => {
          const isSelected = selectedFacilityId === facility.id;
          const isDeprioritized = facility.deprioritized;

          if (isDeprioritized) {
            return (
              <div
                key={facility.id}
                className="rounded-xl p-space-md bg-surface-container-highest/60 opacity-80 border border-surface-container-highest"
              >
                <div className="flex items-center justify-between gap-space-xs mb-space-xs">
                  <span className="font-label-sm text-label-sm bg-surface-container text-on-surface-variant px-space-xs py-0.5 rounded font-bold uppercase tracking-wider">
                    {facility.tier}
                  </span>
                  <span className="material-symbols-outlined text-error text-[18px]">
                    block
                  </span>
                </div>
                <div>
                  <h3 className="font-title-md text-title-md text-on-surface-variant font-semibold">
                    {facility.name}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    {facility.distanceKm} km ({facility.travelMins} mins) • {facility.tags[0]}
                  </p>
                </div>
                <div className="mt-space-sm bg-error-container/40 p-space-xs rounded flex items-center gap-space-xs border border-error-container">
                  <span className="material-symbols-outlined text-error text-[16px] shrink-0">
                    do_not_disturb_on
                  </span>
                  <span className="font-label-sm text-label-sm text-on-error-container font-medium leading-tight">
                    {facility.deprioritizedReason}
                  </span>
                </div>
              </div>
            );
          }

          return (
            <label
              key={facility.id}
              onClick={() => setSelectedFacilityId(facility.id)}
              className="relative block cursor-pointer transition-all"
            >
              <input
                type="radio"
                name="selected_facility"
                value={facility.id}
                checked={isSelected}
                onChange={() => setSelectedFacilityId(facility.id)}
                className="sr-only"
              />
              <div
                className={`rounded-xl p-space-md shadow-sm transition-all border ${
                  isSelected
                    ? 'bg-surface-container-low border-primary ring-2 ring-primary/20 shadow-md'
                    : 'bg-surface-container-lowest border-surface-container-high hover:border-outline'
                }`}
              >
                {/* Header ribbon */}
                <div className="flex items-center justify-between gap-space-xs mb-space-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {facility.recommended ? (
                      <span className="inline-flex items-center gap-1 bg-primary-container text-on-primary font-label-sm text-label-sm px-space-xs py-0.5 rounded font-bold">
                        <span className="material-symbols-outlined text-[14px]">verified</span>
                        <span>AI RECOMMENDED</span>
                      </span>
                    ) : (
                      <span className="font-label-sm text-label-sm bg-tertiary-fixed text-on-tertiary-fixed px-space-xs py-0.5 rounded font-bold uppercase tracking-wider">
                        Stabilization Unit Only
                      </span>
                    )}
                    <span className="font-label-sm text-label-sm text-primary-container font-bold uppercase tracking-wider">
                      {facility.tier}
                    </span>
                  </div>

                  {/* Radio Checkbox Indicator */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-primary-container text-on-primary'
                        : 'bg-surface-container-highest text-on-surface-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                  </div>
                </div>

                {/* Name & Distance */}
                <div className="mb-space-xs">
                  <h3 className="font-title-lg text-title-lg text-primary font-bold leading-snug">
                    {facility.name}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-[15px] text-primary">
                      near_me
                    </span>
                    <span className="font-bold text-on-surface">{facility.distanceKm} km</span>
                    <span>({facility.travelMins} mins via {facility.route})</span>
                  </p>
                </div>

                {/* Metric Badges Row */}
                <div className="flex flex-wrap gap-1.5 mb-space-sm">
                  {facility.tags.map((tag) => {
                    const isNoIcu = tag.includes('No ICU');
                    return (
                      <span
                        key={tag}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold ${
                          isNoIcu
                            ? 'bg-error-container text-on-error-container'
                            : facility.recommended
                            ? 'bg-primary-fixed text-on-primary-fixed'
                            : 'bg-surface-container-highest text-on-surface-variant'
                        }`}
                      >
                        {tag.includes('ICU & O2') && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
                        )}
                        {tag.includes('24x7') && (
                          <span className="material-symbols-outlined text-[12px]">medical_services</span>
                        )}
                        {tag.includes('CT &') && (
                          <span className="material-symbols-outlined text-[12px]">radiology</span>
                        )}
                        {isNoIcu && (
                          <span className="material-symbols-outlined text-[12px]">cancel</span>
                        )}
                        {tag}
                      </span>
                    );
                  })}
                </div>

                {/* Duty Clinical Staff & Drug Stock Tonal Box */}
                {facility.activeDoctor && (
                  <div className="bg-surface-container rounded-lg p-space-sm flex flex-col gap-space-xs border border-surface-container-high">
                    <div className="flex items-start gap-space-xs">
                      <span className="material-symbols-outlined text-primary-container text-[18px] shrink-0 mt-0.5">
                        person_celebrate
                      </span>
                      <div className="min-w-0">
                        <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider block">
                          Doctor on Active Shift
                        </span>
                        <p className="font-body-sm text-body-sm text-on-surface font-bold truncate">
                          {facility.activeDoctor}
                        </p>
                      </div>
                    </div>
                    {facility.criticalMedsStock && (
                      <div className="flex items-start gap-space-xs pt-1 border-t border-surface-container-high">
                        <span className="material-symbols-outlined text-primary-container text-[18px] shrink-0 mt-0.5">
                          inventory_2
                        </span>
                        <div className="min-w-0">
                          <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider block">
                            Critical Meds Stock
                          </span>
                          <p className="font-body-sm text-body-sm text-on-surface font-medium truncate">
                            {facility.criticalMedsStock}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Transfer notice if any */}
                {facility.notice && (
                  <div className="bg-surface-container-high rounded-lg p-space-sm flex items-start gap-space-xs mt-2 border border-surface-container-highest">
                    <span className="material-symbols-outlined text-tertiary-container text-[18px] shrink-0 mt-0.5">
                      info
                    </span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      <strong className="text-on-surface">Transfer Advisory:</strong> {facility.notice.replace('Transfer Advisory: ', '')}
                    </p>
                  </div>
                )}

                {/* Verified Badge Footer */}
                <div className="flex items-center justify-between mt-space-sm pt-space-xs">
                  <div className="flex items-center gap-1 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[15px] text-primary-container">
                      sync_saved_locally
                    </span>
                    <span className="font-label-sm text-label-sm">
                      Bed status auto-validated {facility.statusValidatedMinsAgo}m ago
                    </span>
                  </div>
                  <span className="font-label-sm text-label-sm font-bold text-primary-container underline">
                    {facility.protocolCode}
                  </span>
                </div>
              </div>
            </label>
          );
        })}
      </div>

      {/* Sticky Bottom Trigger Bar */}
      <div className="sticky bottom-20 z-40 px-gutter pt-space-sm pb-space-xs bg-surface/95 backdrop-blur-md border-t border-surface-container">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleIssueToken}
          className="w-full min-h-[52px] px-space-md py-3 bg-primary-container hover:bg-primary active:scale-[0.99] text-on-primary rounded-xl font-headline-sm text-headline-sm flex items-center justify-center gap-space-xs shadow-lg transition-all touch-manipulation disabled:opacity-75"
        >
          {isSubmitting ? (
            <span className="material-symbols-outlined animate-spin text-[24px]">
              progress_activity
            </span>
          ) : (
            <span className="material-symbols-outlined text-[24px]">send_and_archive</span>
          )}
          <div className="flex flex-col text-left leading-tight min-w-0">
            <span className="font-bold text-on-primary truncate">
              Issue Referral Token &amp; Notify Hospital
            </span>
            <span className="font-label-sm text-label-sm text-on-primary-container truncate font-medium">
              टोकन जारी करें • Emergency Dispatch Pre-alert
            </span>
          </div>
        </button>

        {/* HMIS Data Notice Footer */}
        <div className="text-center mt-space-xs">
          <p className="font-label-sm text-label-sm text-on-surface-variant opacity-80 flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[14px]">cloud_sync</span>
            <span>Demo availability data simulated from HMIS portal mock</span>
          </p>
        </div>
      </div>

      {/* Closed Loop Token Generated Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/70 backdrop-blur-sm flex items-center justify-center p-gutter">
          <div className="bg-surface-container-lowest rounded-xl max-w-sm w-full p-space-lg shadow-2xl flex flex-col items-center text-center border border-surface-container-high animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-primary-fixed flex items-center justify-center text-primary-container mb-space-sm shadow-sm">
              <span className="material-symbols-outlined text-[32px]">task_alt</span>
            </div>
            <span className="font-label-sm text-label-sm text-primary-container font-bold uppercase tracking-wider">
              Referral Dispatched
            </span>
            <h4 className="font-headline-sm text-headline-sm text-primary font-bold mt-1">
              Token #{issuedTokenId || 'pending'}
            </h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">
              Emergency desk at <strong>{selectedFacility.name}</strong> notified. ICU Bed #02 and Dr. Sharma pre-alerted.
            </p>

            <div className="w-full bg-surface-container rounded-lg p-space-sm my-space-md text-left flex flex-col gap-1 border border-surface-container-high">
              <div className="flex justify-between font-label-sm text-label-sm">
                <span className="text-on-surface-variant">Direct Ambulance Desk:</span>
                <span className="font-bold text-primary">+91 108 (Pre-routed)</span>
              </div>
              <div className="flex justify-between font-label-sm text-label-sm">
                <span className="text-on-surface-variant">Transit Window:</span>
                <span className="font-bold text-error">ETA {selectedFacility.travelMins} mins</span>
              </div>
            </div>

            <div className="w-full flex flex-col gap-space-xs">
              <button
                type="button"
                onClick={handleProceedToTracker}
                className="w-full min-h-[48px] bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg rounded-lg font-bold flex items-center justify-center gap-1 active:scale-98 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
                <span>View Digital Handover Slip</span>
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full min-h-[44px] bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm rounded-lg font-semibold transition-colors"
              >
                Dismiss &amp; Monitor Vitals
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
