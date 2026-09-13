import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { AnalysisResult } from '../types';

interface RiskScoreCardProps {
  result: AnalysisResult;
}

export const RiskScoreCard: React.FC<RiskScoreCardProps> = ({ result }) => {
  const score = result.overall_risk_score;

  // Determine score colors
  // 0-10: Green (Safe)
  // 11-35: Yellow (Low Risk)
  // 36-70: Amber (Moderate/High Risk)
  // 71-100: Red (Critical Risk)
  let statusColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
  let badgeColor = 'bg-emerald-500';
  let label = 'Safe / Secure';
  let summaryDesc = 'No critical security risks identified. The contract adheres to foundational safety patterns.';

  if (score > 70) {
    statusColor = 'text-rose-600 bg-rose-50 border-rose-200';
    badgeColor = 'bg-rose-600';
    label = 'Critical Risk';
    summaryDesc = 'Multiple severe vulnerabilities identified that could lead to immediate fund drainage or unauthorized control.';
  } else if (score > 35) {
    statusColor = 'text-amber-600 bg-amber-50 border-amber-200';
    badgeColor = 'bg-amber-500';
    label = 'High / Medium Risk';
    summaryDesc = 'Potential exploit vectors detected. Code modifications are strongly recommended before any mainnet deployment.';
  } else if (score > 10) {
    statusColor = 'text-yellow-700 bg-yellow-50 border-yellow-200';
    badgeColor = 'bg-yellow-500';
    label = 'Low Risk';
    summaryDesc = 'Minor or low-severity findings detected. Review the suggested code improvements below.';
  }

  // Count severities
  const counts = {
    Critical: result.findings.filter((f) => f.severity === 'Critical').length,
    High: result.findings.filter((f) => f.severity === 'High').length,
    Medium: result.findings.filter((f) => f.severity === 'Medium').length,
    Low: result.findings.filter((f) => f.severity === 'Low').length,
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6" id="risk-score-container">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-5">
          {/* Big Circular / Rounded Risk Score Display */}
          <div
            id="overall-risk-score-badge"
            className={`w-24 h-24 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 shadow-sm ${statusColor}`}
          >
            <span className="text-3xl font-black tracking-tight leading-none">
              {score}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider mt-1 opacity-80">
              / 100 Risk
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <span className={`w-2.5 h-2.5 rounded-full ${badgeColor}`} />
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                {result.contract_name || 'Contract'} Security Report
              </h3>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusColor}`}>
                {label}
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1.5 max-w-xl">
              {summaryDesc}
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 font-mono">
              <span>Scanner: <strong className="text-slate-600">{result.scanner_used || 'Slither'}</strong></span>
              <span>&bull;</span>
              <span>Total Findings: <strong className="text-slate-700">{result.total_findings}</strong></span>
            </div>
          </div>
        </div>

        {/* Severity Badges breakdown */}
        <div className="grid grid-cols-4 gap-2 w-full lg:w-auto">
          <div className="bg-rose-50 border border-rose-200/80 rounded-xl px-3 py-2 text-center">
            <span className="block text-xs font-bold text-rose-700">Critical</span>
            <span className="text-lg font-extrabold text-rose-900">{counts.Critical}</span>
          </div>
          <div className="bg-orange-50 border border-orange-200/80 rounded-xl px-3 py-2 text-center">
            <span className="block text-xs font-bold text-orange-700">High</span>
            <span className="text-lg font-extrabold text-orange-900">{counts.High}</span>
          </div>
          <div className="bg-amber-50 border border-amber-200/80 rounded-xl px-3 py-2 text-center">
            <span className="block text-xs font-bold text-amber-700">Medium</span>
            <span className="text-lg font-extrabold text-amber-900">{counts.Medium}</span>
          </div>
          <div className="bg-blue-50 border border-blue-200/80 rounded-xl px-3 py-2 text-center">
            <span className="block text-xs font-bold text-blue-700">Low</span>
            <span className="text-lg font-extrabold text-blue-900">{counts.Low}</span>
          </div>
        </div>
      </div>

      {/* Progress meter bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-medium text-slate-500">
          <span>0 (Safe)</span>
          <span className="font-semibold text-slate-800">Risk Index: {score}%</span>
          <span>100 (Maximum Vulnerability)</span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
          <div
            className={`h-full transition-all duration-700 rounded-full ${
              score > 70
                ? 'bg-rose-600'
                : score > 35
                ? 'bg-amber-500'
                : score > 10
                ? 'bg-yellow-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.max(score, 5)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
