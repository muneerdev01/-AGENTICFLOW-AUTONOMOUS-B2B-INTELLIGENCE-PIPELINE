import React, { useState, useEffect } from 'react';
import {
  Header,
  Sidebar
} from './components/layout/index.ts';
import { OverviewView } from './components/dashboard/OverviewView.tsx';
import { LeadPipelineView } from './components/leads/LeadPipelineView.tsx';
import { NewLeadView } from './components/leads/NewLeadView.tsx';
import { LeadDetailModal } from './components/leads/LeadDetailModal.tsx';
import { AgentRunsView } from './components/agent/AgentRunsView.tsx';
import { VerificationView } from './components/verification/VerificationView.tsx';
import { ScoringView } from './components/scoring/ScoringView.tsx';
import { ProposalsView } from './components/proposals/ProposalsView.tsx';
import { ProposalEditorModal } from './components/proposals/ProposalEditorModal.tsx';
import { ActivityView } from './components/activity/ActivityView.tsx';
import { SettingsView } from './components/settings/SettingsView.tsx';

import { apiClient } from './lib/api.ts';
import {
  Lead,
  LeadInput,
  AgentRun,
  Proposal,
  CompanyVerification,
  DashboardMetrics,
  ActivityEvent,
  AppSettings
} from './types/index.ts';

