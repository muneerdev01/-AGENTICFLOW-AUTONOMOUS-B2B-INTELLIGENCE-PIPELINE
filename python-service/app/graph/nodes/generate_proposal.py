from app.graph.state import AgentState
from app.services.llm import get_llm_provider
from app.config import settings

async def generate_proposal_node(state: AgentState) -> AgentState:
    """
    Node: generate_proposal
    Drafts a personalized B2B proposal using LLM provider abstraction.
    """
    lead = state["lead"]
    ver = state.get("verification")
    is_demo = state.get("is_demo_mode", settings.DEMO_MODE)
    
    llm = get_llm_provider(
        demo_mode=is_demo,
        gemini_key=settings.GEMINI_API_KEY,
        model=settings.LLM_MODEL
    )

    try:
        proposal = await llm.generate_proposal(lead=lead, verification=ver)
        proposal.lead_id = state.get("run_id", "lead-temp")
        state["proposal"] = proposal
    except Exception as e:
        state["errors"].append(f"Proposal generation error: {str(e)[:100]}")

    state["current_node"] = "generate_proposal"
    return state
