import asyncio
import json

from fastapi import APIRouter, BackgroundTasks, Depends
from sse_starlette.sse import EventSourceResponse

from app.api.deps import get_current_user, verify_project_owner
from app.models.user import UserPublic
from app.services import project_service

router = APIRouter(tags=["analyze"])


@router.post("/analyze/{project_id}")
async def start_analysis(
    project_id: str,
    background_tasks: BackgroundTasks,
    user: UserPublic = Depends(get_current_user),
):
    await verify_project_owner(project_id, user)
    background_tasks.add_task(project_service.run_analysis, project_id)
    return {"status": "started", "project_id": project_id}


@router.get("/analyze/{project_id}/stream")
async def stream_progress(project_id: str, user: UserPublic = Depends(get_current_user)):
    await verify_project_owner(project_id, user)

    async def event_generator():
        last_step = None
        while True:
            project = await project_service.get_project(project_id)
            step = project.get("current_step")
            status_value = project.get("status")
            if step != last_step:
                yield {
                    "event": "progress",
                    "data": json.dumps({"status": status_value, "current_step": step}),
                }
                last_step = step
            if status_value in ("completed", "failed"):
                break
            await asyncio.sleep(1.5)

    return EventSourceResponse(event_generator())
