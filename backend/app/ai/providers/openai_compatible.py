import httpx

from app.ai.providers.base import LLMProvider
from app.ai.schemas.extraction import SymptomExtraction
from app.core.config import Settings

EXTRACTION_PROMPT = (
    "Extract clinical symptoms from the patient/ASHA report. "
    "Return JSON with keys: symptoms (string array), duration_days (number|null), "
    "severity_hint (mild|moderate|severe), vitals_mentioned (object), summary (string), "
    "confidence (0-1). Do not give a final risk decision or treatment advice."
)


class OpenAICompatibleProvider(LLMProvider):
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    async def extract_symptoms(self, text: str, language: str | None = None) -> SymptomExtraction:
        if not self.settings.llm_api_key:
            raise RuntimeError("LLM_API_KEY not configured")
        base = (self.settings.llm_base_url or "https://api.openai.com/v1").rstrip("/")
        headers = {
            "Authorization": f"Bearer {self.settings.llm_api_key}",
            "Content-Type": "application/json",
        }
        body = {
            "model": self.settings.llm_model,
            "temperature": 0,
            "response_format": {"type": "json_object"},
            "messages": [
                {"role": "system", "content": EXTRACTION_PROMPT},
                {
                    "role": "user",
                    "content": f"Language hint: {language or 'unknown'}\nReport:\n{text}",
                },
            ],
        }
        async with httpx.AsyncClient(timeout=self.settings.llm_timeout_seconds) as client:
            resp = await client.post(f"{base}/chat/completions", headers=headers, json=body)
            resp.raise_for_status()
            content = resp.json()["choices"][0]["message"]["content"]
        return SymptomExtraction.model_validate_json(content)
