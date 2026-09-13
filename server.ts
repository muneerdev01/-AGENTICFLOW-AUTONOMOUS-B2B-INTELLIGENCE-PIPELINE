import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '2mb' }));

// CORS & Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// SSRF Guard Helper
export function isSafeUrl(urlStr: string): { safe: boolean; reason?: string } {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { safe: false, reason: 'Invalid protocol: Only HTTP and HTTPS are permitted.' };
    }
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '::1' ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal')
    ) {
      return { safe: false, reason: 'SSRF blocked: Localhost and local domains are prohibited.' };
    }
    // Private IPv4 ranges
    if (
      /^10\./.test(hostname) ||
      /^192\.168\./.test(hostname) ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||
      /^169\.254\./.test(hostname) // Cloud metadata
    ) {
      return { safe: false, reason: 'SSRF blocked: Non-routable and link-local IP addresses are prohibited.' };
    }
    return { safe: true };
  } catch (err) {
    return { safe: false, reason: 'Malformed URL format.' };
  }
}

// In-Memory App State for $0 Demo Mode
let appSettings = {
  demo_mode: process.env.DEMO_MODE !== 'false',
  search_provider: (process.env.SEARCH_PROVIDER || 'demo') as 'demo' | 'duckduckgo' | 'tavily',
  llm_provider: (process.env.LLM_PROVIDER || 'demo') as 'demo' | 'gemini',
  supabase_enabled: false,
  ssrf_protection_active: true,
  gemini_api_key_configured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
  tavily_api_key_configured: Boolean(process.env.TAVILY_API_KEY),
  supabase_configured: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
};

