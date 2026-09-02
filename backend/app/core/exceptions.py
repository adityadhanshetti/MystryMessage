class MystryException(Exception):
    """Base exception for application-level errors."""

    def __init__(
        self,
        message: str,
        code: str = "APPLICATION_ERROR",
    ) -> None:
        self.message = message
        self.code = code
        super().__init__(message)