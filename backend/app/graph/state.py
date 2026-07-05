import operator
from typing import Annotated, Any, TypedDict

from app.models.agent import AgentOutput


class GraphState(TypedDict, total=False):
    project_id: str
    readme_text: str
    previous_output_markdown: str | None
    agent_outputs: Annotated[list[AgentOutput], operator.add]
    fine_tuned_analysis: dict[str, Any]
    final_report: dict[str, Any]
