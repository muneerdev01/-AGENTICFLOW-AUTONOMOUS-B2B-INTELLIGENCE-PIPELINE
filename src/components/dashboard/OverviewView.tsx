import React from 'react';
import {
  Users,
  ShieldCheck,
  Target,
  FileText,
  Workflow,
  Sparkles,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  TrendingUp,
  Building2,
  Cpu
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Lead, AgentRun, PipelineAnalytics, AppSettings } from '../../types/index.ts';
import { WorkflowVisualization } from '../agent/WorkflowVisualization.tsx';

interface OverviewViewProps {
  leads?: Lead[];
  agentRuns?: AgentRun[];
  recentRuns?: AgentRun[];
  analytics?: PipelineAnalytics | null;
  metrics?: PipelineAnalytics | null;
  pendingProposals?: any[];
  settings?: AppSettings | null;
  demoMode?: boolean;
  onNavigate?: (tab: string) => void;
  onSelectLead?: (lead: Lead) => void;
  onRunLead?: (leadId: string) => void;
  onOpenProposal?: (lead: Lead) => void;
  onViewAllLeads?: () => void;
  onViewAllRuns?: () => void;
  onNewLead?: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  leads = [],
  agentRuns,
  recentRuns,
  analytics,
  metrics,
  settings,
  demoMode,
  onNavigate,
  onSelectLead = (_lead: Lead) => {},
  onRunLead = (_leadId: string) => {},
  onOpenProposal = (_lead: Lead) => {},
  onViewAllLeads,
  onViewAllRuns,
  onNewLead
}) => {
  const isDemo = demoMode !== undefined ? demoMode : (settings?.demo_mode ?? true);
  const runsList = agentRuns || recentRuns || [];
  const latestRun = runsList[0];

  const handleNavigate = (tab: string) => {
    if (onNavigate) {
      onNavigate(tab);
    } else if (tab === 'pipeline' && onViewAllLeads) {
      onViewAllLeads();
    } else if (tab === 'agent-runs' && onViewAllRuns) {
      onViewAllRuns();
    } else if (tab === 'new-lead' && onNewLead) {
      onNewLead();
    }
  };

  const stats = analytics || metrics || {
    total_leads: leads.length,
    qualified_leads: leads.filter(
      l => l.latest_score && (l.latest_score.qualification === 'hot' || l.latest_score.qualification === 'warm')
    ).length,
    verification_rate: 85,
    avg_lead_score: 78,
    proposals_generated: 4,
    agent_runs: runsList.length
  };

  // Score distribution data for Recharts
  const scoreDistribution = [
    { name: 'HOT (80-100)', count: leads.filter(l => l.latest_score && l.latest_score.total_score >= 80).length, fill: '#10b981' },
    { name: 'WARM (60-79)', count: leads.filter(l => l.latest_score && l.latest_score.total_score >= 60 && l.latest_score.total_score < 80).length, fill: '#6366f1' },
    { name: 'COLD (40-59)', count: leads.filter(l => l.latest_score && l.latest_score.total_score >= 40 && l.latest_score.total_score < 60).length, fill: '#f59e0b' },
    { name: 'UNQUAL (<40)', count: leads.filter(l => l.latest_score && l.latest_score.total_score < 40).length, fill: '#ef4444' }
  ];

  // Pipeline stages distribution data
  const pipelineData = [
    { name: 'Verified', value: leads.filter(l => l.verification_status === 'verified').length, color: '#10b981' },
    { name: 'Human Review', value: leads.filter(l => l.status === 'human_review' || l.status === 'proposal_ready').length, color: '#f59e0b' },
    { name: 'Researching', value: leads.filter(l => l.status === 'researching').length, color: '#6366f1' },
    { name: 'New / Draft', value: leads.filter(l => l.status === 'new').length, color: '#64748b' }
  ];

  const pendingHumanReviews = leads.filter(l => l.status === 'human_review' || l.status === 'proposal_ready');

  return (
    <div id="overview-view" className="space-y-6">
      {/* Demo Mode Notice Banner */}
      {isDemo && (
        <div
          id="demo-mode-alert"
          className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-amber-300">
                Operating in $0 Demo Mode — Free Tier Evaluation
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Deterministic synthetic search citations, corporate registry lookups, and structured proposals.
                All citations are marked with <span className="font-mono text-amber-400">Synthetic Demo Source</span>.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleNavigate('settings')}
            className="text-xs font-mono font-medium text-amber-400 hover:text-amber-300 underline shrink-0 ml-4"
          >
            Configure Providers →
          </button>
        </div>
      )}

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Leads</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-100">{leads.length}</span>
            <span className="block text-[10px] text-slate-400 mt-0.5">Tracked opportunities</span>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Verified Rate</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-emerald-400">{stats.verification_rate}%</span>
            <span className="block text-[10px] text-slate-400 mt-0.5">SSRF & TLS cleared</span>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Qualified (Hot/Warm)</span>
            <Target className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-100">{stats.qualified_leads}</span>
            <span className="block text-[10px] text-slate-400 mt-0.5">Score threshold ≥ 60</span>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Avg Lead Score</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-amber-400">{stats.avg_lead_score} <span className="text-xs text-slate-400 font-normal">/ 100</span></span>
            <span className="block text-[10px] text-slate-400 mt-0.5">Weighted algorithm</span>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Proposals</span>
            <FileText className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-100">{stats.proposals_generated}</span>
            <span className="block text-[10px] text-slate-400 mt-0.5">Structured B2B drafts</span>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Agent Runs</span>
            <Workflow className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-100">{stats.agent_runs}</span>
            <span className="block text-[10px] text-slate-400 mt-0.5">LangGraph workflows</span>
          </div>
        </div>
      </div>

      {/* Prominent LangGraph Workflow State Visualization */}
      <WorkflowVisualization currentRun={latestRun} onSelectNode={() => handleNavigate('agent-runs')} />

      {/* Two-Column Intelligence Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Visual Charts & Analytics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Qualification Score Distribution */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-slate-200">Score Tier Distribution</h4>
                <span className="text-[10px] font-mono text-slate-400">0–100 Weighted</span>
              </div>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                      cursor={{ fill: '#1e293b' }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pipeline Stage Breakdown */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-slate-200">Pipeline Status Mix</h4>
                <span className="text-[10px] font-mono text-slate-400">Active Leads</span>
              </div>
              <div className="h-44 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pipelineData}
                      cx="50%"
                      cy="50%"
                      innerRadius={36}
                      outerRadius={60}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pipelineData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1 text-[11px] pr-2">
                  {pipelineData.map((p, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: p.color }}></span>
                      <span className="text-slate-300">{p.name}:</span>
                      <span className="font-mono text-slate-400 font-medium">{p.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Active Opportunities Table */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-semibold text-slate-200">Active B2B Opportunities</h4>
                <p className="text-[11px] text-slate-400">Real-time status across autonomous verification and proposal stages</p>
              </div>
              <button
                onClick={() => handleNavigate('pipeline')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center space-x-1"
              >
                <span>Full Pipeline</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 font-mono text-[10px] uppercase">
                    <th className="pb-2">Company</th>
                    <th className="pb-2">Industry</th>
                    <th className="pb-2">Verification</th>
                    <th className="pb-2">Score</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {leads.slice(0, 5).map(lead => (
                    <tr
                      key={lead.id}
                      className="hover:bg-slate-800/30 transition-colors group cursor-pointer"
                      onClick={() => onSelectLead(lead)}
                    >
                      <td className="py-2.5 font-medium text-slate-200 group-hover:text-indigo-300">
                        <div>{lead.company_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{lead.domain || 'no domain'}</div>
                      </td>
                      <td className="py-2.5 text-slate-300 max-w-[140px] truncate">{lead.industry}</td>
                      <td className="py-2.5">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono ${
                          lead.verification_status === 'verified'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : lead.verification_status === 'partially_verified'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {lead.verification_status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 font-mono">
                        {lead.latest_score ? (
                          <span className={`font-semibold ${
                            lead.latest_score.total_score >= 80 ? 'text-emerald-400' :
                            lead.latest_score.total_score >= 60 ? 'text-indigo-400' :
                            lead.latest_score.total_score >= 40 ? 'text-amber-400' : 'text-rose-400'
                          }`}>
                            {lead.latest_score.total_score}
                            <span className="text-[10px] text-slate-400 ml-1">({lead.latest_score.qualification.toUpperCase()})</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                          {lead.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRunLead(lead.id);
                          }}
                          className="px-2 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-[11px] font-medium"
                        >
                          Run Agent
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Human Review Gate & Quick Actions */}
        <div className="space-y-6">
          {/* Human Review Required Gate */}
          <div className="bg-slate-900/60 border border-amber-500/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-semibold text-slate-100">Human Review Gate</h4>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                {pendingHumanReviews.length} Awaiting
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Autonomous proposals strictly halted prior to external transmission. Review, modify, or approve drafts.
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {pendingHumanReviews.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  No proposals currently awaiting review.
                </div>
              ) : (
                pendingHumanReviews.map(lead => (
                  <div
                    key={lead.id}
                    className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-xs text-slate-200">{lead.company_name}</span>
                      <span className="text-[10px] font-mono text-emerald-400">
                        {lead.latest_score?.total_score || 85} pts
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 truncate">
                      {lead.business_need || 'Telemetry modernization and cloud integration.'}
                    </div>
                    <div className="mt-2 flex items-center space-x-2">
                      <button
                        onClick={() => {
                          onSelectLead(lead);
                          if (onOpenProposal) {
                            onOpenProposal(lead);
                          } else {
                            handleNavigate('proposals');
                          }
                        }}
                        className="w-full py-1 text-center text-[11px] font-medium rounded bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                      >
                        Review Proposal Draft
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-semibold text-slate-200">Pipeline Actions</h4>
            <div className="space-y-2">
              <button
                onClick={() => handleNavigate('new-lead')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-indigo-500/40 text-left transition-all group"
              >
                <div>
                  <span className="text-xs font-medium text-slate-200 group-hover:text-indigo-300 block">
                    + Ingest New Opportunity
                  </span>
                  <span className="text-[10px] text-slate-400">Input lead to kick off autonomous research</span>
                </div>
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </button>

              <button
                onClick={() => handleNavigate('verification')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-indigo-500/40 text-left transition-all group"
              >
                <div>
                  <span className="text-xs font-medium text-slate-200 group-hover:text-indigo-300 block">
                    Verify Domain & Registry
                  </span>
                  <span className="text-[10px] text-slate-400">SSRF-protected TLS and corporate filings</span>
                </div>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </button>

              <button
                onClick={() => handleNavigate('scoring')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-indigo-500/40 text-left transition-all group"
              >
                <div>
                  <span className="text-xs font-medium text-slate-200 group-hover:text-indigo-300 block">
                    Scoring Engine Weights
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Company (25) • Market (20) • Need (20)</span>
                </div>
                <Target className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
