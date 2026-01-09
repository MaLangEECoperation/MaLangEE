from __future__ import annotations

import logging
import os
from typing import Optional


def get_logger(name: str, level: Optional[int] = None) -> logging.Logger:
    resolved_level = _resolve_log_level(level)
    logger = logging.getLogger(name)
    if logger.handlers:
        return logger
    logger.setLevel(resolved_level)
    handler = logging.StreamHandler()
    formatter = logging.Formatter("[%(levelname)s] %(name)s: %(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.propagate = False
    return logger


def configure_root(level: Optional[int] = None) -> None:
    resolved_level = _resolve_log_level(level)
    logging.basicConfig(level=resolved_level, format="[%(levelname)s] %(name)s: %(message)s")


def _resolve_log_level(level: Optional[int]) -> int:
    if level is not None:
        return level
    env_value = os.getenv("MALANGEE_LOG_LEVEL", "").strip().upper()
    if not env_value:
        return logging.INFO
    return getattr(logging, env_value, logging.INFO)
