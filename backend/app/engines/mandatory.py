"""Runs all six mandatory Engines for a business - Strategy, Marketing, Lead Gen,
Sales, Analytics, Customer Success. These are always-on product features,
independent of the dynamic per-business agent pipeline (app/graph/, app/planner/):
the Master Planner may still add extra agents specific to a business's industry,
but these six always run regardless.
"""

import logging

from app.engines import analytics, customer_success, leadgen, marketing, sales, strategy

logger = logging.getLogger(__name__)

MANDATORY_ENGINES = [
    ("strategy", strategy.generate),
    ("marketing", marketing.generate),
    ("leadgen", leadgen.generate),
    ("sales", sales.generate),
    ("analytics", analytics.generate),
    ("customer_success", customer_success.generate),
]


async def run_all(project_id: str) -> dict[str, dict]:
    """Generates all six mandatory engines for a business. One engine failing
    does not block the others - each result is reported independently.
    """
    results: dict[str, dict] = {}
    for name, generate_fn in MANDATORY_ENGINES:
        try:
            output = await generate_fn(project_id)
            results[name] = {"status": "ok", "output": output.model_dump()}
        except Exception as exc:  # noqa: BLE001 - isolate one engine's failure from the rest
            logger.error("Mandatory engine '%s' failed for project %s: %s", name, project_id, exc)
            results[name] = {"status": "failed", "error": str(exc)}
    return results
