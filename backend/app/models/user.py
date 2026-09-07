from datetime import datetime, timezone
from typing import Any

from bson import ObjectId


class UserModel:
    """
    MongoDB representation of an application user.

    Authentication identity belongs to Clerk.
    This model only stores Mystry-specific user information.
    """

    collection_name = "users"

    @staticmethod
    def create_document(
        *,
        clerk_user_id: str,
        username: str,
        display_name: str,
        bio: str = "",
        avatar_url: str = "",
    ) -> dict[str, Any]:
        now = datetime.now(timezone.utc)

        return {
            "_id": ObjectId(),
            "clerk_user_id": clerk_user_id,
            "username": username,
            "username_normalized": username.lower(),
            "display_name": display_name,
            "bio": bio,
            "avatar_url": avatar_url,
            "is_public": True,
            "accept_messages": True,
            "created_at": now,
            "updated_at": now,
        }