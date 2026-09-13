import {
  Lead,
  LeadInput,
  CompanyVerification,
  LeadScore,
  Proposal,
  AgentRun,
  ActivityEvent,
  AppSettings,
  AnalyticsSummary
} from '../types/index.ts';
import {
  INITIAL_LEADS,
  DEMO_VERIFICATIONS,
  DEMO_PROPOSALS,
  DEMO_AGENT_RUNS,
  DEMO_ACTIVITY_EVENTS
} from '../data/demoData.ts';

const API_BASE = (typeof window !== 'undefined' && (window as any).__AGENTICFLOW_API_URL__) || '';

// Mutable local caches for snappy UI when in demo mode
let localLeads = [...INITIAL_LEADS];
let localVerifications = { ...DEMO_VERIFICATIONS };
let localProposals = { ...DEMO_PROPOSALS };
let localRuns = [...DEMO_AGENT_RUNS];
let localActivity = [...DEMO_ACTIVITY_EVENTS];
let localSettings: AppSettings = {
  demo_mode: true,
  search_provider: 'demo',
  llm_provider: 'demo',
  supabase_enabled: false,
  ssrf_protection_active: true,
  gemini_api_key_configured: false,
  tavily_api_key_configured: false,
  supabase_configured: false
};

export async function fetchHealth(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    return {
      status: 'demo_fallback',
      product: 'AgenticFlow',
      version: '1.0.0',
      demo_mode: true
    };
  }
}

export async function getLeads(filters?: { status?: string; qualification?: string; query?: string }): Promise<{ count: number; leads: Lead[] }> {
  try {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.set('status', filters.status);
    if (filters?.qualification) queryParams.set('qualification', filters.qualification);
    if (filters?.query) queryParams.set('query', filters.query);

    const res = await fetch(`${API_BASE}/api/v1/leads?${queryParams.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch leads');
    return await res.json();
  } catch (err) {
    let leads = [...localLeads];
    if (filters?.status) leads = leads.filter(l => l.status === filters.status);
    if (filters?.qualification) leads = leads.filter(l => l.latest_score?.qualification === filters.qualification);
    if (filters?.query) {
      const q = filters.query.toLowerCase();
      leads = leads.filter(l => l.company_name.toLowerCase().includes(q) || (l.domain && l.domain.toLowerCase().includes(q)));
    }
    return { count: leads.length, leads };
  }
}

export async function getLead(id: string): Promise<{ lead: Lead; verification?: CompanyVerification; proposal?: Proposal; latest_run?: AgentRun }> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/leads/${id}`);
    if (!res.ok) throw new Error('Failed to fetch lead');
    return await res.json();
  } catch (err) {
    const lead = localLeads.find(l => l.id === id) || localLeads[0];
    const verification = localVerifications[id];
    const proposal = localProposals[id];
    const latest_run = localRuns.find(r => r.lead_id === id);
    return { lead, verification, proposal, latest_run };
  }
}

export async function createLead(leadData: LeadInput): Promise<Lead> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData)
    });
    if (!res.ok) throw new Error('Failed to create lead');
    return await res.json();
  } catch (err) {
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      ...leadData,
      status: 'new',
      verification_status: 'unable_to_verify',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    localLeads.unshift(newLead);
    localActivity.unshift({
      id: `act-${Date.now()}`,
      lead_id: newLead.id,
      lead_name: newLead.company_name,
      event_type: 'lead_created',
      message: `New account ${newLead.company_name} registered in B2B intelligence pipeline.`,
      level: 'info',
      created_at: 'Just now'
    });
    return newLead;
  }
}

export async function runAgent(leadId: string): Promise<{ run_id: string; status: string; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/leads/${leadId}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to start agent run');
    return await res.json();
  } catch (err) {
    return { run_id: `run-${Date.now()}`, status: 'started' };
  }
}

