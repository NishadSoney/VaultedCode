import React from 'react';
import { CheckCircle2, ShieldCheck, Lock, Check, FileCode, ArrowUpRight } from 'lucide-react';

interface CleanStateCardProps {
  contractName: string;
  scannerUsed: string;
}

export const CleanStateCard: React.FC<CleanStateCardProps> = ({ contractName, scannerUsed }) => {
  return (
    <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-8 text-center space-y-6" id="clean-state-card">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
        <ShieldCheck className="w-9 h-9" />
      </div>

      <div className="max-w-md mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
          <Check className="w-3.5 h-3.5" />
          Clean Security Audit
        </div>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
          No Vulnerabilities Detected
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          <strong className="text-slate-800 font-semibold">{contractName}</strong> successfully passed all static analysis detectors and security heuristics without triggering any high, medium, or low risk findings.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto pt-2 text-left">
        <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/50 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-slate-800 block">Reentrancy Guard</span>
            <span className="text-slate-500">Checks-effects-interactions adhered</span>
          </div>
        </div>
        <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/50 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-slate-800 block">Access Controls</span>
            <span className="text-slate-500">Privileged endpoints protected</span>
          </div>
        </div>
        <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/50 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-slate-800 block">External Calls</span>
            <span className="text-slate-500">Safe ether handling verified</span>
          </div>
        </div>
      </div>

      <div className="pt-2 text-xs text-slate-400 font-mono">
        Scanned via {scannerUsed || 'Slither Static Analyzer'} &bull; Risk Score: 0/100 (Safe)
      </div>
    </div>
  );
};
