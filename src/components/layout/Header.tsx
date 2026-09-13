import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  Activity,
  ShieldCheck,
  Bell,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { AppSettings, Lead } from '../../types/index.ts';

interface HeaderProps {
  activeTab: string;
  onSelectTab?: (tab: string) => void;
  pendingReviewCount?: number;
  settings?: AppSettings | null;
  demoMode?: boolean;
  leads?: Lead[];
  onSelectLead?: (lead: Lead) => void;
  onOpenNewLead?: () => void;
  onToggleDemoMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  pendingReviewCount = 0,
  settings,
  demoMode,
  leads = [],
  onSelectLead = (_lead: Lead) => {},
  onOpenNewLead = () => {},
  onToggleDemoMode = () => {}
}) => {
  const isDemoMode = demoMode !== undefined ? demoMode : (settings?.demo_mode ?? true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const filteredSearch = searchQuery.trim()
    ? leads.filter(
        l =>
          l.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (l.domain && l.domain.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 5)
    : [];

  const getPageTitle = () => {
    switch (activeTab) {
      case 'overview':
        return { title: 'Executive Overview', desc: 'Autonomous intelligence pipeline metrics and lead velocity' };
      case 'pipeline':
        return { title: 'Lead Pipeline', desc: 'Kanban tracking across autonomous verification and qualification gates' };
      case 'new-lead':
        return { title: 'New Lead Intake', desc: 'Ingest B2B opportunity and initialize autonomous research' };
      case 'agent-runs':
        return { title: 'Agent Runs & State Graph', desc: 'LangGraph execution timeline, operational traces, and active nodes' };
      case 'verification':
        return { title: 'Entity & Domain Verification', desc: 'SSRF-protected HTTP probing, TLS inspection, and registry checks' };
      case 'scoring':
        return { title: 'Transparent Lead Scoring', desc: '0–100 multi-category weighted qualification algorithm' };
      case 'proposals':
        return { title: 'B2B Proposals & Review', desc: 'Human-in-the-loop review, markdown editor, and outreach governance' };
      case 'activity':
        return { title: 'Activity Audit Log', desc: 'Immutable chronological trace of agentic decisions and human actions' };
      case 'settings':
        return { title: 'System Settings', desc: 'Providers, $0 Demo Mode controls, and security configurations' };
      default:
        return { title: 'AgenticFlow', desc: 'Autonomous B2B Intelligence' };
    }
  };

  const { title, desc } = getPageTitle();

  return (
    <header
      id="app-header"
      className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30"
    >
      {/* Page Title & Subtitle */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center space-x-3">
          <h1 className="text-base font-semibold text-slate-100 tracking-tight">{title}</h1>
          
          {/* Demo Mode Badge */}
          {isDemoMode ? (
            <span
              id="header-demo-badge"
              onClick={onToggleDemoMode}
              title="Click to toggle Demo Mode in Settings"
              className="cursor-pointer inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5 animate-pulse"></span>
              DEMO MODE ($0)
            </span>
          ) : (
            <span
              id="header-live-badge"
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5"></span>
              LIVE MODE
            </span>
          )}

          {/* Backend Status Pill */}
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-1.5"></span>
            FastAPI + LangGraph
          </span>
        </div>
        <p className="text-xs text-slate-400 hidden md:block">{desc}</p>
      </div>

      {/* Right Action Bar */}
      <div className="flex items-center space-x-3">
        {/* Global Search */}
        <div className="relative">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 focus-within:border-indigo-500/60 focus-within:ring-1 focus-within:ring-indigo-500/30 transition-all w-48 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
            <input
              id="global-search-input"
              type="text"
              placeholder="Search companies, domains..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              className="bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-full"
            />
          </div>

          {/* Search Dropdown */}
          {showSearchDropdown && searchQuery.trim() && (
            <div
              id="global-search-dropdown"
              className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-2 z-50 text-xs"
            >
              <div className="px-3 py-1 text-[10px] uppercase font-mono tracking-wider text-slate-400 border-b border-slate-800">
                Matching Leads ({filteredSearch.length})
              </div>
              {filteredSearch.length === 0 ? (
                <div className="px-3 py-3 text-slate-400 text-center">No leads matching "{searchQuery}"</div>
              ) : (
                filteredSearch.map(lead => (
                  <button
                    key={lead.id}
                    id={`search-item-${lead.id}`}
                    onClick={() => {
                      onSelectLead(lead);
                      setShowSearchDropdown(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800/70 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="font-medium text-slate-200 group-hover:text-indigo-300">
                        {lead.company_name}
                      </div>
                      <div className="text-[11px] text-slate-400">{lead.domain || lead.industry}</div>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {lead.latest_score ? `${lead.latest_score.total_score} pts` : lead.status}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Notifications Button */}
        <div className="relative">
          <button
            id="notifications-toggle-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500"></span>
          </button>

          {showNotifications && (
            <div
              id="notifications-dropdown"
              className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-lg shadow-xl p-3 z-50 text-xs"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-semibold text-slate-200">System Alerts</span>
                <span className="text-[10px] font-mono text-amber-400">Human Review Required (2)</span>
              </div>
              <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-slate-300">
                  <div className="font-medium text-amber-400 flex items-center justify-between">
                    <span>Summit Health Systems</span>
                    <span className="text-[10px] font-mono text-slate-400">10 min ago</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Proposal ready. Paused at Human Review gate due to healthcare HIPAA criteria.
                  </p>
                </div>
                <div className="p-2 rounded bg-slate-800/60 border border-slate-700/50 text-slate-300">
                  <div className="font-medium text-slate-200 flex items-center justify-between">
                    <span>Northstar Analytics</span>
                    <span className="text-[10px] font-mono text-slate-400">1 hr ago</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    State filing verified in California Secretary of State registry (Score: 88 HOT).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Start Research Primary CTA */}
        <button
          id="header-start-research-btn"
          onClick={onOpenNewLead}
          className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium tracking-tight shadow-sm shadow-indigo-500/20 active:translate-y-0.5 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Lead</span>
        </button>
      </div>
    </header>
  );
};