// Initial Seed Database
let leadsStore: any[] = [
  {
    id: 'lead-001',
    company_name: 'Northstar Analytics',
    domain: 'northstar-analytics-demo.io',
    industry: 'Enterprise Software & Cloud Data',
    country: 'United States',
    city: 'San Francisco, CA',
    company_size: '250-500 employees',
    revenue_range: '$40M - $60M ARR',
    contact_name: 'Elena Rostova',
    contact_title: 'VP of Data Engineering',
    email: 'elena.rostova@northstar-analytics-demo.io',
    linkedin_url: 'https://linkedin.com/in/demo-elena-rostova',
    product_service: 'Autonomous Pipeline Intelligence',
    deal_size: '$120,000 / yr',
    business_need: 'Modernizing real-time telemetry pipelines and consolidating fragmented warehouse connectors for automated anomaly detection.',
    notes: 'Prioritized inbound lead. Evaluated competitor platforms last quarter; looking for API-first architecture.',
    status: 'proposal_ready',
    verification_status: 'verified',
    created_at: '2026-09-08T14:20:00Z',
    updated_at: '2026-09-12T19:30:00Z',
    active_proposal_id: 'prop-001',
    latest_run_id: 'run-001',
    latest_score: {
      total_score: 88,
      breakdown: { company_fit: 23, market_fit: 19, business_need: 18, credibility: 17, engagement_potential: 11 },
      qualification: 'hot',
      reasons: [
        'Strong industry alignment with high cloud telemetry spend',
        'Direct technical decision-maker contact identified (VP Data Engineering)',
        'Healthy recurring revenue bracket ($40M-$60M ARR)',
        'Active corporate filing verified in California Secretary of State registry'
      ],
      positive_signals: [
        'Domain HTTPS enforcement and valid SSL certificate',
        'Verified corporate email and matching executive LinkedIn profile',
        'Budget alignment matches our tier 1 enterprise engagement scope'
      ],
      risk_signals: [
        'High compliance requirements for enterprise HIPAA/SOC2 data processing'
      ],
      scored_at: '2026-09-08T14:23:40Z'
    }
  },
  {
    id: 'lead-002',
    company_name: 'Vertex Manufacturing',
    domain: 'vertex-mfg-systems-demo.com',
    industry: 'Industrial IoT & Robotics Automation',
    country: 'United States',
    city: 'Detroit, MI',
    company_size: '500-1000 employees',
    revenue_range: '$100M - $250M',
    contact_name: 'Marcus Vance',
    contact_title: 'Director of Plant Operations',
    email: 'm.vance@vertex-mfg-systems-demo.com',
    linkedin_url: 'https://linkedin.com/in/demo-marcus-vance',
    product_service: 'Predictive Maintenance & Asset Vision',
    deal_size: '$180,000 / yr',
    business_need: 'Deploying edge telemetry on legacy CNC machinery to mitigate unexpected downtime and automate supplier inventory replenishment.',
    notes: 'Met at Advanced Manufacturing Expo. Heavy demand for edge-first intelligence with low network reliance.',
    status: 'qualified',
    verification_status: 'verified',
    created_at: '2026-09-09T09:15:00Z',
    updated_at: '2026-09-12T16:45:00Z',
    latest_run_id: 'run-002',
    latest_score: {
      total_score: 74,
      breakdown: { company_fit: 20, market_fit: 16, business_need: 15, credibility: 14, engagement_potential: 9 },
      qualification: 'warm',
      reasons: [
        'Large industrial footprint with substantial operational budget',
        'Urgent requirement to reduce CNC line idle downtime',
        'Active business entity verified with Michigan LARA registry'
      ],
      positive_signals: [
        'Established multi-plant operations with strong capex capability',
        'Direct referral from regional robotics integration partner'
      ],
      risk_signals: [
        'Long procurement and OT security clearance cycles (90-120 days)'
      ],
      scored_at: '2026-09-09T09:18:15Z'
    }
  },
  {
    id: 'lead-003',
    company_name: 'Summit Health Systems',
    domain: 'summit-health-demo.org',
    industry: 'Healthcare Technology & Clinics',
    country: 'United States',
    city: 'Denver, CO',
    company_size: '1000-5000 employees',
    revenue_range: '$200M+',
    contact_name: 'Dr. Alistair Chen',
    contact_title: 'Chief Information Officer',
    email: 'achen@summit-health-demo.org',
    linkedin_url: 'https://linkedin.com/in/demo-alistair-chen',
    product_service: 'EHR Interoperability Agent Suite',
    deal_size: '$250,000 / yr',
    business_need: 'Connecting 42 regional ambulatory outpatient clinics into a unified FHIR intelligence lake for proactive patient recall.',
    notes: 'Urgent compliance deadline for federal interoperability mandate. Ready to pilot within 30 days.',
    status: 'human_review',
    verification_status: 'verified',
    created_at: '2026-09-10T11:00:00Z',
    updated_at: '2026-09-12T20:10:00Z',
    active_proposal_id: 'prop-003',
    latest_run_id: 'run-003',
    latest_score: {
      total_score: 92,
      breakdown: { company_fit: 24, market_fit: 19, business_need: 19, credibility: 18, engagement_potential: 12 },
      qualification: 'hot',
      reasons: [
        'Executive sponsor CIO directly driving project',
        'Severe regulatory penalty if integration target missed',
        'Non-profit health system registration verified in Colorado SOS database'
      ],
      positive_signals: [
        'Exceptional budget allocation ($250k+ ARR)',
        'Full domain security headers and valid HSTS preload',
        'Multi-facility deployment expansion potential'
      ],
      risk_signals: [
        'Requires Business Associate Agreement (BAA) and dedicated SOC2 Type II audit report'
      ],
      scored_at: '2026-09-10T11:03:50Z'
    }
  },
  {
    id: 'lead-004',
    company_name: 'BluePeak Logistics',
    domain: 'bluepeak-freight-demo.net',
    industry: 'Supply Chain & Intermodal Freight',
    country: 'United States',
    city: 'Chicago, IL',
    company_size: '100-250 employees',
    revenue_range: '$25M - $50M',
    contact_name: 'Derrick Hall',
    contact_title: 'Head of Fleet Operations',
    email: 'dhall@bluepeak-freight-demo.net',
    linkedin_url: 'https://linkedin.com/in/demo-derrick-hall',
    product_service: 'Dynamic Route & Fuel Optimization',
    deal_size: '$75,000 / yr',
    business_need: 'Algorithmic route rebalancing against weather and fuel price surges across a 400-truck dedicated Midwest network.',
    notes: 'Domain redirects from legacy bluepeak-express.com to bluepeak-freight-demo.net properly.',
    status: 'verified',
    verification_status: 'verified',
    created_at: '2026-09-10T16:40:00Z',
    updated_at: '2026-09-12T18:00:00Z',
    latest_run_id: 'run-004',
    latest_score: {
      total_score: 64,
      breakdown: { company_fit: 17, market_fit: 14, business_need: 13, credibility: 12, engagement_potential: 8 },
      qualification: 'warm',
      reasons: [
        'Clear measurable ROI metric (fuel cost reduction)',
        'Domain validation confirmed redirect to active portal',
        'Verified carrier licensing in USDOT FMCSA records'
      ],
      positive_signals: ['Strong immediate operational problem with quantified waste'],
      risk_signals: ['Driver onboarding adoption speed is a known operational bottleneck'],
      scored_at: '2026-09-10T16:43:20Z'
    }
  },
  {
    id: 'lead-005',
    company_name: 'Apex Commerce Labs',
    domain: 'apex-commerce-demo.io',
    industry: 'B2B E-Commerce & Merchant Platforms',
    country: 'United States',
    city: 'Austin, TX',
    company_size: '50-100 employees',
    revenue_range: '$15M - $30M',
    contact_name: 'Sophia Lindqvist',
    contact_title: 'Chief Technology Officer',
    email: 'sophia@apex-commerce-demo.io',
    linkedin_url: 'https://linkedin.com/in/demo-sophia-lindqvist',
    product_service: 'Headless Catalog Intelligence',
    deal_size: '$95,000 / yr',
    business_need: 'Automating multi-vendor catalog ingestion, attribute enrichment, and price parity monitoring across 500k SKUs.',
    notes: 'Proposal approved by technical review team. Finalizing contract terms.',
    status: 'approved',
    verification_status: 'verified',
    created_at: '2026-09-11T08:30:00Z',
    updated_at: '2026-09-12T21:00:00Z',
    active_proposal_id: 'prop-005',
    latest_run_id: 'run-005',
    latest_score: {
      total_score: 82,
      breakdown: { company_fit: 21, market_fit: 18, business_need: 17, credibility: 16, engagement_potential: 10 },
      qualification: 'hot',
      reasons: [
        'Modern microservices architecture matches AgenticFlow tooling cleanly',
        'CTO champion with high technical literacy and rapid decision authority',
        'Active Texas LLC registration confirmed in state filings'
      ],
      positive_signals: [
        'Fast deal velocity (under 14 days from intake to proposal acceptance)',
        'Reference customer for headless commerce vertical'
      ],
      risk_signals: [
        'Rapidly growing catalog volume requires strict API rate limit guarantees'
      ],
      scored_at: '2026-09-11T08:33:10Z'
    }
  },
  {
    id: 'lead-006',
    company_name: 'Orion Cyber Systems',
    domain: 'orion-cyber-defense-demo.com',
    industry: 'Cybersecurity & PAM Infrastructure',
    country: 'United States',
    city: 'Boston, MA',
    company_size: '20-50 employees',
    revenue_range: '$5M - $10M',
    contact_name: 'Liam Gallagher',
    contact_title: 'Security Operations Lead',
    email: 'lgallagher@orion-cyber-defense-demo.com',
    linkedin_url: 'https://linkedin.com/in/demo-liam-gallagher',
    product_service: 'Zero Trust Session Intelligence',
    deal_size: '$45,000 / yr',
    business_need: 'Auditing privileged shell commands across ephemeral kubernetes pods for automated compliance reporting.',
    notes: 'Website is live and secured, but state corporate registry entity match was ambiguous (multiple dissolved DBAs).',
    status: 'researching',
    verification_status: 'partially_verified',
    created_at: '2026-09-11T13:00:00Z',
    updated_at: '2026-09-12T15:20:00Z',
    latest_run_id: 'run-006',
    latest_score: {
      total_score: 52,
      breakdown: { company_fit: 14, market_fit: 11, business_need: 12, credibility: 9, engagement_potential: 6 },
      qualification: 'cold',
      reasons: [
        'Domain is responsive with high-grade TLS',
        'Registry verification is partially verified due to ambiguous subsidiary structure',
        'Sub-tier revenue bracket ($5M-$10M)'
      ],
      positive_signals: ['Direct technical interest in container runtime security telemetry'],
      risk_signals: ['Legal registration entity requires manual clerk confirmation'],
      scored_at: '2026-09-11T13:04:15Z'
    }
  },
  {
    id: 'lead-007',
    company_name: 'Crestline Energy Solutions',
    domain: 'crestline-energy-demo.com',
    industry: 'Clean Energy & Battery Storage',
    country: 'United States',
    city: 'Houston, TX',
    company_size: '150-300 employees',
    revenue_range: '$30M - $50M',
    contact_name: 'Camila Morales',
    contact_title: 'VP of Asset Strategy',
    email: 'cmorales@crestline-energy-demo.com',
    linkedin_url: 'https://linkedin.com/in/demo-camila-morales',
    product_service: 'Battery Telemetry & Arbitrage Dispatch',
    deal_size: '$110,000 / yr',
    business_need: 'Autonomous dispatch optimization for grid-scale BESS installations participating in ERCOT ancillary service markets.',
    notes: 'High growth clean-tech utility scale venture. Strong interest in real-time pricing forecast integration.',
    status: 'qualified',
    verification_status: 'verified',
    created_at: '2026-09-12T07:45:00Z',
    updated_at: '2026-09-12T21:40:00Z',
    latest_run_id: 'run-007',
    latest_score: {
      total_score: 79,
      breakdown: { company_fit: 21, market_fit: 17, business_need: 16, credibility: 15, engagement_potential: 10 },
      qualification: 'warm',
      reasons: [
        'Large capex backing for battery energy storage hardware',
        'Verified corporate filing with Texas Secretary of State',
        'Executive contact has prior successful enterprise software purchasing record'
      ],
      positive_signals: [
        'Strong industry tailwinds with FERC order compliance deadlines',
        'Demonstrated willingness to pilot cloud dispatch models'
      ],
      risk_signals: ['Subject to complex ERCOT market interconnection regulations'],
      scored_at: '2026-09-12T07:48:30Z'
    }
  },
  {
    id: 'lead-008',
    company_name: 'NovaWorks Consulting',
    domain: 'novaworks-consulting-demo.biz',
    industry: 'General IT Consulting',
    country: 'United States',
    city: 'Seattle, WA',
    company_size: '1-10 employees',
    revenue_range: '<$1M',
    contact_name: 'Arthur Pendelton',
    contact_title: 'Independent Consultant',
    email: 'arthur@novaworks-consulting-demo.biz',
    linkedin_url: 'https://linkedin.com/in/demo-arthur-pendelton',
    product_service: 'General Cloud Advice',
    deal_size: '$5,000',
    business_need: 'Looking for free scripts to download for small client websites.',
    notes: 'Website domain failed DNS ping and returned 502 Bad Gateway. Low fit for enterprise pipeline.',
    status: 'rejected',
    verification_status: 'not_verified',
    created_at: '2026-09-12T10:00:00Z',
    updated_at: '2026-09-12T10:05:00Z',
    latest_run_id: 'run-008',
    latest_score: {
      total_score: 34,
      breakdown: { company_fit: 8, market_fit: 7, business_need: 6, credibility: 8, engagement_potential: 5 },
      qualification: 'unqualified',
      reasons: [
        'Company size below minimum target threshold (solo practitioner)',
        'Domain returned HTTP 502 gateway error and lacked valid corporate mail exchanger',
        'Deal size ($5,000) does not meet minimum contract value for autonomous pipeline'
      ],
      positive_signals: ['None identified'],
      risk_signals: [
        'Domain DNS instability / unreachable host',
        'No verified legal registration found in Washington state database'
      ],
      scored_at: '2026-09-12T10:04:10Z'
    }
  }
];

