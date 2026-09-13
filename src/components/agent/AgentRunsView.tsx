import React, { useState } from 'react';
import {
  Workflow,
  Play,
  CheckCircle2,
  Clock,
  AlertCircle,
  Terminal,
  ChevronRight,
  Filter,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { AgentRun, Lead } from '../../types/index.ts';
import { WorkflowVisualization } from './WorkflowVisualization.tsx';

interface AgentRunsViewProps {
  runs: AgentRun[];
  leads: Lead[];
  onRunLead: (leadId: string) => void;
  onSelectLead: (lead: Lead) => void;
}

export const AgentRunsView: React.FC<AgentRunsViewProps> = ({
  runs,
  leads,
  onRunLead,
  onSelectLead
}) => {
  const [selectedRunId, setSelectedRunId] = useState<string | null>(
    runs.length > 0 ? runs[0].id : null
  );
  const [selectedLeadToRun, setSelectedLeadToRun] = useState<string>(
    leads.length > 0 ? leads[0].id : ''
  );

  const selectedRun = runs.find(r => r.id === selectedRunId) || runs[0];

  return (
    <div id="agent-runs-view" className="space-y-6">
      {/* Top Header & Run Trigger Controls */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span>LangGraph Agent Workflows</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time execution telemetry, node step durations, and operational state transitions.
          </p>
        </div>

        {/* Trigger Pipeline On Lead */}
        <div className="flex items-center space-x-2">
          <select
            value={selectedLeadToRun}
            onChange={e => setSelectedLeadToRun(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {leads.map(l => (
              <option key={l.id} value={l.id}>
                {l.company_name} ({l.status})
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              if (selectedLeadToRun) onRunLead(selectedLeadToRun);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center space-x-1.5 shadow-sm transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Launch Workflow</span>
          </button>
        </div>
      </div>

      {/* Selected Run Visual StateGraph */}
      {selectedRun && (
        <WorkflowVisualization currentRun={selectedRun} />
      )}

      {/* Split View: Runs List & Detailed Operational Trace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Runs List (1 Col) */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-semibold text-slate-200">Execution History</span>
            <span className="text-[10px] font-mono text-slate-400">({runs.length} runs)</span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {runs.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">No runs executed yet.</div>
            ) : (
              runs.map(run => {
                const isSelected = run.id === selectedRun?.id;
                return (
                  <div
                    key={run.id}
                    id={`run-item-${run.id}`}
                    onClick={() => setSelectedRunId(run.id)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-950 border-indigo-500/60 ring-1 ring-indigo-500/30'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-xs text-slate-100">{run.company_name}</h4>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-medium ${
                          run.status === 'human_review_required'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : run.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : run.status === 'failed'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}
                      >
                        {run.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 font-mono">
                      <span>Run: {run.id.slice(-8)}</span>
                      <span>Node: <strong className="text-slate-300">{run.current_node}</strong></span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Node Timings & Operational Trace (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Node Execution Breakdown */}
          {selectedRun && (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-xs font-semibold text-slate-200">
                    Node Execution Telemetry — {selectedRun.company_name}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Start: {selectedRun.started_at} • Total: {selectedRun.duration_ms || 1840}ms
                  </p>
                </div>
                <span className="text-xs font-mono text-indigo-400">LangGraph v0.1+</span>
              </div>

              <div className="space-y-2">
                {selectedRun.nodes.map(node => (
                  <div
                    key={node.id}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-200">{node.display_name}</span>
                        <span className="text-[10px] font-mono text-slate-400">({node.tool_used})</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{node.summary}</p>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      {node.duration_ms && (
                        <span className="text-[10px] font-mono text-slate-400">{node.duration_ms}ms</span>
                      )}
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium ${
                          node.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : node.status === 'RUNNING'
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {node.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Operational Trace Terminal View */}
          {selectedRun && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-slate-200">Operational Trace Stream</span>
                </div>
                <span className="text-[10px] text-slate-400">Strict SSRF & Zero-CoT Enforced</span>
              </div>

              <div className="h-44 overflow-y-auto space-y-1 text-[11px] pr-2">
                {selectedRun.operational_trace.map((trace, i) => (
                  <div key={i} className="flex items-start space-x-2">
                    <span className="text-slate-400 shrink-0">{trace.timestamp}</span>
                    <span className={`shrink-0 ${
                      trace.level === 'SUCCESS' ? 'text-emerald-400' :
                      trace.level === 'WARN' ? 'text-amber-400' :
                      trace.level === 'ERROR' ? 'text-rose-400' : 'text-indigo-400'
                    }`}>
                      [{trace.node}::{trace.event}]
                    </span>
                    <span className="text-slate-300">{trace.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
