from pymongo.database import Database


def create_indexes(database: Database) -> None:
    """
    Create application database indexes.

    This function will grow as we add users, messages,
    links, reactions, polls, reports, etc.
    """

    # Future indexes will be created here.
    #
    # Example:
    #
    # database.users.create_index(
    #     "clerk_user_id",
    #     unique=True,
    # )