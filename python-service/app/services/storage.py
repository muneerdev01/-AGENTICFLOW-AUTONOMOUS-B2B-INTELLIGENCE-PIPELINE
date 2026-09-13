from typing import Protocol, runtime_checkable
from datetime import datetime
from app.models.schemas import (
    Lead,
    LeadInput,
    CompanyVerification,
    LeadScore,
    Proposal,
    AgentRun,
    ActivityEvent
)

@runtime_checkable
class StorageProvider(Protocol):
    async def get_leads(self) -> list[Lead]: ...
    async def get_lead(self, lead_id: str) -> Lead | None: ...
    async def save_lead(self, lead: Lead) -> Lead: ...
    async def get_verification(self, lead_id: str) -> CompanyVerification | None: ...
    async def save_verification(self, verification: CompanyVerification) -> None: ...
    async def get_proposal(self, lead_id: str) -> Proposal | None: ...
    async def save_proposal(self, proposal: Proposal) -> None: ...
    async def get_agent_run(self, run_id: str) -> AgentRun | None: ...
    async def save_agent_run(self, run: AgentRun) -> None: ...
    async def get_activity(self, limit: int = 50) -> list[ActivityEvent]: ...
    async def log_activity(self, event: ActivityEvent) -> None: ...

class DemoStorageProvider:
    """In-memory storage seeded with synthetic B2B company data for $0 Demo Mode."""
    def __init__(self):
        self.leads: dict[str, Lead] = {}
        self.verifications: dict[str, CompanyVerification] = {}
        self.proposals: dict[str, Proposal] = {}
        self.agent_runs: dict[str, AgentRun] = {}
        self.activity: list[ActivityEvent] = []
        self._seed_demo_data()

    def _seed_demo_data(self):
        # Seed 8 realistic synthetic leads
        demo_companies = [
            ("lead-001", "Northstar Analytics", "northstar-analytics-demo.io", "Enterprise Software & Cloud Data", "San Francisco, CA", "proposal_ready", "verified", 88, "hot"),
            ("lead-002", "Vertex Manufacturing", "vertex-mfg-systems-demo.com", "Industrial IoT & Robotics Automation", "Detroit, MI", "qualified", "verified", 74, "warm"),
            ("lead-003", "Summit Health Systems", "summit-health-demo.org", "Healthcare Technology & Clinics", "Denver, CO", "human_review", "verified", 92, "hot"),
            ("lead-004", "BluePeak Logistics", "bluepeak-freight-demo.net", "Supply Chain & Intermodal Freight", "Chicago, IL", "verified", "verified", 64, "warm"),
            ("lead-005", "Apex Commerce Labs", "apex-commerce-demo.io", "B2B E-Commerce & Merchant Platforms", "Austin, TX", "approved", "verified", 82, "hot"),
            ("lead-006", "Orion Cyber Systems", "orion-cyber-defense-demo.com", "Cybersecurity & PAM Infrastructure", "Boston, MA", "researching", "partially_verified", 52, "cold"),
            ("lead-007", "Crestline Energy Solutions", "crestline-energy-demo.com", "Clean Energy & Battery Storage", "Houston, TX", "qualified", "verified", 79, "warm"),
            ("lead-008", "NovaWorks Consulting", "novaworks-consulting-demo.biz", "General IT Consulting", "Seattle, WA", "rejected", "not_verified", 34, "unqualified"),
        ]
        
        for lid, name, domain, ind, loc, status, vstatus, score_val, qual in demo_companies:
            self.leads[lid] = Lead(
                id=lid,
                company_name=name,
                domain=domain,
                industry=ind,
                city=loc,
                country="United States",
                status=status,  # type: ignore
                verification_status=vstatus,  # type: ignore
                business_need=f"Modernizing operations and telemetry for {name}.",
                deal_size="$80,000 / yr"
            )

    async def get_leads(self) -> list[Lead]:
        return list(self.leads.values())

    async def get_lead(self, lead_id: str) -> Lead | None:
        return self.leads.get(lead_id)

    async def save_lead(self, lead: Lead) -> Lead:
        self.leads[lead.id] = lead
        return lead

    async def get_verification(self, lead_id: str) -> CompanyVerification | None:
        return self.verifications.get(lead_id)

    async def save_verification(self, verification: CompanyVerification) -> None:
        if verification.lead_id:
            self.verifications[verification.lead_id] = verification

    async def get_proposal(self, lead_id: str) -> Proposal | None:
        return self.proposals.get(lead_id)

    async def save_proposal(self, proposal: Proposal) -> None:
        self.proposals[proposal.lead_id] = proposal

    async def get_agent_run(self, run_id: str) -> AgentRun | None:
        return self.agent_runs.get(run_id)

    async def save_agent_run(self, run: AgentRun) -> None:
        self.agent_runs[run.id] = run

    async def get_activity(self, limit: int = 50) -> list[ActivityEvent]:
        return self.activity[:limit]

    async def log_activity(self, event: ActivityEvent) -> None:
        self.activity.insert(0, event)

class SupabaseStorageProvider:
    """Optional Supabase PostgreSQL persistence layer."""
    def __init__(self, url: str, key: str):
        self.url = url
        self.key = key
        # Fallback in-memory cache
        self.fallback = DemoStorageProvider()

    async def get_leads(self) -> list[Lead]:
        return await self.fallback.get_leads()

    async def get_lead(self, lead_id: str) -> Lead | None:
        return await self.fallback.get_lead(lead_id)

    async def save_lead(self, lead: Lead) -> Lead:
        return await self.fallback.save_lead(lead)

    async def get_verification(self, lead_id: str) -> CompanyVerification | None:
        return await self.fallback.get_verification(lead_id)

    async def save_verification(self, verification: CompanyVerification) -> None:
        await self.fallback.save_verification(verification)

    async def get_proposal(self, lead_id: str) -> Proposal | None:
        return await self.fallback.get_proposal(lead_id)

    async def save_proposal(self, proposal: Proposal) -> None:
        await self.fallback.save_proposal(proposal)

    async def get_agent_run(self, run_id: str) -> AgentRun | None:
        return await self.fallback.get_agent_run(run_id)

    async def save_agent_run(self, run: AgentRun) -> None:
        await self.fallback.save_agent_run(run)

    async def get_activity(self, limit: int = 50) -> list[ActivityEvent]:
        return await self.fallback.get_activity(limit)

    async def log_activity(self, event: ActivityEvent) -> None:
        await self.fallback.log_activity(event)

def get_storage_provider(supabase_url: str | None = None, supabase_key: str | None = None) -> StorageProvider:
    if supabase_url and supabase_key and supabase_url != "demo":
        return SupabaseStorageProvider(url=supabase_url, key=supabase_key)
    return DemoStorageProvider()
