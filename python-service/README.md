# AgenticFlow Python Backend Service
Autonomous B2B Intelligence Pipeline powered by FastAPI, LangGraph, and Pydantic v2.

## Overview
This service powers the autonomous multi-step research, verification, scoring, and proposal generation workflow for AgenticFlow.

```
START
  ↓
input_lead (Pydantic validation)
  ↓
search_company (SearchProvider abstraction with fallback)
  ↓
verify_domain (SSRF-aware HTTP & TLS probe)
  ↓
verify_registry (Corporate filing registry abstraction)
  ↓
[Conditional Routing]
  ├─ Valid ──────────────> normalize_data (Entity harmonization)
  └─ Unreachable / Invalid > score_lead (Penalized)
  ↓
score_lead (Transparent 0-100 score: Company Fit, Market Fit, Need, Credibility, Engagement)
  ↓
[Conditional Routing]
  ├─ Qualified ──────────> generate_proposal (7-section structured B2B proposal)
  └─ Unqualified (<40) ──> human_review
  ↓
human_review (Mandatory human-in-the-loop gate before outreach)
  ↓
END
```

## Local Setup

1. Create a Python virtual environment:
```bash
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run FastAPI development server:
```bash
uvicorn app.main:app --reload --port 8000
```

4. Run tests:
```bash
pytest tests/
```

## Render Deployment

This service includes a production Dockerfile configured for Render:
- **Build Command**: `docker build`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Health Check Path**: `/health`

## Environment Variables
- `DEMO_MODE=true`: Run in $0 Demo Mode with synthetic providers.
- `SEARCH_PROVIDER=demo`: Options: `demo`, `duckduckgo`, `tavily`.
- `LLM_PROVIDER=demo`: Options: `demo`, `gemini`.
- `GEMINI_API_KEY`: Optional Gemini AI API key.
- `TAVILY_API_KEY`: Optional Tavily search key.
- `SUPABASE_URL`: Optional Supabase PostgreSQL endpoint.
- `SUPABASE_SERVICE_ROLE_KEY`: Optional Supabase secret key.
