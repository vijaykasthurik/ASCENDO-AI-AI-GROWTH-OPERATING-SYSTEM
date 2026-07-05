from fastapi import APIRouter, Depends

from app.api.deps import get_current_user, verify_project_owner
from app.core.exceptions import NotFoundError
from app.engines import base as engine_base
from app.engines import mandatory
from app.models.user import UserPublic

router = APIRouter(prefix="/engines", tags=["engines"])


@router.post("/{project_id}/generate-all")
async def generate_all_engines(project_id: str, user: UserPublic = Depends(get_current_user)):
    await verify_project_owner(project_id, user)
    return await mandatory.run_all(project_id)


@router.get("/{project_id}")
async def get_all_latest_engines(project_id: str, user: UserPublic = Depends(get_current_user)):
    await verify_project_owner(project_id, user)
    results: dict[str, dict | None] = {}
    for name, _ in mandatory.MANDATORY_ENGINES:
        try:
            results[name] = await engine_base.get_latest(project_id, name)
        except NotFoundError:
            results[name] = None
    return results
