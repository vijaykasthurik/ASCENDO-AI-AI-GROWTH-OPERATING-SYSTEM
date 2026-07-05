"""Turns a Master-Planner-generated AgentSpec into a runnable LangGraph node.

Every node follows the same contract required by the spec: it always receives
the ORIGINAL README plus the PREVIOUS agent's output, and must improve on that
previous output rather than replace it.
"""

import logging
import time
from typing import Callable

from app.core.llm_client import chat_completion_json
from app.models.agent import AgentOutput, AgentSpec

logger = logging.getLogger(__name__)

_OUTPUT_INSTRUCTIONS = """
Respond with ONLY a single JSON object (no markdown fences, no commentary) with this exact shape:
{
  "reasoning_summary": "brief explanation of how you reasoned about this business",
  "confidence_score": <number 0-100>,
  "recommendations": ["specific, actionable recommendation", "..."],
  "markdown_output": "full markdown-formatted analysis for your domain, using headings and bullets",
  "json_output": { "...": "any structured fields relevant to your domain" }
}
Your markdown_output and json_output must BUILD ON AND IMPROVE the previous agent's
output where it is relevant to your role - reference and refine it, don't just repeat it.
If there is no previous output (you are the first agent), produce the first full analysis.
"""


def _clamp(value: float, low: float = 0.0, high: float = 100.0) -> float:
    return max(low, min(high, value))


def make_agent_node(spec: AgentSpec, sequence_index: int) -> Callable:
    async def node(state: dict) -> dict:
        from app.models.project import ProjectStatus
        from app.services.project_service import _set_status
        
        project_id = state["project_id"]
        await _set_status(
            project_id,
            ProjectStatus.RUNNING_AGENTS,
            f"Running agent: {spec.name}",
        )

        readme_text = state["readme_text"]
        previous_output_markdown = state.get("previous_output_markdown")

        sections = [
            "=== ORIGINAL README ===",
            readme_text,
            "=== END README ===",
        ]
        if previous_output_markdown:
            sections += [
                "",
                "=== PREVIOUS AGENT OUTPUT (build on and improve this) ===",
                previous_output_markdown,
                "=== END PREVIOUS AGENT OUTPUT ===",
            ]
        else:
            sections += ["", "(You are the first agent in the sequence - there is no previous output yet.)"]
        sections += ["", _OUTPUT_INSTRUCTIONS]
        user_prompt = "\n".join(sections)

        start = time.perf_counter()
        data = await chat_completion_json(
            messages=[
                {"role": "system", "content": spec.system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.4,
        )
        elapsed = time.perf_counter() - start

        try:
            confidence = _clamp(float(data.get("confidence_score", 70)))
        except (TypeError, ValueError):
            confidence = 70.0

        output = AgentOutput(
            agent_name=spec.name,
            role=spec.role,
            responsibility=spec.responsibility,
            input_summary="Original README" + (" + previous agent output" if previous_output_markdown else ""),
            confidence_score=confidence,
            reasoning_summary=data.get("reasoning_summary", ""),
            recommendations=list(data.get("recommendations", [])),
            markdown_output=data.get("markdown_output", ""),
            json_output=data.get("json_output", {}),
            priority=spec.priority,
            execution_time_seconds=elapsed,
            sequence_index=sequence_index,
        )
        logger.info(
            "Agent '%s' (#%d) finished in %.2fs, confidence=%.0f",
            spec.name,
            sequence_index,
            elapsed,
            output.confidence_score,
        )

        return {
            "agent_outputs": [output],
            "previous_output_markdown": output.markdown_output,
        }

    return node
