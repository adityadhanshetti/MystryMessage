from pymongo.database import Database


def create_indexes(database: Database) -> None:
    users = database["users"]
    messages = database["messages"]

    users.create_index(
        "clerk_user_id",
        unique=True,
        name="uq_users_clerk_user_id",
    )

    users.create_index(
        "username_normalized",
        unique=True,
        name="uq_users_username_normalized",
    )

    messages.create_index(
        [
            ("recipient_id", 1),
            ("created_at", -1),
        ],
        name="idx_messages_recipient_created",
    )

    messages.create_index(
        [
            ("recipient_id", 1),
            ("is_read", 1),
            ("created_at", -1),
        ],
        name="idx_messages_recipient_read",
    )