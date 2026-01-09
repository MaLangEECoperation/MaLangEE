from __future__ import annotations

import os
from dataclasses import dataclass

from dotenv import load_dotenv


@dataclass(frozen=True)
class AppConfig:
    api_key: str
    realtime_model: str = "gpt-4o-realtime-preview-2024-12-17"
    llm_model: str = "gpt-4o-mini"
    max_attempts: int = 3
    max_retries: int = 1

    @staticmethod
    def from_env() -> "AppConfig":
        load_dotenv()
        api_key = os.getenv("OPENAI_API_KEY", "").strip()
        try:
            from app.core.config import settings as backend_settings
        except Exception:
            backend_settings = None
        if backend_settings and backend_settings.OPENAI_API_KEY:
            api_key = str(backend_settings.OPENAI_API_KEY).strip()
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY is required")
        realtime_model = os.getenv("OPENAI_REALTIME_MODEL", "").strip()
        llm_model = os.getenv("OPENAI_LLM_MODEL", "").strip()
        return AppConfig(
            api_key=api_key,
            realtime_model=realtime_model or AppConfig.realtime_model,
            llm_model=llm_model or AppConfig.llm_model,
        )
