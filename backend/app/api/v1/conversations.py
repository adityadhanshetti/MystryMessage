from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.dependencies import CurrentClerkUser
from app.db.mongodb import mongodb
from app.repositories.conversations import ConversationRepository
from app.repositories.users import UserRepository
from app.services.conversations import ConversationService
from app.services.users import UserService

router = APIRouter(
    prefix="/conversations",
    tags=["Conversations"],
)


def get_conversation_service() -> ConversationService:
    database = mongodb.get_database()
    return ConversationService(
        repository=ConversationRepository(database),
    )


def get_user_service() -> UserService:
    database = mongodb.get_database()
    return UserService(
        repository=UserRepository(database),
    )


@router.get("")
def list_conversations(
    clerk_user_id: CurrentClerkUser,
    filter_type: str = Query(
        default="all",
        pattern="^(all|unread|read)$",
        alias="filter",
    ),
    limit: int = Query(default=20, ge=1, le=100),
    skip: int = Query(default=0, ge=0),
    conversation_service: ConversationService = Depends(
        get_conversation_service
    ),
    user_service: UserService = Depends(get_user_service),
):
    user = user_service.get_or_create_user(clerk_user_id)

    result = conversation_service.get_owner_conversations(
        recipient_id=user["_id"],
        filter_type=filter_type,
        limit=limit,
        skip=skip,
    )

    return {
        "success": True,
        "data": result,
    }


@router.patch("/{conversation_id}/read")
def mark_conversation_as_read(
    conversation_id: str,
    clerk_user_id: CurrentClerkUser,
    conversation_service: ConversationService = Depends(
        get_conversation_service
    ),
    user_service: UserService = Depends(get_user_service),
):
    try:
        conv_obj_id = ObjectId(conversation_id)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "success": False,
                "error": {
                    "code": "INVALID_ID",
                    "message": "Invalid conversation ID.",
                },
            },
        ) from exc

    user = user_service.get_or_create_user(clerk_user_id)
    conversation_service.mark_as_read(conv_obj_id, user["_id"])

    return {
        "success": True,
        "data": {
            "message": "Conversation marked as read.",
        },
    }


@router.post("/mark-all-read")
def mark_all_conversations_as_read(
    clerk_user_id: CurrentClerkUser,
    conversation_service: ConversationService = Depends(
        get_conversation_service
    ),
    user_service: UserService = Depends(get_user_service),
):
    user = user_service.get_or_create_user(clerk_user_id)
    count = conversation_service.mark_all_read(user["_id"])

    return {
        "success": True,
        "data": {
            "message": f"Marked {count} conversations as read.",
            "count": count,
        },
    }


@router.patch("/{conversation_id}/close")
def close_conversation(
    conversation_id: str,
    clerk_user_id: CurrentClerkUser,
    conversation_service: ConversationService = Depends(
        get_conversation_service
    ),
    user_service: UserService = Depends(get_user_service),
):
    try:
        conv_obj_id = ObjectId(conversation_id)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "success": False,
                "error": {
                    "code": "INVALID_ID",
                    "message": "Invalid conversation ID.",
                },
            },
        ) from exc

    user = user_service.get_or_create_user(clerk_user_id)
    conversation_service.close_conversation(conv_obj_id, user["_id"])

    return {
        "success": True,
        "data": {
            "message": "Conversation has been closed.",
        },
    }
