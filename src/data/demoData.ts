import {
  Lead,
  CompanyVerification,
  LeadScore,
  Proposal,
  AgentRun,
  ActivityEvent,
  SourceCitation
} from '../types/index.ts';

export const DEMO_NOTICE = 'Synthetic Demo Source - For AgenticFlow portfolio evaluation only.';

export const INITIAL_LEADS: Lead[] = [
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
      breakdown: {
        company_fit: 23,
        market_fit: 19,
        business_need: 18,
        credibility: 17,
        engagement_potential: 11
      },
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
      breakdown: {
        company_fit: 20,
        market_fit: 16,
        business_need: 15,
        credibility: 14,
        engagement_potential: 9
      },
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
      breakdown: {
        company_fit: 24,
        market_fit: 19,
        business_need: 19,
        credibility: 18,
        engagement_potential: 12
      },
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
      breakdown: {
        company_fit: 17,
        market_fit: 14,
        business_need: 13,
        credibility: 12,
        engagement_potential: 8
      },
      qualification: 'warm',
      reasons: [
        'Clear measurable ROI metric (fuel cost reduction)',
        'Domain validation confirmed redirect to active portal',
        'Verified carrier licensing in USDOT FMCSA records'
      ],
      positive_signals: [
        'Strong immediate operational problem with quantified waste'
      ],
      risk_signals: [
        'Driver onboarding adoption speed is a known operational bottleneck'
      ],
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
      breakdown: {
        company_fit: 21,
        market_fit: 18,
        business_need: 17,
        credibility: 16,
        engagement_potential: 10
      },
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
      breakdown: {
        company_fit: 14,
        market_fit: 11,
        business_need: 12,
        credibility: 9,
        engagement_potential: 6
      },
      qualification: 'cold',
      reasons: [
        'Domain is responsive with high-grade TLS',
        'Registry verification is partially verified due to ambiguous subsidiary structure',
        'Sub-tier revenue bracket ($5M-$10M)'
      ],
      positive_signals: [
        'Direct technical interest in container runtime security telemetry'
      ],
      risk_signals: [
        'Legal registration entity requires manual clerk confirmation',
        'Budget authority unclear; contact is operations level not VP/C-suite'
      ],
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
      breakdown: {
        company_fit: 21,
        market_fit: 17,
        business_need: 16,
        credibility: 15,
        engagement_potential: 10
      },
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
      risk_signals: [
        'Subject to complex ERCOT market interconnection regulations'
      ],
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
      breakdown: {
        company_fit: 8,
        market_fit: 7,
        business_need: 6,
        credibility: 8,
        engagement_potential: 5
      },
      qualification: 'unqualified',
      reasons: [
        'Company size below minimum target threshold (solo practitioner)',
        'Domain returned HTTP 502 gateway error and lacked valid corporate mail exchanger',
        'Deal size ($5,000) does not meet minimum contract value for autonomous pipeline'
      ],
      positive_signals: [
        'None identified'
      ],
      risk_signals: [
        'Domain DNS instability / unreachable host',
        'No verified legal registration found in Washington state database'
      ],
      scored_at: '2026-09-12T10:04:10Z'
    }
  }
];

