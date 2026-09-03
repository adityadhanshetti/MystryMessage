from datetime import datetime, timezone
from typing import Any

from bson import ObjectId


class MessageModel:
    collection_name = "messages"

    @staticmethod
    def create_document(
        *,
        recipient_id: ObjectId,
        content: str,
    ) -> dict[str, Any]:
        now = datetime.now(timezone.utc)

        return {
            "_id": ObjectId(),
            "recipient_id": recipient_id,
            "content": content,
            "is_read": False,
            "is_deleted": False,
            "reply": None,
            "created_at": now,
            "updated_at": now,
        }