from bson import ObjectId
from fastapi import HTTPException, status

from app.models.user import UserModel
from app.repositories.users import UserRepository
from app.schemas.user import ProfileUpdate
from app.services.clerk import clerk_service


class UserService:
    def __init__(
        self,
        repository: UserRepository,
    ) -> None:
        self.repository = repository

    def get_or_create_user(
        self,
        clerk_user_id: str,
    ) -> dict:
        existing = self.repository.get_by_clerk_id(
            clerk_user_id
        )

        if existing:
            return existing

        clerk_user = clerk_service.get_user(
            clerk_user_id
        )

        username = self._generate_initial_username(
            clerk_user
        )

        display_name = self._get_display_name(
            clerk_user
        )

        avatar_url = self._get_avatar_url(
            clerk_user
        )

        document = UserModel.create_document(
            clerk_user_id=clerk_user_id,
            username=username,
            display_name=display_name,
            avatar_url=avatar_url,
        )

        try:
            return self.repository.create(document)

        except Exception:
            # Handle a race where another request created
            # the same Clerk user simultaneously.
            existing = self.repository.get_by_clerk_id(
                clerk_user_id
            )

            if existing:
                return existing

            raise

    def get_by_id(
        self,
        user_id: str,
    ) -> dict:
        try:
            object_id = ObjectId(user_id)
        except Exception:
            raise HTTPException(
                status_code=400,
                detail={
                    "success": False,
                    "error": {
                        "code": "INVALID_USER_ID",
                        "message": "Invalid user ID.",
                    },
                },
            )

        user = self.repository.get_by_id(object_id)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "success": False,
                    "error": {
                        "code": "USER_NOT_FOUND",
                        "message": "User not found.",
                    },
                },
            )

        return user

    def update_profile(
        self,
        user_id: str,
        payload: ProfileUpdate,
    ) -> dict:
        object_id = ObjectId(user_id)

        updates = payload.model_dump(
            exclude_unset=True
        )

        if "username" in updates:
            username = updates["username"]

            if self.repository.username_exists_for_other_user(
                username,
                object_id,
            ):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail={
                        "success": False,
                        "error": {
                            "code": "USERNAME_TAKEN",
                            "message": "Username is already taken.",
                        },
                    },
                )
    
            updates["username"] = username
            updates["username_normalized"] = username.lower()

        user = self.repository.update(
            object_id,
            updates,
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "success": False,
                    "error": {
                        "code": "USER_NOT_FOUND",
                        "message": "User not found.",
                    },
                },
            )

        return user

    def username_available(
        self,
        username: str,
    ) -> bool:
        return not self.repository.username_exists(username)

    def _generate_initial_username(
        self,
        clerk_user,
    ) -> str:
        """
        Generate a safe initial username.

        Users can change this later.

        Example:
        Aditya Dhanshetti → aditya
        """

        first_name = getattr(
            clerk_user,
            "first_name",
            None,
        )

        username = (
            first_name
            or getattr(clerk_user, "username", None)
            or "user"
        )

        username = "".join(
            character.lower()
            for character in username
            if character.isalnum()
        )

        if not username:
            username = "user"

        candidate = username
        counter = 1

        while self.repository.username_exists(candidate):
            counter += 1
            candidate = f"{username}{counter}"

        return candidate[:30]

    @staticmethod
    def _get_display_name(
        clerk_user,
    ) -> str:
        first_name = getattr(
            clerk_user,
            "first_name",
            None,
        )

        last_name = getattr(
            clerk_user,
            "last_name",
            None,
        )

        full_name = " ".join(
            part
            for part in [first_name, last_name]
            if part
        ).strip()

        return full_name or "Mystry User"

    @staticmethod
    def _get_avatar_url(
        clerk_user,
    ) -> str:
        return (
            getattr(
                clerk_user,
                "image_url",
                None,
            )
            or ""
        )