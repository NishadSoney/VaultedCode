export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export interface Finding {
  detector: string;
  severity: SeverityLevel;
  function: string;
  lines: string;
  original_code: string;
  explanation: string;
  attack_scenario: string;
  fixed_code: string;
  fix_explanation: string;
}

export interface AnalysisResult {
  contract_name: string;
  total_findings: number;
  overall_risk_score: number;
  scanner_used?: string;
  findings: Finding[];
  error_notes?: string | null;
  message?: string;
}

export interface SampleContract {
  filename: string;
  name: string;
  description: string;
  content: string;
}
