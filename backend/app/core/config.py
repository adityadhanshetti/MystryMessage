from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = Field(
        default="Mystry Message API",
        alias="APP_NAME",
    )

    app_version: str = Field(
        default="0.1.0",
        alias="APP_VERSION",
    )

    environment: str = Field(
        default="development",
        alias="ENVIRONMENT",
    )

    api_v1_prefix: str = "/api/v1"

    mongodb_uri: str = Field(
        ...,
        alias="MONGODB_URI",
    )

    mongodb_database: str = Field(
        default="mystry",
        alias="MONGODB_DATABASE",
    )

    clerk_secret_key: str = Field(
        ...,
        alias="CLERK_SECRET_KEY",
    )

    clerk_jwt_key: str | None = Field(
        default=None,
        alias="CLERK_JWT_KEY",
    )

    clerk_authorized_parties: str = Field(
        default="",
        alias="CLERK_AUTHORIZED_PARTIES",
    )

    cors_origins: str = Field(
        default="http://localhost:5173",
        alias="CORS_ORIGINS",
    )

    redis_url: str | None = Field(
        default=None,
        alias="REDIS_URL",
    )

    cloudinary_cloud_name: str | None = Field(
        default=None,
        alias="CLOUDINARY_CLOUD_NAME",
    )

    cloudinary_api_key: str | None = Field(
        default=None,
        alias="CLOUDINARY_API_KEY",
    )

    cloudinary_api_secret: str | None = Field(
        default=None,
        alias="CLOUDINARY_API_SECRET",
    )

    cloudinary_upload_preset: str | None = Field(
        default=None,
        alias="CLOUDINARY_UPLOAD_PRESET",
    )

    log_level: str = Field(
        default="INFO",
        alias="LOG_LEVEL",
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    rate_limit_window_seconds: int = Field(
        default=60,
        alias="RATE_LIMIT_WINDOW_SECONDS",
    )

    rate_limit_max_requests: int = Field(
        default=5,
        alias="RATE_LIMIT_MAX_REQUESTS",
    )

    @property
    def cors_origin_list(self) -> list[str]:
        origins = [
            origin.strip()
            for origin in self.cors_origins.split(",")
            if origin.strip()
        ]
        defaults = [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173",
        ]
        for d in defaults:
            if d not in origins:
                origins.append(d)
        return origins

    @property
    def clerk_authorized_party_list(self) -> list[str]:
        if not self.clerk_authorized_parties or self.clerk_authorized_parties.strip() == "*":
            return []

        return [
            origin.strip()
            for origin in self.clerk_authorized_parties.split(",")
            if origin.strip()
        ]

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()