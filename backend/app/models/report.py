from typing import Any

from pydantic import BaseModel


class SWOT(BaseModel):
    strengths: list[str]
    weaknesses: list[str]
    opportunities: list[str]
    threats: list[str]


class FinalReport(BaseModel):
    executive_summary: str
    business_analysis: str
    business_health: str
    swot: SWOT
    growth_strategy: str
    roadmap: str
    revenue_strategy: str
    marketing_strategy: str
    sales_strategy: str
    operations_strategy: str
    risk_analysis: str
    innovation_strategy: str
    investment_suggestions: str
    customer_strategy: str
    kpis: list[str]
    action_plan: str
    implementation_timeline: str
    next_steps: str
    full_markdown: str


class OrchestratorScore(BaseModel):
    agent_name: str
    accuracy: float
    business_value: float
    innovation: float
    growth_potential: float
    risk_awareness: float
    technical_feasibility: float
    confidence: float
    overall: float


class FineTunedAnalysis(BaseModel):
    scores: list[OrchestratorScore]
    duplicate_insights: list[str]
    conflicting_recommendations: list[str]
    priority_ranking: list[str]
    merged_markdown: str
    merged_json: dict[str, Any]


class DashboardMetrics(BaseModel):
    business_health_score: float
    growth_score: float
    revenue_opportunity: float
    lead_score: float
    customer_health: float
    market_readiness: float
    risk_alerts: list[str]
    executive_summary: str
    ai_recommendations: list[str]
    agent_contribution: dict[str, float]