export const DEMO_VERIFICATIONS: Record<string, CompanyVerification> = {
  'lead-001': {
    id: 'ver-001',
    lead_id: 'lead-001',
    company_name: 'Northstar Analytics',
    domain: 'northstar-analytics-demo.io',
    company_exists: true,
    domain_valid: true,
    domain_status: 'VALID',
    industry: 'Enterprise Software & Cloud Data',
    location: 'San Francisco, CA, USA',
    confidence: 96,
    verification_status: 'verified',
    domain_check: {
      domain: 'northstar-analytics-demo.io',
      status: 'VALID',
      syntax_valid: true,
      https_available: true,
      http_status: 200,
      final_url: 'https://northstar-analytics-demo.io',
      redirect_count: 1,
      page_title: 'Northstar Analytics | Enterprise Observability & Pipeline Intelligence',
      response_time_ms: 142,
      server_header: 'cloudflare',
      ssrf_passed: true,
      notes: 'Synthetic Demo Source: Probed synthetic host. TLS 1.3 negotiated with valid Let\'s Encrypt demo cert.'
    },
    registry_check: {
      country: 'United States',
      registry_name: 'California Secretary of State Business Registry',
      registry_type: 'State Corporate Registry',
      status: 'verified',
      legal_name: 'Northstar Analytics Inc.',
      jurisdiction: 'Delaware / California Foreign Corporation',
      evidence: 'Synthetic Demo Data: Active status filing C4912084. Entity in good standing since 2021.',
      trust_level: 'DEMO',
      source_url: 'https://demo-registry.example.gov/corp/c4912084',
      notes: 'Synthetic registry record created for AgenticFlow demo verification.'
    },
    public_info_status: 'Verified across 4 public repositories and technical conference proceedings.',
    sources: [
      {
        title: 'Northstar Analytics - Enterprise Observability',
        url: 'https://northstar-analytics-demo.io/about',
        snippet: 'Synthetic Demo Source: Northstar Analytics delivers autonomous data lake telemetry for Fortune 500 engineering teams.',
        source: 'Official Corporate Domain (Demo)',
        source_type: 'demo',
        trust_level: 'DEMO',
        retrieved_at: '2026-09-08T14:21:10Z'
      },
      {
        title: 'California Secretary of State Corporate Search (Demo)',
        url: 'https://bizfileonline.demo.ca.gov/search/c4912084',
        snippet: 'Synthetic Demo Data: Northstar Analytics Inc. Active Status. Principal Address: San Francisco, CA.',
        source: 'Government Business Registry (Demo)',
        source_type: 'demo',
        trust_level: 'DEMO',
        retrieved_at: '2026-09-08T14:21:40Z'
      },
      {
        title: 'Cloud Data Architecture Directory (Demo)',
        url: 'https://directories.demo.example.com/northstar',
        snippet: 'Synthetic Demo Source: Listed vendor in 2026 Modern Data Stack Radar report.',
        source: 'Established Business Directory (Demo)',
        source_type: 'demo',
        trust_level: 'DEMO',
        retrieved_at: '2026-09-08T14:22:15Z'
      }
    ],
    evidence: [
      'DNS records match legitimate Cloudflare nameservers with configured SPF/DKIM',
      'Corporate registration active with verified registered agent in Sacramento',
      'VP of Data Engineering Elena Rostova verified on LinkedIn & conference speaker program'
    ],
    notes: 'Clear entity integrity with strong domain trust profile. High confidence for executive outreach.',
    timestamp: '2026-09-08T14:22:45Z'
  },
  'lead-003': {
    id: 'ver-003',
    lead_id: 'lead-003',
    company_name: 'Summit Health Systems',
    domain: 'summit-health-demo.org',
    company_exists: true,
    domain_valid: true,
    domain_status: 'VALID',
    industry: 'Healthcare Technology & Clinics',
    location: 'Denver, CO, USA',
    confidence: 98,
    verification_status: 'verified',
    domain_check: {
      domain: 'summit-health-demo.org',
      status: 'VALID',
      syntax_valid: true,
      https_available: true,
      http_status: 200,
      final_url: 'https://summit-health-demo.org',
      redirect_count: 0,
      page_title: 'Summit Health Systems | Integrated Regional Ambulatory Network',
      response_time_ms: 118,
      server_header: 'nginx',
      ssrf_passed: true,
      notes: 'Synthetic Demo Source: Valid domain with strict HSTS, CSP, and DNSSEC protection.'
    },
    registry_check: {
      country: 'United States',
      registry_name: 'Colorado Secretary of State Non-Profit & Healthcare Registry',
      registry_type: 'State Registry',
      status: 'verified',
      legal_name: 'Summit Health Systems Foundation',
      jurisdiction: 'Colorado Non-Profit Healthcare Entity',
      evidence: 'Synthetic Demo Data: Active non-profit healthcare organization ID 20181920391.',
      trust_level: 'DEMO',
      source_url: 'https://demo-registry.colorado.gov/health/20181920391',
      notes: 'Synthetic registry record demonstrating compliance verification.'
    },
    public_info_status: 'Accredited healthcare provider listed in regional clinical health board listings.',
    sources: [
      {
        title: 'Summit Health Systems Clinical Network (Demo)',
        url: 'https://summit-health-demo.org/clinics',
        snippet: 'Synthetic Demo Source: Operating 42 outpatient ambulatory clinical locations throughout the Mountain West.',
        source: 'Official Corporate Domain (Demo)',
        source_type: 'demo',
        trust_level: 'DEMO',
        retrieved_at: '2026-09-10T11:01:20Z'
      },
      {
        title: 'Colorado Non-Profit Health Registry (Demo)',
        url: 'https://demo-registry.colorado.gov/health/20181920391',
        snippet: 'Synthetic Demo Data: Summit Health Systems Foundation - Good Standing since 2018.',
        source: 'State Government Registry (Demo)',
        source_type: 'demo',
        trust_level: 'DEMO',
        retrieved_at: '2026-09-10T11:02:00Z'
      }
    ],
    evidence: [
      'Verified federal NPI / clinical taxonomy registry cross-reference',
      'HSTS Preloaded domain with strict healthcare security headers',
      'CIO Dr. Alistair Chen confirmed author of published FHIR interoperability whitepapers'
    ],
    notes: 'Exemplary clinical credibility. Rigorous privacy compliance controls required.',
    timestamp: '2026-09-10T11:02:45Z'
  }
};

