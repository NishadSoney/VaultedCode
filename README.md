# Smart Contract Vulnerability Detection & Code Patching (SolidityGuard AI)

A complete, working end-to-end Web3 security application for detecting vulnerabilities in Solidity smart contracts and generating automated AI code patches.

## Overview
1. **Upload or Select Contract**: Upload any `.sol` file, drag-and-drop, or choose from pre-bundled vulnerability test contracts (Reentrancy, Missing Access Control, Clean Secure Vault).
2. **Static Analysis**: Runs Slither (`slither-analyzer`) via subprocess to detect structural flaws, reentrancy vulnerabilities, access control lapses, and bad patterns.
3. **AI Remediation & Patching**: Synthesizes each finding using Gemini to generate:
   - Plain English vulnerability explanation
   - Concrete attack scenario / exploit vector walkthrough
   - Exact side-by-side patched code fix
   - Rationale for the patch
4. **Interactive Dashboard**:
   - Color-coded risk score gauge (0 to 100)
   - Severity breakdown badges (Critical, High, Medium, Low)
   - Side-by-side and patched code views with syntax styling
   - 1-click "Copy AI Patch" button
   - Clean state celebration card for secure contracts (0 issues)
   - Full audit report export (Markdown & JSON)

---

## Tech Stack
- **Backend**: Python 3 + FastAPI (`main.py`)
- **Vulnerability Scanner**: Slither Static Analyzer (`slither-analyzer` + `solc-select`)
- **LLM**: Google Gemini API via `@google/genai` Python SDK
- **Frontend**: React 19 + Vite + Tailwind CSS + Lucide Icons

---

## API Endpoints

### `POST /analyze`
Accepts a `.sol` file via `multipart/form-data` (or raw source code in form data).
Returns:
```json
{
  "contract_name": "ReentrancyVulnerable",
  "total_findings": 1,
  "overall_risk_score": 25,
  "scanner_used": "Slither Static Analyzer",
  "findings": [
    {
      "detector": "reentrancy-eth",
      "severity": "High",
      "function": "withdraw",
      "lines": "L18-L27",
      "original_code": "...",
      "explanation": "The withdraw function violates the Checks-Effects-Interactions pattern...",
      "attack_scenario": "1. Attacker deploys a malicious contract with fallback...",
      "fixed_code": "function withdraw() public { ... balances[msg.sender] = 0; ... }",
      "fix_explanation": "Applied Checks-Effects-Interactions pattern by updating user balance before external call."
    }
  ]
}
```

### `GET /health`
Returns system status, verification of Slither and Solc installations, and Gemini API readiness:
```json
{
  "status": "healthy",
  "slither_installed": true,
  "solc_installed": true,
  "gemini_configured": true
}
```

### `GET /test-contracts`
Returns the list of bundled test contracts (`ReentrancyVulnerable.sol`, `MissingAccessControl.sol`, `SecureVault.sol`) with descriptions and code.

---

## Running Locally

### 1. Start the FastAPI Backend
```bash
python3 -m uvicorn main:app --port 8001 --reload
```

### 2. Start the Frontend Dev Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.
