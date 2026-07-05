"""Master Planner: reads a business README and decides, from scratch, which
specialized AI agents this specific business needs. Never hardcoded — every
industry produces a different team and different system prompts.
"""

import logging

from app.core.exceptions import PlannerError
from app.core.llm_client import chat_completion
from app.models.agent import AgentSpec, MasterPlan
from app.utils.json_parsing import extract_json

logger = logging.getLogger(__name__)

MIN_AGENTS = 5

_PLANNER_SYSTEM_PROMPT = """\
You are the Master Planner of Ascendo, an AI Business Growth Operating System. \
You read a company's README/business documentation and design a bespoke team of \
specialized AI agents to analyze that exact business. You never reuse a fixed \
template of agents - the team composition must be derived from THIS business's \
industry, product, business model, and stage. Different businesses must get \
different agents (e.g. a healthcare startup needs a Compliance Agent and Medical \
Agent; an agriculture business needs an Agriculture Expert and IoT Agent; an \
e-commerce business needs a Supply Chain Agent and Customer Success Agent).

Requirements:
- Always include at least 5 agents. Include more if the business genuinely needs \
  deeper coverage (e.g. regulated industries, hardware + software components, \
  multi-sided marketplaces).
- Always include a CEO/Strategy Agent that reasons across the whole business, \
  unless another agent name better fits that role for this business.
- Every agent must be genuinely specialized to a distinct concern of THIS business \
  - do not create generic filler agents.
- Every agent needs a full, specialized system_prompt (3-8 sentences) written \
  specifically for this business's industry/domain/technology/goals. The prompt \
  must tell the agent exactly what to analyze and what kind of recommendations to \
  produce. Never reuse a generic prompt across agents.
- priority must be one of: "high", "medium", "low".
- dependencies lists the exact `name` values of other agents whose output this \
  agent should build on (based on logical analysis order), or an empty list.

Respond with ONLY a single JSON object (no markdown fences, no commentary) with \
this exact shape:
{
  "business_summary": "2-3 sentence summary of what this business is",
  "industry": "the primary industry/domain",
  "agents": [
    {
      "name": "string, e.g. 'Finance Agent'",
      "role": "one-line role title",
      "responsibility": "what this agent is responsible for analyzing/producing",
      "input_spec": "what this agent should read/consider as input",
      "expected_output": "what this agent must produce",
      "priority": "high | medium | low",
      "dependencies": ["Other Agent Name", "..."],
      "system_prompt": "full specialized system prompt for this agent"
    }
  ]
}
"""


def _build_user_prompt(readme_text: str) -> str:
    return (
        "Analyze this business README and design its AI agent team.\n\n"
        "=== README START ===\n"
        f"{readme_text}\n"
        "=== README END ===\n"
    )


async def _request_plan(readme_text: str, repair_note: str | None = None) -> MasterPlan:
    user_prompt = _build_user_prompt(readme_text)
    if repair_note:
        user_prompt += f"\n\nIMPORTANT CORRECTION NEEDED: {repair_note}"

    raw = await chat_completion(
        messages=[
            {"role": "system", "content": _PLANNER_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.3,
    )
    data = extract_json(raw)
    agents = [AgentSpec(**a) for a in data["agents"]]
    return MasterPlan(business_summary=data["business_summary"], industry=data["industry"], agents=agents)


async def generate_master_plan(readme_text: str) -> MasterPlan:
    """Understand the business and produce the dynamic agent team. Retries once
    with an explicit correction if the model returns fewer than MIN_AGENTS agents
    or otherwise malformed output.
    """
    try:
        plan = await _request_plan(readme_text)
    except Exception as exc:
        logger.warning("Master Planner initial attempt failed to parse: %s", exc)
        plan = await _request_plan(
            readme_text,
            repair_note=(
                "Your previous response could not be parsed as valid JSON. "
                "Respond again with ONLY the raw JSON object, no markdown fences, no extra text."
            ),
        )

    if len(plan.agents) < MIN_AGENTS:
        logger.warning(
            "Master Planner returned only %d agents, requesting at least %d", len(plan.agents), MIN_AGENTS
        )
        plan = await _request_plan(
            readme_text,
            repair_note=(
                f"You returned only {len(plan.agents)} agents. You MUST return at least "
                f"{MIN_AGENTS} distinct, specialized agents for this business. Try again."
            ),
        )

    if len(plan.agents) < MIN_AGENTS:
        raise PlannerError(
            f"Master Planner could not produce at least {MIN_AGENTS} agents after retry "
            f"(got {len(plan.agents)})."
        )

    logger.info(
        "Master Plan ready: industry=%s, %d agents: %s",
        plan.industry,
        len(plan.agents),
        [a.name for a in plan.agents],
    )
    return plan
