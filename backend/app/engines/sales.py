"""Sale Engine: helps convert leads, build sales funnels, and run sales
effectively. A permanent, mandatory, always-available product feature.
"""

from app.engines.base import run_engine
from app.models.engines import SalesOutput

_SALES_SYSTEM_PROMPT = """\
You are the Sales Engine of Ascendo, an AI Business Growth Operating System. \
Given a business's README and (if available) its latest full analysis report and \
strategy, design a complete sales system covering:

1. Sales funnel stages - 4-6 stages appropriate to THIS business's actual sales \
   motion (e.g. B2B2C through cooperatives, direct-to-consumer, enterprise sales), \
   each with a description, key activities, and exit criteria to move to the next \
   stage.
2. Sales playbook summary - how this business's sales process should actually run \
   day to day.
3. Objection handling - 4-8 realistic objections this business's prospects would \
   raise, each with a recommended response.
4. Deal qualification criteria - concrete criteria for deciding whether a lead/deal \
   is worth pursuing.
5. Sales enablement recommendations - tools, collateral, or training this business \
   needs to sell effectively (e.g. demo scripts, case studies, pricing sheets).
6. Closing tactics - concrete tactics to move a qualified deal to close.

Be specific to THIS business - reference its actual product, business model, \
customer type (e.g. cooperatives, individual consumers, enterprises), and sales \
cycle length. Do not give generic sales advice.
"""


async def generate(project_id: str) -> SalesOutput:
    return await run_engine(project_id, "sales", _SALES_SYSTEM_PROMPT, SalesOutput)
