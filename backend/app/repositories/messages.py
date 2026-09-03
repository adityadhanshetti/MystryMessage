from datetime import datetime, timezone, timedelta
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
        recipient_id: ObjectId | None,
        *,
        limit: int = 50,
        skip: int = 0,
    ) -> list[dict[str, Any]]:
        cursor = (
            self.collection
            .find(
                {
                    "recipient_id": recipient_id,
                    "sender": "anonymous",
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
        recipient_id: ObjectId | None,
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

    def mark_all_read(
        self,
        recipient_id: ObjectId | None,
    ) -> int:
        result = self.collection.update_many(
            {
                "recipient_id": recipient_id,
                "is_read": False,
                "is_deleted": False,
            },
            {
                "$set": {
                    "is_read": True,
                    "updated_at": datetime.now(timezone.utc),
                }
            },
        )
        return result.modified_count

    def soft_delete(
        self,
        message_id: ObjectId,
        recipient_id: ObjectId | None,
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

    def report_message(
        self,
        message_id: ObjectId,
        recipient_id: ObjectId | None,
        reason: str = "inappropriate",
    ) -> bool:
        result = self.collection.update_one(
            {
                "_id": message_id,
                "recipient_id": recipient_id,
                "is_deleted": False,
            },
            {
                "$set": {
                    "is_reported": True,
                    "report_reason": reason,
                    "reported_at": datetime.now(timezone.utc),
                    "updated_at": datetime.now(timezone.utc),
                }
            },
        )
        return result.modified_count == 1

    def count_unread(
        self,
        recipient_id: ObjectId | None,
    ) -> int:
        return self.collection.count_documents(
            {
                "recipient_id": recipient_id,
                "is_read": False,
                "is_deleted": False,
            }
        )

    def recent_duplicate_exists(
        self,
        recipient_id: ObjectId | None,
        content: str,
    ) -> bool:
        return (
            self.collection.count_documents(
                {
                    "recipient_id": recipient_id,
                    "content": content,
                    "is_deleted": False,
                    "created_at": {
                        "$gte": datetime.now(timezone.utc)
                        - timedelta(minutes=5)
                    },
                },
                limit=1,
            )
            > 0
        )

    def add_reply(
        self,
        message_id: ObjectId,
        recipient_id: ObjectId | None,
        content: str,
    ) -> dict[str, Any] | None:
        now = datetime.now(timezone.utc)

        result = self.collection.update_one(
            {
                "_id": message_id,
                "recipient_id": recipient_id,
                "is_deleted": False,
                "reply": None,
            },
            {
                "$set": {
                    "reply": {
                        "content": content,
                        "created_at": now,
                    },
                    "updated_at": now,
                }
            },
        )

        if result.modified_count != 1:
            return None

        return self.get_by_id(message_id)

    def get_conversation_messages(
        self,
        conversation_id: ObjectId,
    ) -> list[dict[str, Any]]:
        cursor = (
            self.collection
            .find(
                {
                    "conversation_id": conversation_id,
                    "is_deleted": False,
                }
            )
            .sort("created_at", 1)
        )

        return list(cursor)

    def add_reaction(
        self,
        message_id: ObjectId,
        emoji: str,
    ) -> dict[str, Any] | None:
        self.collection.update_one(
            {
                "_id": message_id,
                "is_deleted": False,
            },
            {
                "$inc": {f"reactions.{emoji}": 1},
                "$set": {"updated_at": datetime.now(timezone.utc)},
            },
        )
        return self.get_by_id(message_id)

    def get_engagement_stats(self, recipient_id: ObjectId) -> dict[str, Any]:
        total_messages = self.collection.count_documents(
            {"recipient_id": recipient_id, "is_deleted": False}
        )
        unread_messages = self.collection.count_documents(
            {"recipient_id": recipient_id, "is_read": False, "is_deleted": False}
        )
        owner_replies = self.collection.count_documents(
            {"recipient_id": recipient_id, "sender": "owner", "is_deleted": False}
        )
        anonymous_messages = self.collection.count_documents(
            {"recipient_id": recipient_id, "sender": "anonymous", "is_deleted": False}
        )

        reply_rate = (
            round((owner_replies / anonymous_messages) * 100)
            if anonymous_messages > 0
            else 0
        )

        return {
            "total_messages": total_messages,
            "anonymous_messages": anonymous_messages,
            "owner_replies": owner_replies,
            "unread_count": unread_messages,
            "reply_rate": min(100, reply_rate),
        }