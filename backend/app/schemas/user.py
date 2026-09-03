import re

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.constants import (
    MAX_BIO_LENGTH,
    MAX_DISPLAY_NAME_LENGTH,
    MAX_USERNAME_LENGTH,
    MIN_USERNAME_LENGTH,
    RESERVED_USERNAMES,
)


USERNAME_PATTERN = re.compile(r"^[a-zA-Z0-9_-]+$")


def validate_username(value: str) -> str:
    value = value.strip().lower()

    if not MIN_USERNAME_LENGTH <= len(value) <= MAX_USERNAME_LENGTH:
        raise ValueError(
            f"Username must contain between "
            f"{MIN_USERNAME_LENGTH} and {MAX_USERNAME_LENGTH} characters."
        )

    if not USERNAME_PATTERN.fullmatch(value):
        raise ValueError(
            "Username can contain only letters, numbers, "
            "underscores, and hyphens."
        )

    if value in RESERVED_USERNAMES:
        raise ValueError("This username is reserved.")

    return value


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    username: str
    display_name: str
    bio: str
    avatar_url: str
    is_public: bool
    accept_messages: bool = True


class ProfileUpdate(BaseModel):
    display_name: str | None = Field(
        default=None,
        max_length=MAX_DISPLAY_NAME_LENGTH,
    )

    bio: str | None = Field(
        default=None,
        max_length=MAX_BIO_LENGTH,
    )

    username: str | None = None

    avatar_url: str | None = None

    is_public: bool | None = None

    accept_messages: bool | None = None

    @field_validator("username")
    @classmethod
    def validate_username_field(cls, value: str | None) -> str | None:
        if value is None:
            return None

        return validate_username(value)

    @field_validator("display_name")
    @classmethod
    def validate_display_name(
        cls,
        value: str | None,
    ) -> str | None:
        if value is None:
            return None

        value = value.strip()

        if not value:
            raise ValueError("Display name cannot be empty.")

        return value

    @field_validator("bio")
    @classmethod
    def normalize_bio(cls, value: str | None) -> str | None:
        if value is None:
            return None

        return value.strip()


class UsernameAvailabilityResponse(BaseModel):
    username: str
    available: bool