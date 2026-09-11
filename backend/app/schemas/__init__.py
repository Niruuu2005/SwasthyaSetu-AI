from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.enums import ReferralStatus, RiskLevel, RiskSource, UserRole


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRole
    user_id: UUID
    name: str


class LoginRequest(BaseModel):
    phone: str
    password: str


class PatientIn(BaseModel):
    display_name: str
    age_years: int | None = None
    sex: str | None = None
    village: str | None = None


class IntakeCreateRequest(BaseModel):
    symptom_text_raw: str = Field(min_length=1)
    patient: PatientIn
    symptom_structured_json: dict | None = None
    language: str | None = None


class IntakeResponse(BaseModel):
    case_id: UUID
    patient_id: UUID
    status: str
    created_at: datetime


class TriageResponse(BaseModel):
    case_id: UUID
    risk_level: RiskLevel
    source: RiskSource
    confidence: float | None
    reasoning_summary: str
    rule_hits: list[str]
    llm_summary: dict | None
    ai_summary_unavailable: bool


class FacilityOut(BaseModel):
    id: UUID
    name: str
    type: str
    district_id: str
    latitude: float
    longitude: float
    specialist_available: bool
    diagnostic_status: str
    medicine_stock_json: dict
    capability_tags: list
    last_updated: datetime

    model_config = {"from_attributes": True}


class FacilityListResponse(BaseModel):
    items: list[FacilityOut]


class ReferralCreateRequest(BaseModel):
    case_id: UUID
    facility_id: UUID
    idempotency_key: str | None = None


class ReferralResponse(BaseModel):
    token_id: UUID
    case_id: UUID
    facility_id: UUID
    status: ReferralStatus
    issued_at: datetime
    confirmed_at: datetime | None
    status_history: list

    model_config = {"from_attributes": True}


class OfflineQueueItem(BaseModel):
    client_idempotency_key: str = Field(min_length=1)
    symptom_text_raw: str = Field(min_length=1)
    patient: PatientIn
    symptom_structured_json: dict | None = None


class OfflineSyncRequest(BaseModel):
    items: list[OfflineQueueItem] = Field(min_length=1)


class OfflineSyncResponse(BaseModel):
    accepted: list[IntakeResponse]
    duplicates: list[str]


class DashboardResponse(BaseModel):
    district_id: str
    funnel: dict[str, int]
    intake_count: int
    red_flag_count: int


class AuditVerifyResponse(BaseModel):
    valid: bool
    entries: int
    broken_at_sequence: int | None = None
    message: str | None = None


class IntegrationSimulateRequest(BaseModel):
    case_id: UUID | None = None
    payload: dict | None = None


class IntegrationSimulateResponse(BaseModel):
    event_id: UUID
    system: str
    status: str


class HealthResponse(BaseModel):
    status: str


class ConsentCreateRequest(BaseModel):
    patient_id: UUID
    grantee_user_id: UUID
    purpose: str = Field(min_length=1, max_length=200)
    expires_at: datetime


class ConsentResponse(BaseModel):
    consent_id: UUID
    patient_id: UUID
    grantee_user_id: UUID
    purpose: str
    expires_at: datetime
    revoked: bool
