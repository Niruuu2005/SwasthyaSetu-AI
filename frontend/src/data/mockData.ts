import { Facility, PatientRecord, ReferralTokenData, UserProfile } from '../types';

export const ASSETS = {
  BRAND_LOGO: 'https://lh3.googleusercontent.com/aida/AEtjO1WxeyN7LYR-wHGbO-qNQH2tDd8ksoOQ7NkHJEBFbSIwXDn9sCZk5fOS2NnzknGCji5rEwZ_f8e0pfGmGMOe8qf3alzY1cK4nUbvRhUX1NO5tJx5tAqeyjz_lqZVQA0zW_BX8QuWEDbR2vaaEjp5sm5GOlavmnAiMoiMREoFdw_3iO9QSqxrugyTf5Hd9n94CoBPSRNWD6L9AFuAX1Ju1Co2xw0oU4fe6d-BSv5w1a9573v8ylTu0TmJYnM',
  SUNITA_TRIAGE: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWrrvPnWZlcrhnYBBGwdTXVCfwNP-QlUAtRFJb-Nr67F98gOtBozrvVgmtWvcUFGkxTdzF3oNuLLW0qqWhZ2WKzcwL-qay3dpG5-DhpxkOZ7fwMJPh8EhI0IELPicVEnWqpnuFE_w5ikq-s37p5X7BqwFNgtnYk_gsSAEGLXGQHcF7oc_9LDutLMYvfa8pBWhjGtP8J0KBWl5XJgPen5AcwDC4JHWusOVktHVq-kQo4mavXpW3rU6KNg',
  SUNITA_TRACKER: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDl4eNoX45TTDB3kZDA-ERTnabVPpOqpzlus8cUdkSQtoB8NFVaB0CAaJ-WDMNLQIfX1HiJC9QrSJQfUfWF7dz2RFdcNGWwinxYNm5nKiD9zIxnZzxbwABBWTVdQRb4hdNioq0UAgX5m-x9wbsJzeE-gz0LI4Nv8gcYhG1USj7TueMYwsCktlPqFUb_jOihv8TA698usPo0OGZUfE0DVhv4KkHDphadKeAUD7awLXMkayAa8_n7Y-j0Uw',
  HOSPITAL_TRAUMA: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCggIS5PY1efVYNSfFCykCYLSU1k4dKJHBQPsQTPvkKE9pak_svpAGEO72q-TxXVUqSHa9fgzbjMTdxFMhxnOhVDmvJGosgvfxcBWrf8fLpZu5etBUWKHyjT9jB53pgdkBPhzxSqjX0PD5hbSIlB-BQNgaSjKNZZlceXERjxMduTvFloU6Emc5HM7Vcocob0eMj5N1jTO_MAG1nqI9hehfqfPinKPEOKHpJjqk0XAUmNjMfxOzIqkVnPQ',
  CDMO_HERO: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmvOitbVaXN-MXiGL8VEVqn90mXbLXbBpYIIHKmGP-dzvZ1JQ-oRNDt0HQOMVPUDZ4PmM4ORqMT0iYjvotvgoKAm0mOOC_SqjrHOPB2nPl5qQkmfERClnK3anT-gBx4Ei_KH2vvQnYlCv1A-HkPatmygv8Yt_M5ed697q7dfIMJTMw7tpwiXTX-r3pvcdzJzmCkOnPfJQtOCJG-VE6amYOC6SmHdr2lNL4I_LpQVBVLCbGLIuLKZrkMg'
};

export const DEMO_PROFILES: UserProfile[] = [
  {
    id: 'asha-1',
    name: 'Sunita Devi',
    role: 'asha',
    roleLabel: 'ASHA Worker: Sunita Devi',
    roleTag: 'Field',
    phone: '9000000001',
    location: 'Sub-Center Pipra',
    badge: 'Field Triage & Home Visits',
    avatarIcon: 'medical_services'
  },
  {
    id: 'facility-1',
    name: 'Ramesh MO',
    role: 'facility',
    roleLabel: 'Facility Staff: Ramesh MO',
    roleTag: 'PHC',
    phone: '9000000003',
    location: 'PHC Rampur',
    badge: 'PHC Triage & Bed Bedding',
    avatarIcon: 'local_hospital'
  },
  {
    id: 'cdmo-1',
    name: 'Dr. Verma',
    role: 'cdmo',
    roleLabel: 'CDMO: Dr. Verma',
    roleTag: 'District',
    phone: '9000000004',
    location: 'District HQ',
    badge: 'District Overview & Resource Allocation',
    avatarIcon: 'admin_panel_settings'
  }
];

