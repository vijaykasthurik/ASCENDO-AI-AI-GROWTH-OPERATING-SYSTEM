"""Glues the whole pipeline together: upload -> plan -> sequential agent graph
-> orchestrator -> final LLM -> persistence, plus dashboard metric derivation.
"""

import logging
from datetime import datetime, timezone

from bson import ObjectId

from app.core.email_client import send_email
from app.core.email_templates import analysis_complete_email
from app.core.exceptions import NotFoundError
from app.db import chroma, mongodb
from app.graph.workflow import build_dynamic_graph
from app.models.agent import AgentOutput
from app.models.project import ProjectStatus
from app.models.report import DashboardMetrics
from app.parsers.readme_parser import build_embedding_chunks, chunk_text
from app.planner.master_planner import generate_master_plan

logger = logging.getLogger(__name__)


async def create_project(user_id: str, name: str, readme_text: str) -> str:
    now = datetime.now(timezone.utc)
    project_doc = {
        "user_id": user_id,
        "name": name,
        "status": ProjectStatus.UPLOADED.value,
        "current_step": "Uploaded, awaiting analysis",
        "error": None,
        "created_at": now,
        "updated_at": now,
    }
    result = await mongodb.projects_collection().insert_one(project_doc)
    project_id = str(result.inserted_id)

    await mongodb.readmes_collection().insert_one(
        {"project_id": project_id, "content": readme_text, "created_at": now}
    )

    chunks = build_embedding_chunks(readme_text)
    chroma.add_documents(project_id, "readme_chunk", chunks)

    logger.info("Project %s created for user %s (%d README chunks embedded)", project_id, user_id, len(chunks))
    return project_id


