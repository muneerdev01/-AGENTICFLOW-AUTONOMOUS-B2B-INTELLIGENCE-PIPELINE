from app.graph.state import AgentState
from app.models.schemas import NormalizedCompany

async def normalize_data_node(state: AgentState) -> AgentState:
    """
    Node: normalize_data
    Normalizes unstructured lead data into a standardized corporate entity.
    """
    lead = state["lead"]
    clean_industry = (lead.industry or "Information Technology").strip().title()
    
    # Estimate NAICS code based on industry
    naics_code = "541512"
    naics_desc = "Computer Systems Design and Related Services"
    if "manufactur" in clean_industry.lower() or "robot" in clean_industry.lower():
        naics_code = "333249"
        naics_desc = "Other Industrial Machinery Manufacturing"
    elif "health" in clean_industry.lower() or "clinic" in clean_industry.lower():
        naics_code = "621498"
        naics_desc = "All Other Outpatient Care Centers"
    elif "logist" in clean_industry.lower() or "freight" in clean_industry.lower():
        naics_code = "488510"
        naics_desc = "Freight Transportation Arrangement"

    normalized = NormalizedCompany(
        legal_name=f"{lead.company_name} Inc.",
        tradestyle=lead.company_name,
        primary_domain=lead.domain or "unknown.com",
        clean_industry=clean_industry,
        naics_code=naics_code,
        naics_description=naics_desc,
        headquarters=f"{lead.city + ', ' if lead.city else ''}{lead.country or 'United States'}",
        employee_range=lead.company_size or "100-250 employees",
        estimated_annual_revenue=lead.revenue_range or "$20M - $50M",
        tech_stack=["Cloud Architecture", "REST API", "Telemetry Pipelines", "OAuth 2.0"],
        key_decision_makers=[
            {"name": lead.contact_name or "VP Operations", "title": lead.contact_title or "Executive"}
        ],
        verified_summary=f"Normalized entity profile for {lead.company_name} in {clean_industry}."
    )
    
    state["normalized_data"] = normalized
    state["current_node"] = "normalize_data"
    return state