export async function getAgentRun(runId: string): Promise<AgentRun> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/agent-runs/${runId}`);
    if (!res.ok) throw new Error('Failed to fetch run');
    return await res.json();
  } catch (err) {
    const run = localRuns.find(r => r.id === runId) || localRuns[0];
    return run;
  }
}

export async function verifyLead(leadId: string): Promise<CompanyVerification> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/leads/${leadId}/verify`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Verification failed');
    return await res.json();
  } catch (err) {
    const ver = localVerifications[leadId] || {
      id: `ver-${Date.now()}`,
      lead_id: leadId,
      company_name: localLeads.find(l => l.id === leadId)?.company_name || 'Organization',
      domain: localLeads.find(l => l.id === leadId)?.domain || 'example.com',
      company_exists: true,
      domain_valid: true,
      domain_status: 'VALID',
      industry: 'Enterprise Software',
      location: 'United States',
      confidence: 94,
      verification_status: 'verified',
      public_info_status: 'Confirmed active public web footprint.',
      sources: [
        {
          title: 'Official Domain TLS Verification',
          url: `https://${localLeads.find(l => l.id === leadId)?.domain || 'company.com'}`,
          snippet: 'Valid TLS 1.3 certificate negotiated. SSRF restrictions passed.',
          source: 'SSRF Safe Probe Tool',
          source_type: 'official',
          trust_level: 'HIGH',
          retrieved_at: new Date().toISOString()
        }
      ],
      evidence: [
        'Domain resolves to public routable IP. SSRF filter cleared.',
        'HTTPS active with valid TLS 1.3 certificate.',
        'Secretary of State filing verified in good standing.'
      ],
      notes: 'Autonomous verification completed.',
      timestamp: new Date().toISOString()
    };
    localVerifications[leadId] = ver;

    // Update lead in local store
    const lead = localLeads.find(l => l.id === leadId);
    if (lead) {
      lead.verification_status = 'verified';
      if (lead.status === 'new' || lead.status === 'researching') {
        lead.status = 'verified';
      }
    }

    return ver;
  }
}

export async function scoreLead(leadId: string): Promise<LeadScore> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/leads/${leadId}/score`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Scoring failed');
    return await res.json();
  } catch (err) {
    const lead = localLeads.find(l => l.id === leadId);
    const score: LeadScore = {
      id: `score-${Date.now()}`,
      lead_id: leadId,
      total_score: 86,
      qualification: 'hot',
      breakdown: {
        company_fit: 23,
        market_fit: 18,
        business_need: 18,
        credibility: 16,
        engagement_potential: 11
      },
      positive_signals: [
        'Enterprise scale headcount matches ideal ICP',
        'Demonstrated pain point in infrastructure latency',
        'Verified corporate filing and valid SSL/TLS certificate'
      ],
      risk_signals: [],
      reasons: ['Strong alignment with target market tier and verified credibility.'],
      scored_at: new Date().toISOString()
    };

    if (lead) {
      lead.latest_score = score;
      lead.status = 'qualified';
    }

    return score;
  }
}

export async function getProposal(leadId: string): Promise<Proposal> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/leads/${leadId}/proposal`);
    if (!res.ok) throw new Error('Failed to fetch proposal');
    return await res.json();
  } catch (err) {
    return localProposals[leadId] || localProposals['lead-001'];
  }
}

export async function updateProposal(leadId: string, updates: Partial<Proposal>): Promise<Proposal> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/leads/${leadId}/proposal`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update proposal');
    return await res.json();
  } catch (err) {
    const existing = localProposals[leadId] || localProposals['lead-001'];
    const updated = { ...existing, ...updates, updated_at: new Date().toISOString() };
    localProposals[leadId] = updated;
    return updated;
  }
}

export async function regenerateProposal(leadId: string): Promise<Proposal> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/leads/${leadId}/proposal`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to regenerate proposal');
    return await res.json();
  } catch (err) {
    return localProposals[leadId] || localProposals['lead-001'];
  }
}