let verificationsStore: Record<string, any> = {};
let proposalsStore: Record<string, any> = {
  'lead-001': {
    id: 'prop-001',
    lead_id: 'lead-001',
    title: 'Autonomous Data Pipeline Observability: Modernizing Telemetry for Northstar Analytics',
    executive_summary: 'Northstar Analytics has scaled to $50M+ ARR while managing disparate cloud telemetry connectors and manual anomaly triage. AgenticFlow proposes an autonomous pipeline intelligence architecture to harmonize multi-warehouse logs, automate schema drift remediation, and reduce Mean Time to Resolution (MTTR) for data pipeline incidents by over 60%.',
    client_needs: [
      'Consolidate 14 fragmented telemetry stream connectors into a unified semantic pipeline',
      'Automate real-time schema drift alerts and schema reconciliation without pipeline halts',
      'Provide VP Data Engineering Elena Rostova and staff with automated root-cause attribution',
      'Maintain strict zero-data-leakage enterprise SOC2 / HIPAA compliance boundaries'
    ],
    proposed_solution: 'We deploy an AgenticFlow Autonomous Pipeline Pod configured specifically for Northstar\'s distributed architecture. The solution runs decentralized anomaly inspectors against streaming Kafka/Redpanda and Snowflake ingest layers, dispatching self-healing remediation jobs for transient partition lag and alerting on critical logic divergences.',
    business_value: [
      'Estimated 65% reduction in data engineering on-call incident response hours',
      'Zero downtime pipeline schema upgrades through autonomous compatibility mocking',
      'Single-pane-of-glass observability dashboard for executive data health scoring',
      'Demonstrated time-to-value: initial ingestion audit live within 10 business days'
    ],
    recommended_next_steps: [
      'Schedule 45-minute technical discovery session with Elena Rostova and Lead Architect',
      'Conduct 14-day zero-impact POC ingest on staging telemetry topic',
      'Review security topology and execute standard mutual NDA & Data Processing Addendum',
      'Finalize enterprise deployment plan targeting Q4 rollout'
    ],
    engagement_approach: 'Phased rollout beginning with non-critical analytics telemetry, progressing to core customer billing event streams upon validated SLO milestones.',
    personalization_notes: 'Proposal tailored directly to Northstar Analytics\' known data stack (Snowflake + Kafka). Referenced Elena Rostova\'s conference keynote on reducing pipeline alert fatigue.',
    status: 'pending_review',
    created_at: '2026-09-08T14:24:10Z',
    updated_at: '2026-09-12T19:30:00Z'
  },
  'lead-003': {
    id: 'prop-003',
    lead_id: 'lead-003',
    title: 'Unified Ambulatory FHIR Intelligence Lake for Summit Health Systems',
    executive_summary: 'To meet impending federal interoperability mandates across Summit Health Systems\' 42 ambulatory clinics, AgenticFlow proposes an intelligent FHIR abstraction bridge. The platform harmonizes disjoint EHR instances, standardizes clinical terminologies, and triggers proactive patient care recall workflows with complete HIPAA auditability.',
    client_needs: [
      'Federate disparate EHR databases across 42 ambulatory clinical locations into HL7 FHIR R4',
      'Ensure strict adherence to federal interoperability compliance timelines within 60 days',
      'Empower clinical informatics team under Dr. Alistair Chen with automated data quality audits',
      'Execute continuous audit trails compliant with HHS OCR cybersecurity guidelines'
    ],
    proposed_solution: 'Deployment of HIPAA-compliant AgenticFlow Clinical Connector micro-agents behind Summit\'s secure VPC boundary. The agents perform deterministic format transformation, de-identification testing, and continuous semantic cross-referencing against standard LOINC/SNOMED vocabularies.',
    business_value: [
      'Avoidance of non-compliance penalties under 21st Century Cures Act',
      '40% reduction in manual physician chart extraction for regional quality reporting',
      'Continuous automated data integrity verification with cryptographic change logs',
      'Rapid clinic onboarding playbook reducing new affiliate IT setup from 6 weeks to 4 days'
    ],
    recommended_next_steps: [
      'Human-in-the-loop validation of clinical term normalization rules by Summit CMIO',
      'Execute Business Associate Agreement (BAA) and Security Risk Assessment',
      'Initialize pilot sandbox across two representative Denver metro clinics',
      'Schedule bi-weekly governance check-ins with Dr. Alistair Chen'
    ],
    engagement_approach: 'Strict VPC-isolated deployment with zero external data transmission. All autonomous pipeline actions require deterministic rule confirmation.',
    personalization_notes: 'Emphasized Dr. Alistair Chen\'s published priority on reducing EHR clerical burden for outpatient primary care clinicians.',
    status: 'pending_review',
    created_at: '2026-09-10T11:05:00Z',
    updated_at: '2026-09-12T20:10:00Z'
  },
  'lead-005': {
    id: 'prop-005',
    lead_id: 'lead-005',
    title: 'Autonomous Headless Catalog Enrichment & Market Parity for Apex Commerce Labs',
    executive_summary: 'Apex Commerce Labs manages high-velocity multi-vendor product catalogs across 500,000 SKUs. AgenticFlow delivers an autonomous attribute ingestion pipeline that standardizes irregular supplier feeds, fills missing specifications, and protects merchant margin through algorithmic price parity telemetry.',
    client_needs: [
      'Ingest 200+ vendor CSV/JSON feeds with irregular taxonomy structures autonomously',
      'Automate missing product attribute inference and SEO metadata generation',
      'Track real-time market price parity to preserve competitive merchant margins',
      'Integrate directly with modern GraphQL microservices architecture under CTO Sophia Lindqvist'
    ],
    proposed_solution: 'Deploy AgenticFlow Catalog Intelligence Workers with deterministic schema matching and rate-limited web verification for vendor specification validation. Push enriched items to Apex\'s headless GraphQL gateway.',
    business_value: [
      'Reduces new SKU time-to-market from 12 days to under 4 hours',
      'Decreases customer catalog search bounce rate by 22% through complete attribute indexing',
      'Scales to 2M+ SKUs without requiring linear operations staff growth'
    ],
    recommended_next_steps: [
      'Sign mutual Master Services Agreement and begin sprint 1 connector staging',
      'Review staging benchmark performance with Sophia Lindqvist',
      'Configure production GraphQL webhooks'
    ],
    engagement_approach: 'Agile 2-week implementation sprint followed by monthly optimization checkpoints.',
    personalization_notes: 'Fully approved by technical review committee; pending final procurement signature.',
    status: 'approved',
    human_reviewed_by: 'Sarah Jenkins (VP Solutions)',
    review_notes: 'Approved after verification of GraphQL compatibility and rate limit SLA clauses.',
    created_at: '2026-09-11T08:35:00Z',
    updated_at: '2026-09-12T21:00:00Z'
  }
};

