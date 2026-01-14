from __future__ import annotations

import asyncio
import base64
import inspect
import json
import logging
from dataclasses import dataclass
from typing import Any, Awaitable, Callable, Optional, Union

from openai import OpenAI

try:
    import websockets
    from websockets.client import WebSocketClientProtocol
except ImportError:  # pragma: no cover - optional dependency
    websockets = None
    WebSocketClientProtocol = Any

EventHandler = Callable[[dict[str, Any]], Union[Awaitable[None], None]]
ErrorHandler = Callable[[Exception], Union[Awaitable[None], None]]


@dataclass(frozen=True)
class RealtimeConfig:
    api_key: str
    model: str = "gpt-4o-realtime-preview-2024-12-17"
    base_url: str = "https://api.openai.com/v1"
    max_retries: int = 1


@dataclass(frozen=True)
class RealtimeSessionInfo:
    wss_url: str
    bearer_token: Optional[str]
    model: str


class RealtimeSessionManager:
    def __init__(self, config: RealtimeConfig) -> None:
        self._config = config

    def create_session(self) -> RealtimeSessionInfo:
        client = OpenAI(api_key=self._config.api_key)
        bearer_token: Optional[str] = None

        # Prefer ephemeral session creation when supported by SDK.
        if hasattr(client, "realtime") and hasattr(client.realtime, "sessions"):
            session = client.realtime.sessions.create(model=self._config.model)
            client_secret = getattr(session, "client_secret", None)
            if client_secret is not None:
                bearer_token = getattr(client_secret, "value", None)

        wss_url = self._build_wss_url(self._config.base_url, self._config.model)
        return RealtimeSessionInfo(wss_url=wss_url, bearer_token=bearer_token, model=self._config.model)

    @staticmethod
    def _build_wss_url(base_url: str, model: str) -> str:
        if base_url.startswith("https://"):
            wss_base = "wss://" + base_url[len("https://") :]
        elif base_url.startswith("http://"):
            wss_base = "ws://" + base_url[len("http://") :]
        else:
            wss_base = base_url
        return f"{wss_base}/realtime?model={model}"


class RealtimeWebSocketClient:
    def __init__(
        self,
        session: RealtimeSessionInfo,
        api_key: str,
        event_handler: EventHandler,
        session_config: Optional[dict[str, Any]] = None,
        max_retries: int = 1,
        error_handler: Optional[ErrorHandler] = None,
        logger: Optional[logging.Logger] = None,
    ) -> None:
        self._session = session
        self._api_key = api_key
        self._event_handler = event_handler
        self._session_config = session_config
        self._max_retries = max_retries
        self._error_handler = error_handler
        self._logger = logger or logging.getLogger(__name__)
        self._ws: Optional[WebSocketClientProtocol] = None
        self._connected_event = asyncio.Event()

    async def connect_and_run(self) -> None:
        if websockets is None:
            raise RuntimeError("websockets dependency is required for Realtime API")

        retries = 0
        last_error: Optional[Exception] = None
        while True:
            try:
                await self._connect()
                await self._run_loop()
                return
            except Exception as exc:
                self._logger.exception("Realtime websocket error: %s", exc)
                last_error = exc
                if retries >= self._max_retries:
                    if self._error_handler and last_error is not None:
                        result = self._error_handler(last_error)
                        if asyncio.iscoroutine(result):
                            await result
                        return
                    raise
                retries += 1
                await asyncio.sleep(0.5)

    async def _connect(self) -> None:
        bearer = self._session.bearer_token or self._api_key
        headers = {
            "Authorization": f"Bearer {bearer}",
            "OpenAI-Beta": "realtime=v1",
        }
        connect_kwargs = self._build_connect_kwargs(headers)
        self._ws = await websockets.connect(self._session.wss_url, **connect_kwargs)
        self._connected_event.set()

        if self._session_config:
            await self.send_event({"type": "session.update", "session": self._session_config})

    async def _run_loop(self) -> None:
        if self._ws is None:
            raise RuntimeError("WebSocket is not connected")

        async for message in self._ws:
            try:
                payload = json.loads(message)
            except json.JSONDecodeError:
                self._logger.warning("Skipping non-JSON message from Realtime")
                continue
            result = self._event_handler(payload)
            if asyncio.iscoroutine(result):
                await result

    async def send_event(self, event: dict[str, Any]) -> None:
        if self._ws is None:
            raise RuntimeError("WebSocket is not connected")
        await self._ws.send(json.dumps(event))

    async def send_audio_chunk(self, audio_bytes: bytes) -> None:
        encoded = base64.b64encode(audio_bytes).decode("ascii")
        await self.send_event({"type": "input_audio_buffer.append", "audio": encoded})

    async def commit_audio_buffer(self) -> None:
        await self.send_event({"type": "input_audio_buffer.commit"})

    def set_event_handler(self, event_handler: EventHandler) -> None:
        self._event_handler = event_handler

    def set_error_handler(self, error_handler: Optional[ErrorHandler]) -> None:
        self._error_handler = error_handler

    async def close(self) -> None:
        if self._ws is not None:
            await self._ws.close()
        self._connected_event.clear()

    async def wait_until_connected(self, timeout: Optional[float] = None) -> bool:
        try:
            await asyncio.wait_for(self._connected_event.wait(), timeout=timeout)
            return True
        except asyncio.TimeoutError:
            return False

    @staticmethod
    def _build_connect_kwargs(headers: dict[str, str]) -> dict[str, Any]:
        try:
            signature = inspect.signature(websockets.connect)
            params = signature.parameters
        except (TypeError, ValueError):
            params = {}
        if "extra_headers" in params:
            return {"extra_headers": headers}
        if "additional_headers" in params:
            return {"additional_headers": headers}
        if "headers" in params:
            return {"headers": headers}
        return {}
