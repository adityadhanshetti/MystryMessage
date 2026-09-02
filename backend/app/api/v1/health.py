from fastapi import APIRouter, HTTPException

from app.db.mongodb import mongodb

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check() -> dict:
    return {
        "success": True,
        "data": {
            "status": "healthy",
        },
    }


@router.get("/ready")
async def readiness_check() -> dict:
    try:
        database = mongodb.get_database()
        database.command("ping")

        return {
            "success": True,
            "data": {
                "status": "ready",
                "database": "connected",
            },
        }

    except Exception:
        raise HTTPException(
            status_code=503,
            detail={
                "success": False,
                "error": {
                    "code": "SERVICE_NOT_READY",
                    "message": "Database is unavailable.",
                },
            },
        )