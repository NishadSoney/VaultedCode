import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { UploadSection } from './components/UploadSection';
import { RiskScoreCard } from './components/RiskScoreCard';
import { FindingCard } from './components/FindingCard';
import { CleanStateCard } from './components/CleanStateCard';
import { ReportExportModal } from './components/ReportExportModal';
import { SampleContract, AnalysisResult } from './types';
import { Shield, Sparkles, Download, RotateCcw, AlertCircle, FileCheck2 } from 'lucide-react';

const DEFAULT_SOL = ``;

export default function App() {
  const [sampleContracts, setSampleContracts] = useState<SampleContract[]>([]);
  const [selectedContract, setSelectedContract] = useState<string>('');
  const [sourceCode, setSourceCode] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Fetch samples and health on mount
  useEffect(() => {
    fetchHealth();
    fetchSamples();

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate rotation based on center of screen. Reversed axes for looking "at" the cursor.
      const x = (e.clientX / window.innerWidth - 0.5) * 30; // -15 to +15 deg
      const y = (e.clientY / window.innerHeight - 0.5) * -30; // -15 to +15 deg
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await fetch('/health');
      if (res.ok) {
        setBackendOnline(true);
      } else {
        setBackendOnline(false);
      }
    } catch {
      setBackendOnline(false);
    }
  };

  const fetchSamples = async () => {
    try {
      const res = await fetch('/test-contracts');
      if (res.ok) {
        const data = await res.json();
        if (data.contracts && data.contracts.length > 0) {
          setSampleContracts(data.contracts);
          // Demos are now only loaded when explicitly clicked by the user.
        }
      }
    } catch (e) {
      console.warn('Could not fetch sample contracts', e);
    }
  };

  const handleSelectSample = (contract: SampleContract) => {
    setSelectedContract(contract.filename);
    setSourceCode(contract.content);
    setFileName(contract.filename);
    setError(null);
  };

  const handleFileUpload = (file: File) => {
    setSelectedContract('');
    setFileName(file.name);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setSourceCode(text || '');
    };
    reader.readAsText(file);
  };

  const handleAnalyze = async () => {
    if (!sourceCode.trim()) {
      setError('Please provide Solidity contract code to analyze');
      return;
    }

    setIsLoading(true);
    setError(null);
    setLoadingStep('Running Slither Static Analysis...');

    try {
      const formData = new FormData();
      const blob = new Blob([sourceCode], { type: 'text/plain' });
      formData.append('file', blob, fileName || 'Contract.sol');
      formData.append('code', sourceCode);
      formData.append('contract_name', fileName.replace('.sol', '') || 'Contract');

      // Update loading message after 2s to reflect LLM synthesis step
      const stepTimer = setTimeout(() => {
        setLoadingStep('Generating Explanations & AI Patches with Gemini...');
      }, 2200);

      const response = await fetch('/analyze', {
        method: 'POST',
        body: formData,
      });

      clearTimeout(stepTimer);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ detail: 'Analysis failed' }));
        throw new Error(errData.detail || `Server returned error ${response.status}`);
      }

      const data: AnalysisResult = await response.json();
      setAnalysisResult(data);

      // Smooth scroll down to results
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'An unexpected error occurred during contract analysis.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-indigo-100">
      <Navbar
        backendOnline={backendOnline}
        scannerName={analysisResult?.scanner_used || 'Slither Static Analyzer'}
      />

      <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-12 py-8 space-y-8 animate-fade-in">
        {/* Banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-950 rounded-2xl p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden animate-slide-up hover:shadow-indigo-500/20 transition-all duration-500 flex flex-col md:flex-row items-center justify-between">
          <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/20">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Automated Web3 Security Audit & Code Patching</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Scan Solidity Contracts, Understand Vulnerabilities, & Auto-Patch
            </h2>
            <p className="text-base text-slate-300 leading-relaxed">
              Detect reentrancy bugs, broken access control, and logic vulnerabilities via static analysis. Receive clear, human-understandable explanations, exploit scenarios, and complete AI-generated code patches.
            </p>
          </div>
          <div className="relative z-10 hidden md:flex w-64 h-64 lg:w-80 lg:h-80 shrink-0 mr-16 justify-center items-center" style={{ perspective: 1200 }}>
             <img 
               src="/monitor_transparent.png" 
               alt="Secure Terminal" 
               className="w-full h-full object-contain drop-shadow-2xl"
               style={{ 
                 transform: `rotateX(${mousePos.y}deg) rotateY(${mousePos.x}deg) scale(1.15)`,
                 transition: 'transform 0.1s ease-out',
                 transformStyle: 'preserve-3d'
               }} 
             />
          </div>
        </div>

        {/* Upload & Code Input Form */}
        <UploadSection
          sampleContracts={sampleContracts}
          selectedContract={selectedContract}
          sourceCode={sourceCode}
          fileName={fileName}
          onSelectSample={handleSelectSample}
          onCodeChange={setSourceCode}
          onFileUpload={handleFileUpload}
          onAnalyze={handleAnalyze}
          isLoading={isLoading}
          loadingStep={loadingStep}
          error={error}
        />

        {/* Results View */}
        {analysisResult && (
          <div id="results-section" className="space-y-6 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  Audit Results & Generated Patches
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Static analysis report for <strong className="text-slate-800">{analysisResult.contract_name}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  id="btn-export-report"
                  onClick={() => setIsExportOpen(true)}
                  className="text-xs font-semibold px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Download className="w-4 h-4 text-slate-500" />
                  <span>Export Report</span>
                </button>

                <button
                  type="button"
                  id="btn-new-audit"
                  onClick={handleReset}
                  className="text-xs font-semibold px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <RotateCcw className="w-4 h-4 text-slate-500" />
                  <span>New Audit</span>
                </button>
              </div>
            </div>

            {/* Risk Score Card */}
            <RiskScoreCard result={analysisResult} />

            {/* Findings List or Clean State */}
            {analysisResult.total_findings === 0 ? (
              <CleanStateCard
                contractName={analysisResult.contract_name}
                scannerUsed={analysisResult.scanner_used || 'Slither Static Analyzer'}
              />
            ) : (
              <div className="space-y-5" id="findings-list">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    Detected Vulnerabilities ({analysisResult.findings.length})
                  </h4>
                  <span className="text-xs text-slate-500">
                    Showing all patched code diffs below
                  </span>
                </div>

                {analysisResult.findings.map((finding, idx) => (
                  <FindingCard key={idx} finding={finding} index={idx} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Export Report Modal */}
      {analysisResult && (
        <ReportExportModal
          result={analysisResult}
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>VaultCode &bull; Built with Slither Analyzer & Google Gemini AI</span>
          <span>Hackathon Edition &bull; End-to-End Vulnerability Detection & Remediation</span>
        </div>
      </footer>
    </div>
  );
}
