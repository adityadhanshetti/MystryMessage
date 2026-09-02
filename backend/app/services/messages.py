from bson import ObjectId
from fastapi import HTTPException, status

from app.models.message import MessageModel
from app.repositories.messages import MessageRepository
from app.repositories.users import UserRepository
from app.schemas.message import MessageCreate


class MessageService:
    def __init__(
        self,
        message_repository: MessageRepository,
        user_repository: UserRepository,
    ) -> None:
        self.messages = message_repository
        self.users = user_repository

    def send_message(
        self,
        username: str,
        payload: MessageCreate,
    ) -> dict:
        recipient = self.users.get_by_username(username)

        if not recipient or not recipient.get("is_public", True):
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

        document = MessageModel.create_document(
            recipient_id=recipient["_id"],
            content=payload.content,
        )

        return self.messages.create(document)

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