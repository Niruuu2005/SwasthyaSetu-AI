import { api, DISTRICT_ID } from './client';

export interface IntakeResponse {
  case_id: string;
  patient_id: string;
  status: string;
  created_at: string;
}

export interface TriageResponse {
  case_id: string;
  risk_level: 'low' | 'moderate' | 'red_flag';
  source: 'rule_engine' | 'llm_assist';
  confidence: number | null;
  reasoning_summary: string;
  rule_hits: string[];
  llm_summary: Record<string, unknown> | null;
  ai_summary_unavailable: boolean;
}

export interface FacilityApi {
  id: string;
  name: string;
  type: string;
  district_id: string;
  latitude: number;
  longitude: number;
  specialist_available: boolean;
  diagnostic_status: string;
  medicine_stock_json: Record<string, unknown>;
  capability_tags: string[];
  last_updated: string;
}

export interface ReferralResponse {
  token_id: string;
  case_id: string;
  facility_id: string;
  status: string;
  issued_at: string;
  confirmed_at: string | null;
  status_history: { status: string; at: string }[];
}

export interface DashboardResponse {
  district_id: string;
  funnel: Record<string, number>;
  intake_count: number;
  red_flag_count: number;
}

export async function createIntake(payload: {
  symptom_text_raw: string;
  patient: {
    display_name: string;
    age_years?: number | null;
    sex?: string | null;
    village?: string | null;
  };
  language?: string;
}): Promise<IntakeResponse> {
  return api<IntakeResponse>('/intake', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function runTriage(caseId: string): Promise<TriageResponse> {
  return api<TriageResponse>(`/triage/${caseId}`, { method: 'POST' });
}

export async function listFacilitiesNearby(districtId = DISTRICT_ID): Promise<FacilityApi[]> {
  const data = await api<{ items: FacilityApi[] }>(
    `/facilities/nearby?district_id=${encodeURIComponent(districtId)}&limit=20`,
  );
  return data.items;
}

export async function issueReferral(payload: {
  case_id: string;
  facility_id: string;
  idempotency_key?: string;
}): Promise<ReferralResponse> {
  return api<ReferralResponse>('/referral', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getReferral(tokenId: string): Promise<ReferralResponse> {
  return api<ReferralResponse>(`/referral/${tokenId}`);
}

export async function confirmReferral(tokenId: string): Promise<ReferralResponse> {
  return api<ReferralResponse>(`/referral/${tokenId}/confirm`, { method: 'POST' });
}

export async function getDistrictDashboard(
  districtId = DISTRICT_ID,
): Promise<DashboardResponse> {
  return api<DashboardResponse>(`/dashboard/district/${encodeURIComponent(districtId)}`);
}

export async function syncOfflineQueue(items: Array<{
  client_idempotency_key: string;
  symptom_text_raw: string;
  patient: {
    display_name: string;
    age_years?: number | null;
    sex?: string | null;
    village?: string | null;
  };
}>): Promise<{ accepted: IntakeResponse[]; duplicates: string[] }> {
  return api('/sync/offline-queue', {
    method: 'POST',
    body: JSON.stringify({ items }),
  });
}
