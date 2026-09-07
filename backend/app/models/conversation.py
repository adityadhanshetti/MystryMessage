from datetime import datetime, timezone, timedelta
from typing import Any

from bson import ObjectId

# Default conversation expiration period (30 days)
DEFAULT_CONVERSATION_TTL_DAYS = 30


class ConversationModel:
    collection_name = "conversations"

    @staticmethod
    def create_document(
        *,
        recipient_id: ObjectId | None,
        token_hash: str,
        initial_snippet: str = "",
        ttl_days: int = DEFAULT_CONVERSATION_TTL_DAYS,
    ) -> dict[str, Any]:
        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(days=ttl_days)

        return {
            "_id": ObjectId(),
            "recipient_id": recipient_id,
            "token_hash": token_hash,
            "is_active": True,
            "is_read": False,
            "last_message_content": initial_snippet[:120] if initial_snippet else "",
            "last_message_sender": "anonymous",
            "last_message_at": now,
            "message_count": 1 if initial_snippet else 0,
            "expires_at": expires_at,
            "created_at": now,
            "updated_at": now,
        }