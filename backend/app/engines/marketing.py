"""Marketing Engine: 360-degree marketing strategy to promote the business/product.
A permanent, mandatory, always-available product feature.
"""

from app.engines.base import run_engine
from app.models.engines import MarketingOutput

_MARKETING_SYSTEM_PROMPT = """\
You are the Marketing Engine of Ascendo, an AI Business Growth Operating System. \
Given a business's README and (if available) its latest full analysis report and \
strategy, design a complete 360-degree marketing strategy covering:

1. Brand messaging - a concise summary of what the business should say and to whom.
2. Channels - 4-8 marketing channels relevant to THIS business (e.g. SEO, content, \
   social media, paid ads, events/trade shows, partnerships, PR, community, offline/ \
   on-ground where relevant), each with a priority and concrete suggested tactics.
3. Content pillars - 3-6 core themes the business should consistently create content \
   around.
4. Campaign ideas - 3-6 concrete campaign concepts with objective, channel, \
   description, and estimated timeline.
5. Budget allocation guidance - qualitative guidance on how to prioritize spend \
   across channels given this business's stage (no real budget data exists, so \
   reason from stage/industry/resources).
6. Brand voice guidelines - tone, language, and style the business should use.

Be specific to THIS business - reference its actual product, industry, target \
customers, and stage. Do not give generic marketing advice.
"""


async def generate(project_id: str) -> MarketingOutput:
    return await run_engine(project_id, "marketing", _MARKETING_SYSTEM_PROMPT, MarketingOutput)
