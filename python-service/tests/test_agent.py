import pytest
from app.models.schemas import (
    LeadInput,
    ScoreBreakdown,
    LeadScore,
    CompanyVerification
)
from app.tools.domain import is_safe_host
from app.tools.search import DemoSearchProvider, get_search_provider
from app.tools.registry import DemoRegistryProvider
from app.graph.state import AgentState
from app.graph.nodes.score_lead import score_lead_node

def test_pydantic_lead_input_validation():
    """Verify Pydantic LeadInput enforces company name and accepts optional attributes."""
    valid_lead = LeadInput(company_name="Apex Logistics", domain="apex-demo.com")
    assert valid_lead.company_name == "Apex Logistics"
    assert valid_lead.domain == "apex-demo.com"

    with pytest.raises(Exception):
        LeadInput()  # Missing required company_name

def test_ssrf_protection_guard():
    """Verify SSRF protection rejects localhost, 127.0.0.1, 0.0.0.0, and private ranges."""
    safe, msg = is_safe_host("localhost")
    assert not safe
    assert "SSRF blocked" in msg

    safe, msg = is_safe_host("127.0.0.1")
    assert not safe

    safe, msg = is_safe_host("169.254.169.254")  # AWS/GCP metadata
    assert not safe

    safe, msg = is_safe_host("10.0.0.1")
    assert not safe

    safe, msg = is_safe_host("192.168.1.1")
    assert not safe

    # Test valid public domain format
    safe, _ = is_safe_host("example.com")
    assert safe

def test_demo_search_provider_deterministic():
    """Verify DemoSearchProvider returns synthetic citations with DEMO trust."""
    provider = DemoSearchProvider()
    import asyncio
    results = asyncio.run(provider.search("Northstar Analytics", max_results=3))
    assert len(results) == 3
    assert results[0].trust_level == "DEMO"
    assert "Synthetic Demo Source" in results[0].snippet

def test_demo_registry_provider():
    """Verify Registry provider returns structured verified evidence or unable_to_verify."""
    provider = DemoRegistryProvider()
    import asyncio
    
    # Standard company
    res = asyncio.run(provider.verify_registry("Summit Health Systems"))
    assert res.status == "verified"
    assert res.trust_level == "DEMO"
    assert "Good Standing" in res.evidence

    # Unknown company
    unknown = asyncio.run(provider.verify_registry("NovaWorks Consulting (unverified)"))
    assert unknown.status == "unable_to_verify"

@pytest.mark.asyncio
async def test_lead_scoring_weights_and_classification():
    """Verify 0-100 scoring engine outputs valid score, breakdown, and qualification."""
    lead = LeadInput(
        company_name="Enterprise Scale Corp",
        domain="enterprise-scale-demo.com",
        industry="Enterprise Cloud Software",
        company_size="1000-5000 employees",
        revenue_range="$200M+",
        contact_name="Sarah Connor",
        contact_title="VP of Engineering",
        business_need="Automating enterprise compliance and distributed stream processing across multi-cloud."
    )
    ver = CompanyVerification(
        company_name="Enterprise Scale Corp",
        domain="enterprise-scale-demo.com",
        company_exists=True,
        domain_valid=True,
        domain_status="VALID",
        industry="Software",
        location="USA",
        confidence=95,
        verification_status="verified",
        public_info_status="Checked",
        sources=[],
        evidence=[]
    )
    state: AgentState = {
        "run_id": "test-run",
        "lead": lead,
        "verification": ver,
        "search_results": [],
        "errors": []
    }

    updated_state = await score_lead_node(state)
    score = updated_state["score"]
    assert score is not None
    assert 0 <= score.total_score <= 100
    assert score.qualification in ("hot", "warm", "cold", "unqualified")
    assert score.breakdown.company_fit <= 25
    assert score.breakdown.market_fit <= 20
    assert score.breakdown.business_need <= 20
    assert score.breakdown.credibility <= 20
    assert score.breakdown.engagement_potential <= 15
    assert score.qualification == "hot"  # High tier attributes should result in HOT
