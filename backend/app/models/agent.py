from typing import Any

from pydantic import BaseModel, Field


class AgentSpec(BaseModel):
    """A single agent the Master Planner has decided this business needs."""

    name: str
    role: str
    responsibility: str
    input_spec: str = Field(description="What this agent should read/consider as input")
    expected_output: str = Field(description="What this agent must produce")
    priority: str = Field(description="high | medium | low")
    dependencies: list[str] = Field(default_factory=list, description="Names of agents this one builds on")
    system_prompt: str = Field(description="Full, specialized system prompt for this agent")


class MasterPlan(BaseModel):
    business_summary: str
    industry: str
    agents: list[AgentSpec]


class AgentOutput(BaseModel):
    """The structured result a single agent produces after running."""

    agent_name: str
    role: str
    responsibility: str
    input_summary: str
    confidence_score: float = Field(ge=0, le=100)
    reasoning_summary: str
    recommendations: list[str]
    markdown_output: str
    json_output: dict[str, Any]
    priority: str
    execution_time_seconds: float
    sequence_index: int