export const DEMO_PROPOSALS: Record<string, Proposal> = {
  'prop-001': {
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
  'prop-003': {
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
  'prop-005': {
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
    proposed_solution: 'Deploy AgenticFlow Catalog Intelligence Workers with deterministic schema matching and rate-limited web verification for vendor specification validation. Seamlessly push enriched items to Apex\'s headless GraphQL catalog gateway.',
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

export const DEMO_AGENT_RUNS: AgentRun[] = [
  {
    id: 'run-001',
    lead_id: 'lead-001',
    company_name: 'Northstar Analytics',
    status: 'completed',
    current_node: 'human_review',
    started_at: '2026-09-08T14:20:15Z',
    completed_at: '2026-09-08T14:24:20Z',
    duration_ms: 4050,
    operational_trace: [
      { timestamp: '14:20:15', node: 'input_lead', event: 'INIT_STATE', level: 'INFO', detail: 'Initialized Typed AgentState with Company=Northstar Analytics, Domain=northstar-analytics-demo.io' },
      { timestamp: '14:20:18', node: 'search_company', event: 'TOOL_EXEC', level: 'INFO', detail: 'Executed DemoSearchProvider with query: "Northstar Analytics enterprise observability"' },
      { timestamp: '14:20:20', node: 'search_company', event: 'SEARCH_OK', level: 'SUCCESS', detail: 'Retrieved 3 synthetic citations (official, business directory, industry index)' },
      { timestamp: '14:20:23', node: 'verify_domain', event: 'SSRF_PROBE', level: 'INFO', detail: 'SSRF guard passed: host validated, non-routable IP blocks rejected' },
      { timestamp: '14:20:25', node: 'verify_domain', event: 'DOMAIN_OK', level: 'SUCCESS', detail: 'HTTPS 200 OK, latency 142ms, Server=Cloudflare, TLS 1.3 verified' },
      { timestamp: '14:20:27', node: 'verify_registry', event: 'REGISTRY_QUERY', level: 'INFO', detail: 'Queried DemoRegistryProvider for US-CA Secretary of State active filing' },
      { timestamp: '14:20:30', node: 'verify_registry', event: 'REGISTRY_OK', level: 'SUCCESS', detail: 'Matched active corporation entity C4912084 in Good Standing' },
      { timestamp: '14:20:32', node: 'normalize_data', event: 'NORMALIZATION', level: 'INFO', detail: 'Standardized legal entity name, NAICS code 541512, and clean headquarters' },
      { timestamp: '14:20:35', node: 'score_lead', event: 'SCORE_CALC', level: 'SUCCESS', detail: 'Scored 88/100 (HOT). CompanyFit=23, MarketFit=19, Need=18, Cred=17, Eng=11' },
      { timestamp: '14:20:38', node: 'generate_proposal', event: 'PROPOSAL_GEN', level: 'SUCCESS', detail: 'Structured proposal drafted via DemoLLMProvider with 4 client needs and 4 ROI pillars' },
      { timestamp: '14:20:40', node: 'human_review', event: 'PAUSE_REVIEW', level: 'WARN', detail: 'Workflow paused: Human-In-The-Loop review required before outreach' }
    ],
    nodes: [
      {
        id: 'node-1',
        node_name: 'input_lead',
        display_name: 'Lead Input',
        status: 'COMPLETED',
        started_at: '2026-09-08T14:20:15Z',
        completed_at: '2026-09-08T14:20:17Z',
        duration_ms: 180,
        tool_used: 'SchemaValidator',
        summary: 'Parsed and validated initial lead parameters for Northstar Analytics.',
        input_summary: 'Raw intake: Northstar Analytics, northstar-analytics-demo.io, Enterprise Software',
        output_summary: 'Validated LeadInput model with sanitized domain and assigned unique run ID.'
      },
      {
        id: 'node-2',
        node_name: 'search_company',
        display_name: 'Company Search',
        status: 'COMPLETED',
        started_at: '2026-09-08T14:20:17Z',
        completed_at: '2026-09-08T14:20:22Z',
        duration_ms: 620,
        tool_used: 'DemoSearchProvider',
        summary: 'Discovered 3 verified synthetic citations with high source trust rating.',
        input_summary: 'Query: "Northstar Analytics enterprise observability"',
        output_summary: '3 citations gathered. Official domain, business directory, modern data stack listing.'
      },
      {
        id: 'node-3',
        node_name: 'verify_domain',
        display_name: 'Domain Verification',
        status: 'COMPLETED',
        started_at: '2026-09-08T14:20:22Z',
        completed_at: '2026-09-08T14:20:26Z',
        duration_ms: 450,
        tool_used: 'SSRFProtectedDomainVerifier',
        summary: 'Domain is active, HTTPS-enabled, responds with 200 OK in 142ms.',
        input_summary: 'Domain: northstar-analytics-demo.io',
        output_summary: 'Syntax valid, SSL valid, Cloudflare CDN detected, SSRF protection verified.'
      },
      {
        id: 'node-4',
        node_name: 'verify_registry',
        display_name: 'Registry Verification',
        status: 'COMPLETED',
        started_at: '2026-09-08T14:20:26Z',
        completed_at: '2026-09-08T14:20:31Z',
        duration_ms: 540,
        tool_used: 'DemoRegistryProvider (US-CA)',
        summary: 'Active corporate entity confirmed in California Secretary of State records.',
        input_summary: 'Company: Northstar Analytics Inc, Jurisdiction: US-CA',
        output_summary: 'Entity C4912084 confirmed active in Good Standing. Synthetic demo evidence noted.'
      },
      {
        id: 'node-5',
        node_name: 'normalize_data',
        display_name: 'Data Normalization',
        status: 'COMPLETED',
        started_at: '2026-09-08T14:20:31Z',
        completed_at: '2026-09-08T14:20:34Z',
        duration_ms: 290,
        tool_used: 'CompanyEntityNormalizer',
        summary: 'Harmonized corporate records, NAICS 541512 classification, and verified tech stack.',
        input_summary: 'Aggregated company data from search and state registries',
        output_summary: 'NormalizedCompany model output with sanitized headquarters and decision-maker records.'
      },
      {
        id: 'node-6',
        node_name: 'score_lead',
        display_name: 'Lead Quality Scoring',
        status: 'COMPLETED',
        started_at: '2026-09-08T14:20:34Z',
        completed_at: '2026-09-08T14:20:37Z',
        duration_ms: 310,
        tool_used: 'DeterministicScoringEngine',
        summary: 'Calculated 88/100 score; classified as HOT enterprise opportunity.',
        input_summary: 'Normalized attributes: $40M-$60M ARR, 250-500 headcount, VP level buyer',
        output_summary: 'CompanyFit=23/25, MarketFit=19/20, Need=18/20, Credibility=17/20, Engagement=11/15.'
      },
      {
        id: 'node-7',
        node_name: 'generate_proposal',
        display_name: 'Proposal Generation',
        status: 'COMPLETED',
        started_at: '2026-09-08T14:20:37Z',
        completed_at: '2026-09-08T14:20:40Z',
        duration_ms: 850,
        tool_used: 'DemoLLMProvider / GeminiBridge',
        summary: 'Generated 7-section enterprise B2B proposal document targeting telemetry consolidation.',
        input_summary: 'Lead profile, verified pain points, scoring highlights',
        output_summary: 'Structured Proposal object created with executive summary, solution architecture, and steps.'
      },
      {
        id: 'node-8',
        node_name: 'human_review',
        display_name: 'Human Review',
        status: 'RUNNING',
        started_at: '2026-09-08T14:20:40Z',
        completed_at: undefined,
        duration_ms: undefined,
        tool_used: 'HumanInTheLoopGuard',
        summary: 'Awaiting human review. Autonomous outreach paused for manual approval.',
        input_summary: 'Proposal prop-001 ready for human sign-off',
        output_summary: 'Gate status: Pending reviewer action (Approve, Edit, Reject, Export).'
      }
    ]
  },
  {
    id: 'run-003',
    lead_id: 'lead-003',
    company_name: 'Summit Health Systems',
    status: 'human_review_required',
    current_node: 'human_review',
    started_at: '2026-09-10T11:00:10Z',
    completed_at: '2026-09-10T11:04:12Z',
    duration_ms: 4200,
    operational_trace: [
      { timestamp: '11:00:10', node: 'input_lead', event: 'INIT_STATE', level: 'INFO', detail: 'Intake: Summit Health Systems, clinical EHR interoperability' },
      { timestamp: '11:00:15', node: 'search_company', event: 'SEARCH_OK', level: 'SUCCESS', detail: 'Found 4 regional healthcare network references' },
      { timestamp: '11:00:20', node: 'verify_domain', event: 'DOMAIN_OK', level: 'SUCCESS', detail: 'Domain summit-health-demo.org verified, HSTS preloaded' },
      { timestamp: '11:00:24', node: 'verify_registry', event: 'REGISTRY_OK', level: 'SUCCESS', detail: 'Colorado Non-profit registry record 20181920391 confirmed' },
      { timestamp: '11:00:28', node: 'normalize_data', event: 'NORMALIZATION', level: 'INFO', detail: 'Entity normalized to NAICS 621498 (Ambulatory Clinic Center)' },
      { timestamp: '11:00:32', node: 'score_lead', event: 'SCORE_CALC', level: 'SUCCESS', detail: 'Calculated 92/100 (HOT). High executive intent and budget' },
      { timestamp: '11:00:36', node: 'generate_proposal', event: 'PROPOSAL_GEN', level: 'SUCCESS', detail: 'Proposal drafted for 42-clinic FHIR interoperability lake' },
      { timestamp: '11:00:40', node: 'human_review', event: 'PAUSE_REVIEW', level: 'WARN', detail: 'Human review gate triggered: HIPAA compliance terms requires specialist signoff' }
    ],
    nodes: [
      {
        id: 'node-301',
        node_name: 'input_lead',
        display_name: 'Lead Input',
        status: 'COMPLETED',
        started_at: '2026-09-10T11:00:10Z',
        completed_at: '2026-09-10T11:00:12Z',
        duration_ms: 190,
        tool_used: 'SchemaValidator',
        summary: 'Intake validated with high-priority healthcare flag.',
        input_summary: 'Summit Health Systems, Dr. Alistair Chen CIO',
        output_summary: 'Validated lead input state.'
      },
      {
        id: 'node-302',
        node_name: 'search_company',
        display_name: 'Company Search',
        status: 'COMPLETED',
        started_at: '2026-09-10T11:00:12Z',
        completed_at: '2026-09-10T11:00:16Z',
        duration_ms: 580,
        tool_used: 'DemoSearchProvider',
        summary: 'Found 4 hospital and clinic system citations.',
        input_summary: 'Query: Summit Health Systems Denver healthcare network',
        output_summary: 'Retrieved verified healthcare registry and domain links.'
      },
      {
        id: 'node-303',
        node_name: 'verify_domain',
        display_name: 'Domain Verification',
        status: 'COMPLETED',
        started_at: '2026-09-10T11:00:16Z',
        completed_at: '2026-09-10T11:00:20Z',
        duration_ms: 410,
        tool_used: 'SSRFProtectedDomainVerifier',
        summary: 'Domain active, HTTPS 200 OK, strict security headers.',
        input_summary: 'summit-health-demo.org',
        output_summary: 'HSTS enabled, zero redirects, 118ms latency.'
      },
      {
        id: 'node-304',
        node_name: 'verify_registry',
        display_name: 'Registry Verification',
        status: 'COMPLETED',
        started_at: '2026-09-10T11:00:20Z',
        completed_at: '2026-09-10T11:00:25Z',
        duration_ms: 610,
        tool_used: 'DemoRegistryProvider',
        summary: 'Active non-profit healthcare foundation verified with Colorado SOS.',
        input_summary: 'Summit Health Systems Foundation, Colorado',
        output_summary: 'Entity ID 20181920391 confirmed active.'
      },
      {
        id: 'node-305',
        node_name: 'normalize_data',
        display_name: 'Data Normalization',
        status: 'COMPLETED',
        started_at: '2026-09-10T11:00:25Z',
        completed_at: '2026-09-10T11:00:28Z',
        duration_ms: 270,
        tool_used: 'CompanyEntityNormalizer',
        summary: 'Standardized healthcare taxonomy and clinic network size.',
        input_summary: 'Clinical facility count: 42 clinics',
        output_summary: 'Normalized company entity model.'
      },
      {
        id: 'node-306',
        node_name: 'score_lead',
        display_name: 'Lead Quality Scoring',
        status: 'COMPLETED',
        started_at: '2026-09-10T11:00:28Z',
        completed_at: '2026-09-10T11:00:31Z',
        duration_ms: 320,
        tool_used: 'DeterministicScoringEngine',
        summary: 'Scored 92/100 (HOT) — Tier 1 strategic enterprise priority.',
        input_summary: '200M+ revenue, 1000-5000 headcount, CIO buyer',
        output_summary: 'High fit, high credibility, urgent regulatory deadline.'
      },
      {
        id: 'node-307',
        node_name: 'generate_proposal',
        display_name: 'Proposal Generation',
        status: 'COMPLETED',
        started_at: '2026-09-10T11:00:31Z',
        completed_at: '2026-09-10T11:00:35Z',
        duration_ms: 910,
        tool_used: 'DemoLLMProvider / GeminiBridge',
        summary: 'Drafted FHIR Interoperability Lake proposal document.',
        input_summary: 'Lead 003 attributes and clinical requirements',
        output_summary: 'Structured proposal created with BAA safety requirements.'
      },
      {
        id: 'node-308',
        node_name: 'human_review',
        display_name: 'Human Review',
        status: 'RUNNING',
        started_at: '2026-09-10T11:00:35Z',
        completed_at: undefined,
        duration_ms: undefined,
        tool_used: 'HumanInTheLoopGuard',
        summary: 'Awaiting human review and compliance signoff.',
        input_summary: 'Proposal prop-003 pending human evaluation',
        output_summary: 'Status: Pending human approval.'
      }
    ]
  }
];

export const DEMO_ACTIVITY_EVENTS: ActivityEvent[] = [
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
