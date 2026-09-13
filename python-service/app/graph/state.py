from typing import TypedDict
from app.models.schemas import (
    LeadInput,
    SearchResult,
    CompanyVerification,
    NormalizedCompany,
    LeadScore,
    Proposal
)

class AgentState(TypedDict, total=False):
    run_id: str
    lead: LeadInput
    search_results: list[SearchResult]
    verification: CompanyVerification | None
    normalized_data: NormalizedCompany | None
    score: LeadScore | None
    proposal: Proposal | None
    current_node: str
    status: str
    errors: list[str]
    is_demo_mode: bool
