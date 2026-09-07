import re

# Curated list of harmful / abusive word patterns
PROFANITY_PATTERNS = [
    r"\b(hate|slur|abuse|scam|phish|threat|kill\s*yourself|kys)\b",
]

COMPILED_PATTERNS = [
    re.compile(pattern, re.IGNORECASE) for pattern in PROFANITY_PATTERNS
]


def contains_abusive_content(text: str) -> bool:
    """
    Check if text contains obvious profanity or abusive keywords.
    Returns True if flagged.
    """
    if not text:
        return False

    for pattern in COMPILED_PATTERNS:
        if pattern.search(text):
            return True

    return False
