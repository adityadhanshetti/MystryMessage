import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.health import router as health_router
from app.api.v1.users import router as users_router
from app.api.v1.messages import router as messages_router
from app.api.v1.conversations import router as conversations_router

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
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$|^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.middleware("http")
async def request_id_and_security_middleware(request, call_next):
    if request.method == "OPTIONS":
        return await call_next(request)

    import uuid
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


app.include_router(
    health_router,
    prefix=settings.api_v1_prefix,
)

app.include_router(
    users_router,
    prefix=settings.api_v1_prefix,
)

app.include_router(
    messages_router,
    prefix=settings.api_v1_prefix,
)

app.include_router(
    conversations_router,
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