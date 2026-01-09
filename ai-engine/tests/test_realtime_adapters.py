import unittest

from scenario.realtime_adapters import build_response_create_sender, build_text_response_sender


class DummyClient:
    def __init__(self) -> None:
        self.events = []

    async def send_event(self, event):
        self.events.append(event)


class RealtimeAdapterTests(unittest.IsolatedAsyncioTestCase):
    async def test_text_sender_event(self) -> None:
        client = DummyClient()
        sender = build_text_response_sender(client)
        await sender("Hello")
        self.assertEqual(client.events[0]["type"], "conversation.item.create")
        self.assertEqual(client.events[0]["item"]["role"], "assistant")

    async def test_response_create_sender_event(self) -> None:
        client = DummyClient()
        sender = build_response_create_sender(client, modalities=["audio"])
        await sender("Hello")
        self.assertEqual(client.events[0]["type"], "response.create")
        self.assertEqual(client.events[0]["response"]["modalities"], ["audio"])


if __name__ == "__main__":
    unittest.main()
