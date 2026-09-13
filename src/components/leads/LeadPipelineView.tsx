import React, { useState } from 'react';
import {
  Search,
  Filter,
  Sparkles,
  Play,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  MoreVertical,
  Plus,
  ShieldCheck,
  Building,
  Target
} from 'lucide-react';
import { Lead, LeadScore } from '../../types/index.ts';

interface LeadPipelineViewProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onRunLead?: (leadId: string) => void;
  onRunAgent?: (leadId: string) => void;
  onOpenNewLead?: () => void;
  onNewLead?: () => void;
  onOpenProposal?: (lead: Lead) => void;
}

export const LeadPipelineView: React.FC<LeadPipelineViewProps> = ({
  leads,
  onSelectLead,
  onRunLead,
  onRunAgent,
  onOpenNewLead,
  onNewLead,
  onOpenProposal = (_lead: Lead) => {}
}) => {
  const handleRun = onRunLead || onRunAgent || (() => {});
  const handleNewLead = onOpenNewLead || onNewLead || (() => {});
  const [searchQuery, setSearchQuery] = useState('');
  const [qualificationFilter, setQualificationFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');

  const stages = [
    { id: 'new', label: 'New Intake', color: 'border-slate-700' },
    { id: 'researching', label: 'Autonomous Research', color: 'border-indigo-500/50' },
    { id: 'verified', label: 'Entity Verified', color: 'border-cyan-500/50' },
    { id: 'qualified', label: 'Lead Scored', color: 'border-emerald-500/50' },
    { id: 'human_review', label: 'Human Review Gate', color: 'border-amber-500/50' },
    { id: 'approved', label: 'Approved for Outreach', color: 'border-green-500/50' },
    { id: 'rejected', label: 'Disqualified / Rejected', color: 'border-rose-500/50' }
  ];

  const filteredLeads = leads.filter(lead => {
    // Search filter
    const matchesSearch =
      !searchQuery.trim() ||
      lead.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.domain && lead.domain.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (lead.industry && lead.industry.toLowerCase().includes(searchQuery.toLowerCase()));

    // Qualification filter
    const qual = lead.latest_score?.qualification || 'unqualified';
    const matchesQual = qualificationFilter === 'all' || qual === qualificationFilter;

    // Verification filter
    const matchesVer =
      verificationFilter === 'all' || lead.verification_status === verificationFilter;

    return matchesSearch && matchesQual && matchesVer;
  });

  return (
    <div id="lead-pipeline-view" className="space-y-4">
      {/* Control / Filter Bar */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Filter leads..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-full"
            />
          </div>

          {/* Qualification Filter */}
          <select
            value={qualificationFilter}
            onChange={e => setQualificationFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Qualifications</option>
            <option value="hot">🔥 HOT (80–100)</option>
            <option value="warm">⚡ WARM (60–79)</option>
            <option value="cold">❄️ COLD (40–59)</option>
            <option value="unqualified">⛔ UNQUALIFIED</option>
          </select>

          {/* Verification Status Filter */}
          <select
            value={verificationFilter}
            onChange={e => setVerificationFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Verification</option>
            <option value="verified">Verified</option>
            <option value="partially_verified">Partially Verified</option>
            <option value="unable_to_verify">Unable to Verify</option>
          </select>

          {(searchQuery || qualificationFilter !== 'all' || verificationFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setQualificationFilter('all');
                setVerificationFilter('all');
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 underline font-mono"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-mono">
            Showing <strong className="text-slate-200">{filteredLeads.length}</strong> / {leads.length} leads
          </span>
          <button
            onClick={handleNewLead}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Kanban Multi-Column Scrollable Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex space-x-3.5 min-w-[1300px]">
          {stages.map(stage => {
            // Include 'proposal_ready' in human review column
            const columnLeads = filteredLeads.filter(l => {
              if (stage.id === 'human_review') {
                return l.status === 'human_review' || l.status === 'proposal_ready';
              }
              return l.status === stage.id;
            });

            return (
              <div
                key={stage.id}
                id={`kanban-col-${stage.id}`}
                className="w-72 bg-slate-900/50 border border-slate-800/80 rounded-xl flex flex-col shrink-0"
              >
                {/* Column Header */}
                <div className={`p-3 border-b ${stage.color} flex items-center justify-between`}>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-slate-200">{stage.label}</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    {columnLeads.length}
                  </span>
                </div>

                {/* Column Card Stream */}
                <div className="p-2.5 space-y-2.5 min-h-[500px] max-h-[calc(100vh-230px)] overflow-y-auto">
                  {columnLeads.length === 0 ? (
                    <div className="h-32 flex items-center justify-center text-[11px] text-slate-400 border border-dashed border-slate-800/80 rounded-lg">
                      No leads in stage
                    </div>
                  ) : (
                    columnLeads.map(lead => {
                      const score = lead.latest_score?.total_score;
                      const qual = lead.latest_score?.qualification;

                      return (
                        <div
                          key={lead.id}
                          id={`lead-card-${lead.id}`}
                          onClick={() => onSelectLead(lead)}
                          className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/90 hover:border-indigo-500/50 transition-all cursor-pointer space-y-2 group shadow-sm hover:shadow-md"
                        >
                          {/* Card Header: Name & Score */}
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-xs text-slate-100 group-hover:text-indigo-300 transition-colors">
                                {lead.company_name}
                              </h4>
                              <p className="text-[10px] font-mono text-slate-400 truncate max-w-[170px]">
                                {lead.domain || 'no domain provided'}
                              </p>
                            </div>

                            {score !== undefined && (
                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                                  score >= 80
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : score >= 60
                                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                    : score >= 40
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                }`}
                              >
                                {score} pts
                              </span>
                            )}
                          </div>

                          {/* Industry & Location */}
                          <div className="text-[11px] text-slate-300 truncate">
                            {lead.industry || 'Technology'}
                          </div>

                          {/* Verification & Trust Badge */}
                          <div className="flex items-center space-x-1.5 text-[10px]">
                            <span
                              className={`px-1.5 py-0.5 rounded font-mono ${
                                lead.verification_status === 'verified'
                                  ? 'bg-emerald-500/15 text-emerald-400'
                                  : lead.verification_status === 'partially_verified'
                                  ? 'bg-amber-500/15 text-amber-300'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {lead.verification_status.replace(/_/g, ' ')}
                            </span>
                            {lead.deal_size && (
                              <span className="font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 truncate">
                                {lead.deal_size}
                              </span>
                            )}
                          </div>

                          {/* Contact */}
                          {lead.contact_name && (
                            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-900 flex items-center justify-between">
                              <span className="truncate">{lead.contact_name}</span>
                              <span className="truncate max-w-[90px] text-slate-400">{lead.contact_title}</span>
                            </div>
                          )}

                          {/* Card Action Footer */}
                          <div className="pt-2 flex items-center justify-between gap-1 border-t border-slate-900">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                handleRun(lead.id);
                              }}
                              className="px-2 py-1 text-[10px] font-medium rounded bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 flex items-center space-x-1"
                            >
                              <Play className="w-2.5 h-2.5 fill-indigo-300" />
                              <span>Run Agent</span>
                            </button>

                            {(lead.status === 'human_review' || lead.status === 'proposal_ready') && (
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  onOpenProposal(lead);
                                }}
                                className="px-2 py-1 text-[10px] font-medium rounded bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/30"
                              >
                                Review Draft
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
