import base64
import unittest

from scenario.audio_relay import RealtimeAudioRelay


class AudioRelayTests(unittest.IsolatedAsyncioTestCase):
    async def test_audio_delta_base64(self) -> None:
        chunks: list[str] = []
        relay = RealtimeAudioRelay(on_audio_chunk_base64=chunks.append)
        audio_bytes = b"hello"
        encoded = base64.b64encode(audio_bytes).decode("ascii")
        await relay.handle_event({"type": "response.audio.delta", "delta": encoded})
        self.assertEqual(chunks, [encoded])

    async def test_transcript_events(self) -> None:
        transcript_events: list[tuple[str, bool]] = []

        def on_transcript(text: str, is_final: bool) -> None:
            transcript_events.append((text, is_final))

        relay = RealtimeAudioRelay(on_transcript=on_transcript)
        await relay.handle_event({"type": "response.audio_transcript.delta", "transcript_delta": "Hi"})
        await relay.handle_event({"type": "response.audio_transcript.done", "transcript": "Hi there"})
        self.assertEqual(transcript_events, [("Hi", False), ("Hi there", True)])


if __name__ == "__main__":
    unittest.main()
