"""Shared runner for all always-on product Engines (Strategy, Analytics, and
future engines: Marketing, Lead Gen, Sales, Customer Success). Centralizes
context gathering, the resilient LLM call, schema validation with one repair
retry, versioned persistence, and Chroma embedding so the Copilot automatically
picks up engine output as grounding context.
"""

import logging
from datetime import datetime, timezone
from typing import TypeVar

from pydantic import BaseModel, ValidationError

from app.core.exceptions import NotFoundError
from app.core.llm_client import chat_completion_json
from app.db import chroma, mongodb
from app.parsers.readme_parser import chunk_text
from app.services import project_service

logger = logging.getLogger(__name__)

ModelT = TypeVar("ModelT", bound=BaseModel)


async def _gather_context(project_id: str) -> str:
    readme_text = await project_service.get_readme_text(project_id)
    sections = [
        "=== ORIGINAL README ===",
        readme_text,
        "=== END README ===",
    ]
    try:
        final_report = await project_service.get_final_report(project_id)
    except NotFoundError:
        sections += [
            "",
            "(No full multi-agent analysis has been run yet for this business - "
            "base your output on the README alone.)",
        ]
    else:
        sections += [
            "",
            "=== LATEST BUSINESS ANALYSIS REPORT (use as grounding, may be refined) ===",
            final_report.get("full_markdown", ""),
            "=== END BUSINESS ANALYSIS REPORT ===",
        ]
    return "\n".join(sections)


async def _next_version(project_id: str, engine_name: str) -> int:
    latest = await mongodb.engine_runs_collection().find_one(
        {"project_id": project_id, "engine_name": engine_name},
        sort=[("version", -1)],
    )
    return (latest["version"] + 1) if latest else 1


def _output_instructions(output_model: type[BaseModel]) -> str:
    schema = output_model.model_json_schema()
    return (
        "Respond with ONLY a single JSON object (no markdown fences, no commentary) "
        f"matching this exact JSON schema:\n{schema}\n"
        "Every field is required. Text fields must be substantive, not one-liners. "
        "`full_markdown` must render the ENTIRE output as one well-formatted markdown "
        "document with headings for every section."
    )


async def run_engine(
    project_id: str,
    engine_name: str,
    system_prompt: str,
    output_model: type[ModelT],
) -> ModelT:
    """Runs one Engine (e.g. Strategy, Analytics) for a business, persists a new
    version, embeds it for the Copilot, and returns the validated output.
    """
    context = await _gather_context(project_id)
    user_prompt = f"{context}\n\n{_output_instructions(output_model)}"
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    data = await chat_completion_json(messages, temperature=0.4)
    try:
        validated = output_model.model_validate(data)
    except ValidationError as exc:
        logger.warning("%s engine output failed schema validation, retrying: %s", engine_name, exc)
        repair_messages = messages + [
            {"role": "assistant", "content": str(data)},
            {
                "role": "user",
                "content": (
                    f"Your previous response did not match the required schema ({exc}). "
                    "Respond again with ONLY the corrected JSON object satisfying every field."
                ),
            },
        ]
        data = await chat_completion_json(repair_messages, temperature=0.4)
        validated = output_model.model_validate(data)

    version = await _next_version(project_id, engine_name)
    generated_at = datetime.now(timezone.utc)
    await mongodb.engine_runs_collection().insert_one(
        {
            "project_id": project_id,
            "engine_name": engine_name,
            "version": version,
            "output_json": validated.model_dump(),
            "generated_at": generated_at,
        }
    )
    chroma.add_documents(
        project_id,
        f"engine:{engine_name}",
        chunk_text(validated.model_dump().get("full_markdown", "")),
        {"engine_name": engine_name, "version": version},
    )
    logger.info("Engine '%s' generated v%d for project %s", engine_name, version, project_id)
    return validated


async def get_latest(project_id: str, engine_name: str) -> dict:
    doc = await mongodb.engine_runs_collection().find_one(
        {"project_id": project_id, "engine_name": engine_name},
        sort=[("version", -1)],
    )
    if not doc:
        raise NotFoundError(f"No '{engine_name}' engine output yet for project {project_id}")
    doc["id"] = str(doc.pop("_id"))
    return doc


async def get_history(project_id: str, engine_name: str) -> list[dict]:
    cursor = (
        mongodb.engine_runs_collection()
        .find({"project_id": project_id, "engine_name": engine_name}, {"output_json": 0})
        .sort("version", 1)
    )
    docs = await cursor.to_list(length=None)
    for doc in docs:
        doc["id"] = str(doc.pop("_id"))
    return docs
