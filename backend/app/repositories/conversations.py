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

    def get_by_id(self, conversation_id: ObjectId) -> dict[str, Any] | None:
        return self.collection.find_one({"_id": conversation_id})

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

    def get_owner_conversations(
        self,
        recipient_id: ObjectId,
        *,
        filter_type: str = "all",  # "all", "unread", "read"
        limit: int = 20,
        skip: int = 0,
    ) -> list[dict[str, Any]]:
        query: dict[str, Any] = {"recipient_id": recipient_id}

        if filter_type == "unread":
            query["is_read"] = False
        elif filter_type == "read":
            query["is_read"] = True

        cursor = (
            self.collection
            .find(query)
            .sort("last_message_at", -1)
            .skip(skip)
            .limit(limit)
        )

        return list(cursor)

    def count_owner_conversations(
        self,
        recipient_id: ObjectId,
        *,
        filter_type: str = "all",
    ) -> int:
        query: dict[str, Any] = {"recipient_id": recipient_id}

        if filter_type == "unread":
            query["is_read"] = False
        elif filter_type == "read":
            query["is_read"] = True

        return self.collection.count_documents(query)

    def count_unread(self, recipient_id: ObjectId) -> int:
        return self.collection.count_documents(
            {
                "recipient_id": recipient_id,
                "is_read": False,
            }
        )

    def mark_as_read(
        self,
        conversation_id: ObjectId,
        recipient_id: ObjectId,
    ) -> bool:
        result = self.collection.update_one(
            {
                "_id": conversation_id,
                "recipient_id": recipient_id,
            },
            {
                "$set": {
                    "is_read": True,
                    "updated_at": datetime.now(timezone.utc),
                }
            },
        )
        return result.modified_count > 0

    def mark_all_read(self, recipient_id: ObjectId) -> int:
        result = self.collection.update_many(
            {
                "recipient_id": recipient_id,
                "is_read": False,
            },
            {
                "$set": {
                    "is_read": True,
                    "updated_at": datetime.now(timezone.utc),
                }
            },
        )
        return result.modified_count

    def close_conversation(
        self,
        conversation_id: ObjectId,
        recipient_id: ObjectId,
    ) -> bool:
        result = self.collection.update_one(
            {
                "_id": conversation_id,
                "recipient_id": recipient_id,
            },
            {
                "$set": {
                    "is_active": False,
                    "updated_at": datetime.now(timezone.utc),
                }
            },
        )
        return result.modified_count > 0

    def record_new_message(
        self,
        conversation_id: ObjectId,
        snippet: str,
        sender: str,
    ) -> None:
        now = datetime.now(timezone.utc)
        update_doc: dict[str, Any] = {
            "$set": {
                "last_message_content": snippet[:120],
                "last_message_sender": sender,
                "last_message_at": now,
                "updated_at": now,
            },
            "$inc": {
                "message_count": 1,
            },
        }

        # If anonymous sent a message, mark conversation as unread for the owner
        if sender == "anonymous":
            update_doc["$set"]["is_read"] = False

        self.collection.update_one(
            {"_id": conversation_id},
            update_doc,
        )