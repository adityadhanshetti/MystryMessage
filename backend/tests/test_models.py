from datetime import datetime, timezone
from bson import ObjectId
from app.models.conversation import ConversationModel
from app.models.user import UserModel


def test_user_model_defaults():
    doc = UserModel.create_document(
        clerk_user_id="user_test123",
        username="cooluser",
        display_name="Cool User",
    )
    assert doc["clerk_user_id"] == "user_test123"
    assert doc["username"] == "cooluser"
    assert doc["username_normalized"] == "cooluser"
    assert doc["is_public"] is True
    assert doc["accept_messages"] is True
    assert isinstance(doc["_id"], ObjectId)
    assert isinstance(doc["created_at"], datetime)


def test_conversation_model_fields():
    recipient_id = ObjectId()
    doc = ConversationModel.create_document(
        recipient_id=recipient_id,
        token_hash="fakehash123",
        initial_snippet="First anonymous message",
    )
    assert doc["recipient_id"] == recipient_id
    assert doc["token_hash"] == "fakehash123"
    assert doc["is_active"] is True
    assert doc["is_read"] is False
    assert doc["last_message_content"] == "First anonymous message"
    assert doc["last_message_sender"] == "anonymous"
    assert doc["message_count"] == 1
    assert "expires_at" in doc
    assert doc["expires_at"] > doc["created_at"]
