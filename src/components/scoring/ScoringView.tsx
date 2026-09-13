import React, { useState } from 'react';
import {
  Target,
  TrendingUp,
  Award,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  ChevronRight,
  Info,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { Lead, LeadScore } from '../../types/index.ts';

interface ScoringViewProps {
  leads: Lead[];
  onScoreLead: (leadId: string) => void;
  onSelectLead: (lead: Lead) => void;
}

export const ScoringView: React.FC<ScoringViewProps> = ({
  leads,
  onScoreLead,
  onSelectLead
}) => {
  const [selectedLeadId, setSelectedLeadId] = useState<string>(leads[0]?.id || '');

  // Simulator state
  const [simCompanyFit, setSimCompanyFit] = useState(22);
  const [simMarketFit, setSimMarketFit] = useState(18);
  const [simBusinessNeed, setSimBusinessNeed] = useState(16);
  const [simCredibility, setSimCredibility] = useState(18);
  const [simEngagement, setSimEngagement] = useState(12);

  const simTotal = simCompanyFit + simMarketFit + simBusinessNeed + simCredibility + simEngagement;
  const simQual =
    simTotal >= 80 ? 'hot' : simTotal >= 60 ? 'warm' : simTotal >= 40 ? 'cold' : 'unqualified';

  const currentLead = leads.find(l => l.id === selectedLeadId) || leads[0];
  const score = currentLead?.latest_score;

  return (
    <div id="scoring-view" className="space-y-6">
      {/* Scoring Engine Architectural Formula Card */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center space-x-2">
              <Target className="w-4 h-4 text-indigo-400" />
              <span>Transparent 0–100 Weighted Qualification Engine</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Deterministic scoring formula mapping enterprise signals directly to qualification tiers. No black-box AI guessing.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-[10px] font-mono">
            <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold">
              80–100: HOT
            </span>
            <span className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold">
              60–79: WARM
            </span>
            <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold">
              40–59: COLD
            </span>
            <span className="px-2 py-1 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 font-semibold">
              &lt;40: UNQUALIFIED
            </span>
          </div>
        </div>

        {/* 5 Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex justify-between text-[11px] font-medium text-slate-300">
              <span>Company Fit</span>
              <span className="font-mono text-indigo-400 font-bold">25%</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Headcount scale, annual recurring revenue (ARR)</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex justify-between text-[11px] font-medium text-slate-300">
              <span>Market Fit</span>
              <span className="font-mono text-cyan-400 font-bold">20%</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Industry tech alignment & sector spend velocity</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex justify-between text-[11px] font-medium text-slate-300">
              <span>Business Need</span>
              <span className="font-mono text-emerald-400 font-bold">20%</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Articulated requirements & pain point urgency</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex justify-between text-[11px] font-medium text-slate-300">
              <span>Credibility</span>
              <span className="font-mono text-amber-400 font-bold">20%</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Verified HTTPS status & legal registry standing</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 col-span-2 md:col-span-1">
            <div className="flex justify-between text-[11px] font-medium text-slate-300">
              <span>Engagement</span>
              <span className="font-mono text-purple-400 font-bold">15%</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Executive stakeholder title & target ACV deal size</p>
          </div>
        </div>
      </div>

      {/* Main Split: Leads List & Detailed Score Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leads Score List */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-semibold text-slate-200">Scored Opportunities</span>
            <span className="text-[10px] font-mono text-slate-400">({leads.length})</span>
          </div>

          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {leads.map(lead => {
              const isSelected = lead.id === selectedLeadId;
              const sc = lead.latest_score?.total_score;

              return (
                <div
                  key={lead.id}
                  onClick={() => setSelectedLeadId(lead.id)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-950 border-indigo-500/60 ring-1 ring-indigo-500/30'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-xs text-slate-100">{lead.company_name}</h4>
                    {sc !== undefined ? (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                          sc >= 80
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : sc >= 60
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : sc >= 40
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {sc} pts
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-mono">Unscored</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-mono">
                    <span>{lead.industry}</span>
                    <span className="uppercase">{lead.latest_score?.qualification || 'NEW'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Lead Score Card & Real-Time Simulator (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {currentLead && score ? (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-5">
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-semibold text-slate-100">{currentLead.company_name}</h3>
                    <span
                      className={`text-xs font-mono px-2.5 py-0.5 rounded font-bold border ${
                        score.qualification === 'hot'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : score.qualification === 'warm'
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                          : score.qualification === 'cold'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {score.qualification.toUpperCase()} ({score.total_score} / 100)
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Evaluated against multi-cloud target economic benchmarks
                  </p>
                </div>

                <button
                  onClick={() => onScoreLead(currentLead.id)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium flex items-center space-x-1.5 transition-colors self-start"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-Compute Score</span>
                </button>
              </div>

              {/* Progress Bars for the 5 Factors */}
              <div className="space-y-3.5">
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Company Fit (Scale & Annual Revenue)</span>
                    <span className="font-mono text-indigo-400 font-semibold">{score.breakdown.company_fit} / 25 pts</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${(score.breakdown.company_fit / 25) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Market Fit (Target Operating Sector)</span>
                    <span className="font-mono text-cyan-400 font-semibold">{score.breakdown.market_fit} / 20 pts</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-cyan-500 rounded-full"
                      style={{ width: `${(score.breakdown.market_fit / 20) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Business Need (Urgency & Complexity)</span>
                    <span className="font-mono text-emerald-400 font-semibold">{score.breakdown.business_need} / 20 pts</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${(score.breakdown.business_need / 20) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Credibility (SSRF TLS Probe & Registry)</span>
                    <span className="font-mono text-amber-400 font-semibold">{score.breakdown.credibility} / 20 pts</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${(score.breakdown.credibility / 20) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Engagement Potential (Seniority & ACV Scope)</span>
                    <span className="font-mono text-purple-400 font-semibold">{score.breakdown.engagement_potential} / 15 pts</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${(score.breakdown.engagement_potential / 15) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Positive Signals & Risk Signals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold block">
                    Positive Signals Detected
                  </span>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {score.positive_signals.map((sig, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>{sig}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-rose-400 font-semibold block">
                    Risk / Disqualification Flags
                  </span>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {score.risk_signals.length > 0 ? (
                      score.risk_signals.map((sig, i) => (
                        <li key={i} className="flex items-start space-x-1.5">
                          <span className="text-rose-400 font-bold">!</span>
                          <span>{sig}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-400">Zero critical disqualifications detected.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-8 text-center text-slate-400">
              <Target className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs">No score computed for this lead yet.</p>
            </div>
          )}

          {/* Interactive What-If Score Simulator */}
          <div className="bg-slate-900/70 border border-indigo-500/30 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-semibold text-slate-100">Interactive What-If Score Simulator</h4>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-slate-300">Total:</span>
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    simTotal >= 80
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : simTotal >= 60
                      ? 'bg-indigo-500/20 text-indigo-300'
                      : simTotal >= 40
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {simTotal} PTS ({simQual.toUpperCase()})
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Company Fit (0–25)</span>
                    <span className="font-mono text-indigo-400 font-bold">{simCompanyFit}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={simCompanyFit}
                    onChange={e => setSimCompanyFit(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Market Fit (0–20)</span>
                    <span className="font-mono text-cyan-400 font-bold">{simMarketFit}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={simMarketFit}
                    onChange={e => setSimMarketFit(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Business Need (0–20)</span>
                    <span className="font-mono text-emerald-400 font-bold">{simBusinessNeed}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={simBusinessNeed}
                    onChange={e => setSimBusinessNeed(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Credibility (0–20)</span>
                    <span className="font-mono text-amber-400 font-bold">{simCredibility}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={simCredibility}
                    onChange={e => setSimCredibility(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Engagement Potential (0–15)</span>
                    <span className="font-mono text-purple-400 font-bold">{simEngagement}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    value={simEngagement}
                    onChange={e => setSimEngagement(Number(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
