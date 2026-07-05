from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.api.deps import get_current_user, verify_project_owner
from app.models.user import UserPublic
from app.services import copilot_service

router = APIRouter(tags=["copilot"])


class CopilotQuestion(BaseModel):
    question: str


@router.post("/copilot/{project_id}")
async def ask_copilot(
    project_id: str,
    payload: CopilotQuestion,
    user: UserPublic = Depends(get_current_user),
):
    await verify_project_owner(project_id, user)
    answer = await copilot_service.answer_question(project_id, payload.question)
    return {"answer": answer}
