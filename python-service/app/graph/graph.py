from typing import Literal
from langgraph.graph import StateGraph, START, END
from app.graph.state import AgentState
from app.graph.nodes import (
    input_lead_node,
    search_company_node,
    verify_domain_node,
    verify_registry_node,
    normalize_data_node,
    score_lead_node,
    generate_proposal_node,
    human_review_node
)

def route_after_verification(state: AgentState) -> Literal["normalize_data", "score_lead"]:
    """
    Conditional Routing:
    If domain verification succeeded or is partially verified, proceed with data normalization.
    If domain verification failed critically (unreachable / invalid), route directly to scoring
    to penalize and skip standard normalization.
    """
    ver = state.get("verification")
    if ver and ver.domain_status in ("INVALID", "UNREACHABLE") and ver.confidence < 50:
        return "score_lead"
    return "normalize_data"

def route_after_scoring(state: AgentState) -> Literal["generate_proposal", "human_review"]:
    """
    Conditional Routing:
    If lead is completely unqualified (<40 score), skip proposal generation and go straight to human review.
    Otherwise generate a tailored proposal.
    """
    score = state.get("score")
    if score and score.qualification == "unqualified":
        return "human_review"
    return "generate_proposal"

def create_agenticflow_graph():
    """
    Builds and compiles the complete LangGraph StateGraph for the autonomous B2B intelligence pipeline.
    """
    workflow = StateGraph(AgentState)

    # Register all 8 nodes
    workflow.add_node("input_lead", input_lead_node)
    workflow.add_node("search_company", search_company_node)
    workflow.add_node("verify_domain", verify_domain_node)
    workflow.add_node("verify_registry", verify_registry_node)
    workflow.add_node("normalize_data", normalize_data_node)
    workflow.add_node("score_lead", score_lead_node)
    workflow.add_node("generate_proposal", generate_proposal_node)
    workflow.add_node("human_review", human_review_node)

    # Edges
    workflow.add_edge(START, "input_lead")
    workflow.add_edge("input_lead", "search_company")
    workflow.add_edge("search_company", "verify_domain")
    workflow.add_edge("verify_domain", "verify_registry")

    # Conditional edge 1: based on verification outcome
    workflow.add_conditional_edges(
        "verify_registry",
        route_after_verification,
        {
            "normalize_data": "normalize_data",
            "score_lead": "score_lead"
        }
    )

    workflow.add_edge("normalize_data", "score_lead")

    # Conditional edge 2: based on qualification score
    workflow.add_conditional_edges(
        "score_lead",
        route_after_scoring,
        {
            "generate_proposal": "generate_proposal",
            "human_review": "human_review"
        }
    )

    workflow.add_edge("generate_proposal", "human_review")
    workflow.add_edge("human_review", END)

    return workflow.compile()

# Pre-compiled instance
agenticflow_app = create_agenticflow_graph()
