/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { AppScreen, Facility, Language, PatientRecord, ReferralTokenData, UserProfile } from './types';
import { EMPTY_PATIENT, GUEST_USER } from './data/mockData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ToastNotification } from './components/ToastNotification';
import { LoginScreen } from './screens/LoginScreen';
import { IntakeScreen } from './screens/IntakeScreen';
import { TriageScreen } from './screens/TriageScreen';
import { ReferralsScreen } from './screens/ReferralsScreen';
import { DispatchTrackerScreen } from './screens/DispatchTrackerScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { logout } from './api/auth';
import { ApiError, DISTRICT_ID, getToken } from './api/client';
import {
  confirmReferral,
  createIntake,
  getDistrictDashboard,
  getReferral,
  issueReferral,
  listFacilitiesNearby,
  runTriage,
  syncOfflineQueue,
  type DashboardResponse,
} from './api/clinical';
import { applyTriageToPatient, mapFacility, mapReferralToken, parseAgeYears } from './lib/mappers';
import {
  clearAcceptedKeys,
  enqueueOfflineIntake,
  loadOfflineQueue,
  pendingCount,
} from './offline/queue';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('login');
  const [currentUser, setCurrentUser] = useState<UserProfile>(GUEST_USER);
  const [language, setLanguage] = useState<Language>('en');
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [patientRecord, setPatientRecord] = useState<PatientRecord>(EMPTY_PATIENT);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [referralToken, setReferralToken] = useState<ReferralTokenData | null>(null);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [offlinePending, setOfflinePending] = useState(pendingCount());

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const refreshOfflineCount = () => setOfflinePending(pendingCount());

  const flushOfflineQueue = useCallback(async () => {
    const items = loadOfflineQueue();
    if (!items.length || !getToken()) return;
    try {
      const result = await syncOfflineQueue(
        items.map(({ client_idempotency_key, symptom_text_raw, patient }) => ({
          client_idempotency_key,
          symptom_text_raw,
          patient,
        })),
      );
      const keys = new Set(result.duplicates);
      let acceptedIdx = 0;
      for (const it of items) {
        if (keys.has(it.client_idempotency_key)) continue;
        if (acceptedIdx < result.accepted.length) {
          keys.add(it.client_idempotency_key);
          acceptedIdx += 1;
        }
      }
      clearAcceptedKeys([...keys]);
      refreshOfflineCount();
      showToast(
        `Synced offline queue: ${result.accepted.length} accepted, ${result.duplicates.length} duplicates`,
      );
    } catch (err) {
      if (err instanceof ApiError && err.code === 'NETWORK_ERROR') return;
      showToast(err instanceof Error ? err.message : 'Offline sync failed');
    }
  }, []);

  useEffect(() => {
    const onOnline = () => {
      setIsOnline(true);
      void flushOfflineQueue();
    };
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [flushOfflineQueue]);

  const handleToggleLanguage = () => {
    setLanguage((prev) => {
      const next = prev === 'en' ? 'hi' : 'en';
      showToast(next === 'hi' ? 'भाषा: हिंदी सक्रिय (Hindi Active)' : 'Language: English Active');
      return next;
    });
  };

  const handleToggleOnline = () => {
    setIsOnline((prev) => {
      const next = !prev;
      showToast(next ? 'Online: attempting sync…' : 'Offline Mode: intakes will queue locally');
      if (next) void flushOfflineQueue();
      return next;
    });
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setPatientRecord(EMPTY_PATIENT);
    setReferralToken(null);
    setFacilities([]);
    showToast(`Logged in as ${user.name} (${user.roleTag})`);
    void flushOfflineQueue();
    if (user.role === 'cdmo') {
      setCurrentScreen('cdmo-dashboard');
    } else if (user.role === 'facility') {
      setCurrentScreen('referral-dispatch-tracker');
    } else {
      setCurrentScreen('patient-intake');
    }
  };

  const handleSignOut = () => {
    logout();
    setCurrentUser(GUEST_USER);
    setPatientRecord(EMPTY_PATIENT);
    setReferralToken(null);
    setFacilities([]);
    setDashboard(null);
    setCurrentScreen('login');
    showToast('Signed out');
  };

  const handleIntakeSubmit = async (record: PatientRecord) => {
    const payload = {
      symptom_text_raw: record.clinicalNarrative,
      patient: {
        display_name: record.name,
        age_years: parseAgeYears(record.age),
        sex: record.sex,
        village: record.village,
      },
      language,
    };

    if (!isOnline) {
      enqueueOfflineIntake({
        symptom_text_raw: payload.symptom_text_raw,
        patient: payload.patient,
      });
      refreshOfflineCount();
      showToast('Saved offline — will sync when connected');
      return;
    }

    try {
      showToast('Submitting intake…');
      const intake = await createIntake(payload);
      showToast('Running triage…');
      const triage = await runTriage(intake.case_id);
      const updated = applyTriageToPatient(
        {
          ...record,
          caseId: intake.case_id,
          patientId: intake.patient_id,
        },
        triage,
      );
      setPatientRecord(updated);
      setCurrentScreen('active-cases-triage');
      showToast(
        triage.source === 'rule_engine'
          ? `Triage: ${triage.risk_level} (rule engine)`
          : `Triage: ${triage.risk_level} (LLM assist)`,
      );
    } catch (err) {
      if (err instanceof ApiError && err.code === 'NETWORK_ERROR') {
        enqueueOfflineIntake({
          symptom_text_raw: payload.symptom_text_raw,
          patient: payload.patient,
        });
        refreshOfflineCount();
        showToast('Network lost — queued offline');
        return;
      }
      throw err;
    }
  };

  const loadFacilities = async () => {
    try {
      const items = await listFacilitiesNearby(DISTRICT_ID);
      setFacilities(items.map(mapFacility));
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to load facilities');
    }
  };

  const handleNavigateToReferrals = async () => {
    await loadFacilities();
    setCurrentScreen('urgent-referrals');
  };

  const handleIssueReferral = async (facilityId: string) => {
    if (!patientRecord.caseId || patientRecord.caseId.startsWith('CASE-')) {
      throw new Error('Submit a live intake first so case_id is a backend UUID');
    }
    const ref = await issueReferral({
      case_id: patientRecord.caseId,
      facility_id: facilityId,
      idempotency_key: crypto.randomUUID(),
    });
    const facilityName =
      facilities.find((f) => f.id === facilityId)?.name || 'Facility';
    const token = mapReferralToken(ref, patientRecord, facilityName);
    setReferralToken(token);
    setPatientRecord((prev) => ({
      ...prev,
      assignedFacilityId: facilityId,
      token: ref.token_id,
    }));
    return { tokenId: ref.token_id };
  };

  const handleOpenTracker = async (facilityId: string, tokenId: string) => {
    setPatientRecord((prev) => ({ ...prev, assignedFacilityId: facilityId, token: tokenId }));
    try {
      const ref = await getReferral(tokenId);
      const facilityName =
        facilities.find((f) => f.id === facilityId)?.name ||
        facilities.find((f) => f.id === ref.facility_id)?.name ||
        'Facility';
      setReferralToken(mapReferralToken(ref, patientRecord, facilityName));
    } catch {
      // keep existing mapped token from issue step
    }
    setCurrentScreen('referral-dispatch-tracker');
  };

  const handleConfirmArrival = async () => {
    const tokenId = referralToken?.tokenId || patientRecord.token;
    if (!tokenId) throw new Error('No referral token to confirm');
    const ref = await confirmReferral(tokenId);
    const facilityName = referralToken?.facilityName || 'Facility';
    setReferralToken(mapReferralToken(ref, patientRecord, facilityName));
  };

  const refreshDashboard = useCallback(async () => {
    try {
      const data = await getDistrictDashboard(DISTRICT_ID);
      setDashboard(data);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Dashboard load failed');
    }
  }, []);

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed">
      <ToastNotification message={toastMessage} />

      {currentScreen === 'login' ? (
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          language={language}
          onToggleLanguage={handleToggleLanguage}
          isOnline={isOnline}
          onToggleOnline={handleToggleOnline}
        />
      ) : (
        <>
          <Header
            currentScreen={currentScreen}
            onNavigate={(s) => setCurrentScreen(s)}
            language={language}
            onToggleLanguage={handleToggleLanguage}
            isOnline={isOnline}
            onToggleOnline={handleToggleOnline}
            currentUser={currentUser}
            onSignOut={handleSignOut}
          />

          <main className="flex-1 w-full bg-surface">
            {currentScreen === 'patient-intake' && (
              <IntakeScreen
                patient={patientRecord}
                onUpdatePatient={(p) => setPatientRecord(p)}
                onSubmitToIntake={handleIntakeSubmit}
                language={language}
                onToggleLanguage={handleToggleLanguage}
                isOnline={isOnline}
                showToast={showToast}
                pendingOfflineCount={offlinePending}
              />
            )}

            {currentScreen === 'active-cases-triage' && (
              <TriageScreen
                patient={patientRecord}
                onNavigateToReferrals={() => void handleNavigateToReferrals()}
                showToast={showToast}
              />
            )}

            {currentScreen === 'urgent-referrals' && (
              <ReferralsScreen
                patient={patientRecord}
                facilities={facilities}
                onOpenTracker={(facilityId, tokenId) => void handleOpenTracker(facilityId, tokenId)}
                onIssueReferral={handleIssueReferral}
                showToast={showToast}
              />
            )}

            {currentScreen === 'referral-dispatch-tracker' && (
              <DispatchTrackerScreen
                patient={patientRecord}
                currentUser={currentUser}
                showToast={showToast}
                referralToken={referralToken}
                onConfirmArrival={
                  currentUser.role === 'facility' ? handleConfirmArrival : undefined
                }
              />
            )}

            {currentScreen === 'cdmo-dashboard' && (
              <DashboardScreen
                showToast={showToast}
                dashboard={dashboard}
                onRefresh={refreshDashboard}
              />
            )}
          </main>

          <BottomNav
            currentScreen={currentScreen}
            onNavigate={(s) => {
              if (s === 'urgent-referrals') void loadFacilities();
              if (s === 'cdmo-dashboard') void refreshDashboard();
              setCurrentScreen(s);
            }}
            language={language}
            hasRedFlagCase={patientRecord.triageLevel === 'RED_FLAG'}
          />
        </>
      )}
    </div>
  );
}
