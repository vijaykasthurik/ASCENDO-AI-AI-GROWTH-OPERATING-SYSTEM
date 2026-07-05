from datetime import datetime, timezone
from enum import StrEnum

from pydantic import BaseModel, Field


class ProjectStatus(StrEnum):
    UPLOADED = "uploaded"
    PLANNING = "planning"
    RUNNING_AGENTS = "running_agents"
    ORCHESTRATING = "orchestrating"
    FINALIZING = "finalizing"
    GENERATING_ENGINES = "generating_engines"
    COMPLETED = "completed"
    FAILED = "failed"


class ProjectCreate(BaseModel):
    name: str
    readme_text: str


class Project(BaseModel):
    id: str
    user_id: str
    name: str
    status: ProjectStatus
    current_step: str = ""
    error: str | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
