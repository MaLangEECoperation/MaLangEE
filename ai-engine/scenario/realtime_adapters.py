from __future__ import annotations

from typing import Any, Awaitable, Callable, Iterable, Optional

from .realtime_session import RealtimeWebSocketClient

SendResponse = Callable[[str], Awaitable[Any]]


def build_text_response_sender(client: RealtimeWebSocketClient) -> SendResponse:
    async def _send(text: str) -> None:
        event = {
            "type": "conversation.item.create",
            "item": {
                "type": "message",
                "role": "assistant",
                "content": [{"type": "text", "text": text}],
            },
        }
        await client.send_event(event)

    return _send


def build_response_create_sender(
    client: RealtimeWebSocketClient,
    *,
    modalities: Optional[Iterable[str]] = None,
    voice: Optional[str] = None,
) -> SendResponse:
    response_modalities = list(modalities) if modalities else ["text"]

    async def _send(text: str) -> None:
        event: dict[str, Any] = {
            "type": "response.create",
            "response": {
                "modalities": response_modalities,
                "instructions": text,
            },
        }
        if voice:
            event["response"]["voice"] = voice
        await client.send_event(event)

    return _send


def build_audio_response_sender(
    client: RealtimeWebSocketClient,
    *,
    voice: str,
) -> SendResponse:
    return build_response_create_sender(client, modalities=["audio", "text"], voice=voice)
