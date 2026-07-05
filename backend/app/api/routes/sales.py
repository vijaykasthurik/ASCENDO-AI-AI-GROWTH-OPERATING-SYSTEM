from fastapi import APIRouter, Depends

from app.api.deps import get_current_user, verify_project_owner
from app.engines import base as engine_base
from app.engines import sales as sales_engine
from app.models.user import UserPublic

router = APIRouter(prefix="/sales", tags=["sales"])


@router.post("/{project_id}/generate")
async def generate_sales(project_id: str, user: UserPublic = Depends(get_current_user)):
    await verify_project_owner(project_id, user)
    return await sales_engine.generate(project_id)


@router.get("/{project_id}")
async def get_latest_sales(project_id: str, user: UserPublic = Depends(get_current_user)):
    await verify_project_owner(project_id, user)
    return await engine_base.get_latest(project_id, "sales")


@router.get("/{project_id}/history")
async def get_sales_history(project_id: str, user: UserPublic = Depends(get_current_user)):
    await verify_project_owner(project_id, user)
    return await engine_base.get_history(project_id, "sales")
