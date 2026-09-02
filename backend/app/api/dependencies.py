from typing import Annotated

from clerk_backend_api import (
    AuthenticateRequestOptions,
    authenticate_request,
)
from clerk_backend_api.security.types import RequestState
from fastapi import Depends, HTTPException, Request, status

from app.core.config import Settings, get_settings


def require_auth(
    request: Request,
    settings: Annotated[
        Settings,
        Depends(get_settings),
    ],
) -> RequestState:
    """
    Authenticate a request using Clerk.

    The frontend sends:

        Authorization: Bearer <Clerk session token>

    Clerk validates the signed session token and returns
    the authenticated request state.
    """

    try:
        state = authenticate_request(
            request,
            AuthenticateRequestOptions(
                secret_key=settings.clerk_secret_key,
                jwt_key=settings.clerk_jwt_key,
                authorized_parties=(
                    settings.clerk_authorized_party_list
                ),
                accepts_token=["session_token"],
            ),
        )

    except Exception as exc:
        # Never expose Clerk/internal authentication errors.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "success": False,
                "error": {
                    "code": "AUTHENTICATION_FAILED",
                    "message": "Authentication failed.",
                },
            },
        ) from exc

    if not state.is_signed_in:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "success": False,
                "error": {
                    "code": "UNAUTHENTICATED",
                    "message": "Authentication is required.",
                },
            },
        )

    return state


CurrentAuthState = Annotated[
    RequestState,
    Depends(require_auth),
]


def get_current_clerk_user_id(
    auth_state: CurrentAuthState,
) -> str:
    """
    Extract the authenticated Clerk user ID from
    the verified Clerk token.

    `sub` is taken only AFTER Clerk validates the token.
    """

    user_id = auth_state.payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "success": False,
                "error": {
                    "code": "USER_ID_NOT_FOUND",
                    "message": "Authenticated user could not be identified.",
                },
            },
        )

    return str(user_id)


CurrentClerkUser = Annotated[
    str,
    Depends(get_current_clerk_user_id),
]