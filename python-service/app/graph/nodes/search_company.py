from app.graph.state import AgentState
from app.tools.search import get_search_provider
from app.config import settings

async def search_company_node(state: AgentState) -> AgentState:
    """
    Node: search_company
    Queries search provider with fallback chain.
    """
    lead = state["lead"]
    is_demo = state.get("is_demo_mode", settings.DEMO_MODE)
    provider = get_search_provider(
        demo_mode=is_demo,
        provider_name=settings.SEARCH_PROVIDER,
        tavily_key=settings.TAVILY_API_KEY
    )

    query = f"{lead.company_name} corporate overview {lead.industry or ''}"
    try:
        results = await provider.search(query=query, max_results=3)
        state["search_results"] = results
    except Exception as e:
        state["errors"].append(f"Search provider warning: {str(e)[:100]}")
        # Graceful fallback: empty or demo results
        state["search_results"] = []

    state["current_node"] = "search_company"
    return state
