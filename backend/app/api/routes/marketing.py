from fastapi import APIRouter, Depends

from app.api.deps import get_current_user, verify_project_owner
from app.engines import base as engine_base
from app.engines import marketing as marketing_engine
from app.models.user import UserPublic

router = APIRouter(prefix="/marketing", tags=["marketing"])


@router.post("/{project_id}/generate")
async def generate_marketing(project_id: str, user: UserPublic = Depends(get_current_user)):
    await verify_project_owner(project_id, user)
    return await marketing_engine.generate(project_id)


@router.get("/{project_id}")
async def get_latest_marketing(project_id: str, user: UserPublic = Depends(get_current_user)):
    await verify_project_owner(project_id, user)
    return await engine_base.get_latest(project_id, "marketing")


@router.get("/{project_id}/history")
async def get_marketing_history(project_id: str, user: UserPublic = Depends(get_current_user)):
    await verify_project_owner(project_id, user)
    return await engine_base.get_history(project_id, "marketing")
