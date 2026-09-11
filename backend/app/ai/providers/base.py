from abc import ABC, abstractmethod

from app.ai.schemas.extraction import SymptomExtraction


class LLMProvider(ABC):
    @abstractmethod
    async def extract_symptoms(self, text: str, language: str | None = None) -> SymptomExtraction:
        raise NotImplementedError
