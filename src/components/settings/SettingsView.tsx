import React, { useState, useEffect } from 'react';
import {
  Settings,
  Sparkles,
  Shield,
  Database,
  Search,
  Cpu,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Server
} from 'lucide-react';
import { AppSettings } from '../../types/index.ts';

interface SettingsViewProps {
  settings?: AppSettings | null;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onResetDemoData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetDemoData
}) => {
  const [formData, setFormData] = useState<AppSettings>({
    demo_mode: true,
    search_provider: 'demo',
    llm_provider: 'demo',
    supabase_enabled: false,
    ssrf_protection_active: true,
    gemini_api_key_configured: false,
    tavily_api_key_configured: false,
    supabase_configured: false,
    ...(settings || {})
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(prev => ({ ...prev, ...settings }));
    }
  }, [settings]);

  const handleSave = () => {
    onUpdateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div id="settings-view" className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-5 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 flex items-center space-x-2">
            <Settings className="w-4 h-4 text-indigo-400" />
            <span>AgenticFlow System Settings & Security Controls</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure providers, toggle between $0 Demo Mode and live external networks, and audit SSRF defenses.
          </p>
        </div>

        {savedSuccess && (
          <span className="text-xs font-mono text-emerald-400 flex items-center space-x-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Applied</span>
          </span>
        )}
      </div>

      {/* 1. $0 Demo Mode Toggle */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-xs font-semibold text-slate-100 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Operating Mode ($0 Demo vs Live)</span>
            </h3>
            <p className="text-xs text-slate-400">
              In Demo Mode, AgenticFlow uses deterministic synthetic data and requires $0 in paid API keys.
            </p>
          </div>

          <button
            id="settings-demo-mode-toggle"
            type="button"
            onClick={() => setFormData({ ...formData, demo_mode: !formData.demo_mode })}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              formData.demo_mode ? 'bg-amber-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                formData.demo_mode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {formData.demo_mode ? (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-slate-300">
            <span className="text-amber-300 font-semibold block">Demo Mode Active:</span>
            No external paid search or LLM API calls will be made. All simulated citations will carry the
            <strong className="text-amber-400 font-mono ml-1">Synthetic Demo Source</strong> trust badge.
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-slate-300">
            <span className="text-indigo-300 font-semibold block">Live Mode Active:</span>
            External requests will be routed to configured live providers (DuckDuckGo, Tavily, or Gemini). Ensure API keys are defined in your environment.
          </div>
        )}
      </div>

      {/* 2. Provider Abstractions Configuration */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-5">
        <h3 className="text-xs font-semibold text-slate-200 font-mono uppercase tracking-wider pb-2 border-b border-slate-800">
          Autonomous Provider Engines
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Search Provider */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium flex items-center space-x-1.5">
              <Search className="w-3.5 h-3.5 text-indigo-400" />
              <span>Search Tool Provider</span>
            </label>
            <select
              value={formData.search_provider}
              onChange={e => setFormData({ ...formData, search_provider: e.target.value as any })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="demo">Demo Search ($0 Synthetic Fallback)</option>
              <option value="duckduckgo">DuckDuckGo Public HTML Search (Free)</option>
              <option value="tavily">Tavily Search API (Requires TAVILY_API_KEY)</option>
            </select>
          </div>

          {/* LLM Provider */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>LLM & Proposal Provider</span>
            </label>
            <select
              value={formData.llm_provider}
              onChange={e => setFormData({ ...formData, llm_provider: e.target.value as any })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="demo">Demo LLM Provider ($0 Deterministic Structured Engine)</option>
              <option value="gemini">Google Gemini 2.5 Flash (Requires GEMINI_API_KEY)</option>
            </select>
          </div>

          {/* Storage Provider */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium flex items-center space-x-1.5">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>Database & Persistence Layer</span>
            </label>
            <select
              value={formData.storage_provider}
              onChange={e => setFormData({ ...formData, storage_provider: e.target.value as any })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="demo">In-Memory Store with Seeded B2B Opportunities</option>
              <option value="supabase">Supabase PostgreSQL (Configured via env)</option>
            </select>
          </div>

          {/* Registry Provider */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium flex items-center space-x-1.5">
              <Server className="w-3.5 h-3.5 text-indigo-400" />
              <span>Corporate Registry Tool</span>
            </label>
            <select
              value={formData.registry_provider}
              onChange={e => setFormData({ ...formData, registry_provider: e.target.value as any })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="demo">State Corporate Registry Emulator (Demo)</option>
              <option value="live">Live SEC / State Registry Lookup</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Security & SSRF Protection Policy */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-3">
        <h3 className="text-xs font-semibold text-slate-200 font-mono uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center space-x-2">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Active SSRF Protection Guardrails</span>
        </h3>

        <div className="space-y-2 text-xs text-slate-300">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <span>Loopback & Localhost Resolution (127.0.0.1, ::1)</span>
            <span className="font-mono text-emerald-400 font-semibold">BLOCKED</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <span>RFC 1918 Private Ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)</span>
            <span className="font-mono text-emerald-400 font-semibold">BLOCKED</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <span>Cloud Metadata Endpoints (169.254.169.254 / metadata.google.internal)</span>
            <span className="font-mono text-emerald-400 font-semibold">BLOCKED</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <span>Max Redirect Depth & Connection Timeout</span>
            <span className="font-mono text-slate-300">3 hops / 5000ms</span>
          </div>
        </div>
      </div>

      {/* 4. Reset & Save Actions */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 flex items-center justify-between">
        <button
          id="reset-demo-data-btn"
          type="button"
          onClick={onResetDemoData}
          className="px-3.5 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-medium flex items-center space-x-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Demo Data</span>
        </button>

        <button
          id="save-settings-btn"
          type="button"
          onClick={handleSave}
          className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md transition-all active:scale-[0.98]"
        >
          Save System Configuration
        </button>
      </div>
    </div>
  );
};
