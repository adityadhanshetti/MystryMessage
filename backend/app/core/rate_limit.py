import time
from collections import defaultdict
from threading import Lock


class RateLimiter:
    def __init__(
        self,
        max_requests: int,
        window_seconds: int,
    ) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds

        self._requests: dict[str, list[float]] = defaultdict(list)
        self._lock = Lock()

    def is_allowed(self, key: str) -> bool:
        now = time.monotonic()

        with self._lock:
            timestamps = self._requests[key]

            cutoff = now - self.window_seconds

            timestamps[:] = [
                timestamp
                for timestamp in timestamps
                if timestamp > cutoff
            ]

            if len(timestamps) >= self.max_requests:
                return False

            timestamps.append(now)

            return True