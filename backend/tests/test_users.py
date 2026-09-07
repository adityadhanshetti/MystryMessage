import pytest
from app.schemas.user import validate_username


def test_valid_usernames():
    assert validate_username("john_doe") == "john_doe"
    assert validate_username("Alice-123") == "alice-123"
    assert validate_username("  bob_99  ") == "bob_99"


def test_invalid_usernames_length():
    with pytest.raises(ValueError):
        validate_username("ab")  # too short

    with pytest.raises(ValueError):
        validate_username("a" * 31)  # too long


def test_invalid_usernames_characters():
    with pytest.raises(ValueError):
        validate_username("user@name")

    with pytest.raises(ValueError):
        validate_username("hello world")


def test_reserved_usernames():
    with pytest.raises(ValueError, match="reserved"):
        validate_username("admin")
    with pytest.raises(ValueError, match="reserved"):
        validate_username("settings")
