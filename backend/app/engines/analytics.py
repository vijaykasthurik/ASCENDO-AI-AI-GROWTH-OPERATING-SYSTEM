"""Analytics Engine: forecasting, competitive insights, portfolio assessment,
and roadmap. A permanent, always-available product feature. Forecasts are
explicitly AI-estimated from business context - this system has no real
transactional/operational data feed (yet).
"""

from app.engines.base import run_engine
from app.models.engines import AnalyticsOutput

_ANALYTICS_SYSTEM_PROMPT = """\
You are the Analytics Engine of Ascendo, an AI Business Growth Operating System. \
Given a business's README and (if available) its latest full analysis report, \
produce forward-looking business intelligence covering:

1. Forecasts - 3-6 forward-looking estimates (e.g. revenue, active customers, \
   market share) across near-term periods (e.g. next 2-4 quarters), each with a \
   low/mid/high estimate and the key assumptions behind it. You MUST clearly \
   state in forecast_methodology_note that these are AI-estimated projections \
   based on the business's stated context, NOT derived from real transactional \
   or operational data, since no such data feed exists yet.
2. Competitive insights - competitor profiles, this business's competitive \
   advantages, and the competitive threats it faces.
3. Portfolio assessment - the business's current products/features/offerings, \
   each classified (e.g. core, growth, experimental, declining) with a \
   recommendation for investment or sunset.
4. Roadmap - 4-10 concrete initiatives with a timeframe, priority, category \
   (e.g. Product, Go-to-Market, Operations), and description.

Be specific to THIS business - reference its actual product, industry, market, \
and stage. Do not give generic advice.
"""


async def generate(project_id: str) -> AnalyticsOutput:
    return await run_engine(project_id, "analytics", _ANALYTICS_SYSTEM_PROMPT, AnalyticsOutput)
