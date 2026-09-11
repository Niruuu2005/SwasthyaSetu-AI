import React, { useEffect, useState } from 'react';
import { ASSETS } from '../data/mockData';
import type { DashboardResponse } from '../api/clinical';

interface DashboardScreenProps {
  showToast: (msg: string) => void;
  dashboard?: DashboardResponse | null;
  onRefresh?: () => Promise<void>;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  showToast,
  dashboard,
  onRefresh,
}) => {
  const [showBroadcastModal, setShowBroadcastModal] = useState<boolean>(false);
  const [broadcastText, setBroadcastText] = useState<string>(
    'Priority Advisory: Monsoon vector surge detected in Block 4. Initiate fever door-to-door triage protocols.'
  );
  const [showDropoutModal, setShowDropoutModal] = useState<boolean>(false);

  useEffect(() => {
    void onRefresh?.();
  }, [onRefresh]);

  const funnel = dashboard?.funnel || {};
  const intakeCount = dashboard?.intake_count ?? 0;
  const redFlagCount = dashboard?.red_flag_count ?? 0;
  const arrived = funnel.arrived ?? 0;
  const issued = funnel.issued ?? 0;
  const treated = funnel.treated ?? 0;
  const noShow = funnel.no_show ?? 0;

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    setShowBroadcastModal(false);
    showToast('Broadcast UI only — not connected to a push service yet');
  };

  const handleExport = () => {
    showToast('Export is not wired to a download endpoint yet');
  };

  return (
    <div className="flex flex-col w-full pb-28 pt-16 max-w-xl mx-auto">
      {/* Live Sync & Network Anchor Banner */}
      <div className="w-full bg-surface-container px-gutter py-space-sm flex items-center justify-between shadow-sm border-b border-surface-container-high">
        <div className="flex items-center gap-space-xs min-w-0">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-container" />
          </span>
          <p className="font-label-sm text-label-sm text-on-surface-variant truncate">
            District dashboard from live API
          </p>
        </div>
        <div className="flex items-center gap-1 bg-surface-container-highest px-space-xs py-0.5 rounded-full shrink-0">
          <span className="material-symbols-outlined text-primary text-[14px]">cell_tower</span>
          <span className="font-label-sm text-label-sm text-primary font-bold">
            {intakeCount} intakes
          </span>
        </div>
      </div>

      {/* Operational Context Header */}
      <div className="px-gutter pt-space-md pb-space-sm flex flex-col gap-space-xs">
        <div className="flex items-center justify-between">
          <div className="flex flex-col min-w-0">
            <span className="font-label-md text-label-md text-on-surface-variant tracking-wider uppercase font-semibold">
              Administrative Zone
            </span>
            <h1 className="font-headline-sm text-headline-sm text-primary leading-tight truncate font-bold">
              District: Rampur (demo-district)
            </h1>
          </div>
          <button
            type="button"
            onClick={() => showToast('Date range: Today (00:00 - 23:59 IST)')}
            className="h-10 px-space-md rounded-lg bg-surface-container-high text-on-surface-variant flex items-center gap-1 font-label-md text-label-md active:bg-surface-container-highest transition-colors min-h-[44px] font-semibold border border-surface-container-highest"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            <span>Today</span>
          </button>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Chief District Medical Officer (CDMO) Field Oversight Panel • MoHFW Command Network
        </p>
      </div>

      {/* Hero Photo Visual Anchor: Frontline Reality */}
      <div className="px-gutter mb-space-md">
        <div className="relative w-full h-36 rounded-xl overflow-hidden shadow-md bg-surface-container-high border border-surface-container-high">
          <img
            src={ASSETS.CDMO_HERO}
            alt="Frontline ASHA Worker"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/40 to-transparent flex items-end p-space-md">
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col text-on-primary">
                <span className="font-label-sm text-label-sm text-primary-fixed-dim font-bold">
                  ASHA Sanchar Cadre
                </span>
                <span className="font-title-md text-title-md font-bold leading-tight">
                  {intakeCount} intakes • {redFlagCount} red-flag
                </span>
              </div>
              <span className="bg-primary-container/85 backdrop-blur-md text-primary-fixed text-label-sm font-label-sm px-2.5 py-1 rounded-full flex items-center gap-1 font-bold border border-primary-fixed/30">
                <span className="material-symbols-outlined text-[14px]">health_and_safety</span>
                Live funnel
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Metric Bento Grid */}
      <div className="px-gutter grid grid-cols-1 gap-space-sm mb-space-lg">
        {/* Metric 1: Total Intakes */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden flex items-center justify-between border border-surface-container-high">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-primary-container" />
              <span className="font-label-md text-label-md text-on-surface-variant font-semibold">
                Total Field Intakes
              </span>
            </div>
            <div className="flex items-baseline gap-space-xs">
              <span className="font-headline-lg-mobile text-headline-lg-mobile text-primary font-bold">
                {intakeCount.toLocaleString()}
              </span>
              <span className="bg-surface-container-high text-primary-container font-label-sm text-label-sm px-1.5 py-0.5 rounded flex items-center font-bold">
                Live
              </span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              From backend dashboard for {dashboard?.district_id || 'demo-district'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center shrink-0 text-primary-container border border-surface-container-high">
            <span className="material-symbols-outlined text-[26px]">groups</span>
          </div>
        </div>

        {/* Dual Metric Row */}
        <div className="grid grid-cols-2 gap-space-sm">
          {/* Metric 2: Red Flag Cases */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between relative overflow-hidden border border-surface-container-high">
            <div className="absolute top-0 inset-x-0 h-1 bg-error" />
            <div>
              <div className="flex items-center gap-1 mb-1">
                <span className="material-symbols-outlined text-error text-[16px]">
                  emergency
                </span>
                <span className="font-label-sm text-label-sm text-error font-bold">
                  Red Flag Cases
                </span>
              </div>
              <span className="font-headline-md text-headline-md text-error font-bold block">
                {redFlagCount}
              </span>
            </div>
            <div className="mt-space-xs">
              <div className="inline-flex items-center px-1.5 py-0.5 rounded bg-error-container text-on-error-container font-label-sm text-label-sm font-bold">
                Live red_flag risk scores
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant block mt-1 font-medium">
                High clinical urgency
              </span>
            </div>
          </div>

          {/* Metric 3: Loop Closed */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between relative overflow-hidden border border-surface-container-high">
            <div className="absolute top-0 inset-x-0 h-1 bg-primary-container" />
            <div>
              <div className="flex items-center gap-1 mb-1">
                <span className="material-symbols-outlined text-primary-container text-[16px]">
                  verified
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">
                  Care Loop Closed
                </span>
              </div>
              <span className="font-headline-md text-headline-md text-primary font-bold block">
                89.4%
              </span>
            </div>
            <div className="mt-space-xs">
              <div className="inline-flex items-center px-1.5 py-0.5 rounded bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm font-bold">
                High-trust loop
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant block mt-1 font-medium">
                Arrived &amp; Treated
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stepped Referral Funnel Section */}
      <div className="px-gutter mb-space-lg">
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container-high">
          <div className="flex items-center justify-between mb-space-md">
            <div className="flex items-center gap-space-xs">
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  filter_alt
                </span>
              </div>
              <div>
                <h2 className="font-title-md text-title-md text-on-surface font-bold">
                  District Referral Funnel
                </h2>
                <p className="font-label-sm text-label-sm text-on-surface-variant">
                  Intake to Tertiary Resolution Journey
                </p>
              </div>
            </div>
            <button
              onClick={() => showToast('Funnel calculates dropouts across the 5 statutory care milestones.')}
              className="text-on-surface-variant hover:text-primary"
            >
              <span className="material-symbols-outlined text-[20px]">info</span>
            </button>
          </div>

          {/* Funnel Steps Visualizer */}
          <div className="flex flex-col gap-space-md">
            {/* Step 1: Intakes Logged */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-body-sm font-body-sm">
                <span className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary" /> Step 1: Intakes Logged
                </span>
                <span className="text-on-surface font-bold">
                  {intakeCount} <span className="font-normal text-on-surface-variant">(intakes)</span>
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-surface-container-high overflow-hidden">
                <div className="h-full bg-primary rounded-full w-full transition-all duration-500" />
              </div>
            </div>

            {/* Step 2: Referrals Issued */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-body-sm font-body-sm">
                <span className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-secondary" /> Step 2: Referrals Issued
                </span>
                <span className="text-on-surface font-bold">
                  {issued} <span className="font-normal text-on-surface-variant">(issued)</span>
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-surface-container-high overflow-hidden">
                <div
                  className="h-full bg-secondary rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, issued ? 40 + issued * 5 : 8)}%` }}
                />
              </div>
            </div>

            {/* Step 3: En Route / In Transit */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-body-sm font-body-sm">
                <span className="font-label-md text-label-md text-tertiary-container font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-on-tertiary-container animate-pulse" /> Step 3: En Route / In Transit
                </span>
                <span className="text-tertiary font-bold">
                  {funnel.en_route ?? 0} <span className="font-normal text-on-surface-variant">(en_route)</span>
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-surface-container-high overflow-hidden">
                <div
                  className="h-full bg-tertiary rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (funnel.en_route ?? 0) ? 30 : 6)}%` }}
                />
              </div>
            </div>

            {/* Step 4: Arrived at Facility */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-body-sm font-body-sm">
                <span className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary-container" /> Step 4: Arrived at Facility
                </span>
                <span className="text-on-surface font-bold">
                  {arrived} <span className="text-primary-container font-bold">(arrived)</span>
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-surface-container-high overflow-hidden">
                <div
                  className="h-full bg-primary-container rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, arrived ? 50 + arrived * 5 : 8)}%` }}
                />
              </div>
            </div>

            {/* Step 5: Treated & Closed */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-body-sm font-body-sm">
                <span className="font-label-md text-label-md text-primary font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-surface-tint" /> Step 5: Treated &amp; Closed
                </span>
                <span className="text-primary font-bold">
                  {treated} <span className="text-surface-tint font-bold">(treated) · no_show {noShow}</span>
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-surface-container-high overflow-hidden">
                <div
                  className="h-full bg-surface-tint rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, treated ? 40 + treated * 5 : 6)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Actionable Dropout / Red Flag Intervention Callout */}
          <div className="mt-space-md p-space-sm rounded-lg bg-surface-container-high flex items-start gap-space-sm border border-surface-container-highest">
            <div className="w-8 h-8 rounded-full bg-error-container flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-on-error-container text-[18px]">
                person_alert
              </span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-error font-bold">
                  Referral gap (issued − arrived)
                </span>
                <span className="font-label-sm text-label-sm bg-error-container text-on-error-container px-1.5 py-0.5 rounded font-bold">
                  {Math.max(0, issued - arrived)} open
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface mt-0.5">
                From live funnel: {issued} issued, {arrived} arrived, {noShow} marked no-show,{' '}
                {treated} treated.
              </p>
              <div className="mt-space-xs flex gap-space-xs flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowDropoutModal(true)}
                  className="px-space-sm py-1 rounded bg-primary-container text-on-primary font-label-sm text-label-sm font-bold min-h-[36px] active:scale-95 transition-transform"
                >
                  Review open ({Math.max(0, issued - arrived)})
                </button>
                <button
                  type="button"
                  onClick={() => showToast('GIS map is not connected in this build')}
                  className="px-space-sm py-1 rounded bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm min-h-[36px] active:scale-95 transition-transform font-bold"
                >
                  View Geographic Heatmap
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Facility Bed & Oxygen Readiness */}
      <div className="px-gutter mb-space-lg">
        <div className="flex items-center justify-between mb-space-sm">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[20px]">domain</span>
            <h2 className="font-title-md text-title-md text-on-surface font-bold">
              Facility Bed &amp; Oxygen Readiness
            </h2>
          </div>
          <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
            Updated 10m ago
          </span>
        </div>

        <div className="flex flex-col gap-space-sm">
          {/* District Hospital Rampur */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container-high">
            <div className="flex items-start justify-between mb-space-xs">
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-title-md text-title-md text-primary font-bold truncate">
                    District Hospital Rampur
                  </span>
                  <span className="bg-primary-fixed text-on-primary-fixed-variant text-label-sm font-label-sm px-1.5 py-0.5 rounded font-bold">
                    Tertiary
                  </span>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Headquarters Clinical Hub • 14.2 km
                </span>
              </div>
              <span className="w-3 h-3 rounded-full bg-primary-container" title="Operational" />
            </div>

            <div className="grid grid-cols-2 gap-space-xs mt-space-sm">
              <div className="bg-surface-container-low p-space-sm rounded-lg flex items-center justify-between border border-surface-container-high">
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    ICU Beds
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">
                    4 Available
                  </span>
                </div>
                <span className="material-symbols-outlined text-primary-container text-[22px]">
                  bed
                </span>
              </div>

              <div className="bg-surface-container-low p-space-sm rounded-lg flex items-center justify-between border border-surface-container-high">
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    O2 Cylinder Units
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">
                    12 Available
                  </span>
                </div>
                <span className="material-symbols-outlined text-primary-container text-[22px]">
                  mode_fan
                </span>
              </div>
            </div>
          </div>

          {/* CHC Bilaspur */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container-high">
            <div className="flex items-start justify-between mb-space-xs">
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-title-md text-title-md text-primary font-bold truncate">
                    CHC Bilaspur
                  </span>
                  <span className="bg-secondary-fixed text-on-secondary-fixed-variant text-label-sm font-label-sm px-1.5 py-0.5 rounded font-bold">
                    Secondary
                  </span>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Community Health Centre • 26.8 km
                </span>
              </div>
              <span className="w-3 h-3 rounded-full bg-primary-container" title="Operational" />
            </div>

            <div className="bg-surface-container-low p-space-sm rounded-lg flex items-center justify-between mt-space-sm border border-surface-container-high">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  General Ward Beds
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">
                    8 General Beds
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    of 24 total
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-primary-container text-[22px]">
                  local_hospital
                </span>
                <button
                  type="button"
                  onClick={() => showToast('Direct Inflow diversion route active for non-critical cases')}
                  className="ml-2 h-9 px-3 rounded-lg bg-surface-container-highest text-on-surface font-label-sm text-label-sm font-bold active:scale-95 transition-transform min-h-[44px]"
                >
                  Direct Inflow
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Referral Stream Snippet */}
      <div className="px-gutter mb-space-lg">
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container-high">
          <div className="flex items-center justify-between mb-space-sm">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary-container text-[20px]">
                sync_saved_locally
              </span>
              <h3 className="font-title-md text-title-md text-on-surface font-bold">
                Active Ambulatory Transfers
              </h3>
            </div>
            <span className="font-label-sm text-label-sm text-primary-container font-bold">
              Issued {issued}
            </span>
          </div>

          <div className="flex flex-col gap-space-xs">
            <div className="p-space-sm rounded-lg bg-surface-container-low flex items-center justify-between border border-surface-container-high">
              <div className="flex items-center gap-space-sm min-w-0">
                <div className="w-8 h-8 rounded-full bg-error-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-error text-[18px]">
                    emergency
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-lg text-label-lg text-on-surface font-bold truncate">
                    Red-flag cases (district)
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                    {redFlagCount} from live dashboard API — open a referral token for case detail
                  </span>
                </div>
              </div>
            </div>

            <div className="p-space-sm rounded-lg bg-surface-container-low flex items-center justify-between border border-surface-container-high">
              <div className="flex items-center gap-space-sm min-w-0">
                <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-secondary text-[18px]">
                    local_shipping
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-lg text-label-lg text-on-surface font-bold truncate">
                    Arrivals confirmed
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                    {arrived} arrived • {treated} treated • {noShow} no-show
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action CDMO Toolbar (Field Ergonomics) */}
      <div className="px-gutter mb-space-xl">
        <div className="grid grid-cols-2 gap-space-sm">
          <button
            type="button"
            onClick={() => setShowBroadcastModal(true)}
            className="w-full bg-primary hover:bg-primary-container text-on-primary py-space-sm px-space-md rounded-lg flex items-center justify-center gap-1.5 font-label-lg text-label-lg font-bold shadow-md active:scale-95 transition-transform min-h-[52px]"
          >
            <span className="material-symbols-outlined text-[20px]">broadcast_on_home</span>
            <span>Broadcast Alert</span>
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="w-full bg-surface-container-highest hover:bg-surface-container-high text-on-surface py-space-sm px-space-md rounded-lg flex items-center justify-center gap-1.5 font-label-lg text-label-lg font-bold shadow-sm active:scale-95 transition-transform min-h-[52px]"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
            <span>Export MoHFW Log</span>
          </button>
        </div>
      </div>

      {/* Official Regulatory Disclaimer */}
      <div className="px-gutter pb-space-lg text-center">
        <div className="inline-flex items-center gap-1 text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px]">verified_user</span>
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            Simulated District Health Information System data for MoHFW demo pilot.
          </p>
        </div>
        <p className="font-label-sm text-label-sm text-outline-variant mt-1">
          National Digital Health Mission (ABDM) Compliant • SwasthyaSetu AI Engine v2.4
        </p>
      </div>

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/70 backdrop-blur-sm flex items-center justify-center p-gutter">
          <div className="bg-surface-container-lowest rounded-xl max-w-sm w-full p-space-md shadow-2xl border border-surface-container-high animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">broadcast_on_home</span>
                <h3 className="font-title-md font-bold text-on-surface">District Broadcast Alert</h3>
              </div>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleSendBroadcast} className="mt-3 flex flex-col gap-3">
              <p className="text-xs text-on-surface-variant">
                Will queue a district advisory (UI only — no push backend yet):
              </p>
              <textarea
                value={broadcastText}
                onChange={(e) => setBroadcastText(e.target.value)}
                rows={3}
                required
                className="w-full p-2 text-sm bg-surface-container-low rounded-lg border border-surface-container-high text-on-surface"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-primary-container hover:bg-primary text-on-primary font-bold text-sm rounded-lg"
                >
                  Send Broadcast
                </button>
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2.5 bg-surface-container-high text-on-surface-variant font-semibold text-sm rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dropout Review Modal */}
      {showDropoutModal && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/70 backdrop-blur-sm flex items-center justify-center p-gutter">
          <div className="bg-surface-container-lowest rounded-xl max-w-sm w-full p-space-md shadow-2xl border border-surface-container-high">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
              <div className="flex items-center gap-2 text-error">
                <span className="material-symbols-outlined">person_alert</span>
                <h3 className="font-title-md font-bold text-on-surface">Dropout Safeguard Review</h3>
              </div>
              <button
                onClick={() => setShowDropoutModal(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="py-3 flex flex-col gap-2 text-xs">
              <p className="text-on-surface-variant">
                8 cases exceed the 6-hour admission window. Assigned ASHAs dispatched for direct physical verification:
              </p>
              <div className="bg-surface-container-low p-2 rounded border border-surface-container-high">
                <p className="font-bold">#CASE-0819 • Manju Bai (Rampur Gaon)</p>
                <p className="text-on-surface-variant">Assigned: ASHA Sunita Devi (Sub-center Pipra)</p>
              </div>
              <div className="bg-surface-container-low p-2 rounded border border-surface-container-high">
                <p className="font-bold">#CASE-0824 • Rekha Devi (Bilaspur North)</p>
                <p className="text-on-surface-variant">Assigned: ASHA Kavita (Sub-center Bilaspur)</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowDropoutModal(false);
                showToast('Triggered urgent home visit SMS tasks to local ASHAs.');
              }}
              className="w-full mt-2 py-2 bg-primary-container text-on-primary rounded-lg font-bold text-sm"
            >
              Re-alert All 8 ASHAs
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
