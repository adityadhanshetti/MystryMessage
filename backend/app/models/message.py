from datetime import datetime, timezone
from typing import Any

from bson import ObjectId


class MessageModel:
    collection_name = "messages"

    @staticmethod
    def create_document(
        *,
        conversation_id: ObjectId,
        recipient_id: ObjectId | None,
        content: str,
        sender: str,
        sender_hint: dict[str, Any] | None = None,
        reactions: dict[str, int] | None = None,
    ) -> dict[str, Any]:
        now = datetime.now(timezone.utc)

        return {
            "_id": ObjectId(),
            "conversation_id": conversation_id,
            "recipient_id": recipient_id,
            "sender": sender,
            "content": content,
            "is_read": False,
            "is_deleted": False,
            "sender_hint": sender_hint or None,
            "reactions": reactions or {},
            "created_at": now,
            "updated_at": now,
        }