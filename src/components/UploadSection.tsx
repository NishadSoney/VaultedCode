import React, { useState, useRef } from 'react';
import { UploadCloud, FileCode2, Play, AlertCircle, CheckCircle2, RefreshCw, FileText, ChevronRight } from 'lucide-react';
import { SampleContract } from '../types';

interface UploadSectionProps {
  sampleContracts: SampleContract[];
  selectedContract: string;
  sourceCode: string;
  fileName: string;
  onSelectSample: (contract: SampleContract) => void;
  onCodeChange: (newCode: string) => void;
  onFileUpload: (file: File) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  loadingStep: string;
  error: string | null;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  sampleContracts,
  selectedContract,
  sourceCode,
  fileName,
  onSelectSample,
  onCodeChange,
  onFileUpload,
  onAnalyze,
  isLoading,
  loadingStep,
  error,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.sol')) {
        onFileUpload(file);
      } else {
        alert('Please upload a Solidity file ending with .sol');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.name.endsWith('.sol')) {
        onFileUpload(file);
      } else {
        alert('Please upload a Solidity file ending with .sol');
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6" id="upload-section-card">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-indigo-600" />
            Upload or Select Smart Contract
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Provide a Solidity (<code className="text-xs font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">.sol</code>) source file to run static analysis and generate AI remediation patches.
          </p>
        </div>

        {/* Quick Demo Pre-sets */}
        <div className="w-full">
          <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Demo Samples:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {sampleContracts.map((sc) => {
            const isSelected = selectedContract === sc.filename;
            const isClean = sc.filename.includes('Safe');
            const isCritical = sc.filename.includes('Critical');
            const isHigh = sc.filename.includes('High');
            
            return (
              <button
                key={sc.filename}
                type="button"
                id={`sample-btn-${sc.name.toLowerCase()}`}
                onClick={() => onSelectSample(sc)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : isClean
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : isCritical
                    ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                    : isHigh
                    ? 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
                    : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                }`}
              >
                <span>{sc.name.replace(/([A-Z])/g, ' $1').trim()}</span>
                {isClean ? (
                  <span className="text-[10px] opacity-75 font-normal">(Clean)</span>
                ) : (
                  <span className="text-[10px] opacity-75 font-normal">(Vulnerable)</span>
                )}
              </button>
            );
          })}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Side: Drag & Drop Zone (20%) */}
        <div className="w-full lg:w-1/5 flex flex-col gap-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            id="dropzone"
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex-1 flex flex-col justify-center items-center ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]'
                : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/70 bg-slate-50/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".sol"
              onChange={handleFileChange}
              className="hidden"
              id="sol-file-input"
            />
            <div className="w-12 h-12 rounded-full bg-indigo-100/80 text-indigo-600 flex items-center justify-center mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              Select or Drop <span className="text-indigo-600">.sol</span>
            </p>
            {fileName && (
              <div className="mt-4 inline-flex items-center gap-2 text-xs font-mono font-medium text-indigo-700 bg-indigo-50 border border-indigo-200/70 px-3 py-2 rounded-md max-w-full overflow-hidden">
                <FileText className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="truncate">{fileName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Code Editor (80%) */}
        <div className="w-full lg:w-4/5 space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="code-preview" className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <span>Contract Source Code</span>
              <span className="text-[11px] font-normal text-slate-400 normal-case">
                (You can inspect or edit directly before running analysis)
              </span>
            </label>
            <span className="text-xs font-mono text-slate-400">
              {sourceCode.split('\n').length} lines
            </span>
          </div>

          <div className="relative rounded-xl border border-slate-200 bg-slate-950 font-mono text-xs overflow-hidden shadow-inner h-[320px]">
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-slate-400 h-[36px]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-slate-300 font-sans text-[11px]">{fileName || 'Contract.sol'}</span>
              </div>
              <span className="text-[11px] text-slate-500">Solidity</span>
            </div>

            <textarea
              id="code-preview"
              value={sourceCode}
              onChange={(e) => onCodeChange(e.target.value)}
              className="w-full h-[calc(100%-36px)] bg-transparent text-emerald-300 p-4 font-mono text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none selection:bg-indigo-900"
              placeholder="// Paste or write Solidity smart contract code here..."
              spellCheck={false}
            />
          </div>
        </div>
      </div>

      {/* Error notification banner if any */}
      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 flex items-start gap-3 text-rose-800 text-sm" id="analysis-error-banner">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-rose-900">Analysis Notice</p>
            <p className="text-xs text-rose-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Analyze CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Runs Slither Static Analysis first &bull; Gemini generates explanations & patches</span>
        </div>

        <button
          type="button"
          id="btn-analyze-contract"
          onClick={onAnalyze}
          disabled={isLoading || !sourceCode.trim()}
          className={`w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2.5 transition-all shadow-md ${
            isLoading || !sourceCode.trim()
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 hover:shadow-indigo-300 active:scale-[0.98]'
          }`}
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>{loadingStep || 'Analyzing Contract...'}</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Analyze Contract & Generate Fixes</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
