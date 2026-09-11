import re

from app.ai.providers.base import LLMProvider
from app.ai.schemas.extraction import SymptomExtraction

# Deterministic patterns for demo fixtures + common phrases
RED_PATTERNS = [
    (r"\b(unconscious|not\s+responding|coma)\b", "unconsciousness"),
    (r"\b(seizure|convulsion|fits)\b", "seizure"),
    (r"\b(chest\s+pain|cardiac)\b", "chest_pain"),
    (r"\b(severe\s+bleeding|hemorrhage|haemorrhage)\b", "severe_bleeding"),
    (r"\b(difficulty\s+breathing|shortness\s+of\s+breath|dyspnoea|dyspnea|can't\s+breathe)\b", "respiratory_distress"),
    (r"\b(high\s+fever|fever).{0,40}\b(stiff\s+neck|rash)\b", "fever_danger"),
    (r"\b(pregnancy|pregnant).{0,40}\b(bleeding|severe\s+headache|vision)\b", "pregnancy_danger"),
    (r"\b(blue\s+lips|cyanosis)\b", "cyanosis"),
]

MODERATE_PATTERNS = [
    (r"\b(fever|bukhar)\b", "fever"),
    (r"\b(cough|khansi)\b", "cough"),
    (r"\b(diarrhea|diarrhoea|loose\s+stools)\b", "diarrhea"),
    (r"\b(vomiting|ulthi)\b", "vomiting"),
    (r"\b(abdominal\s+pain|pet\s+dard)\b", "abdominal_pain"),
]


class MockLLMProvider(LLMProvider):
    async def extract_symptoms(self, text: str, language: str | None = None) -> SymptomExtraction:
        lowered = text.lower()
        symptoms: list[str] = []
        severity = "mild"
        for pattern, label in RED_PATTERNS:
            if re.search(pattern, lowered, re.IGNORECASE):
                symptoms.append(label)
                severity = "severe"
        for pattern, label in MODERATE_PATTERNS:
            if re.search(pattern, lowered, re.IGNORECASE) and label not in symptoms:
                symptoms.append(label)
                if severity == "mild":
                    severity = "moderate"
        if not symptoms:
            symptoms = ["general_complaint"]
        return SymptomExtraction(
            symptoms=symptoms,
            duration_days=None,
            severity_hint=severity,
            vitals_mentioned={},
            summary=f"Extracted symptoms: {', '.join(symptoms)}",
            confidence=0.85 if severity == "severe" else 0.7,
        )
