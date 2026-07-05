from fastapi import APIRouter, Depends

from app.api.deps import get_current_user, verify_project_owner
from app.models.user import UserPublic
from app.services import project_service

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("")
async def list_projects(user: UserPublic = Depends(get_current_user)):
    return await project_service.list_projects_for_user(user.id)


@router.get("/{project_id}")
async def get_project(project_id: str, user: UserPublic = Depends(get_current_user)):
    await verify_project_owner(project_id, user)
    return await project_service.get_project(project_id)


@router.delete("/{project_id}")
async def delete_project(project_id: str, user: UserPublic = Depends(get_current_user)):
    await verify_project_owner(project_id, user)
    await project_service.delete_project(project_id)
    return {"status": "ok", "message": f"Project {project_id} deleted successfully"}

