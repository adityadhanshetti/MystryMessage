from bson import ObjectId

from app.core.tokens import (
    generate_conversation_token,
    hash_conversation_token,
)
from app.models.conversation import ConversationModel
from app.repositories.conversations import ConversationRepository


class ConversationService:
    def __init__(
        self,
        repository: ConversationRepository,
    ) -> None:
        self.repository = repository

    def create(
        self,
        recipient_id: ObjectId,
    ) -> tuple[dict, str]:
        token = generate_conversation_token()

        token_hash = hash_conversation_token(token)

        document = ConversationModel.create_document(
            recipient_id=recipient_id,
            token_hash=token_hash,
        )

        conversation = self.repository.create(
            document
        )

        return conversation, token

    def get_by_token(
        self,
        token: str,
    ) -> dict | None:
        token_hash = hash_conversation_token(token)

        return self.repository.get_by_token_hash(
            token_hash
        )