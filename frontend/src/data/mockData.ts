import { Facility, PatientRecord, ReferralTokenData, UserProfile } from '../types';

export const ASSETS = {
  BRAND_LOGO: 'https://lh3.googleusercontent.com/aida/AEtjO1WxeyN7LYR-wHGbO-qNQH2tDd8ksoOQ7NkHJEBFbSIwXDn9sCZk5fOS2NnzknGCji5rEwZ_f8e0pfGmGMOe8qf3alzY1cK4nUbvRhUX1NO5tJx5tAqeyjz_lqZVQA0zW_BX8QuWEDbR2vaaEjp5sm5GOlavmnAiMoiMREoFdw_3iO9QSqxrugyTf5Hd9n94CoBPSRNWD6L9AFuAX1Ju1Co2xw0oU4fe6d-BSv5w1a9573v8ylTu0TmJYnM',
  SUNITA_TRIAGE: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWrrvPnWZlcrhnYBBGwdTXVCfwNP-QlUAtRFJb-Nr67F98gOtBozrvVgmtWvcUFGkxTdzF3oNuLLW0qqWhZ2WKzcwL-qay3dpG5-DhpxkOZ7fwMJPh8EhI0IELPicVEnWqpnuFE_w5ikq-s37p5X7BqwFNgtnYk_gsSAEGLXGQHcF7oc_9LDutLMYvfa8pBWhjGtP8J0KBWl5XJgPen5AcwDC4JHWusOVktHVq-kQo4mavXpW3rU6KNg',
  SUNITA_TRACKER: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDl4eNoX45TTDB3kZDA-ERTnabVPpOqpzlus8cUdkSQtoB8NFVaB0CAaJ-WDMNLQIfX1HiJC9QrSJQfUfWF7dz2RFdcNGWwinxYNm5nKiD9zIxnZzxbwABBWTVdQRb4hdNioq0UAgX5m-x9wbsJzeE-gz0LI4Nv8gcYhG1USj7TueMYwsCktlPqFUb_jOihv8TA698usPo0OGZUfE0DVhv4KkHDphadKeAUD7awLXMkayAa8_n7Y-j0Uw',
  HOSPITAL_TRAUMA: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCggIS5PY1efVYNSfFCykCYLSU1k4dKJHBQPsQTPvkKE9pak_svpAGEO72q-TxXVUqSHa9fgzbjMTdxFMhxnOhVDmvJGosgvfxcBWrf8fLpZu5etBUWKHyjT9jB53pgdkBPhzxSqjX0PD5hbSIlB-BQNgaSjKNZZlceXERjxMduTvFloU6Emc5HM7Vcocob0eMj5N1jTO_MAG1nqI9hehfqfPinKPEOKHpJjqk0XAUmNjMfxOzIqkVnPQ',
  CDMO_HERO: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmvOitbVaXN-MXiGL8VEVqn90mXbLXbBpYIIHKmGP-dzvZ1JQ-oRNDt0HQOMVPUDZ4PmM4ORqMT0iYjvotvgoKAm0mOOC_SqjrHOPB2nPl5qQkmfERClnK3anT-gBx4Ei_KH2vvQnYlCv1A-HkPatmygv8Yt_M5ed697q7dfIMJTMw7tpwiXTX-r3pvcdzJzmCkOnPfJQtOCJG-VE6amYOC6SmHdr2lNL4I_LpQVBVLCbGLIuLKZrkMg'
};

/** Quick-login phone hints only (password never stored in the client). */
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

/** Blank case — never seed fake clinical values into the live UI. */
export const EMPTY_PATIENT: PatientRecord = {
  caseId: '',
  name: '',
  age: '',
  sex: '',
  village: '',
  clinicalNarrative: '',
  symptoms: [],
  vitals: {
    hr: 0,
    hrStatus: '—',
    spo2: 0,
    spo2Status: '—',
    bp: '—',
    bpStatus: '—'
  },
  triageLevel: 'STABLE',
  triageTitleEn: '',
  triageTitleHi: '',
  rulesTriggered: [],
  aiAdvisory: '',
  dispatchAlert: {
    logged: false,
    ambulanceTag: '—',
    desk: '—',
    etaMinutes: 0
  },
  timestamp: ''
};

export const GUEST_USER: UserProfile = {
  id: '',
  name: '',
  role: 'asha',
  roleLabel: 'Guest',
  roleTag: '—',
  phone: '',
  location: '',
  badge: '',
  avatarIcon: 'person'
};

export const QUICK_SYMPTOMS = [
  'Loss of consciousness',
  'Severe breathlessness',
  'High fever with convulsions',
  'Severe chest tightness',
  'Post-partum haemorrhage'
];

// Retained type exports for screens that previously imported mock facilities/tokens.
export type { Facility, ReferralTokenData };
