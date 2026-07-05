"""Pydantic schemas for the always-on product Engines (Strategy, Analytics, and
future engines). Distinct from the dynamic per-business agents in app/models/agent.py:
these are fixed, permanent product features with a stable output shape.
"""

from pydantic import BaseModel


class MarketSegment(BaseModel):
    segment: str
    description: str
    why_fit: str


class CompetitorProfile(BaseModel):
    name: str
    strengths: list[str]
    weaknesses: list[str]
    market_position: str


class PricingTier(BaseModel):
    tier_name: str
    price: str
    rationale: str


class StrategyOutput(BaseModel):
    market_research_summary: str
    key_market_trends: list[str]
    target_segments: list[MarketSegment]
    competitor_landscape: list[CompetitorProfile]
    brand_positioning_statement: str
    unique_value_proposition: str
    differentiation_points: list[str]
    pricing_model_recommendation: str
    pricing_tiers: list[PricingTier]
    pricing_rationale: str
    sales_strategy: str
    marketing_strategy: str
    full_markdown: str


class ForecastPoint(BaseModel):
    period: str
    metric: str
    low_estimate: str
    mid_estimate: str
    high_estimate: str
    key_assumptions: list[str]


class PortfolioItem(BaseModel):
    name: str
    status: str
    recommendation: str


class RoadmapInitiative(BaseModel):
    title: str
    timeframe: str
    priority: str
    category: str
    description: str


class AnalyticsOutput(BaseModel):
    forecasts: list[ForecastPoint]
    forecast_methodology_note: str
    competitive_insights: list[CompetitorProfile]
    competitive_advantages: list[str]
    competitive_threats: list[str]
    portfolio_assessment: list[PortfolioItem]
    roadmap: list[RoadmapInitiative]
    full_markdown: str


class MarketingChannel(BaseModel):
    channel_name: str
    rationale: str
    priority: str
    suggested_tactics: list[str]


class CampaignIdea(BaseModel):
    campaign_name: str
    objective: str
    channel: str
    description: str
    estimated_timeline: str


class MarketingOutput(BaseModel):
    brand_messaging_summary: str
    channels: list[MarketingChannel]
    content_pillars: list[str]
    campaign_ideas: list[CampaignIdea]
    budget_allocation_guidance: str
    brand_voice_guidelines: str
    full_markdown: str


class LeadSource(BaseModel):
    source_name: str
    description: str
    expected_lead_quality: str
    effort_level: str


class WhatsAppCampaignIdea(BaseModel):
    campaign_name: str
    target_audience: str
    message_template: str
    cta: str


class LeadMagnet(BaseModel):
    name: str
    description: str
    target_segment: str


class LeadGenOutput(BaseModel):
    lead_sources: list[LeadSource]
    digital_marketing_strategy: str
    whatsapp_campaign_ideas: list[WhatsAppCampaignIdea]
    physical_marketing_ideas: list[str]
    lead_magnets: list[LeadMagnet]
    lead_scoring_criteria: list[str]
    conversion_tactics: list[str]
    full_markdown: str


class SalesFunnelStage(BaseModel):
    stage_name: str
    description: str
    key_activities: list[str]
    exit_criteria: str


class ObjectionResponse(BaseModel):
    objection: str
    recommended_response: str


class SalesOutput(BaseModel):
    sales_funnel_stages: list[SalesFunnelStage]
    sales_playbook_summary: str
    objection_handling: list[ObjectionResponse]
    deal_qualification_criteria: list[str]
    sales_enablement_recommendations: list[str]
    closing_tactics: list[str]
    full_markdown: str


class OnboardingStep(BaseModel):
    step: str
    description: str


class SupportChannel(BaseModel):
    channel: str
    rationale: str


class FaqItem(BaseModel):
    question: str
    answer: str


class ChatbotExchange(BaseModel):
    user_message: str
    bot_response: str


class CustomerSuccessOutput(BaseModel):
    crm_setup_recommendation: str
    customer_onboarding_plan: list[OnboardingStep]
    support_channels_recommendation: list[SupportChannel]
    faq_suggestions: list[FaqItem]
    chatbot_persona: str
    chatbot_sample_conversations: list[ChatbotExchange]
    retention_strategies: list[str]
    churn_risk_signals: list[str]
    full_markdown: str


class EngineRunSummary(BaseModel):
    version: int
    generated_at: str
