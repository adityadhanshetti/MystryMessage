import logging
import time
from collections import defaultdict
from threading import Lock
from typing import Any

logger = logging.getLogger(__name__)


class InMemoryRateLimiter:
    def __init__(self, max_requests: int, window_seconds: int) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._requests: dict[str, list[float]] = defaultdict(list)
        self._lock = Lock()

    def is_allowed(self, key: str) -> bool:
        now = time.monotonic()
        with self._lock:
            timestamps = self._requests[key]
            cutoff = now - self.window_seconds
            timestamps[:] = [t for t in timestamps if t > cutoff]
            if len(timestamps) >= self.max_requests:
                return False
            timestamps.append(now)
            return True


class RedisRateLimiter:
    def __init__(
        self,
        redis_client: Any,
        max_requests: int,
        window_seconds: int,
    ) -> None:
        self.redis = redis_client
        self.max_requests = max_requests
        self.window_seconds = window_seconds

    def is_allowed(self, key: str) -> bool:
        now = time.time()
        cutoff = now - self.window_seconds
        redis_key = f"rate_limit:{key}"

        try:
            pipeline = self.redis.pipeline()
            # Remove timestamps older than cutoff
            pipeline.zremrangebyscore(redis_key, 0, cutoff)
            # Add current timestamp
            pipeline.zadd(redis_key, {str(now): now})
            # Count elements in window
            pipeline.zcard(redis_key)
            # Set key expiration
            pipeline.expire(redis_key, self.window_seconds + 5)
            _, _, count, _ = pipeline.execute()
            return count <= self.max_requests
        except Exception as exc:
            logger.warning("Redis rate limit failed, allowing request: %s", exc)
            return True


class RateLimiter:
    """
    Hybrid RateLimiter: uses Redis if available/configured,
    falling back to thread-safe InMemoryRateLimiter.
    """

    def __init__(
        self,
        max_requests: int,
        window_seconds: int,
        redis_url: str | None = None,
    ) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.redis_limiter: RedisRateLimiter | None = None
        self.memory_limiter = InMemoryRateLimiter(max_requests, window_seconds)

        if redis_url:
            try:
                import redis

                client = redis.from_url(redis_url, decode_responses=True)
                client.ping()
                self.redis_limiter = RedisRateLimiter(
                    client, max_requests, window_seconds
                )
                logger.info("Connected to Redis for production rate limiting")
            except Exception as exc:
                logger.warning(
                    "Could not connect to Redis (%s). Using in-memory rate limiter.",
                    exc,
                )

    def is_allowed(self, key: str) -> bool:
        if self.redis_limiter:
            return self.redis_limiter.is_allowed(key)
        return self.memory_limiter.is_allowed(key)