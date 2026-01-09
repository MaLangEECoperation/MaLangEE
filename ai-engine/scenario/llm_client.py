from __future__ import annotations

import json
from typing import Any, Optional

from openai import OpenAI

from .prompts import build_extraction_prompt, build_fallback_prompt, build_final_prompt, build_followup_prompt
from .scenario_state import ScenarioState


class OpenAIScenarioLLM:
    def __init__(self, api_key: str, model: str, logger: Optional[Any] = None) -> None:
        self._client = OpenAI(api_key=api_key)
        self._model = model
        self._logger = logger

    def extract_fields(self, user_text: str) -> dict[str, str | None]:
        prompt = build_extraction_prompt(user_text)
        text = self._create_text_response(prompt, response_format={"type": "json_object"})
        return _safe_json_loads(text)

    def generate_followup(self, state: ScenarioState, missing_fields: list[str]) -> str:
        prompt = build_followup_prompt(state.place, state.partner, state.goal, missing_fields)
        return self._create_text_response(prompt)

    def generate_final(self, state: ScenarioState) -> str:
        if not (state.place and state.partner and state.goal):
            raise ValueError("ScenarioState is incomplete for final response generation")
        prompt = build_final_prompt(state.place, state.partner, state.goal)
        return self._create_text_response(prompt)

    def generate_fallback(self, state: ScenarioState) -> str:
        prompt = build_fallback_prompt(state.place, state.partner, state.goal)
        return self._create_text_response(prompt)

    def _create_text_response(
        self,
        prompt: str,
        *,
        response_format: Optional[dict[str, Any]] = None,
    ) -> str:
        if hasattr(self._client, "responses"):
            try:
                response = self._client.responses.create(
                    model=self._model,
                    input=prompt,
                    response_format=response_format,
                )
            except TypeError:
                response = self._client.responses.create(
                    model=self._model,
                    input=prompt,
                )
            text = getattr(response, "output_text", None)
            if isinstance(text, str) and text.strip():
                return text.strip()
            return _extract_text_from_response(response)

        if hasattr(self._client, "chat"):
            response = self._client.chat.completions.create(
                model=self._model,
                messages=[{"role": "user", "content": prompt}],
            )
            return response.choices[0].message.content.strip()

        raise RuntimeError("OpenAI client does not support responses or chat completions")


def _safe_json_loads(text: str) -> dict[str, str | None]:
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        data = _extract_json_from_text(text)
        if data is None:
            return {"place": None, "partner": None, "goal": None}
    return {
        "place": _sanitize_field(data.get("place")),
        "partner": _sanitize_field(data.get("partner")),
        "goal": _sanitize_goal(data.get("goal")),
    }


def _extract_json_from_text(text: str) -> dict[str, Any] | None:
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
                    return json.loads(candidate)
                except json.JSONDecodeError:
                    return None
    return None


def _sanitize_field(value: Any) -> str | None:
    if value is None:
        return None
    if not isinstance(value, str):
        return None
    cleaned = value.strip()
    if not cleaned:
        return None
    if len(cleaned) > 80:
        return None
    if cleaned.lower() in {"thanks", "thank you", "ok", "okay", "yes", "no"}:
        return None
    return cleaned


def _sanitize_goal(value: Any) -> str | None:
    cleaned = _sanitize_field(value)
    if not cleaned:
        return None
    lowered = cleaned.lower()
    invalid = {
        "talk",
        "chat",
        "speak",
        "conversation",
        "practice",
        "practice english",
        "help",
        "something",
        "just talk",
    }
    if lowered in invalid:
        return None
    if len(lowered.split()) <= 2 and lowered in {"talk", "chat", "speak", "help"}:
        return None
    return cleaned


def _extract_text_from_response(response: Any) -> str:
    output = getattr(response, "output", None)
    if not output:
        return ""
    for item in output:
        content = getattr(item, "content", None)
        if not content:
            continue
        for part in content:
            text = getattr(part, "text", None)
            if isinstance(text, str) and text.strip():
                return text.strip()
    return ""
