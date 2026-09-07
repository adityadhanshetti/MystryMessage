from app.core.moderation import contains_abusive_content


def test_clean_content():
    assert contains_abusive_content("Hello! Love your profile.") is False
    assert contains_abusive_content("What is your favorite book?") is False
    assert contains_abusive_content("") is False


def test_abusive_content_flagged():
    assert contains_abusive_content("This is a scam website") is True
    assert contains_abusive_content("I will threat you") is True
    assert contains_abusive_content("kys right now") is True
