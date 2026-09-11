"""Deterministic clinical rule engine — authoritative for red-flag decisions.

Rules are IMNCI/PMSMA-inspired heuristics for demo/MVP. Not a licensed CDS product.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

from app.ai.schemas.extraction import SymptomExtraction
from app.models.enums import RiskLevel, RiskSource


@dataclass
class RuleResult:
    risk_level: RiskLevel
    source: RiskSource
    confidence: float
    reasoning_summary: str
    rule_hits: list[str]


RED_FLAG_RULES: list[tuple[str, re.Pattern[str]]] = [
    ("RF_UNCONSCIOUS", re.compile(r"\b(unconscious|not\s+responding|coma)\b", re.I)),
    ("RF_SEIZURE", re.compile(r"\b(seizures?|convulsions?|\bfits\b)\b", re.I)),
    ("RF_CHEST_PAIN", re.compile(r"\b(chest\s+pain|crushing\s+pain)\b", re.I)),
    ("RF_SEVERE_BLEED", re.compile(r"\b(severe\s+bleeding|hemorrhage|haemorrhage)\b", re.I)),
    (
        "RF_RESP_DISTRESS",
        re.compile(
            r"\b(difficulty\s+breathing|shortness\s+of\s+breath|can't\s+breathe|cyanosis|blue\s+lips)\b",
            re.I,
        ),
    ),
    (
        "RF_FEVER_DANGER",
        re.compile(r"\b(fever|bukhar).{0,60}\b(stiff\s+neck|non[\s-]?blanching\s+rash|rash)\b", re.I),
    ),
    (
        "RF_PREGNANCY_DANGER",
        re.compile(
            r"\b(pregnan\w*).{0,80}\b(bleeding|severe\s+headache|blurred\s+vision|vision\s+loss|seizure)\b",
            re.I,
        ),
    ),
    ("RF_CHILD_LETHARGY", re.compile(r"\b(infant|child|baby).{0,40}\b(letharg\w*|not\s+feeding)\b", re.I)),
]

MODERATE_RULES: list[tuple[str, re.Pattern[str]]] = [
    ("MOD_FEVER", re.compile(r"\b(fever|bukhar)\b", re.I)),
    ("MOD_COUGH", re.compile(r"\b(cough|khansi)\b", re.I)),
    ("MOD_DIARRHEA", re.compile(r"\b(diarrhea|diarrhoea|loose\s+stools)\b", re.I)),
    ("MOD_VOMIT", re.compile(r"\b(vomiting|ulthi)\b", re.I)),
    ("MOD_ABDOMINAL", re.compile(r"\b(abdominal\s+pain|pet\s+dard)\b", re.I)),
]

SYMPTOM_RED = {
    "unconsciousness",
    "seizure",
    "chest_pain",
    "severe_bleeding",
    "respiratory_distress",
    "fever_danger",
    "pregnancy_danger",
    "cyanosis",
}


def classify(
    text: str,
    structured: dict | None = None,
    extraction: SymptomExtraction | None = None,
) -> RuleResult:
    """Classify risk. Rules always win over LLM severity hints for red flags."""
    blob_parts = [text or ""]
    if structured:
        blob_parts.append(" ".join(str(v) for v in structured.values()))
    if extraction:
        blob_parts.append(" ".join(extraction.symptoms))
        blob_parts.append(extraction.summary)
    blob = "\n".join(blob_parts)

    hits: list[str] = []
    for rule_id, pattern in RED_FLAG_RULES:
        if pattern.search(blob):
            hits.append(rule_id)

    if extraction:
        for s in extraction.symptoms:
            if s in SYMPTOM_RED:
                hits.append(f"RF_FROM_EXTRACT:{s}")

    if hits:
        return RuleResult(
            risk_level=RiskLevel.red_flag,
            source=RiskSource.rule_engine,
            confidence=1.0,
            reasoning_summary="Red-flag clinical rules matched; rule engine is authoritative.",
            rule_hits=sorted(set(hits)),
        )

    for rule_id, pattern in MODERATE_RULES:
        if pattern.search(blob):
            hits.append(rule_id)

    if hits or (extraction and extraction.severity_hint in {"moderate", "severe"}):
        # severe hint without red rule → still moderate; rules own emergency
        return RuleResult(
            risk_level=RiskLevel.moderate,
            source=RiskSource.rule_engine if hits else RiskSource.llm_assist,
            confidence=(
                0.8
                if hits
                else (
                    extraction.confidence
                    if extraction and extraction.confidence is not None
                    else 0.5
                )
            ),
            reasoning_summary="Moderate risk features present; escalate to facility review.",
            rule_hits=sorted(set(hits)),
        )

    return RuleResult(
        risk_level=RiskLevel.low,
        source=RiskSource.llm_assist if extraction else RiskSource.rule_engine,
        confidence=(extraction.confidence if extraction and extraction.confidence is not None else 0.6),
        reasoning_summary="No red-flag or moderate rule matches; routine local care pathway.",
        rule_hits=[],
    )