async def _set_status(project_id: str, status: ProjectStatus, step: str, error: str | None = None) -> None:
    await mongodb.projects_collection().update_one(
        {"_id": ObjectId(project_id)},
        {
            "$set": {
                "status": status.value,
                "current_step": step,
                "error": error,
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )


async def get_project(project_id: str) -> dict:
    doc = await mongodb.projects_collection().find_one({"_id": ObjectId(project_id)})
    if not doc:
        raise NotFoundError(f"Project {project_id} not found")
    doc["id"] = str(doc.pop("_id"))
    return doc


async def list_projects_for_user(user_id: str) -> list[dict]:
    cursor = mongodb.projects_collection().find({"user_id": user_id}).sort("created_at", -1)
    docs = await cursor.to_list(length=None)
    for doc in docs:
        doc["id"] = str(doc.pop("_id"))
    return docs


async def get_readme_text(project_id: str) -> str:
    doc = await mongodb.readmes_collection().find_one({"project_id": project_id})
    if not doc:
        raise NotFoundError(f"README for project {project_id} not found")
    return doc["content"]


async def list_agent_outputs(project_id: str) -> list[dict]:
    cursor = mongodb.agent_outputs_collection().find({"project_id": project_id}).sort("sequence_index", 1)
    docs = await cursor.to_list(length=None)
    for doc in docs:
        doc["id"] = str(doc.pop("_id"))
    return docs


async def get_final_report(project_id: str) -> dict:
    doc = await mongodb.final_reports_collection().find_one({"project_id": project_id})
    if not doc:
        raise NotFoundError(f"Final report for project {project_id} not found")
    doc["id"] = str(doc.pop("_id"))
    return doc


async def delete_project(project_id: str) -> None:
    # 1. Delete from projects collection
    await mongodb.projects_collection().delete_one({"_id": ObjectId(project_id)})
    # 2. Delete from readmes collection
    await mongodb.readmes_collection().delete_many({"project_id": project_id})
    # 3. Delete from agent_outputs collection
    await mongodb.agent_outputs_collection().delete_many({"project_id": project_id})
    # 4. Delete from final_reports collection
    await mongodb.final_reports_collection().delete_many({"project_id": project_id})
    # 5. Delete from engine_runs collection
    await mongodb.engine_runs_collection().delete_many({"project_id": project_id})
    # 6. Delete from ChromaDB vector collection
    chroma.delete_project_documents(project_id)



async def _persist_agent_output(project_id: str, output: AgentOutput, system_prompt: str) -> None:
    doc = {
        "project_id": project_id,
        "agent_name": output.agent_name,
        "role": output.role,
        "responsibility": output.responsibility,
        "prompt": system_prompt,
        "input_summary": output.input_summary,
        "output_markdown": output.markdown_output,
        "output_json": output.json_output,
        "execution_time_seconds": output.execution_time_seconds,
        "confidence_score": output.confidence_score,
        "priority": output.priority,
        "reasoning_summary": output.reasoning_summary,
        "recommendations": output.recommendations,
        "sequence_index": output.sequence_index,
        "created_at": datetime.now(timezone.utc),
    }
    await mongodb.agent_outputs_collection().insert_one(doc)
    chroma.add_documents(
        project_id, "agent_output", chunk_text(output.markdown_output), {"agent_name": output.agent_name}
    )


async def run_analysis(project_id: str) -> None:
    """Runs plan -> sequential agents -> orchestrator -> final LLM. Meant to run
    as a background task; progress is written to the project document in Mongo
    so the frontend can poll/stream it.
    """
    try:
        readme_text = await get_readme_text(project_id)

        await _set_status(project_id, ProjectStatus.PLANNING, "Master Planner is designing your agent team")
        plan = await generate_master_plan(readme_text)
        prompts_by_name = {a.name: a.system_prompt for a in plan.agents}

        await mongodb.projects_collection().update_one(
            {"_id": ObjectId(project_id)},
            {
                "$set": {
                    "industry": plan.industry,
                    "business_summary": plan.business_summary,
                    "agent_specs": [a.model_dump() for a in plan.agents],
                }
            },
        )

        await _set_status(
            project_id,
            ProjectStatus.RUNNING_AGENTS,
            f"Running {len(plan.agents)} specialized agents sequentially",
        )
        graph = build_dynamic_graph(plan.agents)

        state: dict = {
            "project_id": project_id,
            "readme_text": readme_text,
            "previous_output_markdown": None,
            "agent_outputs": [],
        }

        async for update in graph.astream(state, stream_mode="updates"):
            for node_name, partial in update.items():
                if "agent_outputs" in partial:
                    state["agent_outputs"] = state.get("agent_outputs", []) + partial["agent_outputs"]
                for key, value in partial.items():
                    if key != "agent_outputs":
                        state[key] = value

                if node_name == "orchestrator":
                    await _set_status(
                        project_id, ProjectStatus.ORCHESTRATING, "Merging and scoring all agent insights"
                    )
                elif node_name == "final_llm":
                    await _set_status(
                        project_id, ProjectStatus.FINALIZING, "Generating the final business report"
                    )
                else:
                    for output in partial.get("agent_outputs", []):
                        await _persist_agent_output(
                            project_id, output, prompts_by_name.get(output.agent_name, "")
                        )
                        await _set_status(
                            project_id,
                            ProjectStatus.RUNNING_AGENTS,
                            f"Completed agent: {output.agent_name}",
                        )

        fine_tuned_analysis = state["fine_tuned_analysis"]
        final_report = state["final_report"]

        await mongodb.final_reports_collection().insert_one(
            {
                "project_id": project_id,
                **final_report,
                "created_at": datetime.now(timezone.utc),
            }
        )
        chroma.add_documents(
            project_id, "final_report", chunk_text(final_report.get("full_markdown", ""))
        )

        await mongodb.projects_collection().update_one(
            {"_id": ObjectId(project_id)},
            {"$set": {"fine_tuned_analysis": fine_tuned_analysis}},
        )

        # Local import: avoids a circular import (app.engines.base imports this module
        # to fetch README/final-report context for engines).
        from app.engines import mandatory as engines_mandatory

        await _set_status(
            project_id, ProjectStatus.GENERATING_ENGINES,
            "Generating Strategy, Marketing, Lead Gen, Sales, Analytics, and Customer Success engines"
        )
        engine_results = await engines_mandatory.run_all(project_id)
        failed_engines = [name for name, res in engine_results.items() if res["status"] == "failed"]
        if failed_engines:
            logger.warning("Mandatory engines failed for project %s: %s", project_id, failed_engines)

        await _set_status(project_id, ProjectStatus.COMPLETED, "Analysis complete")
        logger.info("Project %s analysis pipeline completed successfully", project_id)

        try:
            project = await get_project(project_id)
            user = await mongodb.users_collection().find_one({"_id": ObjectId(project["user_id"])})
            if user:
                subject, html, text = analysis_complete_email(user["full_name"], project["name"])
                await send_email(user["email"], subject, html, text)
        except Exception:  # noqa: BLE001 - a notification failure must never fail a completed analysis
            logger.exception("Failed to send analysis-complete email for project %s", project_id)

    except Exception as exc:  # noqa: BLE001 - surface any pipeline failure onto the project doc
        logger.exception("Analysis pipeline failed for project %s", project_id)
        await _set_status(project_id, ProjectStatus.FAILED, "Analysis failed", error=str(exc))


async def compute_dashboard_metrics(project_id: str) -> DashboardMetrics:
    project = await get_project(project_id)
    fine_tuned_analysis = project.get("fine_tuned_analysis")
    if not fine_tuned_analysis:
        raise NotFoundError(f"Project {project_id} has no completed analysis yet")

    report = await get_final_report(project_id)
    scores = fine_tuned_analysis.get("scores", [])

    def _mean(field: str) -> float:
        values = [s.get(field, 0) for s in scores]
        return (sum(values) / len(values)) if values else 0.0

    agent_outputs = await list_agent_outputs(project_id)
    seen: set[str] = set()
    recommendations: list[str] = []
    for doc in agent_outputs:
        for rec in doc.get("recommendations", []):
            if rec not in seen:
                seen.add(rec)
                recommendations.append(rec)
    recommendations = recommendations[:8]

    agent_contribution = {s["agent_name"]: round(s.get("overall", 0) * 10, 1) for s in scores}

    return DashboardMetrics(
        business_health_score=round(_mean("overall") * 10, 1),
        growth_score=round(_mean("growth_potential") * 10, 1),
        revenue_opportunity=round(_mean("business_value") * 10, 1),
        lead_score=round(_mean("confidence") * 10, 1),
        customer_health=round(_mean("accuracy") * 10, 1),
        market_readiness=round(_mean("technical_feasibility") * 10, 1),
        risk_alerts=fine_tuned_analysis.get("conflicting_recommendations", []),
        executive_summary=report.get("executive_summary", ""),
        ai_recommendations=recommendations,
        agent_contribution=agent_contribution,
    )
