-- AgenticFlow: Autonomous B2B Intelligence Database Schema
-- Migration: 20260913000001_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. LEADS TABLE
CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY DEFAULT ('lead-' || uuid_generate_v4()),
    company_name TEXT NOT NULL,
    domain TEXT,
    industry TEXT,
    country TEXT DEFAULT 'United States',
    city TEXT,
    company_size TEXT,
    revenue_range TEXT,
    contact_name TEXT,
    contact_title TEXT,
    email TEXT,
    linkedin_url TEXT,
    product_service TEXT,
    deal_size TEXT,
    business_need TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'researching', 'verified', 'qualified', 'proposal_ready', 'human_review', 'approved', 'rejected')),
    verification_status TEXT NOT NULL DEFAULT 'unable_to_verify' CHECK (verification_status IN ('verified', 'partially_verified', 'not_verified', 'unable_to_verify')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_company_name ON leads (company_name);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at DESC);

-- 2. VERIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS verifications (
    id TEXT PRIMARY KEY DEFAULT ('ver-' || uuid_generate_v4()),
    lead_id TEXT NOT NULL REFERENCES leads (id) ON DELETE CASCADE,
    verification_type TEXT NOT NULL DEFAULT 'autonomous_pipeline',
    status TEXT NOT NULL CHECK (status IN ('verified', 'partially_verified', 'not_verified', 'unable_to_verify')),
    confidence INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
    domain_status TEXT,
    registry_status TEXT,
    source TEXT,
    evidence JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verifications_lead_id ON verifications (lead_id);

-- 3. AGENT RUNS TABLE
CREATE TABLE IF NOT EXISTS agent_runs (
    id TEXT PRIMARY KEY DEFAULT ('run-' || uuid_generate_v4()),
    lead_id TEXT NOT NULL REFERENCES leads (id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'started' CHECK (status IN ('started', 'running', 'completed', 'failed', 'human_review_required')),
    current_node TEXT NOT NULL DEFAULT 'input_lead',
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,
    error TEXT,
    operational_trace JSONB DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_agent_runs_lead_id ON agent_runs (lead_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_started_at ON agent_runs (started_at DESC);

-- 4. AGENT RUN NODES TABLE
CREATE TABLE IF NOT EXISTS agent_run_nodes (
    id TEXT PRIMARY KEY DEFAULT ('node-' || uuid_generate_v4()),
    run_id TEXT NOT NULL REFERENCES agent_runs (id) ON DELETE CASCADE,
    node_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'SKIPPED')),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,
    tool_used TEXT,
    summary TEXT,
    input_summary TEXT,
    output_summary TEXT,
    error TEXT
);

CREATE INDEX IF NOT EXISTS idx_agent_run_nodes_run_id ON agent_run_nodes (run_id);

-- 5. LEAD SCORES TABLE
CREATE TABLE IF NOT EXISTS lead_scores (
    id TEXT PRIMARY KEY DEFAULT ('score-' || uuid_generate_v4()),
    lead_id TEXT NOT NULL REFERENCES leads (id) ON DELETE CASCADE,
    total_score INTEGER NOT NULL CHECK (total_score >= 0 AND total_score <= 100),
    company_fit INTEGER NOT NULL CHECK (company_fit >= 0 AND company_fit <= 25),
    market_fit INTEGER NOT NULL CHECK (market_fit >= 0 AND market_fit <= 20),
    business_need INTEGER NOT NULL CHECK (business_need >= 0 AND business_need <= 20),
    credibility INTEGER NOT NULL CHECK (credibility >= 0 AND credibility <= 20),
    engagement_potential INTEGER NOT NULL CHECK (engagement_potential >= 0 AND engagement_potential <= 15),
    qualification TEXT NOT NULL CHECK (qualification IN ('hot', 'warm', 'cold', 'unqualified')),
    reasons JSONB DEFAULT '[]'::jsonb,
    positive_signals JSONB DEFAULT '[]'::jsonb,
    risk_signals JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_scores_lead_id ON lead_scores (lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_scores_qualification ON lead_scores (qualification);

-- 6. PROPOSALS TABLE
CREATE TABLE IF NOT EXISTS proposals (
    id TEXT PRIMARY KEY DEFAULT ('prop-' || uuid_generate_v4()),
    lead_id TEXT NOT NULL REFERENCES leads (id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    executive_summary TEXT NOT NULL,
    client_needs JSONB DEFAULT '[]'::jsonb,
    proposed_solution TEXT NOT NULL,
    business_value JSONB DEFAULT '[]'::jsonb,
    recommended_next_steps JSONB DEFAULT '[]'::jsonb,
    engagement_approach TEXT,
    personalization_notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('draft', 'pending_review', 'approved', 'rejected')),
    human_reviewed_by TEXT,
    review_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proposals_lead_id ON proposals (lead_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals (status);

-- 7. ACTIVITY EVENTS TABLE
CREATE TABLE IF NOT EXISTS activity_events (
    id TEXT PRIMARY KEY DEFAULT ('evt-' || uuid_generate_v4()),
    lead_id TEXT REFERENCES leads (id) ON DELETE SET NULL,
    run_id TEXT REFERENCES agent_runs (id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    message TEXT NOT NULL,
    level TEXT NOT NULL DEFAULT 'info' CHECK (level IN ('info', 'success', 'warning', 'error')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_events_created_at ON activity_events (created_at DESC);

-- 8. SOURCES TABLE
CREATE TABLE IF NOT EXISTS sources (
    id TEXT PRIMARY KEY DEFAULT ('src-' || uuid_generate_v4()),
    lead_id TEXT REFERENCES leads (id) ON DELETE CASCADE,
    run_id TEXT REFERENCES agent_runs (id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    source_type TEXT NOT NULL,
    trust_level TEXT NOT NULL CHECK (trust_level IN ('HIGH', 'MEDIUM', 'LOW', 'DEMO')),
    snippet TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sources_lead_id ON sources (lead_id);

-- Row Level Security (RLS) Configuration
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_run_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;

-- Allow authenticated and anon read access in development/demo environments
CREATE POLICY "Public read leads" ON leads FOR SELECT USING (true);
CREATE POLICY "Public insert leads" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update leads" ON leads FOR UPDATE USING (true);

CREATE POLICY "Public read verifications" ON verifications FOR SELECT USING (true);
CREATE POLICY "Public read proposals" ON proposals FOR SELECT USING (true);
CREATE POLICY "Public update proposals" ON proposals FOR UPDATE USING (true);
CREATE POLICY "Public read agent_runs" ON agent_runs FOR SELECT USING (true);
CREATE POLICY "Public read lead_scores" ON lead_scores FOR SELECT USING (true);
CREATE POLICY "Public read activity_events" ON activity_events FOR SELECT USING (true);
