from app.ai.providers.base import LLMProvider
from app.ai.providers.mock import MockLLMProvider
from app.ai.providers.openai_compatible import OpenAICompatibleProvider
from app.core.config import Settings, get_settings


def get_llm_provider(settings: Settings | None = None) -> LLMProvider:
    settings = settings or get_settings()
    provider = (settings.llm_provider or "mock").lower()
    if provider in {"openai", "openai_compatible"} and settings.llm_api_key:
        return OpenAICompatibleProvider(settings)
    return MockLLMProvider()
