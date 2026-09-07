import re
from typing import Any


def parse_safe_client_hints(user_agent: str | None) -> dict[str, str]:
    if not user_agent:
        return {
            "device": "Unknown Device",
            "browser": "Web Browser",
            "platform": "Web",
        }

    ua = user_agent.lower()

    # Determine Platform / OS
    if "iphone" in ua or "ipad" in ua or "ipod" in ua:
        platform = "iOS"
        device = "iPhone" if "iphone" in ua else "iPad"
    elif "android" in ua:
        platform = "Android"
        device = "Android Device"
    elif "macintosh" in ua or "mac os" in ua:
        platform = "macOS"
        device = "Mac"
    elif "windows" in ua:
        platform = "Windows"
        device = "PC"
    elif "linux" in ua:
        platform = "Linux"
        device = "Linux PC"
    else:
        platform = "Other"
        device = "Desktop / Mobile"

    # Determine Browser
    if "edg" in ua:
        browser = "Microsoft Edge"
    elif "chrome" in ua and "safari" in ua and "edg" not in ua and "opr" not in ua:
        browser = "Google Chrome"
    elif "safari" in ua and "chrome" not in ua:
        browser = "Safari"
    elif "firefox" in ua:
        browser = "Firefox"
    elif "opr" in ua or "opera" in ua:
        browser = "Opera"
    else:
        browser = "Browser"

    return {
        "device": device,
        "browser": browser,
        "platform": platform,
    }