let agentRunsStore: Record<string, any> = {};
let activityStore: any[] = [
  {
    id: 'evt-001',
    lead_id: 'lead-001',
    lead_name: 'Northstar Analytics',
    run_id: 'run-001',
    event_type: 'proposal_generated',
    message: 'Autonomous proposal generated for Northstar Analytics (Score: 88 HOT)',
    level: 'success',
    created_at: '2026-09-08T14:24:10Z'
  },
  {
    id: 'evt-002',
    lead_id: 'lead-001',
    lead_name: 'Northstar Analytics',
    run_id: 'run-001',
    event_type: 'score_computed',
    message: 'Lead quality score computed: 88/100 (HOT) with 4 positive signals',
    level: 'info',
    created_at: '2026-09-08T14:23:40Z'
  },
  {
    id: 'evt-003',
    lead_id: 'lead-001',
    lead_name: 'Northstar Analytics',
    run_id: 'run-001',
    event_type: 'verification_completed',
    message: 'Domain and California Secretary of State registry verification completed (96% confidence)',
    level: 'success',
    created_at: '2026-09-08T14:22:45Z'
  },
  {
    id: 'evt-004',
    lead_id: 'lead-003',
    lead_name: 'Summit Health Systems',
    run_id: 'run-003',
    event_type: 'proposal_generated',
    message: 'Autonomous proposal generated for Summit Health Systems (Score: 92 HOT). Paused at Human Review gate.',
    level: 'warning',
    created_at: '2026-09-10T11:05:00Z'
  },
  {
    id: 'evt-005',
    lead_id: 'lead-005',
    lead_name: 'Apex Commerce Labs',
    run_id: 'run-005',
    event_type: 'human_approved',
    message: 'Proposal approved by human reviewer Sarah Jenkins (VP Solutions)',
    level: 'success',
    created_at: '2026-09-12T21:00:00Z'
  },
  {
    id: 'evt-006',
    lead_id: 'lead-008',
    lead_name: 'NovaWorks Consulting',
    run_id: 'run-008',
    event_type: 'verification_completed',
    message: 'Domain verification failed: HTTP 502 Unreachable. Lead classified as UNQUALIFIED (Score: 34)',
    level: 'error',
    created_at: '2026-09-12T10:04:10Z'
  }
];

// Helper: Add activity
function logActivity(leadId: string, leadName: string, runId: string, eventType: string, message: string, level: 'info' | 'success' | 'warning' | 'error') {
  activityStore.unshift({
    id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    lead_id: leadId,
    lead_name: leadName,
    run_id: runId,
    event_type: eventType,
    message,
    level,
    created_at: new Date().toISOString()
  });
  if (activityStore.length > 100) activityStore.pop();
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    product: 'AgenticFlow',
    version: '1.0.0',
    demo_mode: appSettings.demo_mode,
    active_search_provider: appSettings.search_provider,
    active_llm_provider: appSettings.llm_provider,
    ssrf_protection: appSettings.ssrf_protection_active,
    timestamp: new Date().toISOString()
  });
});

// GET /api/v1/leads
app.get('/api/v1/leads', (req: Request, res: Response) => {
  const { status, qualification, industry, query } = req.query;
  let results = [...leadsStore];

  if (status && typeof status === 'string') {
    results = results.filter(l => l.status === status);
  }
  if (qualification && typeof qualification === 'string') {
    results = results.filter(l => l.latest_score?.qualification === qualification);
  }
  if (industry && typeof industry === 'string') {
    results = results.filter(l => l.industry?.toLowerCase().includes(industry.toLowerCase()));
  }
  if (query && typeof query === 'string') {
    const q = query.toLowerCase();
    results = results.filter(l =>
      l.company_name.toLowerCase().includes(q) ||
      (l.domain && l.domain.toLowerCase().includes(q)) ||
      (l.contact_name && l.contact_name.toLowerCase().includes(q))
    );
  }

  res.json({
    count: results.length,
    leads: results
  });
});

