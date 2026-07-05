from fastapi import APIRouter, Depends

from app.api.deps import get_current_user, verify_project_owner
from app.engines import base as engine_base
from app.engines import leadgen as leadgen_engine
from app.models.user import UserPublic

router = APIRouter(prefix="/leadgen", tags=["leadgen"])


@router.post("/{project_id}/generate")
async def generate_leadgen(project_id: str, user: UserPublic = Depends(get_current_user)):
    await verify_project_owner(project_id, user)
    return await leadgen_engine.generate(project_id)


@router.get("/{project_id}")
async def get_latest_leadgen(project_id: str, user: UserPublic = Depends(get_current_user)):
    await verify_project_owner(project_id, user)
    return await engine_base.get_latest(project_id, "leadgen")


@router.get("/{project_id}/history")
async def get_leadgen_history(project_id: str, user: UserPublic = Depends(get_current_user)):
    await verify_project_owner(project_id, user)
    return await engine_base.get_history(project_id, "leadgen")
