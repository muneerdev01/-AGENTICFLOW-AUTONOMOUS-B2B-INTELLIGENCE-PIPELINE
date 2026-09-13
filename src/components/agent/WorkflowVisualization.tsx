import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Play,
  Pause,
  Shield,
  Search,
  CheckCheck,
  FileCheck2,
  FileText,
  UserCheck,
  Terminal,
  ChevronRight,
  Info
} from 'lucide-react';
import { AgentRun, AgentNode } from '../../types/index.ts';

interface WorkflowVisualizationProps {
  currentRun?: AgentRun;
  compact?: boolean;
  onSelectNode?: (node: AgentNode) => void;
}

export const WorkflowVisualization: React.FC<WorkflowVisualizationProps> = ({
  currentRun,
  compact = false,
  onSelectNode
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Standard pipeline node definitions
  const defaultNodes = [
    { name: 'input_lead', title: 'Input Intake', icon: Play, desc: 'Pydantic validation & schema intake' },
    { name: 'search_company', title: 'Company Search', icon: Search, desc: 'Multi-source citation retrieval' },
    { name: 'verify_domain', title: 'Domain Verify', icon: Shield, desc: 'SSRF guard, HTTPS & DNS probe' },
    { name: 'verify_registry', title: 'Registry Verify', icon: CheckCheck, desc: 'State corporate filing check' },
    { name: 'normalize_data', title: 'Normalization', icon: FileCheck2, desc: 'Harmonize NAICS & entity profile' },
    { name: 'score_lead', title: 'Quality Scoring', icon: CheckCircle2, desc: '0–100 transparent weighted score' },
    { name: 'generate_proposal', title: 'Proposal Gen', icon: FileText, desc: '7-section customized B2B proposal' },
    { name: 'human_review', title: 'Human Review', icon: UserCheck, desc: 'Mandatory human approval gate' }
  ];

  const nodes = currentRun?.nodes || defaultNodes.map((n, idx) => ({
    id: `default-${idx}`,
    node_name: n.name as any,
    display_name: n.title,
    status: 'COMPLETED' as const,
    tool_used: 'StandardPipeline',
    summary: n.desc,
    duration_ms: 250
  }));

  const activeNode = nodes.find(n => n.id === selectedNodeId) || nodes[nodes.length - 1];

  const getNodeIcon = (nodeName: string) => {
    switch (nodeName) {
      case 'input_lead': return Play;
      case 'search_company': return Search;
      case 'verify_domain': return Shield;
      case 'verify_registry': return CheckCheck;
      case 'normalize_data': return FileCheck2;
      case 'score_lead': return CheckCircle2;
      case 'generate_proposal': return FileText;
      case 'human_review': return UserCheck;
      default: return Play;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          dot: 'bg-emerald-400',
          label: 'Completed'
        };
      case 'RUNNING':
        return {
          bg: 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 ring-2 ring-indigo-500/20',
          dot: 'bg-indigo-400 animate-pulse',
          label: 'Running'
        };
      case 'FAILED':
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          dot: 'bg-rose-400',
          label: 'Failed'
        };
      case 'SKIPPED':
        return {
          bg: 'bg-slate-800 border-slate-700 text-slate-500',
          dot: 'bg-slate-500',
          label: 'Skipped'
        };
      default:
        return {
          bg: 'bg-slate-900 border-slate-800 text-slate-400',
          dot: 'bg-slate-600',
          label: 'Pending'
        };
    }
  };

  return (
    <div id="workflow-visualization" className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-semibold text-slate-100 tracking-tight">LangGraph StateGraph Execution</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
              Typed AgentState
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Deterministic 8-stage autonomous pipeline with conditional routing & human-in-the-loop gate.
          </p>
        </div>

        {currentRun && (
          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="text-slate-400">Run ID: <span className="text-slate-200">{currentRun.id}</span></span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
              currentRun.status === 'human_review_required'
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                : currentRun.status === 'completed'
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
            }`}>
              {currentRun.status.replace(/_/g, ' ').toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Workflow Horizontal Node Chain */}
      <div className="py-6 overflow-x-auto">
        <div className="min-w-[840px] flex items-center justify-between relative">
          {/* Background Connecting Line */}
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-800 -translate-y-1/2 z-0"></div>

          {nodes.map((node, index) => {
            const Icon = getNodeIcon(node.node_name);
            const statusStyle = getStatusBadge(node.status);
            const isSelected = activeNode?.id === node.id;

            return (
              <div
                key={node.id || index}
                id={`workflow-node-${node.node_name}`}
                onClick={() => {
                  setSelectedNodeId(node.id);
                  if (onSelectNode) onSelectNode(node);
                }}
                className="relative z-10 flex flex-col items-center cursor-pointer group"
              >
                {/* Node Pill / Circle */}
                <div
                  className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all ${statusStyle.bg} ${
                    isSelected ? 'ring-2 ring-indigo-400 scale-105 shadow-lg shadow-indigo-500/10' : 'hover:scale-105'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Status Dot */}
                <div className="absolute top-0 right-0 -mt-1 -mr-1">
                  <span className={`block w-2.5 h-2.5 rounded-full ring-2 ring-slate-950 ${statusStyle.dot}`}></span>
                </div>

                {/* Node Title & Timing */}
                <div className="mt-2 text-center">
                  <span className="block text-xs font-medium text-slate-200 group-hover:text-indigo-300 transition-colors">
                    {node.display_name}
                  </span>
                  <span className="block text-[10px] font-mono text-slate-400">
                    {node.duration_ms ? `${node.duration_ms}ms` : statusStyle.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Node Details & Operational Trace */}
      {!compact && activeNode && (
        <div className="mt-2 pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2 bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                <span>Node: {activeNode.display_name}</span>
                <span className="text-[10px] font-mono text-slate-400">({activeNode.tool_used})</span>
              </span>
              <span className="text-[10px] font-mono text-indigo-400">
                Status: {activeNode.status} {activeNode.duration_ms ? `(${activeNode.duration_ms}ms)` : ''}
              </span>
            </div>
            <p className="text-xs text-slate-300">{activeNode.summary}</p>

            {activeNode.input_summary && (
              <div className="text-[11px] font-mono bg-slate-900 p-2 rounded border border-slate-800 text-slate-400">
                <span className="text-slate-400">INPUT: </span>
                {activeNode.input_summary}
              </div>
            )}
            {activeNode.output_summary && (
              <div className="text-[11px] font-mono bg-slate-900 p-2 rounded border border-slate-800 text-slate-300">
                <span className="text-emerald-400">OUTPUT: </span>
                {activeNode.output_summary}
              </div>
            )}
          </div>

          {/* Operational Trace */}
          <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center space-x-1.5">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                <span>Operational Trace</span>
              </span>
              <span className="text-[9px] font-mono text-slate-400">No CoT Exposed</span>
            </div>
            <div className="h-28 overflow-y-auto space-y-1.5 text-[10px] font-mono pr-1">
              {currentRun?.operational_trace?.map((trace, idx) => (
                <div key={idx} className="flex items-start space-x-1.5 text-slate-400">
                  <span className="text-slate-400 shrink-0">{trace.timestamp}</span>
                  <span className={`shrink-0 ${
                    trace.level === 'SUCCESS' ? 'text-emerald-400' :
                    trace.level === 'WARN' ? 'text-amber-400' :
                    trace.level === 'ERROR' ? 'text-rose-400' : 'text-indigo-400'
                  }`}>[{trace.event}]</span>
                  <span className="truncate text-slate-300">{trace.detail}</span>
                </div>
              )) || (
                <div className="text-slate-400 text-center pt-8">Operational events log populated during run.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
