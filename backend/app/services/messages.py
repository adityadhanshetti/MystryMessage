from bson import ObjectId
from fastapi import HTTPException, status

from app.core.moderation import contains_abusive_content
from app.models.message import MessageModel
from app.repositories.messages import MessageRepository
from app.repositories.users import UserRepository
from app.repositories.conversations import ConversationRepository
from app.schemas.message import MessageCreate
from app.services.conversations import ConversationService


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
        sender_hint: dict | None = None,
    ) -> tuple[dict, str]:
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

        if not recipient.get("accept_messages", True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "success": False,
                    "error": {
                        "code": "MESSAGING_DISABLED",
                        "message": "This user is currently not accepting anonymous messages.",
                    },
                },
            )

        # Content moderation check
        if contains_abusive_content(payload.content):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={
                    "success": False,
                    "error": {
                        "code": "CONTENT_FLAGGED",
                        "message": "Message violates community guidelines and cannot be delivered.",
                    },
                },
            )

        # Duplicate message spam protection (within 5 minutes)
        if self.messages.recent_duplicate_exists(recipient["_id"], payload.content):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "success": False,
                    "error": {
                        "code": "DUPLICATE_MESSAGE",
                        "message": "A similar message was sent recently. Please wait before sending again.",
                    },
                },
            )

        conversation_service = ConversationService(self.conversations)
        conversation, token = conversation_service.create(
            recipient["_id"],
            initial_snippet=payload.content,
        )

        document = MessageModel.create_document(
            conversation_id=conversation["_id"],
            recipient_id=recipient["_id"],
            content=payload.content,
            sender="anonymous",
            sender_hint=sender_hint,
        )

        message = self.messages.create(document)
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
                detail={
                    "success": False,
                    "error": {
                        "code": "INVALID_ID",
                        "message": "Invalid user ID.",
                    },
                },
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

    def mark_all_read(self, recipient_id: str) -> int:
        try:
            recipient_object_id = ObjectId(recipient_id)
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "success": False,
                    "error": {
                        "code": "INVALID_ID",
                        "message": "Invalid user ID.",
                    },
                },
            ) from exc

        return self.messages.mark_all_read(recipient_object_id)

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

    def report_message(
        self,
        message_id: str,
        recipient_id: str,
        reason: str = "inappropriate",
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

        reported = self.messages.report_message(
            message_object_id,
            recipient_object_id,
            reason=reason,
        )

        if not reported:
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
                        "message": "Message does not exist or already has a reply.",
                    },
                },
            )

        return message

    def send_conversation_message(
        self,
        *,
        conversation_id: ObjectId,
        content: str,
        sender: str,
    ) -> dict:
        content = content.strip()

        if not content:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={
                    "success": False,
                    "error": {
                        "code": "EMPTY_MESSAGE",
                        "message": "Message cannot be empty.",
                    },
                },
            )

        if len(content) > 1000:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={
                    "success": False,
                    "error": {
                        "code": "MESSAGE_TOO_LONG",
                        "message": "Message cannot exceed 1000 characters.",
                    },
                },
            )

        if contains_abusive_content(content):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={
                    "success": False,
                    "error": {
                        "code": "CONTENT_FLAGGED",
                        "message": "Message violates community safety guidelines.",
                    },
                },
            )

        document = MessageModel.create_document(
            conversation_id=conversation_id,
            recipient_id=None,
            content=content,
            sender=sender,
        )

        created = self.messages.create(document)
        self.conversations.record_new_message(
            conversation_id, snippet=content, sender=sender
        )
        return created

    def send_owner_conversation_message(
        self,
        *,
        conversation_id: ObjectId,
        recipient_id: ObjectId,
        content: str,
    ) -> dict:
        content = content.strip()

        if not content:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={
                    "success": False,
                    "error": {
                        "code": "EMPTY_MESSAGE",
                        "message": "Message cannot be empty.",
                    },
                },
            )

        if len(content) > 1000:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={
                    "success": False,
                    "error": {
                        "code": "MESSAGE_TOO_LONG",
                        "message": "Message cannot exceed 1000 characters.",
                    },
                },
            )

        conversation = self.conversations.get_by_id(conversation_id)

        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "success": False,
                    "error": {
                        "code": "CONVERSATION_NOT_FOUND",
                        "message": "Conversation not found.",
                    },
                },
            )

        if conversation["recipient_id"] != recipient_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "success": False,
                    "error": {
                        "code": "CONVERSATION_ACCESS_DENIED",
                        "message": "You do not have access to this conversation.",
                    },
                },
            )

        if not conversation.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail={
                    "success": False,
                    "error": {
                        "code": "CONVERSATION_CLOSED",
                        "message": "This conversation has been closed.",
                    },
                },
            )

        document = MessageModel.create_document(
            conversation_id=conversation_id,
            recipient_id=recipient_id,
            content=content,
            sender="owner",
        )

        created = self.messages.create(document)
        self.conversations.record_new_message(
            conversation_id, snippet=content, sender="owner"
        )
        return created

    def add_reaction(self, message_id: ObjectId, emoji: str) -> dict:
        msg = self.messages.get_by_id(message_id)
        if not msg:
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
        return self.messages.add_reaction(message_id, emoji)

    def get_engagement_stats(self, recipient_id: ObjectId) -> dict:
        return self.messages.get_engagement_stats(recipient_id)