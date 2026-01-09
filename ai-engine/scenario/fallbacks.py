from __future__ import annotations

from typing import Any, Awaitable, Callable, Union

from .prompts import KOREAN_FALLBACK_MESSAGE

SendResponse = Callable[[str], Union[Awaitable[Any], Any]]


def build_realtime_error_handler(
    send_response: SendResponse,
) -> Callable[[Exception], Union[Awaitable[Any], Any]]:
    async def _handler(_: Exception) -> Any:
        result = send_response(KOREAN_FALLBACK_MESSAGE)
        if hasattr(result, "__await__"):
            return await result
        return result

    return _handler
