from fastapi import APIRouter, Depends, Query, status, HTTPException, Request, Header
from bson import ObjectId

from app.api.dependencies import CurrentClerkUser
from app.db.mongodb import mongodb
from app.repositories.messages import MessageRepository
from app.repositories.users import UserRepository
from app.repositories.conversations import ConversationRepository
from app.schemas.message import MessageCreate, MessageReply, MessageReaction
from app.services.messages import MessageService
from app.services.users import UserService
from app.services.conversations import ConversationService
from app.core.security import anonymous_message_limiter
from app.core.client_hints import parse_safe_client_hints


router = APIRouter(
    prefix="/messages",
    tags=["Messages"],
)


def get_message_service() -> MessageService:
    database = mongodb.get_database()

    return MessageService(
        message_repository=MessageRepository(database),
        user_repository=UserRepository(database),
        conversation_repository=ConversationRepository(database),
    )


def check_anonymous_rate_limit(request: Request) -> None:
    client_host = request.client.host if request.client else "unknown"

    key = f"anonymous-message:{client_host}"

    if not anonymous_message_limiter.is_allowed(key):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "success": False,
                "error": {
                    "code": "RATE_LIMIT_EXCEEDED",
                    "message": (
                        "Too many messages. "
                        "Please try again later."
                    ),
                },
            },
        )


# ──────────────────────────────────────────
# Static routes MUST come before parametric
# routes to avoid path-parameter shadowing.
# ──────────────────────────────────────────

@router.get("/inbox")
def get_my_inbox(
    clerk_user_id: CurrentClerkUser,
    service: MessageService = Depends(get_message_service),
    limit: int = Query(default=20, ge=1, le=100),
    skip: int = Query(default=0, ge=0),
):
    user_service = UserService(service.users)
    user = user_service.get_or_create_user(clerk_user_id)

    messages = service.get_inbox(
        recipient_id=str(user["_id"]),
        limit=limit,
        skip=skip,
    )

    return {
        "success": True,
        "data": [
            {
                "id": str(message["_id"]),
                "content": message["content"],
                "is_read": message["is_read"],
                "reply": message.get("reply"),
                "conversation_id": str(message["conversation_id"]),
                "created_at": message["created_at"],
            }
            for message in messages
        ],
    }


@router.get("/unread-count")
def get_unread_count(
    clerk_user_id: CurrentClerkUser,
    service: MessageService = Depends(get_message_service),
):
    user_service = UserService(service.users)
    user = user_service.get_or_create_user(clerk_user_id)

    count = service.messages.count_unread(user["_id"])

    return {
        "success": True,
        "data": {
            "count": count,
        },
    }


@router.post("/mark-all-read")
def mark_all_messages_as_read(
    clerk_user_id: CurrentClerkUser,
    service: MessageService = Depends(get_message_service),
):
    user_service = UserService(service.users)
    user = user_service.get_or_create_user(clerk_user_id)

    count = service.mark_all_read(str(user["_id"]))

    return {
        "success": True,
        "data": {
            "message": f"Marked {count} messages as read.",
            "count": count,
        },
    }


@router.get("/conversations/{conversation_id}")
def get_anonymous_conversation(
    conversation_id: str,
    conversation_token: str = Header(
        ...,
        alias="X-Conversation-Token",
    ),
    service: MessageService = Depends(get_message_service),
):
    try:
        conversation_object_id = ObjectId(conversation_id)
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "error": {
                    "code": "INVALID_CONVERSATION_ID",
                    "message": "Invalid conversation ID.",
                },
            },
        ) from exc

    conversation = ConversationService(
        service.conversations
    ).get_by_token(conversation_token)

    if (
        not conversation
        or conversation["_id"] != conversation_object_id
    ):
        raise HTTPException(
            status_code=403,
            detail={
                "success": False,
                "error": {
                    "code": "INVALID_CONVERSATION_ACCESS",
                    "message": "Conversation access denied.",
                },
            },
        )

    if not conversation.get("is_active", True):
        raise HTTPException(
            status_code=410,
            detail={
                "success": False,
                "error": {
                    "code": "CONVERSATION_CLOSED",
                    "message": "This conversation has been closed.",
                },
            },
        )

    messages = service.messages.get_conversation_messages(
        conversation_object_id
    )

    return {
        "success": True,
        "data": [
            {
                "id": str(message["_id"]),
                "content": message["content"],
                "sender": message["sender"],
                "created_at": message["created_at"],
                "sender_hint": message.get("sender_hint"),
                "reactions": message.get("reactions", {}),
            }
            for message in messages
        ],
    }


