from datetime import datetime
from app.graph.state import AgentState
from app.models.schemas import LeadScore, ScoreBreakdown

async def score_lead_node(state: AgentState) -> AgentState:
    """
    Node: score_lead
    Executes a transparent, deterministic 0-100 scoring algorithm.
    Weights:
      Company Fit: 25
      Market Fit: 20
      Business Need: 20
      Credibility: 20
      Engagement Potential: 15
    """
    lead = state["lead"]
    ver = state.get("verification")
    
    # 1. Company Fit (Max 25)
    company_fit = 15
    size = (lead.company_size or "").lower()
    rev = (lead.revenue_range or "").lower()
    if "1000" in size or "5000" in size or "200m" in rev or "100m" in rev:
        company_fit = 24
    elif "250" in size or "500" in size or "50m" in rev or "40m" in rev:
        company_fit = 22
    elif "50" in size or "100" in size or "15m" in rev or "25m" in rev:
        company_fit = 19
    elif "1-10" in size or "<$1m" in rev:
        company_fit = 8

    # 2. Market Fit (Max 20)
    market_fit = 14
    ind = (lead.industry or "").lower()
    if any(k in ind for k in ["software", "data", "health", "robotics", "cyber", "energy", "logistics"]):
        market_fit = 18
    elif "consulting" in ind or "general" in ind:
        market_fit = 10

    # 3. Business Need (Max 20)
    need_score = 14
    if lead.business_need and len(lead.business_need) > 40:
        need_score = 18
    elif not lead.business_need:
        need_score = 6

    # 4. Credibility (Max 20)
    credibility = 12
    if ver:
        if ver.domain_valid and ver.verification_status == "verified":
            credibility = 18
        elif ver.verification_status == "partially_verified":
            credibility = 11
        elif ver.domain_status in ("UNREACHABLE", "INVALID"):
            credibility = 5

    # 5. Engagement Potential (Max 15)
    engagement = 10
    if lead.contact_name and lead.contact_title:
        title = lead.contact_title.lower()
        if any(t in title for t in ["vp", "director", "chief", "cio", "cto", "head"]):
            engagement = 13
        else:
            engagement = 10
    if lead.deal_size and "$100" in lead.deal_size:
        engagement = min(15, engagement + 2)

    total = company_fit + market_fit + need_score + credibility + engagement

    # Classification
    if total >= 80:
        qual = "hot"
    elif total >= 60:
        qual = "warm"
    elif total >= 40:
        qual = "cold"
    else:
        qual = "unqualified"

    reasons = [
        f"Assigned Company Fit ({company_fit}/25) based on employee size and revenue bracket.",
        f"Assigned Market Fit ({market_fit}/20) for operating sector: {lead.industry or 'General'}.",
        f"Assigned Business Need ({need_score}/20) based on articulated requirements.",
        f"Assigned Credibility ({credibility}/20) based on domain/registry verification status."
    ]

    positive_signals = []
    if ver and ver.domain_valid:
        positive_signals.append("Domain verified active with HTTPS and valid certificate.")
    if company_fit >= 20:
        positive_signals.append("Headcount and budget alignment meet target enterprise criteria.")
    if engagement >= 12:
        positive_signals.append("Executive champion identified with purchasing authority.")

    risk_signals = []
    if not ver or not ver.domain_valid:
        risk_signals.append("Domain unreachable or verification was incomplete.")
    if company_fit < 12:
        risk_signals.append("Deal size or company scale below minimum target economics.")

    score = LeadScore(
        total_score=total,
        breakdown=ScoreBreakdown(
            company_fit=company_fit,
            market_fit=market_fit,
            business_need=need_score,
            credibility=credibility,
            engagement_potential=engagement
        ),
        qualification=qual,
        reasons=reasons,
        positive_signals=positive_signals,
        risk_signals=risk_signals,
        scored_at=datetime.utcnow().isoformat()
    )

    state["score"] = score
    state["current_node"] = "score_lead"
    return state
