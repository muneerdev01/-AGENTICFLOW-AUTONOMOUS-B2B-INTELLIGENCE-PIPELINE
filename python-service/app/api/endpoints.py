import asyncio
from datetime import datetime
from fastapi import APIRouter, HTTPException, BackgroundTasks, Query
from app.models.schemas import (
    Lead,
    LeadInput,
    CompanyVerification,
    LeadScore,
    Proposal,
    AgentRun,
    AgentNode,
    ActivityEvent,
    TraceEvent
)
from app.services.storage import get_storage_provider
from app.graph.graph import agenticflow_app
from app.tools.domain import is_safe_host
from app.config import settings

router = APIRouter()
storage = get_storage_provider(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

@router.get("/health")
async def health():
    return {
        "status": "healthy",
        "product": "AgenticFlow Python Service",
        "version": "1.0.0",
        "demo_mode": settings.DEMO_MODE,
        "search_provider": settings.SEARCH_PROVIDER,
        "llm_provider": settings.LLM_PROVIDER,
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/api/v1/leads")
async def list_leads(
    status: str | None = None,
    qualification: str | None = None,
    query: str | None = None
):
    leads = await storage.get_leads()
    if status:
        leads = [l for l in leads if l.status == status]
    if query:
        q = query.lower()
        leads = [l for l in leads if q in l.company_name.lower() or (l.domain and q in l.domain.lower())]
    return {"count": len(leads), "leads": leads}

@router.post("/api/v1/leads", status_code=201)
async def create_lead(lead_in: LeadInput):
    lead_id = f"lead-{int(datetime.utcnow().timestamp() * 1000)}"
    new_lead = Lead(
        id=lead_id,
        **lead_in.model_dump(),
        status="new",
        verification_status="unable_to_verify",
        created_at=datetime.utcnow().isoformat(),
        updated_at=datetime.utcnow().isoformat()
    )
    saved = await storage.save_lead(new_lead)
    await storage.log_activity(ActivityEvent(
        id=f"evt-{int(datetime.utcnow().timestamp() * 1000)}",
        lead_id=lead_id,
        lead_name=new_lead.company_name,
        event_type="lead_created",
        message=f"Created lead {new_lead.company_name}",
        level="info"
    ))
    return saved

@router.get("/api/v1/leads/{lead_id}")
async def get_lead_detail(lead_id: str):
    lead = await storage.get_lead(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    verification = await storage.get_verification(lead_id)
    proposal = await storage.get_proposal(lead_id)
    latest_run = await storage.get_agent_run(lead.latest_run_id) if lead.latest_run_id else None
    
    return {
        "lead": lead,
        "verification": verification,
        "proposal": proposal,
        "latest_run": latest_run
    }

async def execute_langgraph_pipeline(lead: Lead, run_id: str):
    """Executes the compiled LangGraph StateGraph in the background."""
    run = await storage.get_agent_run(run_id)
    if not run:
        return

    initial_state = {
        "run_id": run_id,
        "lead": lead,
        "search_results": [],
        "errors": [],
        "is_demo_mode": settings.DEMO_MODE,
        "current_node": "input_lead",
        "status": "running"
    }

    try:
        # Run graph through LangGraph
        final_state = await agenticflow_app.ainvoke(initial_state)

        # Update run & lead with outputs
        if final_state.get("verification"):
            await storage.save_verification(final_state["verification"])
            lead.verification_status = final_state["verification"].verification_status

        if final_state.get("score"):
            lead.latest_score = final_state["score"]

        if final_state.get("proposal"):
            prop = final_state["proposal"]
            prop.lead_id = lead.id
            await storage.save_proposal(prop)
            lead.active_proposal_id = prop.id

        lead.status = "human_review"
        lead.updated_at = datetime.utcnow().isoformat()
        await storage.save_lead(lead)

        run.status = "human_review_required"
        run.completed_at = datetime.utcnow().isoformat()
        await storage.save_agent_run(run)

        await storage.log_activity(ActivityEvent(
            id=f"evt-{int(datetime.utcnow().timestamp() * 1000)}",
            lead_id=lead.id,
            lead_name=lead.company_name,
            run_id=run_id,
            event_type="proposal_generated",
            message=f"Autonomous pipeline complete for {lead.company_name}. Awaiting Human Review.",
            level="warning"
        ))
    except Exception as e:
        run.status = "failed"
        run.error = str(e)
        await storage.save_agent_run(run)

@router.post("/api/v1/leads/{lead_id}/run", status_code=202)
async def run_lead_agent(lead_id: str, background_tasks: BackgroundTasks):
    lead = await storage.get_lead(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    run_id = f"run-{int(datetime.utcnow().timestamp() * 1000)}"
    lead.status = "researching"
    lead.latest_run_id = run_id
    lead.updated_at = datetime.utcnow().isoformat()
    await storage.save_lead(lead)

    # Initial AgentRun tracking
    agent_run = AgentRun(
        id=run_id,
        lead_id=lead.id,
        company_name=lead.company_name,
        status="running",
        current_node="input_lead",
        started_at=datetime.utcnow().isoformat(),
        nodes=[
            AgentNode(id=f"{run_id}-1", node_name="input_lead", display_name="Lead Input", status="RUNNING", tool_used="SchemaValidator", summary="Validating input..."),
            AgentNode(id=f"{run_id}-2", node_name="search_company", display_name="Company Search", status="PENDING", tool_used="SearchProvider", summary="Pending..."),
            AgentNode(id=f"{run_id}-3", node_name="verify_domain", display_name="Domain Verification", status="PENDING", tool_used="DomainVerifier", summary="Pending..."),
            AgentNode(id=f"{run_id}-4", node_name="verify_registry", display_name="Registry Verification", status="PENDING", tool_used="RegistryProvider", summary="Pending..."),
            AgentNode(id=f"{run_id}-5", node_name="normalize_data", display_name="Data Normalization", status="PENDING", tool_used="EntityHarmonizer", summary="Pending..."),
            AgentNode(id=f"{run_id}-6", node_name="score_lead", display_name="Quality Scoring", status="PENDING", tool_used="WeightedScoringEngine", summary="Pending..."),
            AgentNode(id=f"{run_id}-7", node_name="generate_proposal", display_name="Proposal Generation", status="PENDING", tool_used="LLMProvider", summary="Pending..."),
            AgentNode(id=f"{run_id}-8", node_name="human_review", display_name="Human Review", status="PENDING", tool_used="HumanInTheLoopGuard", summary="Pending...")
        ],
        operational_trace=[
            TraceEvent(
                timestamp=datetime.utcnow().strftime("%H:%M:%S"),
                node="input_lead",
                event="INIT_STATE",
                level="INFO",
                detail=f"LangGraph StateGraph initialized for {lead.company_name}"
            )
        ]
    )
    await storage.save_agent_run(agent_run)

    # Launch background LangGraph invocation
    background_tasks.add_task(execute_langgraph_pipeline, lead, run_id)

    return {"run_id": run_id, "status": "started"}

@router.get("/api/v1/agent-runs/{run_id}")
async def get_agent_run(run_id: str):
    run = await storage.get_agent_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Agent run not found")
    return run

@router.get("/api/v1/leads/{lead_id}/proposal")
async def get_proposal(lead_id: str):
    proposal = await storage.get_proposal(lead_id)
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return proposal

@router.put("/api/v1/leads/{lead_id}/proposal")
async def update_proposal(lead_id: str, updates: dict):
    lead = await storage.get_lead(lead_id)
    existing = await storage.get_proposal(lead_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Proposal not found")

    updated_data = existing.model_dump()
    updated_data.update(updates)
    updated_data["updated_at"] = datetime.utcnow().isoformat()
    updated_prop = Proposal(**updated_data)
    await storage.save_proposal(updated_prop)

    if lead and updates.get("status"):
        if updates["status"] == "approved":
            lead.status = "approved"
        elif updates["status"] == "rejected":
            lead.status = "rejected"
        lead.updated_at = datetime.utcnow().isoformat()
        await storage.save_lead(lead)

    return updated_prop

@router.get("/api/v1/activity")
async def get_activity_events(limit: int = Query(50, ge=1, le=100)):
    events = await storage.get_activity(limit=limit)
    return {"count": len(events), "events": events}

@router.get("/api/v1/analytics")
async def get_analytics():
    leads = await storage.get_leads()
    total = len(leads)
    verified = sum(1 for l in leads if l.verification_status == "verified")
    scored = [l for l in leads if l.latest_score]
    avg_score = int(sum(l.latest_score.total_score for l in scored) / len(scored)) if scored else 0
    qualified = sum(1 for l in scored if l.latest_score.qualification in ("hot", "warm"))
    
    return {
        "total_leads": total,
        "qualified_leads": qualified,
        "verification_rate": int((verified / total) * 100) if total else 0,
        "avg_lead_score": avg_score,
        "proposals_generated": 3,
        "agent_runs": 8,
        "successful_runs": 7,
        "failed_runs": 1
    }