@router.get("/conversations/{conversation_id}/owner")
def get_owner_conversation(
    conversation_id: str,
    clerk_user_id: CurrentClerkUser,
    service: MessageService = Depends(get_message_service),
):
    try:
        conversation_object_id = ObjectId(conversation_id)
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "error": {
                    "code": "INVALID_CONVERSATION_ID",
                    "message": "Invalid conversation ID.",
                },
            },
        ) from exc

    user = service.users.get_by_clerk_id(clerk_user_id)

    if not user:
        raise HTTPException(
            status_code=404,
            detail={
                "success": False,
                "error": {
                    "code": "USER_NOT_FOUND",
                    "message": "User profile not found.",
                },
            },
        )

    conversation = service.conversations.get_by_id(
        conversation_object_id
    )

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail={
                "success": False,
                "error": {
                    "code": "CONVERSATION_NOT_FOUND",
                    "message": "Conversation not found.",
                },
            },
        )

    if conversation["recipient_id"] != user["_id"]:
        raise HTTPException(
            status_code=403,
            detail={
                "success": False,
                "error": {
                    "code": "CONVERSATION_ACCESS_DENIED",
                    "message": "You do not have access to this conversation.",
                },
            },
        )

    messages = service.messages.get_conversation_messages(
        conversation_object_id
    )

    return {
        "success": True,
        "data": {
            "conversation": {
                "id": str(conversation["_id"]),
                "is_active": conversation.get("is_active", True),
                "created_at": conversation["created_at"],
                "updated_at": conversation["updated_at"],
            },
            "messages": [
                {
                    "id": str(message["_id"]),
                    "content": message["content"],
                    "sender": message["sender"],
                    "created_at": message["created_at"],
                    "sender_hint": message.get("sender_hint"),
                    "reactions": message.get("reactions", {}),
                }
                for message in messages
            ],
        },
    }


@router.post("/conversations/{conversation_id}/messages")
def send_anonymous_conversation_message(
    conversation_id: str,
    payload: MessageCreate,
    conversation_token: str = Header(
        ...,
        alias="X-Conversation-Token",
    ),
    service: MessageService = Depends(get_message_service),
):
    try:
        conversation_object_id = ObjectId(conversation_id)
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "error": {
                    "code": "INVALID_CONVERSATION_ID",
                    "message": "Invalid conversation ID.",
                },
            },
        ) from exc

    conversation = ConversationService(
        service.conversations
    ).get_by_token(conversation_token)

    if (
        not conversation
        or conversation["_id"] != conversation_object_id
    ):
        raise HTTPException(
            status_code=403,
            detail={
                "success": False,
                "error": {
                    "code": "INVALID_CONVERSATION_ACCESS",
                    "message": "Conversation access denied.",
                },
            },
        )

    if not conversation.get("is_active", True):
        raise HTTPException(
            status_code=410,
            detail={
                "success": False,
                "error": {
                    "code": "CONVERSATION_CLOSED",
                    "message": "This conversation has been closed.",
                },
            },
        )

    message = service.send_conversation_message(
        conversation_id=conversation_object_id,
        content=payload.content,
        sender="anonymous",
    )

    return {
        "success": True,
        "data": {
            "id": str(message["_id"]),
            "content": message["content"],
            "sender": message["sender"],
            "created_at": message["created_at"],
        },
    }


