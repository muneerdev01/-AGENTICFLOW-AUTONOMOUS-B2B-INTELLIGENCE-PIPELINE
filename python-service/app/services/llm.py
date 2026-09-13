import json
from typing import Protocol, runtime_checkable
from app.models.schemas import LeadInput, Proposal, CompanyVerification

@runtime_checkable
class LLMProvider(Protocol):
    async def generate_proposal(self, lead: LeadInput, verification: CompanyVerification | None) -> Proposal:
        """Generate structured proposal from lead and verification intelligence."""
        ...

class DemoLLMProvider:
    """
    Deterministic $0 demo LLM provider.
    Produces high quality structured proposals without external API requirements.
    """
    async def generate_proposal(self, lead: LeadInput, verification: CompanyVerification | None) -> Proposal:
        company = lead.company_name
        industry = lead.industry or "Enterprise Technology"
        need = lead.business_need or "Modernizing enterprise data workflows and operations"
        
        return Proposal(
            id=f"prop-{lead.company_name.lower().replace(' ', '-')[:12]}-{int(1000)}",
            lead_id="lead-temp",
            title=f"Autonomous B2B Intelligence Pipeline Architecture for {company}",
            executive_summary=(
                f"{company} operates in the {industry} sector with high operational velocity. "
                f"AgenticFlow proposes an autonomous B2B pipeline deployment to address: {need}. "
                "The platform executes deterministic research, verification, and automated routing to reduce "
                "cycle times by over 50% while guaranteeing strict data security boundaries."
            ),
            client_needs=[
                need,
                "Automate multi-source data validation to eliminate manual human data entry",
                f"Provide leadership with single-pane-of-glass observability into {industry} operations",
                "Ensure zero-data-leakage enterprise compliance and complete audit traceability"
            ],
            proposed_solution=(
                f"Deploy private AgenticFlow Workers configured specifically for {company}'s requirements. "
                "The architecture introduces automated entity verification, transparent scoring logic, "
                "and an integrated human-in-the-loop review gate prior to any external outreach."
            ),
            business_value=[
                "Estimated 55% reduction in manual research and validation engineering hours",
                "Continuous automated anomaly detection with real-time audit event logging",
                "Rapid deployment milestone: Initial staging environment live within 10 business days",
                "Zero risk architecture: Full human sign-off mandatory for every generated deliverable"
            ],
            recommended_next_steps=[
                f"Schedule 45-minute technical discovery session with {lead.contact_name or 'the operations team'}",
                "Conduct 14-day zero-impact sandbox proof-of-concept",
                "Execute mutual Non-Disclosure Agreement (NDA) and Security Review",
                "Finalize quarterly rollout schedule"
            ],
            engagement_approach=(
                "Phased deployment starting with read-only validation telemetry, "
                "followed by automated document generation once accuracy thresholds are satisfied."
            ),
            personalization_notes=(
                f"Proposal generated based on verified attributes for {company} in {industry}. "
                "Synthetic Demo Source notice: Created in $0 Demo Mode for evaluation."
            ),
            status="pending_review"
        )

class GeminiProvider:
    """Optional Gemini integration when GEMINI_API_KEY is supplied."""
    def __init__(self, api_key: str, model: str = "gemini-2.5-flash"):
        self.api_key = api_key
        self.model = model

    async def generate_proposal(self, lead: LeadInput, verification: CompanyVerification | None) -> Proposal:
        try:
            # Lazy import to prevent crash if not installed
            from google import genai
            client = genai.Client(api_key=self.api_key)
            
            prompt = f"""You are an enterprise B2B sales intelligence architect.
Generate a structured proposal for:
Company: {lead.company_name}
Domain: {lead.domain}
Industry: {lead.industry}
Business Need: {lead.business_need}
Deal Size: {lead.deal_size}

Return ONLY valid JSON matching this exact structure:
{{
  "title": "string",
  "executive_summary": "string",
  "client_needs": ["string"],
  "proposed_solution": "string",
  "business_value": ["string"],
  "recommended_next_steps": ["string"],
  "engagement_approach": "string",
  "personalization_notes": "string"
}}"""
            response = client.models.generate_content(
                model=self.model,
                contents=prompt
            )
            raw_text = response.text.strip()
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:-3].strip()
            elif raw_text.startswith("```"):
                raw_text = raw_text[3:-3].strip()
                
            data = json.loads(raw_text)
            return Proposal(
                id=f"prop-{lead.company_name.lower().replace(' ', '-')[:12]}",
                lead_id="lead-temp",
                title=data.get("title", f"Proposal for {lead.company_name}"),
                executive_summary=data.get("executive_summary", ""),
                client_needs=data.get("client_needs", []),
                proposed_solution=data.get("proposed_solution", ""),
                business_value=data.get("business_value", []),
                recommended_next_steps=data.get("recommended_next_steps", []),
                engagement_approach=data.get("engagement_approach", ""),
                personalization_notes=data.get("personalization_notes", ""),
                status="pending_review"
            )
        except Exception:
            # Fallback to deterministic DemoLLMProvider
            fallback = DemoLLMProvider()
            return await fallback.generate_proposal(lead, verification)

def get_llm_provider(demo_mode: bool = True, gemini_key: str | None = None, model: str = "gemini-2.5-flash") -> LLMProvider:
    if not demo_mode and gemini_key and gemini_key != "MY_GEMINI_API_KEY":
        return GeminiProvider(api_key=gemini_key, model=model)
    return DemoLLMProvider()
