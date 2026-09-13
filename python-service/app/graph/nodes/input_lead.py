from app.graph.state import AgentState

async def input_lead_node(state: AgentState) -> AgentState:
    """
    Node: input_lead
    Validates the intake lead model and normalizes basic domain syntax.
    """
    lead = state["lead"]
    clean_domain = lead.domain or ""
    if clean_domain.startswith("http://"):
        clean_domain = clean_domain[7:]
    elif clean_domain.startswith("https://"):
        clean_domain = clean_domain[8:]
    clean_domain = clean_domain.split("/")[0].strip()

    lead.domain = clean_domain
    state["lead"] = lead
    state["current_node"] = "input_lead"
    state["status"] = "running"
    state["errors"] = state.get("errors", [])
    return state
