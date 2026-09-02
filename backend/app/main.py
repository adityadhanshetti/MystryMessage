import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.health import router as health_router
from app.api.v1.users import router as users_router
from app.core.config import get_settings
from app.core.logging import configure_logging
from app.db.indexes import create_indexes
from app.db.mongodb import mongodb


configure_logging()

logger = logging.getLogger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting %s", settings.app_name)

    try:
        mongodb.connect()

        database = mongodb.get_database()
        create_indexes(database)

        logger.info("MongoDB connection established")
        logger.info("Application startup completed")

    except Exception:
        logger.exception("Application startup failed")
        raise

    yield

    logger.info("Shutting down application")

    mongodb.close()

    logger.info("Application shutdown completed")


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Privacy-first anonymous messaging API.",
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


app.include_router(
    health_router,
    prefix=settings.api_v1_prefix,
)

app.include_router(
    users_router,
    prefix=settings.api_v1_prefix,
)

@app.get("/")
async def root() -> dict:
    return {
        "success": True,
        "data": {
            "name": settings.app_name,
            "version": settings.app_version,
            "status": "running",
        },
    }