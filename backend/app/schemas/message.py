from datetime import datetime

from pydantic import BaseModel, Field, field_validator


MIN_MESSAGE_LENGTH = 1
MAX_MESSAGE_LENGTH = 1000


class MessageCreate(BaseModel):
    content: str = Field(
        min_length=MIN_MESSAGE_LENGTH,
        max_length=MAX_MESSAGE_LENGTH,
    )

    @field_validator("content")
    @classmethod
    def validate_content(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("Message cannot be empty.")

        return value


class MessageResponse(BaseModel):
    id: str
    content: str
    is_read: bool
    created_at: datetime


class MessageSendResponse(BaseModel):
    message: str


class MessageReply(BaseModel):
    content: str = Field(
        min_length=1,
        max_length=1000,
    )

    @field_validator("content")
    @classmethod
    def validate_content(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("Reply cannot be empty.")

        return value

class AnonymousMessageResponse(BaseModel):
    message_id: str
    conversation_id: str
    conversation_token: str