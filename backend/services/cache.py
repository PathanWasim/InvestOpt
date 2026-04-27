"""
In-memory cache with TTL support.
Respects Alpha Vantage rate limits (5 req/min on free tier).
"""
import time
from typing import Any, Optional

_store: dict = {}
DEFAULT_TTL = 3600  # 1 hour


def get(key: str) -> Optional[Any]:
    if key in _store:
        value, expires_at = _store[key]
        if time.time() < expires_at:
            return value
        del _store[key]
    return None


def set(key: str, value: Any, ttl: int = DEFAULT_TTL) -> None:
    _store[key] = (value, time.time() + ttl)


def clear() -> None:
    _store.clear()


def size() -> int:
    return len(_store)
