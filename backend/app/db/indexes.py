from pymongo.database import Database


def create_indexes(database: Database) -> None:
    users = database["users"]
    messages = database["messages"]
    conversations = database["conversations"]

    # User indexes
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

    # Message indexes
    messages.create_index(
        [
            ("recipient_id", 1),
            ("created_at", -1),
        ],
        name="idx_messages_recipient_created",
    )

    messages.create_index(
        [
            ("conversation_id", 1),
            ("created_at", 1),
        ],
        name="idx_messages_conversation_created",
    )

    messages.create_index(
        [
            ("recipient_id", 1),
            ("is_read", 1),
            ("created_at", -1),
        ],
        name="idx_messages_recipient_read",
    )

    # Conversation indexes
    conversations.create_index(
        "token_hash",
        unique=True,
        name="uq_conversations_token_hash",
    )

    conversations.create_index(
        [
            ("recipient_id", 1),
            ("last_message_at", -1),
        ],
        name="idx_conversations_recipient_last_message",
    )

    conversations.create_index(
        [
            ("recipient_id", 1),
            ("is_read", 1),
            ("last_message_at", -1),
        ],
        name="idx_conversations_recipient_read_last_message",
    )

    # TTL index to automatically purge expired conversations
    conversations.create_index(
        "expires_at",
        expireAfterSeconds=0,
        name="ttl_conversations_expires_at",
    )