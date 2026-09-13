import React, { useState } from 'react';
import {
  AlertTriangle,
  Bug,
  Shield,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  FileCode,
  Sparkles,
  Zap,
  ArrowRight,
  Code2,
  Download
} from 'lucide-react';
import { Finding } from '../types';

interface FindingCardProps {
  finding: Finding;
  index: number;
}

export const FindingCard: React.FC<FindingCardProps> = ({ finding, index }) => {
  const [showAttackScenario, setShowAttackScenario] = useState(true);
  const [activeTab, setActiveTab] = useState<'diff' | 'side-by-side'>('side-by-side');
  const [copiedPatch, setCopiedPatch] = useState(false);

  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case 'Critical':
        return {
          badge: 'bg-rose-100 text-rose-800 border-rose-200',
          border: 'border-rose-200',
          indicator: 'bg-rose-500',
        };
      case 'High':
        return {
          badge: 'bg-orange-100 text-orange-800 border-orange-200',
          border: 'border-orange-200',
          indicator: 'bg-orange-500',
        };
      case 'Medium':
        return {
          badge: 'bg-amber-100 text-amber-800 border-amber-200',
          border: 'border-amber-200',
          indicator: 'bg-amber-500',
        };
      default:
        return {
          badge: 'bg-blue-100 text-blue-800 border-blue-200',
          border: 'border-blue-200',
          indicator: 'bg-blue-500',
        };
    }
  };

  const style = getSeverityStyle(finding.severity);

  const handleCopyPatch = async () => {
    try {
      await navigator.clipboard.writeText(finding.fixed_code);
      setCopiedPatch(true);
      setTimeout(() => setCopiedPatch(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownloadPatch = () => {
    const blob = new Blob([finding.fixed_code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${finding.function}_patched.sol`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`bg-white rounded-2xl border ${style.border} shadow-sm overflow-hidden transition-all`}
      id={`finding-card-${index}`}
    >
      {/* Finding Header */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-sm shrink-0 mt-0.5">
            <Bug className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${style.badge}`}>
                {finding.severity} Severity
              </span>
              <span className="text-xs font-mono font-medium text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                Detector: {finding.detector}
              </span>
              <span className="text-xs font-mono font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                Function: {finding.function}
              </span>
              <span className="text-xs font-mono text-slate-400">
                {finding.lines}
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-900 mt-1 tracking-tight">
              Finding #{index + 1}: Vulnerability in <code className="text-indigo-600 font-mono">{finding.function}()</code>
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={handleDownloadPatch}
            className="text-xs font-semibold px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Download</span>
          </button>
          
          <button
            type="button"
            onClick={handleCopyPatch}
            id={`copy-patch-btn-${index}`}
            className="text-xs font-semibold px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm transition-all"
          >
            {copiedPatch ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Plain English Explanation */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Shield className="w-4 h-4 text-indigo-600" />
            <span>Plain English Security Explanation</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-sm text-slate-800 leading-relaxed font-normal">
            {finding.explanation}
          </div>
        </div>

        {/* Collapsible Attack Scenario */}
        <div className="border border-slate-200/90 rounded-xl overflow-hidden bg-slate-50/40">
          <button
            type="button"
            onClick={() => setShowAttackScenario(!showAttackScenario)}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-100/60 transition-colors"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
              <Zap className="w-4 h-4 text-amber-600" />
              <span>Exploit Vector / Attack Scenario</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
              <span>{showAttackScenario ? 'Collapse' : 'Expand'}</span>
              {showAttackScenario ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>
          {showAttackScenario && (
            <div className="px-4 pb-4 pt-1 text-sm text-slate-700 border-t border-slate-200/60 leading-relaxed bg-white">
              <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-lg text-xs font-mono text-amber-950 whitespace-pre-wrap leading-relaxed">
                {finding.attack_scenario}
              </div>
            </div>
          )}
        </div>

        {/* Code View: Side-by-Side or Diff View */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <Code2 className="w-4 h-4 text-indigo-600" />
              <span>Code Remediation Patch</span>
            </div>
            <div className="flex items-center rounded-lg border border-slate-200 p-0.5 bg-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('side-by-side')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  activeTab === 'side-by-side'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Side-by-Side
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('diff')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  activeTab === 'diff'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Patched View
              </button>
            </div>
          </div>

          {activeTab === 'side-by-side' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Original Vulnerable Code */}
              <div className="rounded-xl border border-rose-200 bg-slate-950 overflow-hidden font-mono text-xs">
                <div className="bg-rose-950/50 border-b border-rose-900/60 px-3 py-2 flex items-center justify-between text-rose-300">
                  <span className="font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Original Vulnerable Code
                  </span>
                  <span className="text-[10px] text-rose-400 font-sans">{finding.lines}</span>
                </div>
                <pre className="p-4 text-rose-200 overflow-x-auto leading-relaxed max-h-72">
                  <code>{finding.original_code}</code>
                </pre>
              </div>

              {/* Fixed Patched Code */}
              <div className="rounded-xl border border-emerald-300 bg-slate-950 overflow-hidden font-mono text-xs">
                <div className="bg-emerald-950/50 border-b border-emerald-900/60 px-3 py-2 flex items-center justify-between text-emerald-300">
                  <span className="font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    AI Suggested Remediation (Patched)
                  </span>
                  <span className="text-[10px] text-emerald-400 font-sans flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    Gemini Fix
                  </span>
                </div>
                <pre className="p-4 text-emerald-300 overflow-x-auto leading-relaxed max-h-72">
                  <code>{finding.fixed_code}</code>
                </pre>
              </div>
            </div>
          ) : (
            /* Patched Solo Code */
            <div className="rounded-xl border border-emerald-300 bg-slate-950 overflow-hidden font-mono text-xs">
              <div className="bg-emerald-950/60 border-b border-emerald-900/70 px-4 py-2.5 flex items-center justify-between text-emerald-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="font-semibold">Complete Patched Implementation</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPatch}
                  className="text-[11px] bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 px-2 py-1 rounded transition-colors"
                >
                  {copiedPatch ? 'Copied' : 'Copy Code'}
                </button>
              </div>
              <pre className="p-4 text-emerald-300 overflow-x-auto leading-relaxed max-h-80">
                <code>{finding.fixed_code}</code>
              </pre>
            </div>
          )}

          {/* Fix Explanation note */}
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-900 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="font-semibold">Remediation Rationale: </strong>
              <span>{finding.fix_explanation}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
