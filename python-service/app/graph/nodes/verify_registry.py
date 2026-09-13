from app.graph.state import AgentState
from app.tools.registry import get_registry_provider
from app.config import settings

async def verify_registry_node(state: AgentState) -> AgentState:
    """
    Node: verify_registry
    Queries corporate registry records.
    Never invents legal registration if not verified.
    """
    lead = state["lead"]
    is_demo = state.get("is_demo_mode", settings.DEMO_MODE)
    provider = get_registry_provider(demo_mode=is_demo)

    try:
        reg_result = await provider.verify_registry(
            company_name=lead.company_name,
            country=lead.country,
            state=lead.city
        )
        if state.get("verification"):
            ver = state["verification"]
            ver.registry_check = reg_result
            if reg_result.status == "verified":
                ver.confidence = min(100, ver.confidence + 8)
                ver.evidence.append(f"Official registry: {reg_result.registry_name} ({reg_result.status})")
            elif reg_result.status == "unable_to_verify":
                ver.confidence = max(20, ver.confidence - 25)
                ver.evidence.append("Registry match not verified; confidence reduced.")
            state["verification"] = ver
    except Exception as e:
        state["errors"].append(f"Registry query warning: {str(e)[:100]}")

    state["current_node"] = "verify_registry"
    return state
