from app.core.config import get_settings
from app.core.rate_limit import RateLimiter


settings = get_settings()

anonymous_message_limiter = RateLimiter(
    max_requests=settings.rate_limit_max_requests,
    window_seconds=settings.rate_limit_window_seconds,
)