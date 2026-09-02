from pymongo.database import Database


def create_indexes(database: Database) -> None:
    users = database["users"]

    users.create_index(
        "clerk_user_id",
        unique=True,
        name="uq_users_clerk_user_id",
    )

    users.create_index(
        "username_normalized",
        unique=True,
        name="uq_users_username_normalized",
    )