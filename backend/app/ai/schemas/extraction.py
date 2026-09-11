from pydantic import BaseModel, Field


class SymptomExtraction(BaseModel):
    symptoms: list[str] = Field(default_factory=list)
    duration_days: float | None = None
    severity_hint: str | None = None
    vitals_mentioned: dict[str, str] = Field(default_factory=dict)
    summary: str = ""
    confidence: float | None = 0.5
