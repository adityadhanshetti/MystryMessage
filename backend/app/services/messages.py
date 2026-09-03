from bson import ObjectId
from fastapi import HTTPException, status

from app.models.message import MessageModel
from app.repositories.messages import MessageRepository
from app.repositories.users import UserRepository
from app.schemas.message import MessageCreate
from app.services.conversations import ConversationService
from app.repositories.conversations import (
    ConversationRepository,
)


class MessageService:
    def __init__(
        self,
        message_repository: MessageRepository,
        user_repository: UserRepository,
        conversation_repository: ConversationRepository,
    ) -> None:
        self.messages = message_repository
        self.users = user_repository
        self.conversations = conversation_repository

def send_message(
    self,
    username: str,
    payload: MessageCreate,
) -> tuple[dict, str]:
    recipient = self.users.get_by_username(username)

    if not recipient or not recipient.get(
        "is_public",
        True,
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "error": {
                    "code": "PROFILE_NOT_FOUND",
                    "message": "Profile not found.",
                },
            },
        )

    conversation_service = ConversationService(
        self.conversations
    )

    conversation, token = (
        conversation_service.create(
            recipient["_id"]
        )
    )

    document = MessageModel.create_document(
        conversation_id=conversation["_id"],
        recipient_id=recipient["_id"],
        content=payload.content,
        sender="anonymous",
    )

    message = self.messages.create(
        document
    )

    return message, token
    def get_inbox(
        self,
        recipient_id: str,
        *,
        limit: int = 50,
        skip: int = 0,
    ) -> list[dict]:
        try:
            object_id = ObjectId(recipient_id)
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user ID.",
            ) from exc

        return self.messages.get_inbox(
            recipient_id=object_id,
            limit=limit,
            skip=skip,
        )

    def mark_as_read(
        self,
        message_id: str,
        recipient_id: str,
    ) -> dict:
        try:
            message_object_id = ObjectId(message_id)
            recipient_object_id = ObjectId(recipient_id)
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "success": False,
                    "error": {
                        "code": "INVALID_ID",
                        "message": "Invalid message or user ID.",
                    },
                },
            ) from exc

        message = self.messages.mark_as_read(
            message_object_id,
            recipient_object_id,
        )

        if not message:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "success": False,
                    "error": {
                        "code": "MESSAGE_NOT_FOUND",
                        "message": "Message not found.",
                    },
                },
            )

        return message


    def delete_message(
        self,
        message_id: str,
        recipient_id: str,
    ) -> None:
        try:
            message_object_id = ObjectId(message_id)
            recipient_object_id = ObjectId(recipient_id)
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "success": False,
                    "error": {
                        "code": "INVALID_ID",
                        "message": "Invalid message or user ID.",
                    },
                },
            ) from exc

        deleted = self.messages.soft_delete(
            message_object_id,
            recipient_object_id,
        )

        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "success": False,
                    "error": {
                        "code": "MESSAGE_NOT_FOUND",
                        "message": "Message not found.",
                    },
                },
            )

    def reply_to_message(
        self,
        message_id: str,
        recipient_id: str,
        content: str,
    ) -> dict:
        try:
            message_object_id = ObjectId(message_id)
            recipient_object_id = ObjectId(recipient_id)
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "success": False,
                    "error": {
                        "code": "INVALID_ID",
                        "message": "Invalid message or user ID.",
                    },
                },
            ) from exc

        message = self.messages.add_reply(
            message_object_id,
            recipient_object_id,
            content,
        )

        if not message:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "success": False,
                    "error": {
                        "code": "REPLY_NOT_ALLOWED",
                        "message": (
                            "Message does not exist or "
                            "already has a reply."
                        ),
                    },
                },
            )

        return message