from app.core.client_hints import parse_safe_client_hints


def test_parse_safe_client_hints():
    # iOS Safari
    ios_ua = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
    hints = parse_safe_client_hints(ios_ua)
    assert hints["platform"] == "iOS"
    assert hints["device"] == "iPhone"
    assert hints["browser"] == "Safari"

    # Android Chrome
    android_ua = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
    hints = parse_safe_client_hints(android_ua)
    assert hints["platform"] == "Android"
    assert hints["browser"] == "Google Chrome"

    # Windows Edge
    win_ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0"
    hints = parse_safe_client_hints(win_ua)
    assert hints["platform"] == "Windows"
    assert hints["browser"] == "Microsoft Edge"

    # None / Empty fallback
    assert parse_safe_client_hints(None)["platform"] == "Web"
