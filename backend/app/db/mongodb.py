import logging

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.config import get_settings

logger = logging.getLogger(__name__)

_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


def connect() -> None:
    global _client, _db
    settings = get_settings()
    _client = AsyncIOMotorClient(settings.mongodb_uri)
    _db = _client[settings.mongodb_db_name]
    logger.info("Connected to MongoDB at %s (db=%s)", settings.mongodb_uri, settings.mongodb_db_name)


def disconnect() -> None:
    global _client, _db
    if _client is not None:
        _client.close()
        _client = None
        _db = None
        logger.info("Disconnected from MongoDB")


def get_db() -> AsyncIOMotorDatabase:
    if _db is None:
        raise RuntimeError("MongoDB has not been initialized. Call connect() first.")
    return _db


def users_collection():
    return get_db()["users"]


def projects_collection():
    return get_db()["projects"]


def readmes_collection():
    return get_db()["readmes"]


def agent_outputs_collection():
    return get_db()["agent_outputs"]


def final_reports_collection():
    return get_db()["final_reports"]


def engine_runs_collection():
    return get_db()["engine_runs"]


def password_resets_collection():
    return get_db()["password_resets"]
