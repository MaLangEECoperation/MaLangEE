import unittest

from scenario.llm_client import _sanitize_field
from scenario.scenario_state import ScenarioState


class ExtractionSanitizeTests(unittest.TestCase):
    def test_sanitize_basic(self) -> None:
        self.assertEqual(_sanitize_field(" airport "), "airport")

    def test_sanitize_ignore_fillers(self) -> None:
        self.assertIsNone(_sanitize_field("thank you"))
        self.assertIsNone(_sanitize_field("OK"))

    def test_sanitize_goal(self) -> None:
        from scenario.llm_client import _sanitize_goal

        self.assertIsNone(_sanitize_goal("talk"))
        self.assertIsNone(_sanitize_goal("chat"))
        self.assertEqual(_sanitize_goal("check in"), "check in")


class ScenarioStateUpdateTests(unittest.TestCase):
    def test_preserve_existing_place(self) -> None:
        state = ScenarioState(place="airport")
        state.update_from_extraction({"place": "tea", "partner": None, "goal": None})
        self.assertEqual(state.place, "airport")


if __name__ == "__main__":
    unittest.main()
