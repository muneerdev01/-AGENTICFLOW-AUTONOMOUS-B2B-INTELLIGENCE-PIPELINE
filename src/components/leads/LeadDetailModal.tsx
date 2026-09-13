import React, { useState } from 'react';
import {
  X,
  Building,
  ShieldCheck,
  Target,
  FileText,
  Workflow,
  ExternalLink,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Globe,
  Mail,
  Linkedin,
  MapPin,
  Users,
  DollarSign
} from 'lucide-react';
import { Lead, CompanyVerification, Proposal, AgentRun } from '../../types/index.ts';

interface LeadDetailModalProps {
  lead: Lead;
  verification?: CompanyVerification | null;
  proposal?: Proposal | null;
  latestRun?: AgentRun | null;
  onClose: () => void;
  onRunAgent: (leadId: string) => void;
  onOpenProposal: (lead: Lead) => void;
  onApprove: (leadId: string) => void;
  onReject: (leadId: string) => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  verification,
  proposal,
  latestRun,
  onClose,
  onRunAgent,
  onOpenProposal,
  onApprove,
  onReject
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'verification' | 'scoring' | 'proposal' | 'runs'>('overview');

  const score = lead.latest_score;

  return (
    <div
      id="lead-detail-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-semibold text-slate-100">{lead.company_name}</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {lead.status.replace(/_/g, ' ').toUpperCase()}
                </span>
                {score && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                      score.total_score >= 80
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : score.total_score >= 60
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : score.total_score >= 40
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {score.total_score} PTS ({score.qualification.toUpperCase()})
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-400 mt-0.5">
                <span>{lead.industry}</span>
                {lead.domain && (
                  <a
                    href={`https://${lead.domain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1 text-indigo-400 hover:text-indigo-300"
                  >
                    <span>{lead.domain}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-5 border-b border-slate-800 flex space-x-6 text-xs font-medium bg-slate-900/20">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-indigo-500 text-indigo-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview & Context
          </button>

          <button
            onClick={() => setActiveTab('verification')}
            className={`py-3 border-b-2 flex items-center space-x-1.5 transition-colors ${
              activeTab === 'verification'
                ? 'border-indigo-500 text-indigo-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verification Details</span>
          </button>

          <button
            onClick={() => setActiveTab('scoring')}
            className={`py-3 border-b-2 flex items-center space-x-1.5 transition-colors ${
              activeTab === 'scoring'
                ? 'border-indigo-500 text-indigo-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Score Breakdown</span>
          </button>

          <button
            onClick={() => setActiveTab('proposal')}
            className={`py-3 border-b-2 flex items-center space-x-1.5 transition-colors ${
              activeTab === 'proposal'
                ? 'border-indigo-500 text-indigo-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Proposal</span>
          </button>

          <button
            onClick={() => setActiveTab('runs')}
            className={`py-3 border-b-2 flex items-center space-x-1.5 transition-colors ${
              activeTab === 'runs'
                ? 'border-indigo-500 text-indigo-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>Agent Runs</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-mono block">Headquarters</span>
                  <span className="font-medium text-slate-200 mt-1 block">
                    {lead.city ? `${lead.city}, ` : ''}{lead.country}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-mono block">Headcount</span>
                  <span className="font-medium text-slate-200 mt-1 block">{lead.company_size || '100-250 employees'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-mono block">Annual Revenue</span>
                  <span className="font-medium text-slate-200 mt-1 block">{lead.revenue_range || '$20M - $50M'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-mono block">Target Deal Size</span>
                  <span className="font-medium text-emerald-400 mt-1 block font-mono">{lead.deal_size || '$80,000 / yr'}</span>
                </div>
              </div>

              {/* Primary Contact Card */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">
                  Primary Decision Maker
                </span>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-200 text-sm">{lead.contact_name || 'Executive Stakeholder'}</h4>
                    <p className="text-slate-400">{lead.contact_title || 'VP of Operations'}</p>
                  </div>
                  <div className="flex items-center space-x-3 text-slate-400">
                    {lead.email && (
                      <a href={`mailto:${lead.email}`} className="hover:text-indigo-400 flex items-center space-x-1">
                        <Mail className="w-4 h-4" />
                        <span>{lead.email}</span>
                      </a>
                    )}
                    {lead.linkedin_url && (
                      <a href={lead.linkedin_url} target="_blank" rel="noreferrer" className="hover:text-indigo-400">
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Business Need */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">
                  Identified Business Need & Pain Points
                </span>
                <p className="text-slate-200 leading-relaxed">
                  {lead.business_need || 'Modernizing real-time telemetry processing, reducing infrastructure cycle times, and establishing verified zero-defect compliance.'}
                </p>
              </div>

              {lead.notes && (
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 text-slate-300">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Qualification Notes</span>
                  {lead.notes}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: VERIFICATION */}
          {activeTab === 'verification' && (
            <div className="space-y-4 text-xs">
              {verification ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                      <span className="text-[10px] uppercase font-mono text-slate-400 block">Domain Status</span>
                      <span className="text-sm font-semibold font-mono text-emerald-400 flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{verification.domain_status}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 block">HTTPS enforced, TLS negotiated</span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                      <span className="text-[10px] uppercase font-mono text-slate-400 block">Verification Confidence</span>
                      <span className="text-sm font-semibold font-mono text-indigo-300">
                        {verification.confidence}% Trust Score
                      </span>
                      <span className="text-[10px] text-slate-400 block">Multi-source verified</span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                      <span className="text-[10px] uppercase font-mono text-slate-400 block">Registry Status</span>
                      <span className="text-sm font-semibold font-mono text-slate-200">
                        {verification.registry_check?.status || 'Active Good Standing'}
                      </span>
                      <span className="text-[10px] text-slate-400 block">{verification.registry_check?.registry_name || 'Secretary of State'}</span>
                    </div>
                  </div>

                  {/* Evidence List */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">
                      Verification Evidence Log
                    </span>
                    <ul className="space-y-1.5 text-slate-300">
                      {verification.evidence.map((ev, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{ev}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Sources List */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">
                        Retrieved Source Citations ({verification.sources.length})
                      </span>
                      <span className="text-[10px] font-mono text-amber-400">
                        {verification.sources.some(s => s.trust_level === 'DEMO') ? 'Synthetic Demo Sources' : 'Official Records'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {verification.sources.map((src, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-slate-200">{src.title}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              {src.trust_level}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">{src.snippet}</p>
                          <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                            <span>Source: {src.source}</span>
                            <span className="font-mono">{src.url}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-10 text-slate-400">
                  <ShieldCheck className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p>No verification run recorded yet for this company.</p>
                  <button
                    onClick={() => onRunAgent(lead.id)}
                    className="mt-3 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium inline-flex items-center space-x-1"
                  >
                    <Play className="w-3 h-3" />
                    <span>Run Verification Agent</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SCORING */}
          {activeTab === 'scoring' && (
            <div className="space-y-5 text-xs">
              {score ? (
                <>
                  <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400">Overall Lead Quality Score</span>
                      <div className="text-3xl font-bold font-mono text-slate-100 mt-1">
                        {score.total_score} <span className="text-sm font-normal text-slate-400">/ 100</span>
                      </div>
                      <p className="text-slate-400 text-xs mt-1">
                        Qualification: <strong className="text-slate-200">{score.qualification.toUpperCase()}</strong>
                      </p>
                    </div>

                    <div className="text-right text-[11px] font-mono space-y-1 text-slate-400">
                      <div>80–100: <span className="text-emerald-400 font-semibold">HOT</span></div>
                      <div>60–79: <span className="text-indigo-400 font-semibold">WARM</span></div>
                      <div>40–59: <span className="text-amber-400 font-semibold">COLD</span></div>
                      <div>&lt;40: <span className="text-rose-400 font-semibold">UNQUALIFIED</span></div>
                    </div>
                  </div>

                  {/* 5-Category Breakdown Bars */}
                  <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                      Category Breakdown (Weights Sum to 100)
                    </span>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1 text-slate-300">
                          <span>Company Fit (Scale & ARR)</span>
                          <span className="font-mono">{score.breakdown.company_fit} / 25</span>
                        </div>
                        <div className="w-full h-2 rounded bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded"
                            style={{ width: `${(score.breakdown.company_fit / 25) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1 text-slate-300">
                          <span>Market Fit (Industry & Tech Sector)</span>
                          <span className="font-mono">{score.breakdown.market_fit} / 20</span>
                        </div>
                        <div className="w-full h-2 rounded bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-cyan-500 rounded"
                            style={{ width: `${(score.breakdown.market_fit / 20) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1 text-slate-300">
                          <span>Business Need (Pain Point Alignment)</span>
                          <span className="font-mono">{score.breakdown.business_need} / 20</span>
                        </div>
                        <div className="w-full h-2 rounded bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded"
                            style={{ width: `${(score.breakdown.business_need / 20) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1 text-slate-300">
                          <span>Credibility (Domain, TLS, Registry)</span>
                          <span className="font-mono">{score.breakdown.credibility} / 20</span>
                        </div>
                        <div className="w-full h-2 rounded bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded"
                            style={{ width: `${(score.breakdown.credibility / 20) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1 text-slate-300">
                          <span>Engagement Potential (Seniority & Scope)</span>
                          <span className="font-mono">{score.breakdown.engagement_potential} / 15</span>
                        </div>
                        <div className="w-full h-2 rounded bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded"
                            style={{ width: `${(score.breakdown.engagement_potential / 15) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reasons & Signals */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                      <span className="text-[10px] uppercase font-mono text-emerald-400 font-semibold block">
                        Positive Signals
                      </span>
                      <ul className="space-y-1 text-slate-300">
                        {score.positive_signals.map((sig, i) => (
                          <li key={i} className="flex items-start space-x-1.5">
                            <span className="text-emerald-400 font-bold">✓</span>
                            <span>{sig}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                      <span className="text-[10px] uppercase font-mono text-rose-400 font-semibold block">
                        Risk Signals
                      </span>
                      <ul className="space-y-1 text-slate-300">
                        {score.risk_signals.length > 0 ? (
                          score.risk_signals.map((sig, i) => (
                            <li key={i} className="flex items-start space-x-1.5">
                              <span className="text-rose-400 font-bold">!</span>
                              <span>{sig}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-slate-400">No high-risk signals detected.</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-10 text-slate-400">
                  <Target className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p>Lead has not yet undergone autonomous qualification scoring.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PROPOSAL */}
          {activeTab === 'proposal' && (
            <div className="space-y-4 text-xs">
              {proposal ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-100 text-sm">{proposal.title}</h4>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Status:{' '}
                        <strong className="text-amber-400 font-mono">
                          {proposal.status.replace(/_/g, ' ').toUpperCase()}
                        </strong>
                      </p>
                    </div>

                    <button
                      onClick={() => onOpenProposal(lead)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center space-x-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Open in Full Editor</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">Executive Summary</span>
                    <p className="text-slate-200 leading-relaxed">{proposal.executive_summary}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">Proposed Solution Architecture</span>
                    <p className="text-slate-200 leading-relaxed">{proposal.proposed_solution}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400">
                  <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p>No proposal draft generated yet.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: RUNS */}
          {activeTab === 'runs' && (
            <div className="space-y-4 text-xs">
              {latestRun ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 text-[10px] font-mono">Latest Run ID: {latestRun.id}</span>
                      <div className="font-semibold text-slate-200 mt-0.5">
                        Current Node: <span className="font-mono text-indigo-400">{latestRun.current_node}</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                      {latestRun.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {latestRun.nodes.map((node, i) => (
                      <div key={i} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="font-medium text-slate-200">{node.display_name}</span>
                          <span className="text-[10px] text-slate-400 block">{node.summary}</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400">{node.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400">
                  <Workflow className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p>No agent runs recorded for this lead.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onRunAgent(lead.id)}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center space-x-1.5 transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Run Autonomous Agent</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {lead.status === 'human_review' || lead.status === 'proposal_ready' ? (
              <>
                <button
                  onClick={() => onReject(lead.id)}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium text-xs transition-colors"
                >
                  Disqualify
                </button>
                <button
                  onClick={() => onApprove(lead.id)}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors"
                >
                  Approve for Outreach
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
