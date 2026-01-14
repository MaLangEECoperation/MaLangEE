from __future__ import annotations

import json
from typing import Callable, Optional

from .scenario_state import ScenarioState

Extractor = Callable[[str], dict[str, Optional[str]]]
QuestionGenerator = Callable[[ScenarioState, list[str]], str]
FinalGenerator = Callable[[ScenarioState], str]


class ScenarioBuilder:
    def __init__(
        self,
        state: ScenarioState | None = None,
        *,
        extractor: Extractor | None = None,
        question_generator: QuestionGenerator | None = None,
        final_generator: FinalGenerator | None = None,
        fallback_generator: FinalGenerator | None = None,
        max_attempts: int = 3,
        fallback_korean_prompt: str = "음성이 잘 들리지 않았어요. 다시 말해 주세요.",
        logger=None,
    ) -> None:
        self._state = state or ScenarioState()
        self._extractor = extractor
        self._question_generator = question_generator
        self._final_generator = final_generator
        self._fallback_generator = fallback_generator
        self._max_attempts = max_attempts
        self._fallback_korean_prompt = fallback_korean_prompt
        self._logger = logger
        self._default_questions = {
            "place": "Where are you having this conversation?",
            "partner": "Who are you talking to?",
            "goal": "What do you want to achieve in this conversation?",
        }

    @property
    def state(self) -> ScenarioState:
        return self._state

    def ingest_user_text(self, text: str) -> None:
        if not text.strip():
            return
        if self._state.completed:
            return
        if self._extractor is None:
            return
        extracted = self._extractor(text)
        self._state.update_from_extraction(extracted)

    def get_missing_fields(self) -> list[str]:
        return self._state.missing_fields()

    def build_follow_up_question(self) -> str | None:
        if self._state.completed:
            return None
        missing = self.get_missing_fields()
        if not missing:
            return None
        if self._state.attempts >= self._max_attempts:
            return None
        target = next((field for field in missing if field not in self._state.asked_fields), None)
        if target is None:
            target = missing[0]
        self._state.asked_fields.add(target)
        self._state.attempts += 1
        if self._question_generator:
            response = self._question_generator(self._state, [target])
        else:
            response = self._default_questions.get(target, self._default_questions["goal"])
        response = self._sanitize_question(response)
        return response

    def finalize_scenario(self) -> str:
        if self._state.completed:
            place = self._state.place or ""
            partner = self._state.partner or ""
            goal = self._state.goal or ""
            return (
                f"Great. You're at {place} talking to {partner} because you want to {goal}. Let's start."
            )
        self._state.completed = True
        if self._final_generator:
            response = self._final_generator(self._state)
            return response
        place = self._state.place or ""
        partner = self._state.partner or ""
        goal = self._state.goal or ""
        response = (
            f"Great. You're at {place} talking to {partner} because you want to {goal}. Let's start."
        )
        return response

    def finalize_with_fallback(self) -> str:
        if self._state.completed:
            return self.finalize_scenario()
        if self._fallback_generator:
            for attempt in range(2):
                response = self._fallback_generator(self._state)
                extracted = self._extract_json_object(response)
                if extracted:
                    self._state.update_from_extraction(extracted)
                    return self.finalize_scenario()
                if self._logger:
                    self._logger.warning("Fallback JSON parse failed (attempt %s)", attempt + 1)
        return self.finalize_scenario()

    def ensure_defaults(self) -> None:
        self._fill_defaults_if_missing()

    def _fill_defaults_if_missing(self) -> None:
        return

    @staticmethod
    def _extract_json_object(text: str) -> dict[str, str | None] | None:
        start = text.find("{")
        if start == -1:
            return None
        depth = 0
        for idx in range(start, len(text)):
            char = text[idx]
            if char == "{":
                depth += 1
            elif char == "}":
                depth -= 1
                if depth == 0:
                    candidate = text[start : idx + 1]
                    try:
                        data = json.loads(candidate)
                    except json.JSONDecodeError:
                        return None
                    return {
                        "place": data.get("place"),
                        "partner": data.get("partner"),
                        "goal": data.get("goal"),
                    }
        return None

    def _sanitize_question(self, question: str) -> str:
        cleaned = question.strip()
        if not cleaned:
            return self._default_questions["goal"]
        first_sentence = cleaned.split("\n")[0].split("?")[0].split(".")[0].strip()
        if not first_sentence.endswith("?"):
            first_sentence = first_sentence + "?"
        words = [w for w in first_sentence.split() if w]
        if len(words) > 15:
            return self._default_questions["goal"]
        return first_sentence
