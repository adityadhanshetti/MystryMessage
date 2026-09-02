from fastapi import APIRouter, Depends, Query, status,Path,HTTPException,Request

from app.api.dependencies import CurrentClerkUser
from app.db.mongodb import mongodb
from app.repositories.messages import MessageRepository
from app.repositories.users import UserRepository
from app.schemas.message import MessageCreate
from app.services.messages import MessageService
from app.services.users import UserService

from app.core.security import anonymous_message_limiter


router = APIRouter(
    prefix="/messages",
    tags=["Messages"],
)


def get_message_service() -> MessageService:
    database = mongodb.get_database()

    return MessageService(
        message_repository=MessageRepository(database),
        user_repository=UserRepository(database),
    )


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
    message = service.send_message(
        username=username,
        payload=payload,
    )

    return {
        "success": True,
        "data": {
            "message": "Message sent successfully.",
            "id": str(message["_id"]),
        },
    }


@router.get("/inbox")
def get_my_inbox(
    clerk_user_id: CurrentClerkUser,
    service: MessageService = Depends(get_message_service),
    limit: int = Query(default=50, ge=1, le=100),
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
                "created_at": message["created_at"],
            }
            for message in messages
        ],
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