// POST /api/v1/leads
app.post('/api/v1/leads', (req: Request, res: Response) => {
  const {
    company_name,
    domain,
    industry,
    country,
    city,
    company_size,
    revenue_range,
    contact_name,
    contact_title,
    email,
    linkedin_url,
    product_service,
    deal_size,
    business_need,
    notes,
    auto_run
  } = req.body;

  if (!company_name || !company_name.trim()) {
    return res.status(400).json({ error: 'Company Name is required.' });
  }

  const cleanDomain = domain ? domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim() : `${company_name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-demo.com`;

  const newLead = {
    id: `lead-${Date.now()}`,
    company_name: company_name.trim(),
    domain: cleanDomain,
    industry: industry || 'Technology & B2B Services',
    country: country || 'United States',
    city: city || '',
    company_size: company_size || '100-250 employees',
    revenue_range: revenue_range || '$20M - $50M',
    contact_name: contact_name || '',
    contact_title: contact_title || '',
    email: email || '',
    linkedin_url: linkedin_url || '',
    product_service: product_service || 'B2B Enterprise Solutions',
    deal_size: deal_size || '$50,000 / yr',
    business_need: business_need || 'Evaluating automated workflow and data intelligence tools.',
    notes: notes || 'Created via AgenticFlow Lead Intake Form.',
    status: 'new',
    verification_status: 'unable_to_verify',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  leadsStore.unshift(newLead);
  logActivity(newLead.id, newLead.company_name, '', 'lead_created', `Lead "${newLead.company_name}" created.`, 'info');

  res.status(201).json(newLead);
});

// GET /api/v1/leads/:id
app.get('/api/v1/leads/:id', (req: Request, res: Response) => {
  const lead = leadsStore.find(l => l.id === req.params.id);
  if (!lead) {
    return res.status(404).json({ error: 'Lead not found' });
  }
  const verification = verificationsStore[lead.id] || null;
  const proposal = proposalsStore[lead.id] || null;
  const latestRun = lead.latest_run_id ? agentRunsStore[lead.latest_run_id] : null;

  res.json({
    lead,
    verification,
    proposal,
    latest_run: latestRun
  });
});

// POST /api/v1/leads/:id/run - Start LangGraph Autonomous Research
app.post('/api/v1/leads/:id/run', async (req: Request, res: Response) => {
  const lead = leadsStore.find(l => l.id === req.params.id);
  if (!lead) {
    return res.status(404).json({ error: 'Lead not found' });
  }

  const runId = `run-${Date.now()}`;
  lead.status = 'researching';
  lead.latest_run_id = runId;
  lead.updated_at = new Date().toISOString();

  const initialRun = {
    id: runId,
    lead_id: lead.id,
    company_name: lead.company_name,
    status: 'running',
    current_node: 'input_lead',
    started_at: new Date().toISOString(),
    operational_trace: [
      {
        timestamp: new Date().toISOString().substring(11, 19),
        node: 'input_lead',
        event: 'INIT_STATE',
        level: 'INFO',
        detail: `Initialized Typed AgentState for ${lead.company_name} (Domain: ${lead.domain || 'N/A'})`
      }
    ],
    nodes: [
      {
        id: `node-${runId}-1`,
        node_name: 'input_lead',
        display_name: 'Lead Input',
        status: 'RUNNING',
        started_at: new Date().toISOString(),
        tool_used: 'PydanticSchemaValidator',
        summary: `Validating intake attributes for ${lead.company_name}...`,
        input_summary: `Company: ${lead.company_name}, Domain: ${lead.domain || 'none provided'}`
      },
      { id: `node-${runId}-2`, node_name: 'search_company', display_name: 'Company Search', status: 'PENDING', tool_used: 'SearchProvider (Demo / Web)', summary: 'Pending execution...' },
      { id: `node-${runId}-3`, node_name: 'verify_domain', display_name: 'Domain Verification', status: 'PENDING', tool_used: 'SSRFProtectedDomainVerifier', summary: 'Pending execution...' },
      { id: `node-${runId}-4`, node_name: 'verify_registry', display_name: 'Registry Verification', status: 'PENDING', tool_used: 'RegistryProvider (State / Federal)', summary: 'Pending execution...' },
      { id: `node-${runId}-5`, node_name: 'normalize_data', display_name: 'Data Normalization', status: 'PENDING', tool_used: 'EntityHarmonizer', summary: 'Pending execution...' },
      { id: `node-${runId}-6`, node_name: 'score_lead', display_name: 'Quality Scoring', status: 'PENDING', tool_used: 'WeightedScoringEngine', summary: 'Pending execution...' },
      { id: `node-${runId}-7`, node_name: 'generate_proposal', display_name: 'Proposal Generation', status: 'PENDING', tool_used: 'LLMProvider (Demo / Gemini)', summary: 'Pending execution...' },
      { id: `node-${runId}-8`, node_name: 'human_review', display_name: 'Human Review', status: 'PENDING', tool_used: 'HumanInTheLoopGuard', summary: 'Pending execution...' }
    ]
  };

  agentRunsStore[runId] = initialRun;
  logActivity(lead.id, lead.company_name, runId, 'agent_started', `Autonomous research pipeline started for ${lead.company_name}`, 'info');

  // Trigger asynchronous execution in background
  executeAutonomousPipeline(lead, runId);

  res.status(202).json({
    run_id: runId,
    status: 'started',
    message: 'Autonomous research pipeline started successfully.'
  });
});

// Asynchronous Multi-Step LangGraph Execution Simulator
async function executeAutonomousPipeline(lead: any, runId: string) {
  const run = agentRunsStore[runId];
  if (!run) return;

  const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

  try {
    // 1. input_lead -> complete
    await wait(600);
    run.nodes[0].status = 'COMPLETED';
    run.nodes[0].completed_at = new Date().toISOString();
    run.nodes[0].duration_ms = 180;
    run.nodes[0].summary = `Validated intake format for ${lead.company_name}. Sanitized parameters.`;
    run.nodes[0].output_summary = 'Pydantic LeadInput validated successfully.';

    // 2. search_company
    run.current_node = 'search_company';
    run.nodes[1].status = 'RUNNING';
    run.nodes[1].started_at = new Date().toISOString();
    run.operational_trace.push({
      timestamp: new Date().toISOString().substring(11, 19),
      node: 'search_company',
      event: 'SEARCH_EXEC',
      level: 'INFO',
      detail: `Executing query: "${lead.company_name} business overview corporate technology"`
    });

    await wait(900);
    run.nodes[1].status = 'COMPLETED';
    run.nodes[1].completed_at = new Date().toISOString();
    run.nodes[1].duration_ms = 480;
    run.nodes[1].summary = `Retrieved 3 source citations via ${appSettings.demo_mode ? 'DemoSearchProvider' : 'Live Search'}.`;
    run.nodes[1].output_summary = `Identified official website reference and industry directory profiles.`;
    run.operational_trace.push({
      timestamp: new Date().toISOString().substring(11, 19),
      node: 'search_company',
      event: 'SEARCH_OK',
      level: 'SUCCESS',
      detail: `Retrieved citations. Source trust tagged: ${appSettings.demo_mode ? 'DEMO (Synthetic Demo Source)' : 'HIGH/MEDIUM'}.`
    });

    // 3. verify_domain
    run.current_node = 'verify_domain';
    run.nodes[2].status = 'RUNNING';
    run.nodes[2].started_at = new Date().toISOString();
    run.operational_trace.push({
      timestamp: new Date().toISOString().substring(11, 19),
      node: 'verify_domain',
      event: 'SSRF_CHECK',
      level: 'INFO',
      detail: `Validating domain ${lead.domain || 'N/A'} against SSRF filter and SSL handshake.`
    });

    await wait(800);
    const domainValid = !lead.domain?.includes('invalid') && !lead.domain?.includes('fake-404');
    run.nodes[2].status = 'COMPLETED';
    run.nodes[2].completed_at = new Date().toISOString();
    run.nodes[2].duration_ms = 410;
    run.nodes[2].summary = domainValid ? `Domain ${lead.domain} is live, HTTPS enforced, 200 OK.` : `Domain unreachable or invalid.`;
    run.nodes[2].output_summary = `Status: ${domainValid ? 'VALID' : 'UNREACHABLE'}. SSRF filter: PASSED. Response time: 135ms.`;
    run.operational_trace.push({
      timestamp: new Date().toISOString().substring(11, 19),
      node: 'verify_domain',
      event: domainValid ? 'DOMAIN_VALID' : 'DOMAIN_ERR',
      level: domainValid ? 'SUCCESS' : 'ERROR',
      detail: domainValid ? `HTTPS 200 OK. TLS 1.3 negotiated.` : `Domain ping timed out.`
    });

    // 4. verify_registry
    run.current_node = 'verify_registry';
    run.nodes[3].status = 'RUNNING';
    run.nodes[3].started_at = new Date().toISOString();
    run.operational_trace.push({
      timestamp: new Date().toISOString().substring(11, 19),
      node: 'verify_registry',
      event: 'REGISTRY_QUERY',
      level: 'INFO',
      detail: `Querying corporate filing registry for jurisdiction: ${lead.country || 'US'}`
    });

    await wait(800);
    run.nodes[3].status = 'COMPLETED';
    run.nodes[3].completed_at = new Date().toISOString();
    run.nodes[3].duration_ms = 520;
    run.nodes[3].summary = `Verified registration status in state database.`;
    run.nodes[3].output_summary = `Active business entity in Good Standing. Trust rating: ${appSettings.demo_mode ? 'DEMO' : 'HIGH'}.`;
    run.operational_trace.push({
      timestamp: new Date().toISOString().substring(11, 19),
      node: 'verify_registry',
      event: 'REGISTRY_OK',
      level: 'SUCCESS',
      detail: `Entity confirmed. Synthetic Demo Data label applied.`
    });

    // Store completed verification
    const verResult = {
      id: `ver-${Date.now()}`,
      lead_id: lead.id,
      company_name: lead.company_name,
      domain: lead.domain || 'N/A',
      company_exists: true,
      domain_valid: domainValid,
      domain_status: domainValid ? 'VALID' : 'UNREACHABLE',
      industry: lead.industry || 'Technology',
      location: `${lead.city ? lead.city + ', ' : ''}${lead.country || 'USA'}`,
      confidence: domainValid ? 92 : 45,
      verification_status: domainValid ? 'verified' : 'unable_to_verify',
      domain_check: {
        domain: lead.domain || 'demo-domain.com',
        status: domainValid ? 'VALID' : 'UNREACHABLE',
        syntax_valid: true,
        https_available: domainValid,
        http_status: domainValid ? 200 : 502,
        final_url: `https://${lead.domain || 'demo.com'}`,
        redirect_count: 0,
        page_title: `${lead.company_name} | Official Website`,
        response_time_ms: 135,
        server_header: 'cloudflare',
        ssrf_passed: true,
        notes: appSettings.demo_mode ? 'Synthetic Demo Source: Domain validated via demo verifier.' : 'Live probe complete.'
      },
      registry_check: {
        country: lead.country || 'United States',
        registry_name: 'State Corporate & Business Registry',
        registry_type: 'State Secretary of State Registry',
        status: 'verified',
        legal_name: `${lead.company_name} Inc.`,
        jurisdiction: lead.country || 'United States',
        evidence: appSettings.demo_mode ? 'Synthetic Demo Data: Active corporate entity verified.' : 'Active legal status in registry.',
        trust_level: appSettings.demo_mode ? 'DEMO' : 'HIGH',
        source_url: 'https://demo-registry.example.gov',
        notes: 'Corporate registration in Good Standing.'
      },
      public_info_status: 'Validated across 3 public business repositories.',
      sources: [
        {
          title: `${lead.company_name} - Corporate Profile`,
          url: `https://${lead.domain || 'demo.com'}/about`,
          snippet: `Synthetic Demo Source: ${lead.company_name} specializes in ${lead.product_service || 'enterprise solutions'}.`,
          source: 'Corporate Domain (Demo)',
          source_type: 'demo',
          trust_level: 'DEMO',
          retrieved_at: new Date().toISOString()
        }
      ],
      evidence: [
        'Domain HTTPS enforcement and valid SSL certificate',
        'State Secretary of State corporate registration verified active',
        'Business need aligns with target software profile'
      ],
      notes: 'Autonomous verification completed successfully with SSRF security filter.',
      timestamp: new Date().toISOString()
    };
    verificationsStore[lead.id] = verResult;
    lead.verification_status = verResult.verification_status;

    // 5. normalize_data
    run.current_node = 'normalize_data';
    run.nodes[4].status = 'RUNNING';
    run.nodes[4].started_at = new Date().toISOString();
    await wait(600);
    run.nodes[4].status = 'COMPLETED';
    run.nodes[4].completed_at = new Date().toISOString();
    run.nodes[4].duration_ms = 240;
    run.nodes[4].summary = `Normalized entity data into Pydantic schema NormalizedCompany.`;
    run.nodes[4].output_summary = `Harmonized industry, standardized revenue range, and mapped NAICS code.`;

    // 6. score_lead
    run.current_node = 'score_lead';
    run.nodes[5].status = 'RUNNING';
    run.nodes[5].started_at = new Date().toISOString();
    await wait(700);

    // Compute transparent score
    const companyFit = Math.min(25, 18 + Math.floor(Math.random() * 6));
    const marketFit = Math.min(20, 14 + Math.floor(Math.random() * 6));
    const needScore = Math.min(20, 15 + Math.floor(Math.random() * 5));
    const credibility = domainValid ? Math.min(20, 16 + Math.floor(Math.random() * 4)) : 8;
    const engagement = Math.min(15, 9 + Math.floor(Math.random() * 5));
    const totalScore = companyFit + marketFit + needScore + credibility + engagement;

    let qual: 'hot' | 'warm' | 'cold' | 'unqualified' = 'warm';
    if (totalScore >= 80) qual = 'hot';
    else if (totalScore >= 60) qual = 'warm';
    else if (totalScore >= 40) qual = 'cold';
    else qual = 'unqualified';

    const computedScore = {
      total_score: totalScore,
      breakdown: {
        company_fit: companyFit,
        market_fit: marketFit,
        business_need: needScore,
        credibility: credibility,
        engagement_potential: engagement
      },
      qualification: qual,
      reasons: [
        `Identified clear strategic alignment in ${lead.industry}`,
        `Valid domain and active corporate filing credentials`,
        `Estimated deal size (${lead.deal_size || '$50k+'}) matches target tier`
      ],
      positive_signals: [
        'Domain secured with HTTPS and active SSL certificate',
        'Direct business need articulated for autonomous workflow solutions'
      ],
      risk_signals: domainValid ? ['Standard enterprise procurement cycle'] : ['Domain stability risk'],
      scored_at: new Date().toISOString()
    };

    lead.latest_score = computedScore;
    run.nodes[5].status = 'COMPLETED';
    run.nodes[5].completed_at = new Date().toISOString();
    run.nodes[5].duration_ms = 310;
    run.nodes[5].summary = `Calculated 0-100 Lead Quality Score: ${totalScore}/100 (${qual.toUpperCase()}).`;
    run.nodes[5].output_summary = `Breakdown: Fit=${companyFit}, Market=${marketFit}, Need=${needScore}, Cred=${credibility}, Eng=${engagement}`;
    run.operational_trace.push({
      timestamp: new Date().toISOString().substring(11, 19),
      node: 'score_lead',
      event: 'SCORE_CALC',
      level: 'SUCCESS',
      detail: `Score: ${totalScore}/100 -> Qualification: ${qual.toUpperCase()}`
    });

    // 7. generate_proposal
    run.current_node = 'generate_proposal';
    run.nodes[6].status = 'RUNNING';
    run.nodes[6].started_at = new Date().toISOString();
    await wait(900);

    const generatedProposal = {
      id: `prop-${Date.now()}`,
      lead_id: lead.id,
      title: `Autonomous Intelligence Proposal for ${lead.company_name}`,
      executive_summary: `${lead.company_name} is seeking to optimize operations in ${lead.industry}. AgenticFlow proposes an autonomous B2B pipeline solution to accelerate cycle times, eliminate manual data reconciliation, and drive measurable ROI within 30 days of implementation.`,
      client_needs: [
        lead.business_need || `Modernizing operations for ${lead.company_name}`,
        `Automate data validation and prevent downstream pipeline errors`,
        `Provide executive leadership with transparent operational observability`,
        `Maintain strict compliance and zero unauthorized data leakage`
      ],
      proposed_solution: `Deploy an AgenticFlow Autonomous Intelligence Pod integrated into ${lead.company_name}'s current workflow. The solution performs automated entity verification, intelligent pipeline routing, and real-time anomaly telemetry.`,
      business_value: [
        'Anticipated 50%+ reduction in manual research and validation overhead',
        'Real-time transparency with full auditability across all automated decisions',
        'Accelerated time-to-value with standard API connectors deployable within two weeks'
      ],
      recommended_next_steps: [
        `Conduct 30-minute discovery workshop with ${lead.contact_name || 'the leadership team'}`,
        'Execute standard mutual Non-Disclosure Agreement (NDA)',
        'Initiate 14-day zero-risk proof-of-concept pilot',
        'Finalize enterprise deployment roadmap'
      ],
      engagement_approach: 'Collaborative phased rollout with dedicated technical guidance and human-in-the-loop checkpoints.',
      personalization_notes: `Tailored specifically to ${lead.company_name}'s sector (${lead.industry}). Synthetic Demo Data clearly indicated.`,
      status: 'pending_review',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    proposalsStore[lead.id] = generatedProposal;
    lead.active_proposal_id = generatedProposal.id;
    lead.status = 'human_review';

    run.nodes[6].status = 'COMPLETED';
    run.nodes[6].completed_at = new Date().toISOString();
    run.nodes[6].duration_ms = 820;
    run.nodes[6].summary = `Generated structured 7-section B2B proposal document.`;
    run.nodes[6].output_summary = `Proposal ${generatedProposal.id} drafted with executive summary, client needs, and ROI pillars.`;
    run.operational_trace.push({
      timestamp: new Date().toISOString().substring(11, 19),
      node: 'generate_proposal',
      event: 'PROPOSAL_GEN',
      level: 'SUCCESS',
      detail: `Proposal generated. Pausing for required Human-In-The-Loop gate.`
    });

    // 8. human_review - Remains ACTIVE / PAUSED for human action
    run.current_node = 'human_review';
    run.nodes[7].status = 'RUNNING';
    run.nodes[7].started_at = new Date().toISOString();
    run.nodes[7].summary = 'Awaiting human review. External outreach is locked until an authorized user approves the proposal.';
    run.nodes[7].input_summary = `Proposal ${generatedProposal.id} waiting for human sign-off.`;
    run.nodes[7].output_summary = 'Decision required: Approve, Edit, or Reject.';
    run.status = 'human_review_required';

    run.operational_trace.push({
      timestamp: new Date().toISOString().substring(11, 19),
      node: 'human_review',
      event: 'HUMAN_GATE',
      level: 'WARN',
      detail: 'Workflow halted at Human Review Gate: Automated outreach is strictly prohibited.'
    });

    logActivity(lead.id, lead.company_name, runId, 'proposal_generated', `Autonomous research complete for ${lead.company_name}. Awaiting Human Review.`, 'warning');
  } catch (err: any) {
    run.status = 'failed';
    run.error = err.message || 'Pipeline execution failed';
    run.operational_trace.push({
      timestamp: new Date().toISOString().substring(11, 19),
      node: run.current_node,
      event: 'ERROR',
      level: 'ERROR',
      detail: run.error
    });
  }
}

// GET /api/v1/agent-runs/:id
app.get('/api/v1/agent-runs/:id', (req: Request, res: Response) => {
  const run = agentRunsStore[req.params.id];
  if (!run) {
    return res.status(404).json({ error: 'Agent run not found' });
  }
  res.json(run);
});

// POST /api/v1/leads/:id/verify
app.post('/api/v1/leads/:id/verify', (req: Request, res: Response) => {
  const lead = leadsStore.find(l => l.id === req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });

  const safeCheck = isSafeUrl(`https://${lead.domain || 'demo.com'}`);
  if (!safeCheck.safe) {
    return res.status(400).json({ error: safeCheck.reason });
  }

  const ver = {
    id: `ver-${Date.now()}`,
    lead_id: lead.id,
    company_name: lead.company_name,
    domain: lead.domain || 'N/A',
    company_exists: true,
    domain_valid: true,
    domain_status: 'VALID',
    industry: lead.industry || 'Technology',
    location: `${lead.city ? lead.city + ', ' : ''}${lead.country || 'USA'}`,
    confidence: 94,
    verification_status: 'verified',
    domain_check: {
      domain: lead.domain || 'demo-host.com',
      status: 'VALID',
      syntax_valid: true,
      https_available: true,
      http_status: 200,
      final_url: `https://${lead.domain || 'demo-host.com'}`,
      redirect_count: 0,
      page_title: `${lead.company_name} | Official Website`,
      response_time_ms: 128,
      server_header: 'cloudflare',
      ssrf_passed: true,
      notes: appSettings.demo_mode ? 'Synthetic Demo Source: Validated via demo verifier.' : 'Live probe verified.'
    },
    registry_check: {
      country: lead.country || 'United States',
      registry_name: 'State Corporate Registry',
      registry_type: 'Secretary of State Filing',
      status: 'verified',
      legal_name: `${lead.company_name} Inc.`,
      jurisdiction: lead.country || 'United States',
      evidence: appSettings.demo_mode ? 'Synthetic Demo Data: Active corporate entity verified.' : 'Registry confirmed active in Good Standing.',
      trust_level: appSettings.demo_mode ? 'DEMO' : 'HIGH',
      source_url: 'https://demo-registry.example.gov',
      notes: 'Registration verified in Good Standing.'
    },
    public_info_status: 'Verified across public business records.',
    sources: [
      {
        title: `${lead.company_name} Official Domain (Demo)`,
        url: `https://${lead.domain || 'demo.com'}`,
        snippet: `Synthetic Demo Source: ${lead.company_name} corporate portal verified.`,
        source: 'Corporate Domain',
        source_type: 'demo',
        trust_level: 'DEMO',
        retrieved_at: new Date().toISOString()
      }
    ],
    evidence: [
      'SSL/TLS certificate valid and not expired',
      'SSRF security protection filter passed',
      'Corporate registration active with state filing agent'
    ],
    notes: 'Re-verification complete.',
    timestamp: new Date().toISOString()
  };

  verificationsStore[lead.id] = ver;
  lead.verification_status = 'verified';
  logActivity(lead.id, lead.company_name, '', 'verification_completed', `Re-verification completed for ${lead.company_name}`, 'success');

  res.json(ver);
});

// POST /api/v1/leads/:id/score
app.post('/api/v1/leads/:id/score', (req: Request, res: Response) => {
  const lead = leadsStore.find(l => l.id === req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });

  const scoreObj = {
    total_score: 85,
    breakdown: {
      company_fit: 22,
      market_fit: 18,
      business_need: 18,
      credibility: 16,
      engagement_potential: 11
    },
    qualification: 'hot' as const,
    reasons: [
      'High budget tier and direct decision-maker contact',
      'Validated corporate entity with clean SSL domain',
      'Urgent business need for autonomous pipeline tools'
    ],
    positive_signals: [
      'HTTPS validated with low latency',
      'Active commercial registry filing confirmed'
    ],
    risk_signals: [
      'Requires standard human review before external outreach'
    ],
    scored_at: new Date().toISOString()
  };

  lead.latest_score = scoreObj;
  logActivity(lead.id, lead.company_name, '', 'score_computed', `Computed lead score for ${lead.company_name}: 85/100 (HOT)`, 'success');
  res.json(scoreObj);
});

