from clerk_backend_api import Clerk

from app.core.config import get_settings


class ClerkService:
    """
    Wrapper around Clerk's Backend API.

    Only this service should directly interact with Clerk's
    management API.
    """

    def __init__(self) -> None:
        settings = get_settings()

        self.client = Clerk(
            bearer_auth=settings.clerk_secret_key,
        )

    def get_user(self, user_id: str):
        return self.client.users.get(
            user_id=user_id,
        )


clerk_service = ClerkService()