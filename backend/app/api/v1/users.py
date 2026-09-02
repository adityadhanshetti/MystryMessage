from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import CurrentClerkUser
from app.db.mongodb import mongodb
from app.repositories.users import UserRepository
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
            "bio": user["bio"],
            "avatar_url": user["avatar_url"],
        },
    }

def serialize_user(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "display_name": user["display_name"],
        "bio": user["bio"],
        "avatar_url": user["avatar_url"],
        "is_public": user["is_public"],
    }