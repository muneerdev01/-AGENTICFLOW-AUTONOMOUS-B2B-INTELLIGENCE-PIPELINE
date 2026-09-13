from datetime import datetime
from app.graph.state import AgentState
from app.tools.domain import verify_domain_status
from app.models.schemas import CompanyVerification, SourceCitation
from app.config import settings

async def verify_domain_node(state: AgentState) -> AgentState:
    """
    Node: verify_domain
    Performs SSRF-protected domain validation and HTTP/TLS inspection.
    """
    lead = state["lead"]
    is_demo = state.get("is_demo_mode", settings.DEMO_MODE)
    domain_to_check = lead.domain or f"{lead.company_name.lower().replace(' ', '-')}-demo.com"

    domain_result = await verify_domain_status(domain_to_check, is_demo_mode=is_demo)
    
    # Initialize verification record
    is_valid = domain_result.status == "VALID"
    verification = CompanyVerification(
        company_name=lead.company_name,
        domain=domain_to_check,
        company_exists=True,
        domain_valid=is_valid,
        domain_status=domain_result.status,
        industry=lead.industry or "Technology",
        location=f"{lead.city + ', ' if lead.city else ''}{lead.country or 'USA'}",
        confidence=90 if is_valid else 40,
        verification_status="verified" if is_valid else "unable_to_verify",
        domain_check=domain_result,
        public_info_status="Public domain resolution checked.",
        sources=[
            SourceCitation(
                title=f"{lead.company_name} Domain Verification",
                url=f"https://{domain_to_check}",
                snippet=domain_result.notes,
                source="Domain Verifier",
                source_type="demo" if is_demo else "official",
                trust_level="DEMO" if is_demo else "HIGH"
            )
        ],
        evidence=[
            f"Domain probe status: {domain_result.status}",
            f"HTTPS enforced: {domain_result.https_available}",
            f"SSRF filter status: PASSED" if domain_result.ssrf_passed else "SSRF filter: FAILED"
        ],
        notes=domain_result.notes,
        timestamp=datetime.utcnow().isoformat()
    )
    
    state["verification"] = verification
    state["current_node"] = "verify_domain"
    return state
