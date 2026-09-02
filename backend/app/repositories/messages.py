from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from pymongo.database import Database


class MessageRepository:
    def __init__(self, database: Database) -> None:
        self.collection = database["messages"]

    def create(self, document: dict[str, Any]) -> dict[str, Any]:
        self.collection.insert_one(document)
        return document

    def get_inbox(
        self,
        recipient_id: ObjectId,
        *,
        limit: int = 50,
        skip: int = 0,
    ) -> list[dict[str, Any]]:
        cursor = (
            self.collection
            .find(
                {
                    "recipient_id": recipient_id,
                    "is_deleted": False,
                }
            )
            .sort("created_at", -1)
            .skip(skip)
            .limit(limit)
        )

        return list(cursor)

    def get_by_id(
        self,
        message_id: ObjectId,
    ) -> dict[str, Any] | None:
        return self.collection.find_one(
            {
                "_id": message_id,
                "is_deleted": False,
            }
        )

    def mark_as_read(
        self,
        message_id: ObjectId,
        recipient_id: ObjectId,
    ) -> dict[str, Any] | None:
        self.collection.update_one(
            {
                "_id": message_id,
                "recipient_id": recipient_id,
                "is_deleted": False,
            },
            {
                "$set": {
                    "is_read": True,
                    "updated_at": datetime.now(timezone.utc),
                }
            },
        )

        return self.get_by_id(message_id)

    def soft_delete(
        self,
        message_id: ObjectId,
        recipient_id: ObjectId,
    ) -> bool:
        result = self.collection.update_one(
            {
                "_id": message_id,
                "recipient_id": recipient_id,
                "is_deleted": False,
            },
            {
                "$set": {
                    "is_deleted": True,
                    "updated_at": datetime.now(timezone.utc),
                }
            },
        )

        return result.modified_count == 1

    def count_unread(
        self,
        recipient_id: ObjectId,
    ) -> int:
        return self.collection.count_documents(
            {
                "recipient_id": recipient_id,
                "is_read": False,
                "is_deleted": False,
            }
        )