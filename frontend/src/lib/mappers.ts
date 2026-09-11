import type { Facility, PatientRecord, ReferralTokenData } from '../types';
import type { FacilityApi, ReferralResponse, TriageResponse } from '../api/clinical';

export function parseAgeYears(age: string): number | null {
  const m = age.match(/(\d+)/);
  return m ? Number(m[1]) : null;
}

export function mapRiskLevel(
  level: TriageResponse['risk_level'],
): PatientRecord['triageLevel'] {
  if (level === 'red_flag') return 'RED_FLAG';
  if (level === 'moderate') return 'MODERATE';
  return 'STABLE';
}

export function applyTriageToPatient(
  patient: PatientRecord,
  triage: TriageResponse,
): PatientRecord {
  const level = mapRiskLevel(triage.risk_level);
  const llmSummary =
    triage.llm_summary && typeof triage.llm_summary === 'object'
      ? String((triage.llm_summary as { summary?: string }).summary || JSON.stringify(triage.llm_summary))
      : '';

  return {
    ...patient,
    caseId: triage.case_id,
    triageLevel: level,
    triageTitleEn:
      level === 'RED_FLAG'
        ? 'RED FLAG EMERGENCY'
        : level === 'MODERATE'
          ? 'MODERATE RISK'
          : 'STABLE / LOW RISK',
    triageTitleHi:
      level === 'RED_FLAG'
        ? 'उच्च जोखिम • तुरंत रेफर करें'
        : level === 'MODERATE'
          ? 'मध्यम जोखिम'
          : 'कम जोखिम',
    rulesTriggered: (triage.rule_hits || []).map((code) => ({
      code,
      title: code.replace(/^RF_/, '').replace(/_/g, ' '),
      badge: triage.source === 'rule_engine' ? 'RULE ENGINE' : 'LLM ASSIST',
      severity: level === 'RED_FLAG' ? 'critical' : 'warning',
    })),
    aiAdvisory: triage.ai_summary_unavailable
      ? 'AI summary unavailable, manual review needed'
      : llmSummary || triage.reasoning_summary,
    decisionSource: triage.source,
    aiSummaryUnavailable: triage.ai_summary_unavailable,
    reasoningSummary: triage.reasoning_summary,
    dispatchAlert: {
      logged: level === 'RED_FLAG',
      ambulanceTag: level === 'RED_FLAG' ? '108 (simulated log)' : '—',
      desk: 'Rule engine pathway',
      etaMinutes: level === 'RED_FLAG' ? 18 : 0,
    },
  };
}

export function mapFacility(f: FacilityApi, index: number): Facility {
  const stock = f.medicine_stock_json || {};
  const stockHint = Object.keys(stock).slice(0, 3).join(', ') || 'Stock mock';
  return {
    id: f.id,
    name: f.name,
    type: f.type,
    tier: f.type,
    distanceKm: Number((2 + index * 1.4).toFixed(1)),
    travelMins: 12 + index * 8,
    route: f.district_id,
    recommended: f.specialist_available || f.type === 'DH',
    stabilizationOnly: f.type === 'PHC',
    deprioritized: false,
    icuBeds: f.specialist_available ? 4 : 0,
    activeDoctor: f.specialist_available ? 'Specialist listed (demo)' : 'General duty (demo)',
    criticalMedsStock: stockHint,
    statusValidatedMinsAgo: 5,
    protocolCode: f.diagnostic_status,
    tags: Array.isArray(f.capability_tags) ? f.capability_tags.map(String) : [],
  };
}

export function mapReferralToken(
  ref: ReferralResponse,
  patient: PatientRecord,
  facilityName: string,
): ReferralTokenData {
  const arrived = ref.status === 'arrived' || Boolean(ref.confirmed_at);
  return {
    tokenId: ref.token_id,
    caseId: ref.case_id,
    patientName: patient.name,
    patientAge: patient.age,
    patientSex: patient.sex,
    abhaId: patient.abhaId || '—',
    condition: patient.triageTitleEn,
    facilityName,
    facilityUnit: facilityName,
    transitStatus: arrived ? 'PATIENT ARRIVED & ADMITTED' : ref.status.toUpperCase(),
    etaMins: arrived ? 0 : 18,
    currentStep: arrived ? 4 : 2,
    isAdmitted: arrived,
    ambulanceNumber: 'Simulated',
    issuedAt: ref.issued_at,
    statusHistory: ref.status_history || [],
  };
}
