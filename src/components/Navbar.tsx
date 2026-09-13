import React from 'react';
import { ShieldCheck, ShieldAlert, Cpu, Sparkles, FileCode2 } from 'lucide-react';

interface NavbarProps {
  backendOnline: boolean | null;
  scannerName: string;
}

export const Navbar: React.FC<NavbarProps> = ({ backendOnline, scannerName }) => {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-30 animate-fade-in" id="main-header">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-12 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200 animate-pulse-slow">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 
                className="text-3xl text-slate-900 tracking-tight leading-none"
                style={{ fontFamily: "'Gotham Bold', 'Gotham', 'Montserrat', sans-serif", fontWeight: 800 }}
              >
                VaultCode
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Smart Contract Vulnerability Detection & Automated Code Patching
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/80">
            <Cpu className="w-3.5 h-3.5 text-slate-500" />
            <span>Scanner: <strong className="text-slate-800">{scannerName || 'Slither Static Analyzer'}</strong></span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/80">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>LLM: <strong className="text-slate-800">Gemini AI</strong></span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border">
            {backendOnline === null ? (
              <span className="flex items-center gap-1.5 text-slate-500 border-slate-200 bg-slate-100 px-2 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
                Connecting...
              </span>
            ) : backendOnline ? (
              <span className="flex items-center gap-1.5 text-emerald-700 border-emerald-200 bg-emerald-50 px-2 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Engine Active
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-700 border-amber-200 bg-amber-50 px-2 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Fallback Ready
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
