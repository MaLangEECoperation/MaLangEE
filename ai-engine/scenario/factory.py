from __future__ import annotations

from typing import Optional

from .llm_client import OpenAIScenarioLLM
from .prompts import KOREAN_FALLBACK_MESSAGE
from .scenario_builder import ScenarioBuilder
from .scenario_state import ScenarioState


def build_scenario_builder(
    api_key: str,
    model: str,
    max_attempts: int = 3,
    logger: Optional[object] = None,
) -> ScenarioBuilder:
    llm = OpenAIScenarioLLM(api_key=api_key, model=model, logger=logger)
    return ScenarioBuilder(
        state=ScenarioState(),
        extractor=llm.extract_fields,
        question_generator=lambda state, missing: llm.generate_followup(state, missing),
        final_generator=llm.generate_final,
        fallback_generator=llm.generate_fallback,
        max_attempts=max_attempts,
        fallback_korean_prompt=KOREAN_FALLBACK_MESSAGE,
        logger=logger,
    )
