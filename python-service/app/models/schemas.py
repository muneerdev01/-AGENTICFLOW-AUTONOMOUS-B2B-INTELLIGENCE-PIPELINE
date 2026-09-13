from typing import Literal
from datetime import datetime
from pydantic import BaseModel, Field

class LeadInput(BaseModel):
    company_name: str = Field(..., description="Legal or common operating company name")
    domain: str | None = Field(None, description="Primary web domain (e.g. acme.com)")
    industry: str | None = Field(None, description="Operating sector or vertical")
    country: str | None = Field("United States", description="Country of primary registration or operations")
    city: str | None = Field(None, description="City or metropolitan headquarters")
    company_size: str | None = Field(None, description="Employee headcount bracket")
    revenue_range: str | None = Field(None, description="Estimated annual revenue bracket")
    contact_name: str | None = Field(None, description="Key executive contact or champion")
    contact_title: str | None = Field(None, description="Job title of primary contact")
    email: str | None = Field(None, description="Corporate email address")
    linkedin_url: str | None = Field(None, description="Company or contact LinkedIn profile")
    product_service: str | None = Field(None, description="Relevant product or solution focus")
    deal_size: str | None = Field(None, description="Target contract annual value")
    business_need: str | None = Field(None, description="Specific business requirement or pain point")
    notes: str | None = Field(None, description="Internal sales or qualification context")

class SourceCitation(BaseModel):
    title: str
    url: str
    snippet: str
    source: str
    source_type: Literal["official", "registry", "news", "directory", "social", "demo"]
    trust_level: Literal["HIGH", "MEDIUM", "LOW", "DEMO"]
    retrieved_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class SearchResult(BaseModel):
    title: str
    url: str
    snippet: str
    source: str
    source_type: str
    trust_level: Literal["HIGH", "MEDIUM", "LOW", "DEMO"]
    retrieved_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class DomainCheckResult(BaseModel):
    domain: str
    status: Literal["VALID", "INVALID", "UNREACHABLE", "REDIRECTED", "UNKNOWN"]
    syntax_valid: bool
    https_available: bool
    http_status: int
    final_url: str | None = None
    redirect_count: int = 0
    page_title: str | None = None
    response_time_ms: int = 0
    server_header: str | None = None
    ssrf_passed: bool = True
    notes: str = ""

class RegistryCheckResult(BaseModel):
    country: str
    registry_name: str
    registry_type: str
    status: Literal["verified", "partially_verified", "unable_to_verify", "not_found"]
    legal_name: str | None = None
    jurisdiction: str | None = None
    evidence: str
    trust_level: Literal["HIGH", "MEDIUM", "LOW", "DEMO"]
    source_url: str | None = None
    notes: str = ""

class CompanyVerification(BaseModel):
    id: str | None = None
    lead_id: str | None = None
    company_name: str
    domain: str
    company_exists: bool
    domain_valid: bool
    domain_status: Literal["VALID", "INVALID", "UNREACHABLE", "REDIRECTED", "UNKNOWN"]
    industry: str
    location: str
    confidence: int = Field(..., ge=0, le=100)
    verification_status: Literal["verified", "partially_verified", "not_verified", "unable_to_verify"]
    domain_check: DomainCheckResult | None = None
    registry_check: RegistryCheckResult | None = None
    public_info_status: str
    sources: list[SourceCitation] = Field(default_factory=list)
    evidence: list[str] = Field(default_factory=list)
    notes: str = ""
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class NormalizedCompany(BaseModel):
    legal_name: str
    tradestyle: str | None = None
    primary_domain: str
    clean_industry: str
    naics_code: str | None = None
    naics_description: str | None = None
    headquarters: str
    employee_range: str
    estimated_annual_revenue: str | None = None
    tech_stack: list[str] = Field(default_factory=list)
    key_decision_makers: list[dict] = Field(default_factory=list)
    verified_summary: str

class ScoreBreakdown(BaseModel):
    company_fit: int = Field(..., ge=0, le=25)
    market_fit: int = Field(..., ge=0, le=20)
    business_need: int = Field(..., ge=0, le=20)
    credibility: int = Field(..., ge=0, le=20)
    engagement_potential: int = Field(..., ge=0, le=15)

class LeadScore(BaseModel):
    id: str | None = None
    lead_id: str | None = None
    total_score: int = Field(..., ge=0, le=100)
    breakdown: ScoreBreakdown
    qualification: Literal["hot", "warm", "cold", "unqualified"]
    reasons: list[str] = Field(default_factory=list)
    positive_signals: list[str] = Field(default_factory=list)
    risk_signals: list[str] = Field(default_factory=list)
    scored_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class Proposal(BaseModel):
    id: str
    lead_id: str
    title: str
    executive_summary: str
    client_needs: list[str] = Field(default_factory=list)
    proposed_solution: str
    business_value: list[str] = Field(default_factory=list)
    recommended_next_steps: list[str] = Field(default_factory=list)
    engagement_approach: str
    personalization_notes: str
    status: Literal["draft", "pending_review", "approved", "rejected"] = "pending_review"
    human_reviewed_by: str | None = None
    review_notes: str | None = None
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class AgentNode(BaseModel):
    id: str
    node_name: Literal[
        "input_lead",
        "search_company",
        "verify_domain",
        "verify_registry",
        "normalize_data",
        "score_lead",
        "generate_proposal",
        "human_review"
    ]
    display_name: str
    status: Literal["PENDING", "RUNNING", "COMPLETED", "FAILED", "SKIPPED"]
    started_at: str | None = None
    completed_at: str | None = None
    duration_ms: int | None = None
    tool_used: str
    summary: str
    input_summary: str | None = None
    output_summary: str | None = None
    error: str | None = None

class TraceEvent(BaseModel):
    timestamp: str
    node: str
    event: str
    level: Literal["INFO", "WARN", "ERROR", "SUCCESS"]
    detail: str

class AgentRun(BaseModel):
    id: str
    lead_id: str
    company_name: str
    status: Literal["started", "running", "completed", "failed", "human_review_required"]
    current_node: str
    nodes: list[AgentNode] = Field(default_factory=list)
    started_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    completed_at: str | None = None
    duration_ms: int | None = None
    error: str | None = None
    operational_trace: list[TraceEvent] = Field(default_factory=list)

class ActivityEvent(BaseModel):
    id: str
    lead_id: str | None = None
    lead_name: str | None = None
    run_id: str | None = None
    event_type: str
    message: str
    level: Literal["info", "success", "warning", "error"]
    metadata: dict | None = None
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class Lead(LeadInput):
    id: str
    status: Literal["new", "researching", "verified", "qualified", "proposal_ready", "human_review", "approved", "rejected"] = "new"
    verification_status: Literal["verified", "partially_verified", "not_verified", "unable_to_verify"] = "unable_to_verify"
    latest_score: LeadScore | None = None
    latest_run_id: str | None = None
    active_proposal_id: str | None = None
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
