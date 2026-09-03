from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from pymongo.database import Database


class ConversationRepository:
    def __init__(self, database: Database) -> None:
        self.collection = database["conversations"]

    def create(
        self,
        document: dict[str, Any],
    ) -> dict[str, Any]:
        self.collection.insert_one(document)
        return document

    def get_by_token_hash(
        self,
        token_hash: str,
    ) -> dict[str, Any] | None:
        return self.collection.find_one(
            {
                "token_hash": token_hash,
                "is_active": True,
            }
        )

    def update_timestamp(
        self,
        conversation_id: ObjectId,
    ) -> None:
        self.collection.update_one(
            {"_id": conversation_id},
            {
                "$set": {
                    "updated_at": datetime.now(timezone.utc),
                }
            },
        )