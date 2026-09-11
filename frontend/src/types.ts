export type AppScreen = 
  | 'login'
  | 'patient-intake'
  | 'active-cases-triage'
  | 'urgent-referrals'
  | 'referral-dispatch-tracker'
  | 'cdmo-dashboard';

export type UserRole = 'asha' | 'facility' | 'cdmo';

export type Language = 'en' | 'hi';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  roleLabel: string;
  roleTag: string;
  phone: string;
  location: string;
  badge: string;
  avatarIcon: string;
}

export interface PatientRecord {
  caseId: string;
  patientId?: string;
  name: string;
  age: string;
  sex: string;
  village: string;
  abhaId?: string;
  clinicalNarrative: string;
  symptoms: string[];
  vitals: {
    hr: number;
    hrStatus: string;
    spo2: number;
    spo2Status: string;
    bp: string;
    bpStatus: string;
  };
  triageLevel: 'RED_FLAG' | 'MODERATE' | 'STABLE';
  triageTitleEn: string;
  triageTitleHi: string;
  rulesTriggered: { code: string; title: string; badge: string; severity: 'critical' | 'warning' }[];
  aiAdvisory: string;
  decisionSource?: 'rule_engine' | 'llm_assist';
  aiSummaryUnavailable?: boolean;
  reasoningSummary?: string;
  dispatchAlert: {
    logged: boolean;
    ambulanceTag: string;
    desk: string;
    etaMinutes: number;
  };
  assignedFacilityId?: string;
  token?: string;
  timestamp: string;
}

export interface Facility {
  id: string;
  name: string;
  type: string;
  tier: string;
  distanceKm: number;
  travelMins: number;
  route: string;
  recommended: boolean;
  stabilizationOnly?: boolean;
  deprioritized?: boolean;
  deprioritizedReason?: string;
  icuBeds: number;
  totalBeds?: number;
  generalBeds?: number;
  o2Cylinders?: number;
  activeDoctor: string;
  criticalMedsStock: string;
  statusValidatedMinsAgo: number;
  protocolCode: string;
  notice?: string;
  tags: string[];
}

export interface ReferralTokenData {
  tokenId: string;
  caseId: string;
  patientName: string;
  patientAge: string;
  patientSex: string;
  abhaId: string;
  condition: string;
  facilityName: string;
  facilityUnit: string;
  transitStatus: string;
  etaMins: number;
  currentStep: number; // 1 to 5
  isAdmitted: boolean;
  ambulanceNumber: string;
  issuedAt: string;
  statusHistory?: { status: string; at: string }[];
}
