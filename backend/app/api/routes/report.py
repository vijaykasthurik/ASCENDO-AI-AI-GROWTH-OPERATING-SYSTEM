from fastapi import APIRouter, Depends

from app.api.deps import get_current_user, verify_project_owner
from app.models.user import UserPublic
from app.services import project_service

router = APIRouter(tags=["report"])


@router.get("/report/{project_id}")
async def get_report(project_id: str, user: UserPublic = Depends(get_current_user)):
    await verify_project_owner(project_id, user)
    return await project_service.get_final_report(project_id)
