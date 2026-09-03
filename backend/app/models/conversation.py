from datetime import datetime, timezone
from typing import Any

from bson import ObjectId


class ConversationModel:
    collection_name = "conversations"

    @staticmethod
    def create_document(
        *,
        recipient_id: ObjectId,
        token_hash: str,
    ) -> dict[str, Any]:
        now = datetime.now(timezone.utc)

        return {
            "_id": ObjectId(),
            "recipient_id": recipient_id,
            "token_hash": token_hash,
            "is_active": True,
            "created_at": now,
            "updated_at": now,
        }