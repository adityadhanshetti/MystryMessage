RESERVED_USERNAMES: frozenset[str] = frozenset(
    {
        "admin",
        "administrator",
        "api",
        "about",
        "auth",
        "dashboard",
        "help",
        "login",
        "logout",
        "messages",
        "moderator",
        "poll",
        "polls",
        "privacy",
        "profile",
        "settings",
        "signin",
        "signup",
        "support",
        "system",
        "user",
        "users",
        "wall",
    }
)

MIN_USERNAME_LENGTH = 3
MAX_USERNAME_LENGTH = 30

MAX_DISPLAY_NAME_LENGTH = 80
MAX_BIO_LENGTH = 300