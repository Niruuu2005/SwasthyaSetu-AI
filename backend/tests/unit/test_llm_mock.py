import pytest

from app.ai.providers.mock import MockLLMProvider


@pytest.mark.asyncio
async def test_mock_llm_extracts_red_symptoms():
    provider = MockLLMProvider()
    result = await provider.extract_symptoms("severe bleeding and chest pain")
    assert "severe_bleeding" in result.symptoms or "chest_pain" in result.symptoms
    assert result.severity_hint == "severe"
