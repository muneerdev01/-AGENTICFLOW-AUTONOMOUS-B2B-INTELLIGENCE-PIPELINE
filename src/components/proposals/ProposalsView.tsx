import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Proposal, Lead } from '../../types/index.ts';

interface ProposalsViewProps {
  proposals: Proposal[];
  leads: Lead[];
  onOpenProposalModal: (proposal: Proposal, lead: Lead) => void;
  onApprove: (proposalId: string) => void;
  onReject: (proposalId: string) => void;
}

export const ProposalsView: React.FC<ProposalsViewProps> = ({
  proposals,
  leads,
  onOpenProposalModal,
  onApprove,
  onReject
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProposals = proposals.filter(prop => {
    const lead = leads.find(l => l.id === prop.lead_id);
    const matchesSearch =
      !searchQuery.trim() ||
      prop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead && lead.company_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || prop.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = proposals.filter(p => p.status === 'pending_review').length;
  const approvedCount = proposals.filter(p => p.status === 'approved').length;
  const rejectedCount = proposals.filter(p => p.status === 'rejected').length;

  return (
    <div id="proposals-view" className="space-y-6">
      {/* Top Header & Status Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Total Generated</span>
            <span className="text-2xl font-bold text-slate-100 mt-1 block">{proposals.length}</span>
          </div>
          <FileText className="w-5 h-5 text-indigo-400" />
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-amber-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-amber-400 uppercase block">Pending Review</span>
            <span className="text-2xl font-bold text-amber-300 mt-1 block">{pendingCount}</span>
          </div>
          <AlertTriangle className="w-5 h-5 text-amber-400" />
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-emerald-400 uppercase block">Approved</span>
            <span className="text-2xl font-bold text-emerald-300 mt-1 block">{approvedCount}</span>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-rose-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-rose-400 uppercase block">Rejected</span>
            <span className="text-2xl font-bold text-rose-300 mt-1 block">{rejectedCount}</span>
          </div>
          <XCircle className="w-5 h-5 text-rose-400" />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search proposals or companies..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-full"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending_review">Pending Review (Action Required)</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <span className="text-xs font-mono text-slate-400">
          Showing {filteredProposals.length} of {proposals.length} documents
        </span>
      </div>

      {/* Proposals Stream Cards */}
      <div className="space-y-3">
        {filteredProposals.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
            <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs">No proposals match the current filter criteria.</p>
          </div>
        ) : (
          filteredProposals.map(prop => {
            const lead = leads.find(l => l.id === prop.lead_id) || {
              id: prop.lead_id,
              company_name: 'Target Account',
              industry: 'Enterprise Technology'
            } as Lead;

            return (
              <div
                key={prop.id}
                id={`proposal-card-${prop.id}`}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center space-x-2.5">
                    <h3 className="text-sm font-semibold text-slate-100 hover:text-indigo-300 transition-colors">
                      {prop.title}
                    </h3>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                        prop.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : prop.status === 'rejected'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {prop.status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2">{prop.executive_summary}</p>

                  <div className="flex items-center space-x-4 text-[10px] text-slate-400 pt-1 font-mono">
                    <span>Company: <strong className="text-slate-300">{lead.company_name}</strong></span>
                    <span>Industry: {lead.industry}</span>
                    <span>Created: {prop.created_at.slice(0, 10)}</span>
                  </div>
                </div>

                {/* Right Action Controls */}
                <div className="flex items-center space-x-2 shrink-0">
                  {prop.status === 'pending_review' && (
                    <>
                      <button
                        onClick={() => onReject(prop.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-medium transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => onApprove(prop.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
                      >
                        Approve
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => onOpenProposalModal(prop, lead)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition-colors"
                  >
                    <span>View Document</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