const DEFAULT_SETTINGS: AppSettings = {
  demo_mode: true,
  search_provider: 'demo',
  llm_provider: 'demo',
  supabase_enabled: false,
  ssrf_protection_active: true,
  gemini_api_key_configured: false,
  tavily_api_key_configured: false,
  supabase_configured: false
};

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [verifications, setVerifications] = useState<Record<string, CompanyVerification>>({});
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Active Modals
  const [detailLead, setDetailLead] = useState<Lead | null>(null);
  const [editorProposalState, setEditorProposalState] = useState<{
    proposal: Proposal;
    lead: Lead;
  } | null>(null);

  // Load initial data
  const refreshData = async () => {
    try {
      const [
        fetchedLeads,
        fetchedRuns,
        fetchedProposals,
        fetchedMetrics,
        fetchedEvents,
        fetchedSettings
      ] = await Promise.all([
        apiClient.getLeads(),
        apiClient.getRuns(),
        apiClient.getProposals(),
        apiClient.getMetrics(),
        apiClient.getActivity(),
        apiClient.getSettings()
      ]);

      setLeads(fetchedLeads);
      setRuns(fetchedRuns);
      setProposals(fetchedProposals);
      setMetrics(fetchedMetrics);
      setActivityEvents(fetchedEvents);
      setSettings(fetchedSettings);

      // Fetch verifications for leads
      const verMap: Record<string, CompanyVerification> = {};
      for (const lead of fetchedLeads) {
        const ver = await apiClient.getVerification(lead.id);
        if (ver) verMap[lead.id] = ver;
      }
      setVerifications(verMap);
    } catch (err) {
      console.error('Error refreshing data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Action: Launch LangGraph Agent Pipeline on a Lead
  const handleRunAgent = async (leadId: string) => {
    try {
      const lead = leads.find(l => l.id === leadId);
      const newRun = await apiClient.runPipeline(leadId);

      // Optimistically update runs list
      setRuns(prev => [newRun, ...prev]);

      // Switch view to agent-runs so user can see it executing live
      setActiveTab('agent-runs');

      // Refresh to pull updated lead statuses, score, and generated proposal
      setTimeout(async () => {
        await refreshData();
      }, 1000);
    } catch (err) {
      console.error('Failed to run agent:', err);
    }
  };

  // Action: Create a New Lead
  const handleCreateLead = async (input: LeadInput, autoStart: boolean) => {
    try {
      const createdLead = await apiClient.createLead(input);
      await refreshData();

      if (autoStart) {
        await handleRunAgent(createdLead.id);
      } else {
        setActiveTab('pipeline');
      }
    } catch (err) {
      console.error('Failed to create lead:', err);
    }
  };

  // Action: Approve Proposal
  const handleApproveProposal = async (proposalId: string) => {
    try {
      await apiClient.approveProposal(proposalId);
      if (editorProposalState?.proposal.id === proposalId) {
        setEditorProposalState(prev =>
          prev ? { ...prev, proposal: { ...prev.proposal, status: 'approved' } } : null
        );
      }
      await refreshData();
    } catch (err) {
      console.error('Failed to approve proposal:', err);
    }
  };

  // Action: Reject Proposal
  const handleRejectProposal = async (proposalId: string) => {
    try {
      await apiClient.rejectProposal(proposalId);
      if (editorProposalState?.proposal.id === proposalId) {
        setEditorProposalState(prev =>
          prev ? { ...prev, proposal: { ...prev.proposal, status: 'rejected' } } : null
        );
      }
      await refreshData();
    } catch (err) {
      console.error('Failed to reject proposal:', err);
    }
  };

  // Action: Save Proposal Changes
  const handleSaveProposal = async (updated: Proposal) => {
    try {
      await apiClient.updateProposal(updated.id, updated);
      if (editorProposalState?.proposal.id === updated.id) {
        setEditorProposalState(prev =>
          prev ? { ...prev, proposal: updated } : null
        );
      }
      await refreshData();
    } catch (err) {
      console.error('Failed to update proposal:', err);
    }
  };

  // Action: Re-Verify Lead
  const handleVerifyLead = async (leadId: string) => {
    try {
      const ver = await apiClient.verifyDomain(leadId);
      setVerifications(prev => ({ ...prev, [leadId]: ver }));
      await refreshData();
    } catch (err) {
      console.error('Failed to verify lead:', err);
    }
  };

  // Action: Re-Score Lead
  const handleScoreLead = async (leadId: string) => {
    try {
      await apiClient.scoreLead(leadId);
      await refreshData();
    } catch (err) {
      console.error('Failed to score lead:', err);
    }
  };

  // Action: Reset Demo Data
  const handleResetDemoData = async () => {
    try {
      await apiClient.resetDemoData();
      await refreshData();
    } catch (err) {
      console.error('Failed to reset demo data:', err);
    }
  };

  // Pending Human Review Count
  const pendingReviewCount = proposals.filter(p => p.status === 'pending_review').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        pendingReviewCount={pendingReviewCount}
        settings={settings}
        demoMode={settings?.demo_mode ?? true}
        leads={leads}
        onSelectLead={lead => setDetailLead(lead)}
        onOpenNewLead={() => setActiveTab('new-lead')}
        onToggleDemoMode={() => setActiveTab('settings')}
      />

      {/* Main App Layout */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onSelectTab={setActiveTab}
          settings={settings}
          demoMode={settings?.demo_mode ?? true}
          pendingReviewCount={pendingReviewCount}
          leadCount={leads.length}
          runCount={runs.length}
        />

        {/* Content View Container */}
        <main className="flex-1 p-6 overflow-y-auto max-w-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-slate-400 text-xs font-mono">
              Loading AgenticFlow Pipeline Engine...
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <OverviewView
                  leads={leads}
                  agentRuns={runs}
                  recentRuns={runs.slice(0, 3)}
                  analytics={metrics}
                  metrics={metrics}
                  pendingProposals={proposals.filter(p => p.status === 'pending_review')}
                  settings={settings}
                  demoMode={settings?.demo_mode ?? true}
                  onNavigate={setActiveTab}
                  onSelectLead={lead => setDetailLead(lead)}
                  onRunLead={handleRunAgent}
                  onOpenProposal={lead => {
                    const prop = proposals.find(p => p.lead_id === lead.id);
                    if (prop) setEditorProposalState({ proposal: prop, lead });
                  }}
                  onViewAllLeads={() => setActiveTab('pipeline')}
                  onViewAllRuns={() => setActiveTab('agent-runs')}
                  onNewLead={() => setActiveTab('new-lead')}
                />
              )}

              {activeTab === 'pipeline' && (
                <LeadPipelineView
                  leads={leads}
                  onSelectLead={lead => setDetailLead(lead)}
                  onRunLead={handleRunAgent}
                  onRunAgent={handleRunAgent}
                  onOpenNewLead={() => setActiveTab('new-lead')}
                  onNewLead={() => setActiveTab('new-lead')}
                  onOpenProposal={lead => {
                    const prop = proposals.find(p => p.lead_id === lead.id);
                    if (prop) setEditorProposalState({ proposal: prop, lead });
                  }}
                />
              )}

              {activeTab === 'new-lead' && (
                <NewLeadView
                  onCreateLead={handleCreateLead}
                  onCancel={() => setActiveTab('pipeline')}
                />
              )}

              {activeTab === 'agent-runs' && (
                <AgentRunsView
                  runs={runs}
                  leads={leads}
                  onRunLead={handleRunAgent}
                  onSelectLead={lead => setDetailLead(lead)}
                />
              )}

              {activeTab === 'verification' && (
                <VerificationView
                  leads={leads}
                  verifications={verifications}
                  onVerifyLead={handleVerifyLead}
                  onSelectLead={lead => setDetailLead(lead)}
                />
              )}

              {activeTab === 'scoring' && (
                <ScoringView
                  leads={leads}
                  onScoreLead={handleScoreLead}
                  onSelectLead={lead => setDetailLead(lead)}
                />
              )}

              {activeTab === 'proposals' && (
                <ProposalsView
                  proposals={proposals}
                  leads={leads}
                  onOpenProposalModal={(prop, lead) =>
                    setEditorProposalState({ proposal: prop, lead })
                  }
                  onApprove={handleApproveProposal}
                  onReject={handleRejectProposal}
                />
              )}

              {activeTab === 'activity' && (
                <ActivityView events={activityEvents} />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  settings={settings}
                  onUpdateSettings={async newS => {
                    setSettings(newS);
                    try {
                      await apiClient.updateSettings(newS);
                    } catch (e) {
                      console.error('Failed to update settings:', e);
                    }
                  }}
                  onResetDemoData={handleResetDemoData}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Lead Detail Modal */}
      {detailLead && (
        <LeadDetailModal
          lead={detailLead}
          verification={verifications[detailLead.id]}
          proposal={proposals.find(p => p.lead_id === detailLead.id)}
          latestRun={runs.find(r => r.lead_id === detailLead.id)}
          onClose={() => setDetailLead(null)}
          onRunAgent={leadId => {
            setDetailLead(null);
            handleRunAgent(leadId);
          }}
          onOpenProposal={lead => {
            const prop = proposals.find(p => p.lead_id === lead.id);
            if (prop) {
              setDetailLead(null);
              setEditorProposalState({ proposal: prop, lead });
            }
          }}
          onApprove={async leadId => {
            const prop = proposals.find(p => p.lead_id === leadId);
            if (prop) await handleApproveProposal(prop.id);
            setDetailLead(null);
          }}
          onReject={async leadId => {
            const prop = proposals.find(p => p.lead_id === leadId);
            if (prop) await handleRejectProposal(prop.id);
            setDetailLead(null);
          }}
        />
      )}

      {/* Proposal Editor / Human-in-the-Loop Modal */}
      {editorProposalState && (
        <ProposalEditorModal
          proposal={editorProposalState.proposal}
          lead={editorProposalState.lead}
          onClose={() => setEditorProposalState(null)}
          onSave={handleSaveProposal}
          onApprove={async id => {
            await handleApproveProposal(id);
            setEditorProposalState(null);
          }}
          onReject={async id => {
            await handleRejectProposal(id);
            setEditorProposalState(null);
          }}
          onRegenerate={async leadId => {
            setEditorProposalState(null);
            await handleRunAgent(leadId);
          }}
        />
      )}
    </div>
  );
}
