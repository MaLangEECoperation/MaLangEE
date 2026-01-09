from __future__ import annotations

from typing import Iterable


KOREAN_FALLBACK_MESSAGE = "음성이 잘 들리지 않았어요. 다시 말해 주세요."


def build_extraction_prompt(user_text: str) -> str:
    return (
        "You extract scenario fields for English conversation practice.\n"
        "Return JSON only with keys: place, partner, goal. Use null if missing.\n"
        "partner means the conversation partner (e.g., staff), not a travel companion.\n"
        "goal means the conversation purpose (e.g., check-in, order, ask for help).\n"
        "Do not infer or guess. Only extract what the user explicitly said.\n"
        f'User said: "{user_text}"'
    )


def build_followup_prompt(
    place: str | None,
    partner: str | None,
    goal: str | None,
    missing_fields: Iterable[str],
) -> str:
    missing = ", ".join(missing_fields)
    return (
        "You are a scenario-building agent for English conversation practice.\n"
        "The field 'partner' means the conversation partner you will speak with (e.g., staff).\n"
        f"Known: place={place}, partner={partner}, goal={goal}\n"
        f"Missing: {missing}\n"
        "Ask one short question to fill the missing info (max 15 words)."
    )


def build_final_prompt(place: str, partner: str, goal: str) -> str:
    return (
        "You are a friendly English tutor.\n"
        f"Scenario: place={place}, partner={partner}, goal={goal}\n"
        "Write 1-2 sentences to start the conversation naturally."
    )


def build_fallback_prompt(
    place: str | None,
    partner: str | None,
    goal: str | None,
) -> str:
    return (
        "You are a scenario-building agent for English conversation practice.\n"
        "Some fields are missing. Infer plausible values based on context.\n"
        f"Known: place={place}, partner={partner}, goal={goal}\n"
        "Return JSON only with keys: place, partner, goal. Use null only if impossible.\n"
        "Do not use vague values like 'someone'. Be specific (e.g., 'server', 'staff member').\n"
        "Example output:\n"
        "{\"place\":\"airport\",\"partner\":\"immigration officer\",\"goal\":\"pass immigration\"}\n"
    )
