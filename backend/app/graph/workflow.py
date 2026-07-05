"""Builds a fresh, sequential LangGraph workflow for one project's dynamically
generated agent team. The graph is never predefined - it's constructed after the
Master Planner decides how many agents exist and what each one does.
"""

import re

from langgraph.graph import END, START, StateGraph

from app.agents.agent_factory import make_agent_node
from app.graph.final_llm import final_llm_node
from app.graph.orchestrator import orchestrator_node
from app.graph.state import GraphState
from app.models.agent import AgentSpec


def _slugify(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_")


def build_dynamic_graph(agent_specs: list[AgentSpec]):
    """Compile a LangGraph StateGraph: agent1 -> agent2 -> ... -> agentN ->
    orchestrator -> final_llm -> END. Every agent node always sees the original
    README plus the immediately previous agent's output.
    """
    if not agent_specs:
        raise ValueError("Cannot build a workflow with zero agents")

    graph = StateGraph(GraphState)

    node_names: list[str] = []
    used_names: set[str] = set()
    for index, spec in enumerate(agent_specs):
        base = f"agent_{index}_{_slugify(spec.name)}"
        node_name = base
        suffix = 1
        while node_name in used_names:
            node_name = f"{base}_{suffix}"
            suffix += 1
        used_names.add(node_name)

        graph.add_node(node_name, make_agent_node(spec, index))
        node_names.append(node_name)

    graph.add_node("orchestrator", orchestrator_node)
    graph.add_node("final_llm", final_llm_node)

    graph.add_edge(START, node_names[0])
    for current, following in zip(node_names, node_names[1:]):
        graph.add_edge(current, following)
    graph.add_edge(node_names[-1], "orchestrator")
    graph.add_edge("orchestrator", "final_llm")
    graph.add_edge("final_llm", END)

    return graph.compile()
