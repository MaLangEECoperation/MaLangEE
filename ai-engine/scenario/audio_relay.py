from __future__ import annotations

import base64
import binascii
from typing import Any, Awaitable, Callable, Optional, Union


AudioChunkHandler = Callable[[bytes], Union[Awaitable[None], None]]
AudioChunkBase64Handler = Callable[[str], Union[Awaitable[None], None]]
TranscriptHandler = Callable[[str, bool], Union[Awaitable[None], None]]


class RealtimeAudioRelay:
    def __init__(
        self,
        *,
        on_audio_chunk: Optional[AudioChunkHandler] = None,
        on_audio_chunk_base64: Optional[AudioChunkBase64Handler] = None,
        on_transcript: Optional[TranscriptHandler] = None,
    ) -> None:
        self._on_audio_chunk = on_audio_chunk
        self._on_audio_chunk_base64 = on_audio_chunk_base64
        self._on_transcript = on_transcript

    async def handle_event(self, event: dict[str, Any]) -> None:
        event_type = event.get("type", "")

        if event_type == "response.audio.delta":
            await self._handle_audio_delta(event)
            return
        if event_type == "response.audio.done":
            return
        if event_type == "response.audio_transcript.delta":
            await self._handle_transcript(event, is_final=False)
            return
        if event_type == "response.audio_transcript.done":
            await self._handle_transcript(event, is_final=True)

    async def _handle_audio_delta(self, event: dict[str, Any]) -> None:
        chunk_base64 = event.get("delta") or event.get("audio")
        if not isinstance(chunk_base64, str) or not chunk_base64:
            return
        if self._on_audio_chunk_base64 is not None:
            result = self._on_audio_chunk_base64(chunk_base64)
            if hasattr(result, "__await__"):
                await result
        if self._on_audio_chunk is not None:
            try:
                audio_bytes = base64.b64decode(chunk_base64)
            except (ValueError, binascii.Error):
                return
            result = self._on_audio_chunk(audio_bytes)
            if hasattr(result, "__await__"):
                await result

    async def _handle_transcript(self, event: dict[str, Any], *, is_final: bool) -> None:
        transcript = event.get("transcript_delta") or event.get("transcript")
        if not isinstance(transcript, str) or not transcript:
            return
        if self._on_transcript is None:
            return
        result = self._on_transcript(transcript, is_final)
        if hasattr(result, "__await__"):
            await result