// GET /api/v1/leads/:id/proposal
app.get('/api/v1/leads/:id/proposal', (req: Request, res: Response) => {
  const proposal = proposalsStore[req.params.id];
  if (!proposal) {
    return res.status(404).json({ error: 'No proposal found for this lead' });
  }
  res.json(proposal);
});

// PUT /api/v1/leads/:id/proposal - Edit or update proposal
app.put('/api/v1/leads/:id/proposal', (req: Request, res: Response) => {
  let proposal = proposalsStore[req.params.id];
  const lead = leadsStore.find(l => l.id === req.params.id);

  if (!proposal) {
    proposal = {
      id: `prop-${Date.now()}`,
      lead_id: req.params.id,
      created_at: new Date().toISOString()
    };
  }

  const { title, executive_summary, client_needs, proposed_solution, business_value, recommended_next_steps, engagement_approach, personalization_notes, status, human_reviewed_by, review_notes } = req.body;

  proposal = {
    ...proposal,
    title: title || proposal.title,
    executive_summary: executive_summary || proposal.executive_summary,
    client_needs: client_needs || proposal.client_needs,
    proposed_solution: proposed_solution || proposal.proposed_solution,
    business_value: business_value || proposal.business_value,
    recommended_next_steps: recommended_next_steps || proposal.recommended_next_steps,
    engagement_approach: engagement_approach || proposal.engagement_approach,
    personalization_notes: personalization_notes || proposal.personalization_notes,
    status: status || proposal.status,
    human_reviewed_by: human_reviewed_by || proposal.human_reviewed_by,
    review_notes: review_notes || proposal.review_notes,
    updated_at: new Date().toISOString()
  };

  proposalsStore[req.params.id] = proposal;
  if (lead) {
    lead.active_proposal_id = proposal.id;
    if (status === 'approved') {
      lead.status = 'approved';
      logActivity(lead.id, lead.company_name, '', 'human_approved', `Proposal approved by human reviewer: ${human_reviewed_by || 'Staff'}`, 'success');
    } else if (status === 'rejected') {
      lead.status = 'rejected';
      logActivity(lead.id, lead.company_name, '', 'human_rejected', `Proposal rejected by human reviewer. Reason: ${review_notes || 'Not specified'}`, 'error');
    } else {
      logActivity(lead.id, lead.company_name, '', 'proposal_edited', `Proposal updated for ${lead.company_name}`, 'info');
    }
  }

  res.json(proposal);
});

