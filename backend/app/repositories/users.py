from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from pymongo.database import Database


class UserRepository:
    def __init__(self, database: Database) -> None:
        self.collection = database["users"]

    def get_by_id(self, user_id: ObjectId) -> dict[str, Any] | None:
        return self.collection.find_one({"_id": user_id})

    def get_by_clerk_id(
        self,
        clerk_user_id: str,
    ) -> dict[str, Any] | None:
        return self.collection.find_one(
            {"clerk_user_id": clerk_user_id}
        )

    def get_by_username(
        self,
        username: str,
    ) -> dict[str, Any] | None:
        return self.collection.find_one(
            {
                "username_normalized": username.lower(),
            }
        )

    def username_exists(self, username: str) -> bool:
        return (
            self.collection.count_documents(
                {
                    "username_normalized": username.lower(),
                },
                limit=1,
            )
            > 0
        )

    def username_exists_for_other_user(
        self,
        username: str,
        user_id: ObjectId,
    ) -> bool:
        return (
            self.collection.count_documents(
                {
                    "username_normalized": username.lower(),
                    "_id": {"$ne": user_id},
                },
                limit=1,
            )
            > 0
        )

    def create(
        self,
        document: dict[str, Any],
    ) -> dict[str, Any]:
        self.collection.insert_one(document)

        return document

    def update(
        self,
        user_id: ObjectId,
        updates: dict[str, Any],
    ) -> dict[str, Any] | None:
        updates["updated_at"] =  datetime.now(timezone.utc)

        self.collection.update_one(
            {"_id": user_id},
            {"$set": updates},
        )

        return self.get_by_id(user_id)

    def delete(self, user_id: ObjectId) -> bool:
        result = self.collection.delete_one(
            {"_id": user_id}
        )

        return result.deleted_count == 1