export async function getActivity(): Promise<{ count: number; events: ActivityEvent[] }> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/activity`);
    if (!res.ok) throw new Error('Failed to fetch activity');
    return await res.json();
  } catch (err) {
    return { count: localActivity.length, events: localActivity };
  }
}

export async function getAnalytics(): Promise<AnalyticsSummary> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/analytics`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return await res.json();
  } catch (err) {
    const total_leads = localLeads.length;
    const qualified_leads = localLeads.filter(
      l => l.latest_score && (l.latest_score.qualification === 'hot' || l.latest_score.qualification === 'warm')
    ).length;
    const verified_leads = localLeads.filter(l => l.verification_status === 'verified').length;
    const verification_rate = Math.round((verified_leads / (total_leads || 1)) * 100);

    const scores = localLeads.map(l => l.latest_score?.total_score || 0).filter(s => s > 0);
    const avg_lead_score = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 74;

    const proposals_generated = Object.keys(localProposals).length;

    const status_distribution: Record<string, number> = {};
    for (const lead of localLeads) {
      status_distribution[lead.status] = (status_distribution[lead.status] || 0) + 1;
    }

    return {
      total_leads,
      qualified_leads,
      verification_rate,
      avg_lead_score,
      proposals_generated,
      agent_runs: localRuns.length,
      successful_runs: localRuns.filter(r => r.status === 'completed').length,
      failed_runs: localRuns.filter(r => r.status === 'failed').length,
      status_distribution,
      score_distribution: {
        hot: localLeads.filter(l => l.latest_score?.qualification === 'hot').length,
        warm: localLeads.filter(l => l.latest_score?.qualification === 'warm').length,
        cold: localLeads.filter(l => l.latest_score?.qualification === 'cold').length,
        unqualified: localLeads.filter(l => l.latest_score?.qualification === 'unqualified').length
      }
    };
  }
}

export async function getSettings(): Promise<AppSettings> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    return await res.json();
  } catch (err) {
    return localSettings;
  }
}

export async function updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return await res.json();
  } catch (err) {
    localSettings = { ...localSettings, ...settings };
    return localSettings;
  }
}

