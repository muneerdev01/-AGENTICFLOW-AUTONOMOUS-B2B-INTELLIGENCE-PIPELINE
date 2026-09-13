from app.graph.state import AgentState

async def human_review_node(state: AgentState) -> AgentState:
    """
    Node: human_review
    Enforces the Human-In-The-Loop mandate.
    The agent pauses here and is strictly prohibited from executing external outreach automatically.
    """
    state["current_node"] = "human_review"
    state["status"] = "human_review_required"
    return state
