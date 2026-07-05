from fastapi import APIRouter, Depends

from app.api.deps import get_current_user, verify_project_owner
from app.models.report import DashboardMetrics
from app.models.user import UserPublic
from app.services import project_service

router = APIRouter(tags=["dashboard"])


@router.get("/dashboard/{project_id}", response_model=DashboardMetrics)
async def get_dashboard(project_id: str, user: UserPublic = Depends(get_current_user)):
    await verify_project_owner(project_id, user)
    return await project_service.compute_dashboard_metrics(project_id)