@router.post("/conversations/{conversation_id}/owner-messages")
def send_owner_conversation_message(
    conversation_id: str,
    payload: MessageCreate,
    clerk_user_id: CurrentClerkUser,
    service: MessageService = Depends(get_message_service),
):
    try:
        conversation_object_id = ObjectId(conversation_id)
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "error": {
                    "code": "INVALID_CONVERSATION_ID",
                    "message": "Invalid conversation ID.",
                },
            },
        ) from exc

    user = service.users.get_by_clerk_id(clerk_user_id)

    if not user:
        raise HTTPException(
            status_code=404,
            detail={
                "success": False,
                "error": {
                    "code": "USER_NOT_FOUND",
                    "message": "User profile not found.",
                },
            },
        )

    message = service.send_owner_conversation_message(
        conversation_id=conversation_object_id,
        recipient_id=user["_id"],
        content=payload.content,
    )

    return {
        "success": True,
        "data": {
            "id": str(message["_id"]),
            "content": message["content"],
            "sender": message["sender"],
            "created_at": message["created_at"],
        },
    }


# ──────────────────────────────────────────
# Parametric routes — MUST come after all
# static /messages/... routes above.
# ──────────────────────────────────────────

@router.post("/{message_id}/react")
def react_to_message(
    message_id: str,
    payload: MessageReaction,
    service: MessageService = Depends(get_message_service),
):
    try:
        msg_id = ObjectId(message_id)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "success": False,
                "error": {
                    "code": "INVALID_ID",
                    "message": "Invalid message ID.",
                },
            },
        ) from exc

    updated = service.add_reaction(msg_id, payload.emoji)

    return {
        "success": True,
        "data": {
            "id": str(updated["_id"]),
            "reactions": updated.get("reactions", {}),
        },
    }


@router.post(
    "/{username}",
    status_code=status.HTTP_201_CREATED,
)
def send_anonymous_message(
    request: Request,
    username: str,
    payload: MessageCreate,
    _: None = Depends(check_anonymous_rate_limit),
    service: MessageService = Depends(get_message_service),
):
    user_agent = request.headers.get("user-agent")
    hints = parse_safe_client_hints(user_agent)

    message, conversation_token = service.send_message(
        username=username,
        payload=payload,
        sender_hint=hints,
    )

    return {
        "success": True,
        "data": {
            "message": "Message sent successfully.",
            "message_id": str(message["_id"]),
            "conversation_id": str(message["conversation_id"]),
            "conversation_token": conversation_token,
        },
    }


@router.patch("/{message_id}/read")
def mark_message_as_read(
    message_id: str,
    clerk_user_id: CurrentClerkUser,
    service: MessageService = Depends(get_message_service),
):
    user_service = UserService(service.users)
    user = user_service.get_or_create_user(clerk_user_id)

    service.mark_as_read(
        message_id=message_id,
        recipient_id=str(user["_id"]),
    )

    return {
        "success": True,
        "data": {
            "message": "Message marked as read.",
        },
    }


@router.delete("/{message_id}")
def delete_message(
    message_id: str,
    clerk_user_id: CurrentClerkUser,
    service: MessageService = Depends(get_message_service),
):
    user_service = UserService(service.users)
    user = user_service.get_or_create_user(clerk_user_id)

    service.delete_message(
        message_id=message_id,
        recipient_id=str(user["_id"]),
    )

    return {
        "success": True,
        "data": {
            "message": "Message deleted.",
        },
    }


@router.post("/{message_id}/report")
def report_message(
    message_id: str,
    clerk_user_id: CurrentClerkUser,
    service: MessageService = Depends(get_message_service),
):
    user_service = UserService(service.users)
    user = user_service.get_or_create_user(clerk_user_id)

    service.report_message(
        message_id=message_id,
        recipient_id=str(user["_id"]),
    )

    return {
        "success": True,
        "data": {
            "message": "Message reported.",
        },
    }


@router.post("/{message_id}/reply")
def reply_to_message(
    message_id: str,
    payload: MessageReply,
    clerk_user_id: CurrentClerkUser,
    service: MessageService = Depends(get_message_service),
):
    user_service = UserService(service.users)
    user = user_service.get_or_create_user(clerk_user_id)

    message = service.reply_to_message(
        message_id=message_id,
        recipient_id=str(user["_id"]),
        content=payload.content,
    )

    return {
        "success": True,
        "data": {
            "id": str(message["_id"]),
            "message": "Reply sent successfully.",
        },
    }