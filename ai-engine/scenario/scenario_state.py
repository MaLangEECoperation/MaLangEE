from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class ScenarioState:
    place: str | None = None
    partner: str | None = None
    goal: str | None = None
    attempts: int = 0
    asked_fields: set[str] = field(default_factory=set)
    completed: bool = False

    def is_complete(self) -> bool:
        return all([self.place, self.partner, self.goal])

    def missing_fields(self) -> list[str]:
        missing: list[str] = []
        if not self.place:
            missing.append("place")
        if not self.partner:
            missing.append("partner")
        if not self.goal:
            missing.append("goal")
        return missing

    def update_from_extraction(self, extracted: dict[str, str | None]) -> None:
        place = extracted.get("place")
        partner = extracted.get("partner")
        goal = extracted.get("goal")

        if place and not self.place:
            self.place = place
        if partner and not self.partner:
            self.partner = partner
        if goal and not self.goal:
            self.goal = goal
