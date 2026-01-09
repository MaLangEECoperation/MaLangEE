from __future__ import annotations

import asyncio
from typing import Any, Awaitable, Callable, Iterable, Union

EventHandler = Callable[[dict[str, Any]], Union[Awaitable[None], None]]


def fanout_event_handler(handlers: Iterable[EventHandler]) -> EventHandler:
    handler_list = [handler for handler in handlers if handler is not None]

    async def _handler(event: dict[str, Any]) -> None:
        for handler in handler_list:
            result = handler(event)
            if asyncio.iscoroutine(result):
                await result

    return _handler
