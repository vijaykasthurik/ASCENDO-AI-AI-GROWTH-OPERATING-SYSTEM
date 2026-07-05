"""AI Copilot: answers free-form questions grounded in a project's README,
agent outputs, and final report via ChromaDB retrieval.
"""

from app.core.llm_client import chat_completion
from app.db import chroma

_COPILOT_SYSTEM_PROMPT = """\
You are Ascendo's AI Copilot for one specific business. Answer the user's question \
using ONLY the provided context (excerpts from the business README, specialized \
agent analyses, and the final business report). Be specific, concise, and \
actionable - reference concrete numbers, strategies, or risks from the context \
where relevant. If the context doesn't contain enough information to answer \
confidently, say so plainly rather than guessing.
"""


async def answer_question(project_id: str, question: str) -> str:
    results = chroma.query(project_id, question, n_results=12)
    context = "\n\n---\n\n".join(
        f"[{r['metadata'].get('doc_type', 'context')}] {r['document']}" for r in results
    )
    if not context:
        context = "(No indexed context found for this project yet.)"

    user_prompt = f"=== CONTEXT ===\n{context}\n=== END CONTEXT ===\n\nQuestion: {question}"

    return await chat_completion(
        messages=[
            {"role": "system", "content": _COPILOT_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.3,
    )
