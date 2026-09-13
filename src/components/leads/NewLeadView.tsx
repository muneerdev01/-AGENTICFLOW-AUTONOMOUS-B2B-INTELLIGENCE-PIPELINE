import React, { useState } from 'react';
import {
  Sparkles,
  Building,
  Globe,
  Briefcase,
  MapPin,
  Users,
  DollarSign,
  User,
  Mail,
  Linkedin,
  FileText,
  Play,
  Save,
  RotateCcw
} from 'lucide-react';
import { LeadInput } from '../../types/index.ts';

interface NewLeadViewProps {
  onCreateLead: (lead: LeadInput, autoStart: boolean) => void;
  onCancel: () => void;
}

export const NewLeadView: React.FC<NewLeadViewProps> = ({ onCreateLead, onCancel }) => {
  const [formData, setFormData] = useState<LeadInput>({
    company_name: '',
    domain: '',
    industry: 'Enterprise Software & Cloud',
    country: 'United States',
    city: 'San Francisco, CA',
    company_size: '250-500 employees',
    revenue_range: '$40M - $80M',
    contact_name: '',
    contact_title: '',
    email: '',
    linkedin_url: '',
    product_service: 'Data Pipeline Infrastructure',
    deal_size: '$95,000 / yr',
    business_need: 'Modernizing real-time telemetry processing, reducing infrastructure costs, and automating compliance.',
    notes: 'Referred by executive advisor. High urgency to complete evaluation before next quarter.'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preset demo options
  const loadPreset = (type: 'tech' | 'mfg' | 'health') => {
    if (type === 'tech') {
      setFormData({
        company_name: 'QuantumGrid Systems',
        domain: 'quantumgrid-systems-demo.io',
        industry: 'Distributed Computing & Cloud Infrastructure',
        country: 'United States',
        city: 'Seattle, WA',
        company_size: '500-1000 employees',
        revenue_range: '$80M - $150M',
        contact_name: 'Marcus Vance',
        contact_title: 'Chief Technology Officer',
        email: 'mvance@quantumgrid-systems-demo.io',
        linkedin_url: 'https://linkedin.com/in/marcus-vance-demo',
        product_service: 'Multi-Cloud Stream Broker',
        deal_size: '$120,000 / yr',
        business_need: 'Needs autonomous observability and data verification across 4 distinct cloud regions.',
        notes: 'Priority lead for enterprise tier pipeline.'
      });
    } else if (type === 'mfg') {
      setFormData({
        company_name: 'RoboKinetic Motion',
        domain: 'robokinetic-motion-demo.com',
        industry: 'Industrial Robotics & Mechatronics',
        country: 'United States',
        city: 'Pittsburgh, PA',
        company_size: '200-500 employees',
        revenue_range: '$40M - $75M',
        contact_name: 'Elena Rostova',
        contact_title: 'VP of Manufacturing Engineering',
        email: 'erostova@robokinetic-motion-demo.com',
        linkedin_url: 'https://linkedin.com/in/elena-rostova-demo',
        product_service: 'Collaborative Assembly Arms',
        deal_size: '$85,000 / yr',
        business_need: 'Automating multi-vendor quality audits and assembly cycle telemetries.',
        notes: 'Evaluated legacy software last year; dissatisfied with closed proprietary protocols.'
      });
    } else {
      setFormData({
        company_name: 'Aetheria Health AI',
        domain: 'aetheria-health-demo.org',
        industry: 'Clinical Decision Support Systems',
        country: 'United States',
        city: 'Boston, MA',
        company_size: '100-250 employees',
        revenue_range: '$20M - $40M',
        contact_name: 'Dr. Aaron Chen',
        contact_title: 'Chief Medical Information Officer',
        email: 'achen@aetheria-health-demo.org',
        linkedin_url: 'https://linkedin.com/in/dr-aaron-chen-demo',
        product_service: 'HIPAA Diagnostic Validation',
        deal_size: '$150,000 / yr',
        business_need: 'Stringent audit compliance and zero-leakage enterprise verification pipelines.',
        notes: 'Requires human-in-the-loop review confirmation before proposal export.'
      });
    }
  };

  const handleSubmit = (autoStart: boolean) => {
    if (!formData.company_name.trim()) {
      alert('Company Name is required.');
      return;
    }
    setIsSubmitting(true);
    onCreateLead(formData, autoStart);
  };

  return (
    <div id="new-lead-view" className="max-w-4xl mx-auto space-y-6">
      {/* Header with Preset Quick Buttons */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>New B2B Lead Intake</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Provide company details to launch LangGraph autonomous verification, quality scoring, and proposal generation.
          </p>
        </div>

        {/* Demo Preset Buttons */}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono text-slate-400">Load Preset:</span>
          <button
            type="button"
            onClick={() => loadPreset('tech')}
            className="px-2 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium"
          >
            Cloud Tech
          </button>
          <button
            type="button"
            onClick={() => loadPreset('mfg')}
            className="px-2 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium"
          >
            Robotics
          </button>
          <button
            type="button"
            onClick={() => loadPreset('health')}
            className="px-2 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium"
          >
            HealthTech
          </button>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 space-y-6">
        {/* Section 1: Company Profile */}
        <div>
          <h3 className="text-xs font-semibold text-slate-200 font-mono uppercase tracking-wider mb-4 pb-2 border-b border-slate-800 flex items-center space-x-2">
            <Building className="w-3.5 h-3.5 text-indigo-400" />
            <span>1. Organization & Public Identity</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Company Name <span className="text-rose-400">*</span>
              </label>
              <input
                id="intake-company-name"
                type="text"
                placeholder="e.g. Acme Cloud Corp"
                value={formData.company_name}
                onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Web Domain <span className="text-slate-400 text-[11px]">(for SSRF-aware TLS probe)</span>
              </label>
              <input
                id="intake-domain"
                type="text"
                placeholder="acme-cloud.com"
                value={formData.domain || ''}
                onChange={e => setFormData({ ...formData, domain: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Operating Sector / Industry</label>
              <input
                id="intake-industry"
                type="text"
                placeholder="Enterprise Software, Clean Energy..."
                value={formData.industry || ''}
                onChange={e => setFormData({ ...formData, industry: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">City / Region</label>
                <input
                  id="intake-city"
                  type="text"
                  placeholder="San Francisco, CA"
                  value={formData.city || ''}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Country</label>
                <input
                  id="intake-country"
                  type="text"
                  placeholder="United States"
                  value={formData.country || 'United States'}
                  onChange={e => setFormData({ ...formData, country: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Company Size (Headcount)</label>
              <select
                id="intake-company-size"
                value={formData.company_size || '100-250 employees'}
                onChange={e => setFormData({ ...formData, company_size: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="1-10 employees">1-10 employees (Seed)</option>
                <option value="11-50 employees">11-50 employees (Early)</option>
                <option value="50-100 employees">50-100 employees (Growth)</option>
                <option value="100-250 employees">100-250 employees (Scale)</option>
                <option value="250-500 employees">250-500 employees (Mid-Market)</option>
                <option value="500-1000 employees">500-1000 employees (Enterprise)</option>
                <option value="1000-5000 employees">1000-5000 employees (Strategic)</option>
                <option value="5000+ employees">5000+ employees (Global 2000)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Annual Revenue Bracket</label>
              <select
                id="intake-revenue-range"
                value={formData.revenue_range || '$20M - $50M'}
                onChange={e => setFormData({ ...formData, revenue_range: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="<$1M">&lt; $1M ARR</option>
                <option value="$1M - $10M">$1M - $10M ARR</option>
                <option value="$10M - $25M">$10M - $25M ARR</option>
                <option value="$25M - $50M">$25M - $50M ARR</option>
                <option value="$50M - $100M">$50M - $100M ARR</option>
                <option value="$100M - $250M">$100M - $250M ARR</option>
                <option value="$250M+">$250M+ ARR</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Key Executive & Economics */}
        <div>
          <h3 className="text-xs font-semibold text-slate-200 font-mono uppercase tracking-wider mb-4 pb-2 border-b border-slate-800 flex items-center space-x-2">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>2. Key Contact & Deal Scope</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Primary Executive Contact</label>
              <input
                id="intake-contact-name"
                type="text"
                placeholder="e.g. Jordan Miller"
                value={formData.contact_name || ''}
                onChange={e => setFormData({ ...formData, contact_name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Job Title / Seniority</label>
              <input
                id="intake-contact-title"
                type="text"
                placeholder="VP of Operations, CTO..."
                value={formData.contact_title || ''}
                onChange={e => setFormData({ ...formData, contact_title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Annual Contract Value</label>
              <select
                id="intake-deal-size"
                value={formData.deal_size || '$80,000 / yr'}
                onChange={e => setFormData({ ...formData, deal_size: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="$25,000 / yr">$25,000 / yr (Starter)</option>
                <option value="$50,000 / yr">$50,000 / yr (Growth)</option>
                <option value="$80,000 / yr">$80,000 / yr (Core)</option>
                <option value="$120,000 / yr">$120,000 / yr (Enterprise)</option>
                <option value="$250,000+ / yr">$250,000+ / yr (Strategic)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Business Need & Pain Points */}
        <div>
          <h3 className="text-xs font-semibold text-slate-200 font-mono uppercase tracking-wider mb-4 pb-2 border-b border-slate-800 flex items-center space-x-2">
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>3. Business Need & Context (Feeds LLM Proposal Node)</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Articulated Requirement / Bottleneck
              </label>
              <textarea
                id="intake-business-need"
                rows={3}
                placeholder="Describe the operational challenge, data bottleneck, or technical migration need..."
                value={formData.business_need || ''}
                onChange={e => setFormData({ ...formData, business_need: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Internal Qualification Notes</label>
              <input
                id="intake-notes"
                type="text"
                placeholder="Special instructions, regulatory criteria, timeline constraints..."
                value={formData.notes || ''}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Draft Only</span>
            </button>

            <button
              id="intake-submit-and-run"
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium tracking-tight shadow-md shadow-indigo-600/20 flex items-center space-x-2 transition-all active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              <span>START AUTONOMOUS RESEARCH</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
