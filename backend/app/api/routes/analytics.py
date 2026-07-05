from fastapi import APIRouter, Depends

from app.api.deps import get_current_user, verify_project_owner
from app.engines import analytics as analytics_engine
from app.engines import base as engine_base
from app.models.user import UserPublic

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.post("/{project_id}/generate")
async def generate_analytics(project_id: str, user: UserPublic = Depends(get_current_user)):
    await verify_project_owner(project_id, user)
    result = await analytics_engine.generate(project_id)
    return result


@router.get("/{project_id}")
async def get_latest_analytics(project_id: str, user: UserPublic = Depends(get_current_user)):
    await verify_project_owner(project_id, user)
    return await engine_base.get_latest(project_id, "analytics")


@router.get("/{project_id}/history")
async def get_analytics_history(project_id: str, user: UserPublic = Depends(get_current_user)):
    await verify_project_owner(project_id, user)
    return await engine_base.get_history(project_id, "analytics")
