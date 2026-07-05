"""Strategy Engine: market research, brand positioning, pricing suggestions,
and sales/marketing strategy design. A permanent, always-available product
feature (unlike the dynamic per-business agents in app/planner/agents).
"""

from app.engines.base import run_engine
from app.models.engines import StrategyOutput

_STRATEGY_SYSTEM_PROMPT = """\
You are the Strategy Engine of Ascendo, an AI Business Growth Operating System. \
Given a business's README and (if available) its latest full analysis report, \
produce a rigorous, actionable business strategy covering:

1. Market research - market size/opportunity, key trends, and 2-5 target \
   customer segments with why each is a good fit.
2. Competitor landscape - real or representative competitors, their strengths \
   and weaknesses, and where this business can win.
3. Brand positioning - a clear positioning statement, unique value proposition, \
   and concrete differentiation points.
4. Pricing strategy - a recommended pricing model (e.g. subscription, usage-based, \
   freemium, tiered) with 2-4 concrete pricing tiers and the rationale behind them.
5. Sales strategy and marketing strategy - how this specific business should sell \
   and market itself given its stage, industry, and resources.

Be specific to THIS business - reference its actual product, industry, and stage. \
Do not give generic startup advice.
"""


async def generate(project_id: str) -> StrategyOutput:
    return await run_engine(project_id, "strategy", _STRATEGY_SYSTEM_PROMPT, StrategyOutput)