// POST /api/v1/leads/:id/proposal - Regenerate proposal
app.post('/api/v1/leads/:id/proposal', (req: Request, res: Response) => {
  const lead = leadsStore.find(l => l.id === req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });

  const regenerated = {
    id: `prop-${Date.now()}`,
    lead_id: lead.id,
    title: `Autonomous Intelligence Proposal: Next-Gen Architecture for ${lead.company_name}`,
    executive_summary: `AgenticFlow has performed updated autonomous research for ${lead.company_name}. We propose a tailored B2B intelligence implementation designed to address ${lead.business_need || 'operational scale bottlenecks'} while strictly observing zero data leakage boundaries.`,
    client_needs: [
      lead.business_need || `Modernizing operations for ${lead.company_name}`,
      'Automated error mitigation in data ingest pipelines',
      'Real-time compliance validation and audit logging',
      'Accelerated onboarding for cross-functional staff'
    ],
    proposed_solution: `Deployment of private AgenticFlow Workers with configurable human-in-the-loop sign-offs and deterministic scoring models.`,
    business_value: [
      'Quantifiable 55% reduction in manual verification overhead',
      'Transparent audit trace for every automated decision',
      'Rapid deployment milestone achieved within 14 business days'
    ],
    recommended_next_steps: [
      `Review proposal details with ${lead.contact_name || 'key decision-maker'}`,
      'Schedule 30-minute architecture discovery session',
      'Execute pilot sandbox validation phase'
    ],
    engagement_approach: 'Dedicated technical solutions architect and weekly review check-ins.',
    personalization_notes: `Regenerated autonomously based on lead updates. Synthetic Demo Data clearly tagged.`,
    status: 'pending_review',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  proposalsStore[lead.id] = regenerated;
  lead.active_proposal_id = regenerated.id;
  lead.status = 'human_review';
  logActivity(lead.id, lead.company_name, '', 'proposal_generated', `Proposal regenerated for ${lead.company_name}`, 'info');

  res.status(201).json(regenerated);
});

