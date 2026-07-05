"""Orchestrator node: runs once after every agent has finished. Compares all
agent outputs, scores them, flags duplicates/conflicts, and merges the best
insights into one Fine Tuned Business Analysis.
"""

import logging

from app.core.llm_client import chat_completion_json
from app.models.agent import AgentOutput

logger = logging.getLogger(__name__)

_ORCHESTRATOR_SYSTEM_PROMPT = """\
You are the Orchestrator in Ascendo's multi-agent business analysis pipeline. You \
receive the finished outputs of every specialized agent that analyzed this business \
in sequence. Your job:
1. Compare all agent outputs.
2. Identify duplicate/overlapping insights across agents.
3. Identify any conflicting recommendations between agents.
4. Score EVERY agent's output on these 7 dimensions, each 0-10: accuracy, \
   business_value, innovation, growth_potential, risk_awareness, \
   technical_feasibility, confidence.
5. Compute an "overall" score per agent (simple average of the 7 dimensions).
6. Produce a priority ranking of agent names, most to least valuable for this \
   business right now.
7. Merge the best insights from all agents into ONE cohesive Fine Tuned Business \
   Analysis in markdown - richer than any single agent's output, duplicates \
   removed, and conflicts explicitly resolved (state which side you resolved \
   towards and briefly why).

Respond with ONLY a single JSON object (no markdown fences, no commentary):
{
  "scores": [
    {"agent_name": "...", "accuracy": 0-10, "business_value": 0-10, "innovation": 0-10,
     "growth_potential": 0-10, "risk_awareness": 0-10, "technical_feasibility": 0-10,
     "confidence": 0-10, "overall": 0-10}
  ],
  "duplicate_insights": ["..."],
  "conflicting_recommendations": ["..."],
  "priority_ranking": ["Agent Name 1", "Agent Name 2", "..."],
  "merged_markdown": "the full Fine Tuned Business Analysis in markdown",
  "merged_json": { "...": "structured merged insights" }
}
"""


def _format_agent_output(output: AgentOutput) -> str:
    return (
        f"### Agent: {output.agent_name} ({output.role})\n"
        f"Priority: {output.priority} | Confidence: {output.confidence_score}\n"
        f"Reasoning: {output.reasoning_summary}\n"
        f"Recommendations: {', '.join(output.recommendations)}\n\n"
        f"{output.markdown_output}\n"
    )


async def orchestrator_node(state: dict) -> dict:
    agent_outputs: list[AgentOutput] = state["agent_outputs"]

    body = "\n\n---\n\n".join(_format_agent_output(o) for o in agent_outputs)
    user_prompt = (
        "Here are all agent outputs for this business, in the order they ran:\n\n"
        f"{body}"
    )

    fine_tuned_analysis = await chat_completion_json(
        messages=[
            {"role": "system", "content": _ORCHESTRATOR_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.3,
    )
    logger.info(
        "Orchestrator complete: %d scored agents, %d duplicate insights, %d conflicts",
        len(fine_tuned_analysis.get("scores", [])),
        len(fine_tuned_analysis.get("duplicate_insights", [])),
        len(fine_tuned_analysis.get("conflicting_recommendations", [])),
    )

    return {"fine_tuned_analysis": fine_tuned_analysis}
