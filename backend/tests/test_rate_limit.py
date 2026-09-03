from app.core.rate_limit import RateLimiter


def test_rate_limiter_allows_under_limit():
    limiter = RateLimiter(max_requests=3, window_seconds=60)
    assert limiter.is_allowed("test-ip-1") is True
    assert limiter.is_allowed("test-ip-1") is True
    assert limiter.is_allowed("test-ip-1") is True
    # 4th request exceeds limit of 3
    assert limiter.is_allowed("test-ip-1") is False


def test_rate_limiter_distinct_keys():
    limiter = RateLimiter(max_requests=2, window_seconds=60)
    assert limiter.is_allowed("key-a") is True
    assert limiter.is_allowed("key-a") is True
    assert limiter.is_allowed("key-a") is False

    # key-b should still be allowed
    assert limiter.is_allowed("key-b") is True
