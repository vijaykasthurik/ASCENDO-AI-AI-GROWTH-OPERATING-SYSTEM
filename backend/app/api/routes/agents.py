from fastapi import APIRouter, Depends

from app.api.deps import get_current_user, verify_project_owner
from app.models.user import UserPublic
from app.services import project_service

router = APIRouter(tags=["agents"])


@router.get("/agents/{project_id}")
async def get_agents(project_id: str, user: UserPublic = Depends(get_current_user)):
    await verify_project_owner(project_id, user)
    project = await project_service.get_project(project_id)
    outputs = await project_service.list_agent_outputs(project_id)
    return {
        "industry": project.get("industry"),
        "business_summary": project.get("business_summary"),
        "agent_specs": project.get("agent_specs", []),
        "agent_outputs": outputs,
    }
