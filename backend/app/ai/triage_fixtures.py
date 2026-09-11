"""Hand-built ~20 symptom cases for triage evaluation (charter §9)."""

from app.models.enums import RiskLevel

TRIAGE_CASES: list[dict] = [
    {"id": "c01", "text": "Mild cough for 2 days, no fever", "expected": RiskLevel.moderate},
    {"id": "c02", "text": "Patient is unconscious and not responding", "expected": RiskLevel.red_flag},
    {"id": "c03", "text": "Chest pain radiating to left arm", "expected": RiskLevel.red_flag},
    {"id": "c04", "text": "Fever with stiff neck and rash", "expected": RiskLevel.red_flag},
    {"id": "c05", "text": "Pregnant woman with severe bleeding", "expected": RiskLevel.red_flag},
    {"id": "c06", "text": "Difficulty breathing and blue lips", "expected": RiskLevel.red_flag},
    {"id": "c07", "text": "Child with seizures since morning", "expected": RiskLevel.red_flag},
    {"id": "c08", "text": "Infant not feeding and lethargic", "expected": RiskLevel.red_flag},
    {"id": "c09", "text": "Severe bleeding after injury", "expected": RiskLevel.red_flag},
    {"id": "c10", "text": "Fever and cough for three days", "expected": RiskLevel.moderate},
    {"id": "c11", "text": "Diarrhea and vomiting since yesterday", "expected": RiskLevel.moderate},
    {"id": "c12", "text": "Abdominal pain after meals", "expected": RiskLevel.moderate},
    {"id": "c13", "text": "Bukhar aur khansi do din se", "expected": RiskLevel.moderate},
    {"id": "c14", "text": "Loose stools only, drinking well", "expected": RiskLevel.moderate},
    {"id": "c15", "text": "General weakness, no fever", "expected": RiskLevel.low},
    {"id": "c16", "text": "Request for routine blood pressure check", "expected": RiskLevel.low},
    {"id": "c17", "text": "Minor skin itch without fever", "expected": RiskLevel.low},
    {"id": "c18", "text": "Follow-up for healed wound", "expected": RiskLevel.low},
    {"id": "c19", "text": "Pregnant woman with blurred vision and headache", "expected": RiskLevel.red_flag},
    {"id": "c20", "text": "High fever with non-blanching rash", "expected": RiskLevel.red_flag},
]
