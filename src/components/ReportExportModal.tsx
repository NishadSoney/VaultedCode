import React, { useState } from 'react';
import { Download, Copy, Check, X, FileText } from 'lucide-react';
import { AnalysisResult } from '../types';

interface ReportExportModalProps {
  result: AnalysisResult;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({ result, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const markdownReport = `# Smart Contract Security Audit Report
**Contract:** ${result.contract_name}
**Risk Score:** ${result.overall_risk_score}/100
**Total Findings:** ${result.total_findings}
**Scanner Engine:** ${result.scanner_used || 'Slither'}

---

## Findings Summary
${
  result.findings.length === 0
    ? '✅ No vulnerabilities detected. Clean security audit.'
    : result.findings
        .map(
          (f, i) => `### Finding #${i + 1}: ${f.detector} [${f.severity}]
- **Target Function:** \`${f.function}()\` (${f.lines})
- **Explanation:** ${f.explanation}
- **Exploit Scenario:** ${f.attack_scenario}

#### AI Recommended Patch
\`\`\`solidity
${f.fixed_code}
\`\`\`
- **Rationale:** ${f.fix_explanation}
`
        )
        .join('\n---\n')
}
`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdownReport);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${result.contract_name}_audit_report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Export Security Audit Report</h3>
              <p className="text-xs text-slate-500">Download or copy report for hackathon submission</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-950 p-4 font-mono text-xs text-slate-300 max-h-72 overflow-y-auto leading-relaxed">
          <pre className="whitespace-pre-wrap">{markdownReport}</pre>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleDownloadJSON}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center gap-2 shadow-sm transition-all"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Download JSON</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 shadow-md shadow-indigo-100 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Copied Markdown!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-white" />
                <span>Copy Markdown Report</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
