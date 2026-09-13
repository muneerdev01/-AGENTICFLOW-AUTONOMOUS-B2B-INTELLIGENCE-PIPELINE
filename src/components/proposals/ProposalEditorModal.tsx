import React, { useState } from 'react';
import {
  X,
  FileText,
  CheckCircle2,
  XCircle,
  Sparkles,
  Copy,
  Download,
  AlertTriangle,
  Edit3,
  Save,
  Check,
  Building,
  ArrowRight
} from 'lucide-react';
import { Proposal, Lead } from '../../types/index.ts';

interface ProposalEditorModalProps {
  proposal: Proposal;
  lead: Lead;
  onClose: () => void;
  onSave: (updatedProposal: Proposal) => void;
  onApprove: (proposalId: string) => void;
  onReject: (proposalId: string) => void;
  onRegenerate: (leadId: string) => void;
}

export const ProposalEditorModal: React.FC<ProposalEditorModalProps> = ({
  proposal,
  lead,
  onClose,
  onSave,
  onApprove,
  onReject,
  onRegenerate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Proposal>({ ...proposal });
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `
# ${formData.title}

## Executive Summary
${formData.executive_summary}

## Client Needs
${formData.client_needs.map(n => `- ${n}`).join('\n')}

## Proposed Solution Architecture
${formData.proposed_solution}

## Business Value & ROI
${formData.business_value.map(v => `- ${v}`).join('\n')}

## Recommended Next Steps
${formData.recommended_next_steps.map(s => `- ${s}`).join('\n')}

## Engagement Approach
${formData.engagement_approach}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const text = `# ${formData.title}\n\n## Executive Summary\n${formData.executive_summary}\n\n## Proposed Solution\n${formData.proposed_solution}`;
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Proposal-${lead.company_name.replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveEdits = () => {
    onSave(formData);
    setIsEditing(false);
  };

  return (
    <div
      id="proposal-editor-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Top Action Bar */}
        <div className="p-4 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-sm text-slate-100">{lead.company_name} — B2B Proposal</h3>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                    formData.status === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : formData.status === 'rejected'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {formData.status.replace(/_/g, ' ').toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Created by Autonomous LLM Proposal Generator</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center space-x-1 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleExport}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center space-x-1 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .md</span>
            </button>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-xs font-medium flex items-center space-x-1 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'View Mode' : 'Edit Document'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Human-In-The-Loop Prominent Review Banner */}
        <div className="bg-amber-500/10 border-b border-amber-500/30 p-3 px-6 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 text-xs text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              <strong>HUMAN REVIEW MANDATE:</strong> The autonomous agent never initiates external outreach
              automatically. Review and approve below before transmitting.
            </span>
          </div>
        </div>

        {/* Modal Scrollable Document Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-200">
          {/* Document Title */}
          <div>
            <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Proposal Title</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm font-semibold text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            ) : (
              <h2 className="text-base font-bold text-slate-100">{formData.title}</h2>
            )}
          </div>

          {/* Section 1: Executive Summary */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <h4 className="text-xs font-semibold text-indigo-400 uppercase font-mono tracking-wider">
              1. Executive Summary
            </h4>
            {isEditing ? (
              <textarea
                rows={4}
                value={formData.executive_summary}
                onChange={e => setFormData({ ...formData, executive_summary: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            ) : (
              <p className="leading-relaxed text-slate-300">{formData.executive_summary}</p>
            )}
          </div>

          {/* Section 2: Client Needs */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <h4 className="text-xs font-semibold text-indigo-400 uppercase font-mono tracking-wider">
              2. Identified Client Needs & Operational Challenges
            </h4>
            <ul className="space-y-1.5 pl-1">
              {formData.client_needs.map((need, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-slate-300">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span>{need}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 3: Proposed Solution */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <h4 className="text-xs font-semibold text-indigo-400 uppercase font-mono tracking-wider">
              3. Proposed Solution Architecture
            </h4>
            {isEditing ? (
              <textarea
                rows={4}
                value={formData.proposed_solution}
                onChange={e => setFormData({ ...formData, proposed_solution: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            ) : (
              <p className="leading-relaxed text-slate-300">{formData.proposed_solution}</p>
            )}
          </div>

          {/* Section 4: Business Value / ROI */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <h4 className="text-xs font-semibold text-indigo-400 uppercase font-mono tracking-wider">
              4. Projected Business Value & ROI
            </h4>
            <ul className="space-y-1.5 pl-1">
              {formData.business_value.map((bv, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-slate-300">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>{bv}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 5: Recommended Next Steps */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <h4 className="text-xs font-semibold text-indigo-400 uppercase font-mono tracking-wider">
              5. Recommended Next Steps
            </h4>
            <ul className="space-y-1.5 pl-1">
              {formData.recommended_next_steps.map((st, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-slate-300">
                  <span className="text-amber-400 font-bold">→</span>
                  <span>{st}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 6 & 7: Engagement Approach & Personalization Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <h4 className="text-xs font-semibold text-indigo-400 uppercase font-mono tracking-wider">
                6. Engagement Approach
              </h4>
              <p className="text-slate-300">{formData.engagement_approach}</p>
            </div>

            <div className="space-y-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <h4 className="text-xs font-semibold text-indigo-400 uppercase font-mono tracking-wider">
                7. Personalization Notes
              </h4>
              <p className="text-slate-400 text-[11px] font-mono">{formData.personalization_notes}</p>
            </div>
          </div>
        </div>

        {/* Human Action Footer */}
        <div className="p-4 px-6 border-t border-slate-800 bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onRegenerate(lead.id)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium flex items-center space-x-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Regenerate via Agent</span>
            </button>
            {isEditing && (
              <button
                onClick={handleSaveEdits}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Edits</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              id="proposal-reject-btn"
              onClick={() => onReject(formData.id)}
              className="px-4 py-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-medium flex items-center space-x-1.5 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject Proposal</span>
            </button>

            <button
              id="proposal-approve-btn"
              onClick={() => onApprove(formData.id)}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium tracking-tight shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 transition-all active:scale-[0.98]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve for Outreach</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
