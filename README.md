# 🛡️ SolidityGuard AI

**Smart Contract Vulnerability Detection & Automated AI Code Patching**

SolidityGuard AI is an end-to-end Web3 security application that scans Solidity smart contracts for vulnerabilities and uses AI to generate concrete, ready-to-review patches — turning a raw static-analysis report into a plain-English explanation, an attack walkthrough, and a fixed version of the code.

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Slither](https://img.shields.io/badge/Slither-Static%20Analysis-orange)
![Gemini](https://img.shields.io/badge/Gemini-AI%20Patching-4285F4?logo=googlegemini&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Overview

1. **Upload or select a contract** — drag-and-drop a `.sol` file, or choose from pre-bundled test contracts (Reentrancy, Missing Access Control, Clean Secure Vault).
2. **Static analysis** — runs [Slither](https://github.com/crytic/slither) via subprocess to detect structural flaws: reentrancy, access control lapses, and other bad patterns.
3. **AI remediation & patching** — each finding is sent to Gemini, which returns:
   - A plain-English vulnerability explanation
   - A concrete attack scenario / exploit walkthrough
   - An exact, side-by-side patched code fix
   - The rationale behind the patch
4. **Interactive dashboard**:
   - Color-coded risk score gauge (0–100)
   - Severity breakdown badges (Critical / High / Medium / Low)
   - Side-by-side original vs. patched code with syntax highlighting
   - One-click "Copy AI Patch" button
   - Clean-state celebration card when a contract has 0 issues
   - Full audit report export (Markdown & JSON)

---

## 💡 Why This Matters — A Real-World Example

Imagine a UPI-style payments app, but built on the blockchain — real money moving in real time, with no bank in the middle to reverse a mistake. Every transaction is only allowed to go through if a specific condition is met: *"Does this wallet have enough balance?"*, *"Is this the rightful owner?"*, *"Has this payment already been made?"*

That condition isn't enforced by a bank's backend team who can patch a bug overnight. It's written once, by a developer, in a smart contract — a `.sol` file — and deployed permanently to the blockchain. **Once it's live, it usually can't be edited.** There's no rollback, no "we'll fix it in the next release." If the logic has a flaw, it's a flaw forever, sitting in front of real funds, waiting to be found — either by a security researcher, or by an attacker.

And here's the uncomfortable truth: **most smart contract developers are not cybersecurity experts.** They're skilled at building products, not at thinking like an attacker. A single overlooked pattern — funds sent before a balance is updated, a missing ownership check, an unprotected admin function — can be all it takes for someone to drain a contract of millions of dollars in minutes. History is full of these stories: entire protocols emptied because of one line of code nobody caught in time.

This is exactly the gap SolidityGuard AI closes.

- 🧑‍💻 **For developers** — you don't need to be a security researcher to ship secure code. SolidityGuard AI scans your contract, finds the exploitable weaknesses, and — instead of just handing you a cryptic scanner report — walks you through *exactly* what's wrong, *why* it's dangerous, *how* an attacker could exploit it, and *what the corrected code should look like.*
- 🏢 **For founders and product teams** — you get a clear, color-coded risk score before you ever deploy to mainnet, so security isn't a mystery buried in engineering — it's a number you can act on.
- 🔍 **For auditors and security reviewers** — you get a head start: a structured, exportable report that surfaces the obvious issues instantly, so your expertise can go toward the subtle ones.
- 🙋 **For everyday users of Web3 apps** — every contract that gets caught and patched *before* deployment is money, identity, and trust that never gets stolen in the first place.

In short: smart contracts don't get second chances. SolidityGuard AI makes sure the *first* chance is a safe one — by turning "here's a list of scary findings" into "here's what's wrong, why it matters, and exactly how to fix it."

---

## 📸 Preview

> _Add a screenshot or GIF of the dashboard here, e.g._
> `![Dashboard preview](docs/preview.png)`

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3 + FastAPI (`main.py`) |
| Vulnerability Scanner | Slither (`slither-analyzer`) + `solc-select` |
| LLM | Google Gemini API via `@google/genai` Python SDK |
| Frontend | React 19 + Vite + Tailwind CSS + Lucide Icons |

---

## 🏗️ Architecture

```
┌─────────────┐     .sol file      ┌──────────────┐     findings     ┌──────────────┐
│   React UI  │ ─────────────────> │  FastAPI      │ ────────────────>│   Slither    │
│ (Vite/Tail- │                    │  Backend      │                   │  Static Scan │
│  wind)      │ <───────────────── │  (main.py)    │ <────────────────│              │
└─────────────┘   patched report   └──────┬───────┘   raw findings    └──────────────┘
                                           │
                                           │ finding-by-finding
                                           ▼
                                   ┌──────────────┐
                                   │  Gemini API   │
                                   │ (explanation, │
                                   │  patch, etc.) │
                                   └──────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+ and npm
- [`solc-select`](https://github.com/crytic/solc-select) with at least one Solidity compiler version installed
- A [Google Gemini API key](https://ai.google.dev/)

### 1. Clone the repository

```bash
git clone https://github.com/NishadSoney/<repo-name>.git
cd <repo-name>
```

### 2. Backend setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Install and select a Solidity compiler version
solc-select install 0.8.20
solc-select use 0.8.20

# Configure your Gemini API key
export GEMINI_API_KEY="your-api-key-here"   # or add to a .env file
```

Start the FastAPI backend:

```bash
python3 -m uvicorn main:app --port 8001 --reload
```

### 3. Frontend setup

```bash
npm install
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## ⚙️ Environment Variables

| Variable | Description | Required |
|---|---|---|
| `GEMINI_API_KEY` | API key for Google Gemini, used for AI vulnerability explanations and patch generation | Yes |

---

## 📡 API Reference

### `POST /analyze`

Accepts a `.sol` file via `multipart/form-data` (or raw source code as a form field).

**Response:**

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

Returns system status, verifying Slither/Solc installations and Gemini API readiness.

```json
{
  "status": "healthy",
  "slither_installed": true,
  "solc_installed": true,
  "gemini_configured": true
}
```

### `GET /test-contracts`

Returns the list of bundled test contracts (`ReentrancyVulnerable.sol`, `MissingAccessControl.sol`, `SecureVault.sol`) with descriptions and source code.

---

## 📁 Project Structure

```
.
├── main.py                # FastAPI backend entry point
├── requirements.txt       # Python dependencies
├── contracts/              # Bundled test contracts
│   ├── ReentrancyVulnerable.sol
│   ├── MissingAccessControl.sol
│   └── SecureVault.sol
├── src/                    # React frontend source
├── package.json
└── README.md
```

> Adjust this tree to match your actual repo layout.

---

## 🗺️ Roadmap

- [ ] Support for additional static analyzers (e.g., Mythril)
- [ ] Multi-file / project-level contract analysis
- [ ] CI/CD integration (GitHub Action for PR-based scanning)
- [ ] Historical audit report comparison

---

## 🤝 Contributing

Contributions are welcome. Please open an issue to discuss significant changes before submitting a pull request.

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes
4. Open a pull request

---

## ⚠️ Disclaimer

SolidityGuard AI is a security **aid**, not a substitute for a professional smart contract audit. Always have production contracts reviewed by a qualified security auditor before deployment.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).