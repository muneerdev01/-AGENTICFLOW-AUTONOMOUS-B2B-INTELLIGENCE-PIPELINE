import React from 'react';
import {
  LayoutDashboard,
  Kanban,
  UserPlus,
  Workflow,
  ShieldCheck,
  Target,
  FileText,
  History,
  Settings,
  Cpu,
  Server,
  Zap
} from 'lucide-react';
import { AppSettings } from '../../types/index.ts';

interface SidebarProps {
  activeTab: string;
  setActiveTab?: (tab: string) => void;
  onSelectTab?: (tab: string) => void;
  settings?: AppSettings | null;
  demoMode?: boolean;
  pendingReviewCount?: number;
  leadCount?: number;
  runCount?: number;
  isAgentRunning?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onSelectTab,
  settings,
  demoMode,
  pendingReviewCount = 0,
  leadCount = 0,
  runCount = 0,
  isAgentRunning = false
}) => {
  const handleTabChange = onSelectTab || setActiveTab || (() => {});
  const isDemoMode = demoMode !== undefined ? demoMode : (settings?.demo_mode ?? true);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, badge: null },
    { id: 'pipeline', label: 'Lead Pipeline', icon: Kanban, badge: leadCount > 0 ? `${leadCount}` : 'Kanban' },
    { id: 'new-lead', label: 'New Lead', icon: UserPlus, badge: 'Intake' },
    { id: 'agent-runs', label: 'Agent Runs', icon: Workflow, badge: runCount > 0 ? `${runCount}` : 'LangGraph' },
    { id: 'verification', label: 'Verification', icon: ShieldCheck, badge: 'SSRF' },
    { id: 'scoring', label: 'Lead Scoring', icon: Target, badge: '0–100' },
    { id: 'proposals', label: 'Proposals', icon: FileText, badge: pendingReviewCount > 0 ? `${pendingReviewCount} Review` : 'Review' },
    { id: 'activity', label: 'Activity', icon: History, badge: null },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null }
  ];

  return (
    <aside
      id="app-sidebar"
      className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between shrink-0 select-none min-h-screen"
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center px-5 border-b border-slate-800/80 space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Zap className="w-4 h-4 fill-indigo-400/20" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white flex items-center">
              AgenticFlow
              <span className="ml-1.5 text-[9px] font-mono px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                B2B
              </span>
            </span>
            <span className="block text-[10px] text-slate-400 font-medium">Autonomous Intelligence</span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Pipeline Navigation
          </div>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-200 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-indigo-500/30 text-indigo-300'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sidebar Footer Metadata */}
      <div className="p-3 border-t border-slate-800/80 space-y-2 bg-slate-950/40">
        {/* Agent Operational Status */}
        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-slate-400" />
              <span>Agent Status:</span>
            </span>
            {isAgentRunning ? (
              <span className="font-mono text-indigo-400 font-medium flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                <span>EXECUTING</span>
              </span>
            ) : (
              <span className="font-mono text-emerald-400 font-medium flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>READY</span>
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px]">
            <span className="text-slate-400 flex items-center space-x-1">
              <Server className="w-3 h-3 text-slate-400" />
              <span>Backend:</span>
            </span>
            <span className="font-mono text-slate-300">FastAPI & LangGraph</span>
          </div>

          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400">Environment:</span>
            <span className="font-mono text-amber-400">
              {isDemoMode ? '$0 DEMO MODE' : 'PRODUCTION LIVE'}
            </span>
          </div>
        </div>

        {/* System Version */}
        <div className="px-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>AgenticFlow</span>
          <span>v1.0.0-release</span>
        </div>
      </div>
    </aside>
  );
};
