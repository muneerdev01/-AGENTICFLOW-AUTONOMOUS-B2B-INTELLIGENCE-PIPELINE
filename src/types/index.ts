export type LeadQualification = 'hot' | 'warm' | 'cold' | 'unqualified';
export type VerificationStatus = 'verified' | 'partially_verified' | 'not_verified' | 'unable_to_verify';
export type DomainStatus = 'VALID' | 'INVALID' | 'UNREACHABLE' | 'REDIRECTED' | 'UNKNOWN';
export type SourceTrustLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'DEMO';
export type NodeStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
export type ProposalStatus = 'draft' | 'pending_review' | 'approved' | 'rejected';
export type LeadStatus = 'new' | 'researching' | 'verified' | 'qualified' | 'proposal_ready' | 'human_review' | 'approved' | 'rejected';

export interface SourceCitation {
  id?: string;
  title: string;
  url: string;
  snippet: string;
  source: string;
  source_type: 'official' | 'registry' | 'news' | 'directory' | 'social' | 'demo';
  trust_level: SourceTrustLevel;
  retrieved_at: string;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  source_type: string;
  trust_level: SourceTrustLevel;
  retrieved_at: string;
}

export interface DomainCheckResult {
  domain: string;
  status: DomainStatus;
  syntax_valid: boolean;
  https_available: boolean;
  http_status: number;
  final_url?: string;
  redirect_count: number;
  page_title?: string;
  response_time_ms: number;
  server_header?: string;
  ssrf_passed: boolean;
  notes: string;
}

export interface RegistryCheckResult {
  country: string;
  registry_name: string;
  registry_type: string;
  status: 'verified' | 'partially_verified' | 'unable_to_verify' | 'not_found';
  legal_name?: string;
  jurisdiction?: string;
  evidence: string;
  trust_level: SourceTrustLevel;
  source_url?: string;
  notes: string;
}

export interface CompanyVerification {
  id?: string;
  lead_id?: string;
  company_name: string;
  domain: string;
  company_exists: boolean;
  domain_valid: boolean;
  domain_status: DomainStatus;
  industry: string;
  location: string;
  confidence: number; // 0 - 100
  verification_status: VerificationStatus;
  domain_check?: DomainCheckResult;
  registry_check?: RegistryCheckResult;
  public_info_status: string;
  sources: SourceCitation[];
  evidence: string[];
  notes: string;
  timestamp: string;
}

export interface NormalizedCompany {
  legal_name: string;
  tradestyle?: string;
  primary_domain: string;
  clean_industry: string;
  naics_code?: string;
  naics_description?: string;
  headquarters: string;
  employee_range: string;
  estimated_annual_revenue?: string;
  tech_stack: string[];
  key_decision_makers: Array<{ name: string; title: string }>;
  verified_summary: string;
}

export interface ScoreBreakdown {
  company_fit: number; // Max 25
  market_fit: number; // Max 20
  business_need: number; // Max 20
  credibility: number; // Max 20
  engagement_potential: number; // Max 15
}

export interface LeadScore {
  id?: string;
  lead_id?: string;
  total_score: number; // 0 - 100
  breakdown: ScoreBreakdown;
  qualification: LeadQualification;
  reasons: string[];
  positive_signals: string[];
  risk_signals: string[];
  scored_at: string;
}

export interface Proposal {
  id: string;
  lead_id: string;
  title: string;
  executive_summary: string;
  client_needs: string[];
  proposed_solution: string;
  business_value: string[];
  recommended_next_steps: string[];
  engagement_approach: string;
  personalization_notes: string;
  status: ProposalStatus;
  human_reviewed_by?: string;
  review_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AgentNode {
  id: string;
  node_name: 'input_lead' | 'search_company' | 'verify_domain' | 'verify_registry' | 'normalize_data' | 'score_lead' | 'generate_proposal' | 'human_review';
  display_name: string;
  status: NodeStatus;
  started_at?: string;
  completed_at?: string;
  duration_ms?: number;
  tool_used: string;
  summary: string;
  input_summary?: string;
  output_summary?: string;
  error?: string;
}

export interface AgentRun {
  id: string;
  lead_id: string;
  company_name: string;
  status: 'started' | 'running' | 'completed' | 'failed' | 'human_review_required';
  current_node: string;
  nodes: AgentNode[];
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
  error?: string;
  operational_trace: Array<{
    timestamp: string;
    node: string;
    event: string;
    level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
    detail: string;
  }>;
}

export interface LeadInput {
  company_name: string;
  domain?: string;
  industry?: string;
  country?: string;
  city?: string;
  company_size?: string;
  revenue_range?: string;
  contact_name?: string;
  contact_title?: string;
  email?: string;
  linkedin_url?: string;
  product_service?: string;
  deal_size?: string;
  business_need?: string;
  notes?: string;
}

export interface Lead extends LeadInput {
  id: string;
  status: LeadStatus;
  verification_status: VerificationStatus;
  latest_score?: LeadScore;
  latest_run_id?: string;
  active_proposal_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityEvent {
  id: string;
  lead_id?: string;
  lead_name?: string;
  run_id?: string;
  event_type: 'lead_created' | 'agent_started' | 'verification_completed' | 'score_computed' | 'proposal_generated' | 'human_approved' | 'human_rejected' | 'proposal_edited';
  message: string;
  level: 'info' | 'success' | 'warning' | 'error';
  metadata?: Record<string, any>;
  created_at: string;
}

export interface AppSettings {
  demo_mode: boolean;
  search_provider: 'demo' | 'duckduckgo' | 'tavily';
  llm_provider: 'demo' | 'gemini';
  supabase_enabled: boolean;
  ssrf_protection_active: boolean;
  gemini_api_key_configured: boolean;
  tavily_api_key_configured: boolean;
  supabase_configured: boolean;
}

export interface AnalyticsSummary {
  total_leads: number;
  qualified_leads: number;
  verification_rate: number;
  avg_lead_score: number;
  proposals_generated: number;
  agent_runs: number;
  successful_runs: number;
  failed_runs: number;
  status_distribution: Record<string, number>;
  score_distribution: {
    hot: number;
    warm: number;
    cold: number;
    unqualified: number;
  };
}

export type DashboardMetrics = AnalyticsSummary;
export type PipelineAnalytics = AnalyticsSummary;
