import React, { useState } from 'react';
import {
  History,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  Filter,
  Download,
  Terminal,
  Calendar,
  Sparkles
} from 'lucide-react';
import { ActivityEvent } from '../../types/index.ts';

interface ActivityViewProps {
  events: ActivityEvent[];
}

export const ActivityView: React.FC<ActivityViewProps> = ({ events }) => {
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredEvents = events.filter(evt => {
    const matchesLevel = levelFilter === 'all' || evt.level === levelFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      evt.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.lead_name && evt.lead_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      evt.event_type.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesLevel && matchesSearch;
  });

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agenticflow-activity-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'success':
        return {
          icon: CheckCircle2,
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10 border-emerald-500/20'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          color: 'text-amber-400',
          bg: 'bg-amber-500/10 border-amber-500/20'
        };
      case 'error':
        return {
          icon: XCircle,
          color: 'text-rose-400',
          bg: 'bg-rose-500/10 border-rose-500/20'
        };
      default:
        return {
          icon: Info,
          color: 'text-indigo-400',
          bg: 'bg-indigo-500/10 border-indigo-500/20'
        };
    }
  };

  return (
    <div id="activity-view" className="space-y-4">
      {/* Top Filter & Export Bar */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 w-60">
            <Terminal className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search audit trail..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-full"
            />
          </div>

          <select
            value={levelFilter}
            onChange={e => setLevelFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Severity Levels</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs font-mono text-slate-400">
            {filteredEvents.length} log entries
          </span>
          <button
            onClick={handleExportJson}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit JSON</span>
          </button>
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
        <div className="space-y-4">
          {filteredEvents.map(evt => {
            const badge = getLevelBadge(evt.level);
            const Icon = badge.icon;

            return (
              <div
                key={evt.id}
                id={`activity-event-${evt.id}`}
                className="flex items-start space-x-3 pb-4 border-b border-slate-800/60 last:border-0 last:pb-0 text-xs"
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${badge.bg}`}>
                  <Icon className={`w-4 h-4 ${badge.color}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-200">
                        {evt.lead_name || 'System Pipeline'}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {evt.event_type}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{evt.created_at}</span>
                  </div>

                  <p className="text-slate-300 mt-1">{evt.message}</p>

                  {evt.run_id && (
                    <div className="mt-1 text-[10px] font-mono text-slate-400">
                      Run ID: <span className="text-slate-400">{evt.run_id}</span>
                    </div>
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
