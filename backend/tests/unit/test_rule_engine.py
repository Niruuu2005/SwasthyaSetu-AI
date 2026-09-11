from app.ai.rule_engine import classify
from app.ai.triage_fixtures import TRIAGE_CASES
from app.models.enums import RiskLevel, RiskSource


def test_red_flag_unconscious():
    result = classify("Patient is unconscious and not responding")
    assert result.risk_level == RiskLevel.red_flag
    assert result.source == RiskSource.rule_engine
    assert any(h.startswith("RF_") for h in result.rule_hits)


def test_moderate_fever():
    result = classify("Fever and cough for three days")
    assert result.risk_level == RiskLevel.moderate


def test_low_routine():
    result = classify("Request for routine blood pressure check")
    assert result.risk_level == RiskLevel.low


def test_fixture_confusion_matrix_accuracy():
    """Charter §9: evaluate hand-built set; rules must not miss red flags."""
    y_true = []
    y_pred = []
    for case in TRIAGE_CASES:
        pred = classify(case["text"]).risk_level
        y_true.append(case["expected"])
        y_pred.append(pred)

    # Critical safety: no false negatives on red_flag expected cases
    for true, pred, case in zip(y_true, y_pred, TRIAGE_CASES, strict=True):
        if true == RiskLevel.red_flag:
            assert pred == RiskLevel.red_flag, f"Missed red flag for {case['id']}: {case['text']}"

    correct = sum(1 for a, b in zip(y_true, y_pred, strict=True) if a == b)
    accuracy = correct / len(TRIAGE_CASES)
    assert accuracy >= 0.85, f"Accuracy {accuracy:.2%} below threshold"
