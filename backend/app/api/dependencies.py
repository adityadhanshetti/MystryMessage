import logging
from typing import Annotated

from clerk_backend_api import (
    AuthenticateRequestOptions,
    authenticate_request,
)
from clerk_backend_api.security.types import RequestState
from fastapi import Depends, HTTPException, Request, status

from app.core.config import Settings, get_settings

logger = logging.getLogger(__name__)


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

    auth_kwargs = {
        "secret_key": settings.clerk_secret_key,
        "accepts_token": ["session_token"],
    }

    if settings.clerk_jwt_key:
        auth_kwargs["jwt_key"] = settings.clerk_jwt_key.replace("\\n", "\n").strip()

    # Only pass authorized_parties if explicitly configured in settings
    if settings.clerk_authorized_party_list:
        parties = list(settings.clerk_authorized_party_list)
        origin = request.headers.get("origin")
        if origin and origin not in parties:
            parties.append(origin)
        auth_kwargs["authorized_parties"] = parties

    try:
        state = authenticate_request(
            request,
            AuthenticateRequestOptions(**auth_kwargs),
        )

    except Exception as exc:
        logger.warning("Clerk authenticate_request exception: %s", exc)
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
        reason = getattr(state, "reason", "unauthenticated")
        logger.warning(
            "Clerk auth rejected: reason=%s, origin=%s, has_bearer=%s",
            reason,
            request.headers.get("origin"),
            bool(request.headers.get("authorization")),
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "success": False,
                "error": {
                    "code": "UNAUTHENTICATED",
                    "message": f"Authentication is required ({reason}).",
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

    payload = auth_state.payload or {}
    user_id = payload.get("sub")

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