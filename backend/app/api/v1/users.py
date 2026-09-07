from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import CurrentClerkUser
from app.db.mongodb import mongodb
from app.repositories.users import UserRepository
from app.repositories.messages import MessageRepository
from app.schemas.user import (
    ProfileUpdate,
    UsernameAvailabilityResponse,
    validate_username,
)
from app.services.users import UserService


router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


def get_user_service() -> UserService:
    return UserService(
        repository=UserRepository(
            mongodb.get_database()
        )
    )


@router.get("/me/stats")
def get_my_stats(
    clerk_user_id: CurrentClerkUser,
    user_service: UserService = Depends(get_user_service),
):
    user = user_service.get_or_create_user(clerk_user_id)
    message_repo = MessageRepository(mongodb.get_database())
    stats = message_repo.get_engagement_stats(user["_id"])
    return {
        "success": True,
        "data": stats,
    }


@router.get("/me")
def get_my_profile(
    clerk_user_id: CurrentClerkUser,
    service: UserService = Depends(get_user_service),
):
    user = service.get_or_create_user(
        clerk_user_id
    )

    return {
        "success": True,
        "data": serialize_user(user),
    }


@router.patch("/me")
def update_my_profile(
    payload: ProfileUpdate,
    clerk_user_id: CurrentClerkUser,
    service: UserService = Depends(get_user_service),
):
    user = service.get_or_create_user(
        clerk_user_id
    )

    updated = service.update_profile(
        str(user["_id"]),
        payload,
    )

    return {
        "success": True,
        "data": serialize_user(updated),
    }


@router.post("/avatar-signature")
def get_avatar_upload_signature(
    clerk_user_id: CurrentClerkUser,
):
    from app.core.config import get_settings
    settings = get_settings()

    if not settings.cloudinary_cloud_name or not settings.cloudinary_api_secret or not settings.cloudinary_api_key:
        return {
            "success": True,
            "data": {
                "configured": False,
                "message": "Cloudinary is not configured. Direct image URL entry supported.",
            },
        }

    import time
    import cloudinary.utils

    timestamp = int(time.time())
    folder = "mystry_avatars"
    params = {
        "folder": folder,
        "timestamp": timestamp,
    }
    signature = cloudinary.utils.api_sign_request(
        params,
        settings.cloudinary_api_secret,
    )

    return {
        "success": True,
        "data": {
            "configured": True,
            "cloud_name": settings.cloudinary_cloud_name,
            "api_key": settings.cloudinary_api_key,
            "timestamp": timestamp,
            "folder": folder,
            "signature": signature,
        },
    }


@router.get(
    "/username/{username}/availability",
    response_model=UsernameAvailabilityResponse,
)
def check_username_availability(
    username: str,
    service: UserService = Depends(get_user_service),
):
    normalized = validate_username(username)

    return UsernameAvailabilityResponse(
        username=normalized,
        available=service.username_available(
            normalized
        ),
    )


@router.get("/public/{username}")
def get_public_profile(
    username: str,
    service: UserService = Depends(get_user_service),
):
    normalized = validate_username(username)

    user = service.repository.get_by_username(normalized)

    if not user or not user.get("is_public", True):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "error": {
                    "code": "PROFILE_NOT_FOUND",
                    "message": "Profile not found.",
                },
            },
        )

    return {
        "success": True,
        "data": {
            "username": user["username"],
            "display_name": user["display_name"],
            "bio": user.get("bio", ""),
            "avatar_url": user.get("avatar_url", ""),
            "accept_messages": user.get("accept_messages", True),
        },
    }

def serialize_user(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "display_name": user["display_name"],
        "bio": user.get("bio", ""),
        "avatar_url": user.get("avatar_url", ""),
        "is_public": user.get("is_public", True),
        "accept_messages": user.get("accept_messages", True),
    }