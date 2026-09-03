from app.core.tokens import generate_conversation_token, hash_conversation_token


def test_generate_and_hash_conversation_token():
    token = generate_conversation_token()
    assert isinstance(token, str)
    assert len(token) > 20

    hashed = hash_conversation_token(token)
    assert isinstance(hashed, str)
    assert len(hashed) == 64
    # Hashing should be deterministic
    assert hash_conversation_token(token) == hashed


def test_unique_tokens():
    token_1 = generate_conversation_token()
    token_2 = generate_conversation_token()
    assert token_1 != token_2
    assert hash_conversation_token(token_1) != hash_conversation_token(token_2)