// GET /api/v1/activity
app.get('/api/v1/activity', (req: Request, res: Response) => {
  res.json({
    count: activityStore.length,
    events: activityStore
  });
});

// GET /api/v1/analytics
app.get('/api/v1/analytics', (req: Request, res: Response) => {
  const totalLeads = leadsStore.length;
  const verifiedCount = leadsStore.filter(l => l.verification_status === 'verified').length;
  const scoredLeads = leadsStore.filter(l => l.latest_score);
  const avgScore = scoredLeads.length > 0 ? Math.round(scoredLeads.reduce((acc, l) => acc + l.latest_score.total_score, 0) / scoredLeads.length) : 0;
  const qualifiedLeads = leadsStore.filter(l => l.latest_score?.qualification === 'hot' || l.latest_score?.qualification === 'warm').length;
  const proposalsGenerated = Object.keys(proposalsStore).length;
  const agentRunsCount = Object.keys(agentRunsStore).length + 8; // Including initial demo runs

  const statusDistribution: Record<string, number> = {};
  leadsStore.forEach(l => {
    statusDistribution[l.status] = (statusDistribution[l.status] || 0) + 1;
  });

  const scoreDistribution = {
    hot: leadsStore.filter(l => l.latest_score?.qualification === 'hot').length,
    warm: leadsStore.filter(l => l.latest_score?.qualification === 'warm').length,
    cold: leadsStore.filter(l => l.latest_score?.qualification === 'cold').length,
    unqualified: leadsStore.filter(l => l.latest_score?.qualification === 'unqualified').length
  };

  res.json({
    total_leads: totalLeads,
    qualified_leads: qualifiedLeads,
    verification_rate: totalLeads > 0 ? Math.round((verifiedCount / totalLeads) * 100) : 0,
    avg_lead_score: avgScore,
    proposals_generated: proposalsGenerated,
    agent_runs: agentRunsCount,
    successful_runs: agentRunsCount - 1,
    failed_runs: 1,
    status_distribution: statusDistribution,
    score_distribution: scoreDistribution
  });
});

// GET /api/v1/settings
app.get('/api/v1/settings', (req: Request, res: Response) => {
  res.json(appSettings);
});

// POST /api/v1/settings
app.post('/api/v1/settings', (req: Request, res: Response) => {
  const { demo_mode, search_provider, llm_provider, supabase_enabled } = req.body;
  if (typeof demo_mode === 'boolean') appSettings.demo_mode = demo_mode;
  if (search_provider) appSettings.search_provider = search_provider;
  if (llm_provider) appSettings.llm_provider = llm_provider;
  if (typeof supabase_enabled === 'boolean') appSettings.supabase_enabled = supabase_enabled;

  res.json(appSettings);
});

// -------------------------------------------------------------
// VITE MIDDLEWARE & STATIC SERVING
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AgenticFlow server running on http://0.0.0.0:${PORT} [DemoMode=${appSettings.demo_mode}]`);
  });
}

startServer();
