"""Final LLM node: takes the original README plus the Orchestrator's Fine Tuned
Analysis and produces the complete, human-readable business report.
"""

import logging

from app.core.llm_client import chat_completion_json

logger = logging.getLogger(__name__)

_FINAL_SYSTEM_PROMPT = """\
You are the Final Reasoning LLM of Ascendo, an AI Business Growth Operating System. \
You receive the original business README and a Fine Tuned Analysis produced by a \
team of specialized AI agents and an orchestrator. Your job is to reason once more, \
validate the recommendations against the original README, and produce ONE complete, \
professional, human-readable business report. Write in clear, confident, executive-\
ready prose - no filler, no hedging, specific to THIS business.

Respond with ONLY a single JSON object (no markdown fences, no commentary) with this
exact shape:
{
  "executive_summary": "...",
  "business_analysis": "...",
  "business_health": "...",
  "swot": {"strengths": ["..."], "weaknesses": ["..."], "opportunities": ["..."], "threats": ["..."]},
  "growth_strategy": "...",
  "roadmap": "...",
  "revenue_strategy": "...",
  "marketing_strategy": "...",
  "sales_strategy": "...",
  "operations_strategy": "...",
  "risk_analysis": "...",
  "innovation_strategy": "...",
  "investment_suggestions": "...",
  "customer_strategy": "...",
  "kpis": ["metric 1", "metric 2", "..."],
  "action_plan": "...",
  "implementation_timeline": "...",
  "next_steps": "...",
  "full_markdown": "the ENTIRE report above, rendered as one well-formatted markdown document with headings for every section"
}
Every text field must be substantive (multiple sentences/paragraphs or bullet lists
in markdown where natural), not a one-liner.
"""


async def final_llm_node(state: dict) -> dict:
    readme_text = state["readme_text"]
    fine_tuned_analysis = state["fine_tuned_analysis"]

    user_prompt = (
        "=== ORIGINAL README ===\n"
        f"{readme_text}\n"
        "=== END README ===\n\n"
        "=== FINE TUNED ANALYSIS (from orchestrator) ===\n"
        f"{fine_tuned_analysis.get('merged_markdown', '')}\n\n"
        f"Structured insights: {fine_tuned_analysis.get('merged_json', {})}\n"
        f"Priority ranking of agents: {fine_tuned_analysis.get('priority_ranking', [])}\n"
        "=== END FINE TUNED ANALYSIS ===\n"
    )

    final_report = await chat_completion_json(
        messages=[
            {"role": "system", "content": _FINAL_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.4,
    )
    logger.info("Final business report generated (%d top-level fields)", len(final_report))

    # Fallback: if full_markdown is missing or empty, build it from the generated fields
    if not final_report.get("full_markdown"):
        sections = []
        for key, val in final_report.items():
            if key in ("full_markdown", "project_id", "_id", "created_at"):
                continue
            title = key.replace("_", " ").title()
            if isinstance(val, list):
                val_str = "\n".join(f"- {item}" for item in val)
            elif isinstance(val, dict):
                dict_sections = []
                for dk, dv in val.items():
                    dk_title = dk.replace("_", " ").title()
                    if isinstance(dv, list):
                        dv_str = "\n".join(f"  - {item}" for item in dv)
                    else:
                        dv_str = f"  {dv}"
                    dict_sections.append(f"### {dk_title}\n{dv_str}")
                val_str = "\n\n".join(dict_sections)
            else:
                val_str = str(val)
            sections.append(f"# {title}\n\n{val_str}\n")
        final_report["full_markdown"] = "\n\n".join(sections)

    return {"final_report": final_report}