export const INITIAL_PATIENT: PatientRecord = {
  caseId: 'CASE-2025-0841',
  name: 'Sunita Bai',
  age: '42 yrs',
  sex: 'Female (स्त्री)',
  village: 'Rampur Cluster B',
  abhaId: '91-4821-3940',
  clinicalNarrative: 'Patient collapsed 20 mins ago, unconscious and not responding to verbal stimuli. Shallow breathing, cold extremities.',
  symptoms: ['Loss of consciousness', 'Severe breathlessness', 'Cold extremities'],
  vitals: {
    hr: 48,
    hrStatus: 'CRIT',
    spo2: 84,
    spo2Status: 'LOW',
    bp: '82/50',
    bpStatus: 'HYPO'
  },
  triageLevel: 'RED_FLAG',
  triageTitleEn: 'RED FLAG EMERGENCY',
  triageTitleHi: 'उच्च जोखिम • तुरंत रेफर करें',
  rulesTriggered: [
    {
      code: 'Rule RF-04',
      title: 'Acute Unconsciousness / Unresponsive',
      badge: 'HARD STOP',
      severity: 'critical'
    },
    {
      code: 'Rule RF-12',
      title: 'Compromised Respiration (<90% SpO₂)',
      badge: 'O₂ PROTOCOL',
      severity: 'critical'
    }
  ],
  aiAdvisory: 'Suspected acute neurological event (CVA/Stroke) or severe hemodynamic collapse secondary to late-stage shock. Recommend continuous airway monitoring during transit, lateral decubitus positioning if safe, and rapid glucose fingerstick upon arrival.',
  dispatchAlert: {
    logged: true,
    ambulanceTag: '#AMB-108-774',
    desk: 'Rampur Sector Tele-Emergency Desk',
    etaMinutes: 14
  },
  assignedFacilityId: 'dh_rampur',
  token: 'TK-2025-0841-RD',
  timestamp: '10:14 AM'
};

export const FACILITIES: Facility[] = [
  {
    id: 'dh_rampur',
    name: 'District Hospital Rampur',
    type: 'District Civil Hospital',
    tier: 'Level-3 Tertiary',
    distanceKm: 12,
    travelMins: 24,
    route: 'NH-31 Bypass',
    recommended: true,
    icuBeds: 4,
    totalBeds: 150,
    generalBeds: 38,
    o2Cylinders: 12,
    activeDoctor: 'Dr. S. K. Sharma (Anesthetist / Intensivist on site)',
    criticalMedsStock: 'Anti-convulsants, IV Mannitol, Oxygen in stock',
    statusValidatedMinsAgo: 4,
    protocolCode: 'Facility Protocol 04',
    tags: ['ICU & O2: 4 Beds Avail', '24x7 Emergency MO', 'CT & Trauma Ready']
  },
  {
    id: 'chc_bilaspur',
    name: 'Community Health Centre (CHC) Bilaspur',
    type: 'Community Health Centre',
    tier: 'Secondary',
    distanceKm: 6,
    travelMins: 14,
    route: 'State Road 12',
    recommended: false,
    stabilizationOnly: true,
    icuBeds: 0,
    totalBeds: 24,
    generalBeds: 8,
    o2Cylinders: 4,
    activeDoctor: 'Dr. A. K. Gupta (General Duty MO)',
    criticalMedsStock: 'Basic IV Fluids, Oral Anti-hypertensives',
    statusValidatedMinsAgo: 11,
    protocolCode: 'Facility Protocol 02',
    notice: 'Transfer Advisory: Suitable only for initial IV anti-hypertensive stabilization prior to tertiary ICU transfer.',
    tags: ['Basic Emergency', 'Stabilization Only', 'No ICU']
  },
  {
    id: 'phc_rampur',
    name: 'Sub-Centre Primary Health Centre Rampur',
    type: 'Primary Health Centre',
    tier: 'Sub-District PHC',
    distanceKm: 2,
    travelMins: 6,
    route: 'Village Link Road',
    recommended: false,
    deprioritized: true,
    deprioritizedReason: 'No Critical Emergency Beds Available (Auto-deprioritized for Case #0841)',
    icuBeds: 0,
    generalBeds: 2,
    activeDoctor: 'Staff Nurse on Duty',
    criticalMedsStock: 'Essential OTC Kits',
    statusValidatedMinsAgo: 25,
    protocolCode: 'Facility Protocol 01',
    tags: ['Routine Outpatient Care']
  }
];

export const INITIAL_REFERRAL_TOKEN: ReferralTokenData = {
  tokenId: 'TK-2025-0841-RD',
  caseId: 'CASE-2025-0841',
  patientName: 'Sunita Bai',
  patientAge: '42 F',
  patientSex: 'Female',
  abhaId: '#91-4821-3940',
  condition: 'Severe PPH Risk • Post-partum Triage',
  facilityName: 'District Hospital Rampur',
  facilityUnit: 'Emergency Trauma Unit • Ward 3 Bed Prep',
  transitStatus: 'EN ROUTE (108 Ambulance)',
  etaMins: 8,
  currentStep: 3,
  isAdmitted: false,
  ambulanceNumber: 'UP-22-G-4011',
  issuedAt: '10:14 AM'
};

export const QUICK_SYMPTOMS = [
  'Loss of consciousness',
  'Severe breathlessness',
  'High fever with convulsions',
  'Severe chest tightness',
  'Post-partum haemorrhage'
];
