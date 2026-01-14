import unittest
from typing import Optional

from scenario.fallbacks import build_realtime_error_handler
from scenario.prompts import KOREAN_FALLBACK_MESSAGE
from scenario.scenario_builder import ScenarioBuilder
from scenario.scenario_state import ScenarioState


class ScenarioBuilderTests(unittest.TestCase):
    def test_finalize_when_complete(self) -> None:
        state = ScenarioState(place="cafe", partner="barista", goal="order coffee")
        builder = ScenarioBuilder(state=state)
        response = builder.finalize_scenario()
        self.assertIn("cafe", response)
        self.assertIn("barista", response)

    def test_followup_when_missing(self) -> None:
        def extractor(_: str) -> dict[str, Optional[str]]:
            return {"place": "cafe", "partner": None, "goal": None}

        builder = ScenarioBuilder(extractor=extractor)
        builder.ingest_user_text("I am at a cafe")
        question = builder.build_follow_up_question()
        self.assertIsNotNone(question)
        self.assertIn("Who", question)

    def test_finalize_after_max_attempts(self) -> None:
        builder = ScenarioBuilder(max_attempts=3)
        for _ in range(3):
            self.assertIsNotNone(builder.build_follow_up_question())
        self.assertIsNone(builder.build_follow_up_question())
        response = builder.finalize_scenario()
        self.assertIn("Great.", response)


class RealtimeFallbackTests(unittest.IsolatedAsyncioTestCase):
    async def test_realtime_error_fallback(self) -> None:
        messages: list[str] = []

        async def send_response(text: str) -> None:
            messages.append(text)

        handler = build_realtime_error_handler(send_response)
        await handler(RuntimeError("boom"))
        self.assertEqual(messages[-1], KOREAN_FALLBACK_MESSAGE)


if __name__ == "__main__":
    unittest.main()
