from bson import ObjectId
from fastapi import HTTPException, status

from app.core.tokens import (
    generate_conversation_token,
    hash_conversation_token,
)
from app.models.conversation import ConversationModel
from app.repositories.conversations import ConversationRepository


class ConversationService:
    def __init__(
        self,
        repository: ConversationRepository,
    ) -> None:
        self.repository = repository

    def create(
        self,
        recipient_id: ObjectId | None,
        initial_snippet: str = "",
    ) -> tuple[dict, str]:
        token = generate_conversation_token()
        token_hash = hash_conversation_token(token)

        document = ConversationModel.create_document(
            recipient_id=recipient_id,
            token_hash=token_hash,
            initial_snippet=initial_snippet,
        )

        conversation = self.repository.create(document)
        return conversation, token

    def get_by_token(
        self,
        token: str,
    ) -> dict | None:
        token_hash = hash_conversation_token(token)
        return self.repository.get_by_token_hash(token_hash)

    def get_owner_conversations(
        self,
        recipient_id: ObjectId,
        *,
        filter_type: str = "all",
        limit: int = 20,
        skip: int = 0,
    ) -> dict:
        conversations = self.repository.get_owner_conversations(
            recipient_id,
            filter_type=filter_type,
            limit=limit,
            skip=skip,
        )
        total = self.repository.count_owner_conversations(
            recipient_id,
            filter_type=filter_type,
        )
        unread_count = self.repository.count_unread(recipient_id)

        return {
            "items": [
                {
                    "id": str(c["_id"]),
                    "is_active": c.get("is_active", True),
                    "is_read": c.get("is_read", True),
                    "last_message_content": c.get("last_message_content", ""),
                    "last_message_sender": c.get("last_message_sender", "anonymous"),
                    "last_message_at": c.get("last_message_at"),
                    "message_count": c.get("message_count", 0),
                    "expires_at": c.get("expires_at"),
                    "created_at": c.get("created_at"),
                }
                for c in conversations
            ],
            "total": total,
            "unread_count": unread_count,
            "limit": limit,
            "skip": skip,
        }

    def mark_as_read(
        self,
        conversation_id: ObjectId,
        recipient_id: ObjectId,
    ) -> bool:
        return self.repository.mark_as_read(conversation_id, recipient_id)

    def mark_all_read(
        self,
        recipient_id: ObjectId,
    ) -> int:
        return self.repository.mark_all_read(recipient_id)

    def close_conversation(
        self,
        conversation_id: ObjectId,
        recipient_id: ObjectId,
    ) -> bool:
        conversation = self.repository.get_by_id(conversation_id)
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
                        "message": "Access denied to this conversation.",
                    },
                },
            )
        return self.repository.close_conversation(conversation_id, recipient_id)