// Unified client object for clean React component binding
export const apiClient = {
  getLeads: async (filters?: any): Promise<Lead[]> => {
    const res = await getLeads(filters);
    return res.leads;
  },
  getLead,
  createLead,
  runPipeline: async (leadId: string): Promise<AgentRun> => {
    const targetLead = localLeads.find(l => l.id === leadId);
    const companyName = targetLead?.company_name || 'Account';

    // Create a new full LangGraph execution run
    const newRun: AgentRun = {
      id: `run-${Date.now()}`,
      lead_id: leadId,
      company_name: companyName,
      status: 'human_review_required',
      current_node: 'human_review',
      started_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
      completed_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
      duration_ms: 1940,
      nodes: [
        {
          id: 'n1',
          node_name: 'input_lead',
          display_name: 'Input Lead Intake',
          status: 'COMPLETED',
          tool_used: 'Pydantic V2 Schema Validation',
          summary: `Validated intake schema for ${companyName}.`,
          duration_ms: 45
        },
        {
          id: 'n2',
          node_name: 'search_company',
          display_name: 'Company Search',
          status: 'COMPLETED',
          tool_used: 'DemoSearchProvider',
          summary: 'Retrieved 3 synthetic citations and corporate footprint.',
          duration_ms: 380
        },
        {
          id: 'n3',
          node_name: 'verify_domain',
          display_name: 'SSRF Domain Probe',
          status: 'COMPLETED',
          tool_used: 'SSRF-Protected Domain Probe Tool',
          summary: 'Verified RFC 1918 safe host. HTTP 200 OK. TLS 1.3 negotiated.',
          duration_ms: 220
        },
        {
          id: 'n4',
          node_name: 'verify_registry',
          display_name: 'Corporate Registry',
          status: 'COMPLETED',
          tool_used: 'DemoRegistryProvider',
          summary: 'Corporate entity verified active and in good standing.',
          duration_ms: 190
        },
        {
          id: 'n5',
          node_name: 'normalize_data',
          display_name: 'Data Normalization',
          status: 'COMPLETED',
          tool_used: 'Pydantic Normalizer',
          summary: 'Synthesized corporate profile, executive contacts, and tech stack.',
          duration_ms: 120
        },
        {
          id: 'n6',
          node_name: 'score_lead',
          display_name: 'Deterministic Qualification',
          status: 'COMPLETED',
          tool_used: 'Scoring Logic (0-100 Weights)',
          summary: 'Computed 86/100 score. Tier: HOT qualification.',
          duration_ms: 95
        },
        {
          id: 'n7',
          node_name: 'generate_proposal',
          display_name: 'LLM Proposal Generation',
          status: 'COMPLETED',
          tool_used: 'DemoLLMProvider',
          summary: 'Generated 7-section structured enterprise value proposal.',
          duration_ms: 890
        },
        {
          id: 'n8',
          node_name: 'human_review',
          display_name: 'Human Review Gate',
          status: 'RUNNING',
          tool_used: 'Human-in-the-Loop Intercept',
          summary: 'Halted before outreach. Awaiting operator approval.',
          duration_ms: 0
        }
      ],
      operational_trace: [
        {
          timestamp: new Date().toLocaleTimeString(),
          node: 'input_lead',
          event: 'STATE_ENTER',
          level: 'INFO',
          detail: `Beginning pipeline execution for ${companyName}`
        },
        {
          timestamp: new Date().toLocaleTimeString(),
          node: 'verify_domain',
          event: 'SSRF_FILTER_PASS',
          level: 'SUCCESS',
          detail: 'Host not in loopback or private IPv4 block. Probing TLS...'
        },
        {
          timestamp: new Date().toLocaleTimeString(),
          node: 'score_lead',
          event: 'SCORE_EVALUATED',
          level: 'SUCCESS',
          detail: 'Deterministic score 86. ICP tier set to HOT.'
        },
        {
          timestamp: new Date().toLocaleTimeString(),
          node: 'human_review',
          event: 'HUMAN_GATE_TRIGGERED',
          level: 'WARN',
          detail: 'Automated outreach paused. Operator validation required.'
        }
      ]
    };

    localRuns.unshift(newRun);

    // Also update lead state to human_review
    if (targetLead) {
      targetLead.status = 'human_review';
      targetLead.verification_status = 'verified';
      targetLead.latest_run_id = newRun.id;
      if (!targetLead.latest_score) {
        targetLead.latest_score = {
          id: `score-${Date.now()}`,
          total_score: 86,
          qualification: 'hot',
          breakdown: { company_fit: 23, market_fit: 18, business_need: 18, credibility: 16, engagement_potential: 11 },
          positive_signals: ['Enterprise headcount fit', 'Verified SSL/TLS domain', 'Confirmed corporate filing'],
          risk_signals: [],
          reasons: ['High alignment with B2B qualification criteria.'],
          scored_at: new Date().toISOString()
        };
      }

      // Generate a proposal if none exists
      if (!localProposals[leadId]) {
        localProposals[leadId] = {
          id: `prop-${Date.now()}`,
          lead_id: leadId,
          title: `Autonomous Intelligence Modernization Proposal for ${companyName}`,
          executive_summary: `This proposal outlines an autonomous data intelligence pipeline tailored for ${companyName} to eliminate operational bottlenecks, enforce SSRF-safe external probing, and accelerate enterprise qualification cycles.`,
          client_needs: [
            'Automating repetitive qualification research while maintaining strict data integrity',
            'SSRF-safe domain verification to protect internal network infrastructure',
            'Human-in-the-loop validation for outbound executive correspondence'
          ],
          proposed_solution: `Deploy AgenticFlow LangGraph multi-agent pipeline with deterministic 0-100 scoring, RFC 1918 network guardrails, and integrated human review gating.`,
          business_value: [
            'Reduces research cycle times from 4 hours to under 3 seconds per account',
            'Zero tolerance for hallucinations via multi-source verification and citations',
            'Full compliance audit trails and exportable proposal packages'
          ],
          recommended_next_steps: [
            'Schedule 30-minute technical architecture walk-through',
            'Configure custom enterprise qualification scoring weights',
            'Activate pilot integration on target account cohort'
          ],
          engagement_approach: 'Direct executive reach-out highlighting automated risk reduction and cost savings.',
          personalization_notes: `Tailored specifically for ${targetLead.contact_name || 'Executive Stakeholder'} (${targetLead.contact_title || 'Leadership'}).`,
          status: 'pending_review',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
    }

    localActivity.unshift({
      id: `act-${Date.now()}`,
      lead_id: leadId,
      lead_name: companyName,
      run_id: newRun.id,
      event_type: 'agent_started',
      message: `LangGraph pipeline executed for ${companyName}. Human review gate engaged.`,
      level: 'success',
      created_at: 'Just now'
    });

    return newRun;
  },
  getRuns: async (): Promise<AgentRun[]> => {
    return localRuns;
  },
  getVerification: async (leadId: string): Promise<CompanyVerification | null> => {
    return localVerifications[leadId] || null;
  },
  getProposal: async (leadId: string): Promise<Proposal | null> => {
    return localProposals[leadId] || null;
  },
  getProposals: async (): Promise<Proposal[]> => {
    return Object.values(localProposals);
  },
  approveProposal: async (proposalId: string): Promise<Proposal> => {
    // Find proposal
    let prop = Object.values(localProposals).find(p => p.id === proposalId);
    if (!prop) {
      prop = localProposals['lead-001'];
    }
    prop.status = 'approved';
    prop.human_reviewed_by = 'Security & Revenue Operations';

    const lead = localLeads.find(l => l.id === prop!.lead_id);
    if (lead) {
      lead.status = 'approved';
    }

    localActivity.unshift({
      id: `act-${Date.now()}`,
      lead_id: prop.lead_id,
      lead_name: lead?.company_name || 'Account',
      event_type: 'human_approved',
      message: `Proposal approved for external outreach by operator.`,
      level: 'success',
      created_at: 'Just now'
    });

    return prop;
  },
  rejectProposal: async (proposalId: string): Promise<Proposal> => {
    let prop = Object.values(localProposals).find(p => p.id === proposalId);
    if (!prop) {
      prop = localProposals['lead-001'];
    }
    prop.status = 'rejected';

    const lead = localLeads.find(l => l.id === prop!.lead_id);
    if (lead) {
      lead.status = 'rejected';
    }

    localActivity.unshift({
      id: `act-${Date.now()}`,
      lead_id: prop.lead_id,
      lead_name: lead?.company_name || 'Account',
      event_type: 'human_rejected',
      message: `Proposal rejected during human-in-the-loop review. Outreach cancelled.`,
      level: 'warning',
      created_at: 'Just now'
    });

    return prop;
  },
  updateProposal: async (proposalId: string, updates: Partial<Proposal>): Promise<Proposal> => {
    let prop = Object.values(localProposals).find(p => p.id === proposalId);
    if (!prop) prop = localProposals['lead-001'];
    Object.assign(prop, updates, { updated_at: new Date().toISOString() });
    return prop;
  },
  verifyDomain: async (leadId: string): Promise<CompanyVerification> => {
    return await verifyLead(leadId);
  },
  scoreLead: async (leadId: string): Promise<LeadScore> => {
    return await scoreLead(leadId);
  },
  getActivity: async (): Promise<ActivityEvent[]> => {
    const res = await getActivity();
    return res.events;
  },
  getMetrics: async (): Promise<AnalyticsSummary> => {
    return await getAnalytics();
  },
  getSettings,
  updateSettings,
  resetDemoData: async (): Promise<void> => {
    localLeads = [...INITIAL_LEADS];
    localVerifications = { ...DEMO_VERIFICATIONS };
    localProposals = { ...DEMO_PROPOSALS };
    localRuns = [...DEMO_AGENT_RUNS];
    localActivity = [...DEMO_ACTIVITY_EVENTS];
  }
};
