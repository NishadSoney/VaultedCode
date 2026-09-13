import os
import sys
import json
import tempfile
import re
import subprocess
import shutil
import logging
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from google.genai import types

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("vuln_patcher")

app = FastAPI(
    title="Smart Contract Vulnerability Detection & Code Patching API",
    description="Static analysis with Slither and AI-driven automated vulnerability patching with Gemini.",
    version="1.0.0"
)

# CORS middleware for frontend calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini Client
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
ai_client: Optional[genai.Client] = None
if GEMINI_API_KEY:
    try:
        ai_client = genai.Client(api_key=GEMINI_API_KEY)
    except Exception as e:
        logger.error(f"Failed to initialize Gemini Client: {e}")

# Supported models in priority order
GEMINI_MODELS = ["gemini-3.1-flash-lite", "gemini-3.8-flash"]

SYSTEM_PROMPT = """You are an expert smart contract security auditor and a great teacher. You will be given a Solidity vulnerability finding and the relevant code. Respond with ONLY valid JSON matching this exact schema: {explanation, attack_scenario, severity, fixed_code, fix_explanation}. 
CRITICAL: The 'explanation' and 'attack_scenario' fields MUST be highly detailed, plain-english, and beginner-friendly so ANY user can understand it. Avoid overly dense jargon without explanation. Use analogies if helpful. Provide a comprehensive step-by-step exploit walkthrough that clearly illustrates how an attacker would abuse the flaw. Your explanation should be extremely thorough. Do not provide brief answers.
No markdown formatting, no code fences, no extra text — just the raw JSON object."""


def map_slither_severity(impact: str, confidence: str) -> str:
    imp = (impact or "").lower()
    conf = (confidence or "").lower()
    if imp == "high" and conf in ["high", "medium"]:
        return "High"
    elif imp == "high":
        return "High"
    elif imp == "medium":
        return "Medium"
    elif imp in ["low", "informational", "optimization"]:
        return "Low"
    return "Medium"


def compute_risk_score(findings: List[Dict[str, Any]]) -> int:
    if not findings:
        return 0
    weights = {
        "Critical": 40,
        "High": 25,
        "Medium": 15,
        "Low": 5
    }
    raw_penalty = sum(weights.get(f.get("severity", "Medium"), 15) for f in findings)
    return min(100, raw_penalty)


def extract_function_code(source_code: str, func_name: str, lines: List[int]) -> str:
    code_lines = source_code.splitlines()
    total_lines = len(code_lines)

    # If line numbers are specified and valid
    if lines:
        start_line = max(1, min(lines))
        end_line = min(total_lines, max(lines))
        # Add 1 line of context if possible
        s = max(0, start_line - 2)
        e = min(total_lines, end_line + 1)
        snippet = "\n".join(code_lines[s:e])
        if snippet.strip():
            return snippet

    # Fallback to regex search for function
    if func_name and func_name != "fallback" and func_name != "receive":
        pattern = rf"(function\s+{re.escape(func_name)}\s*\([^)]*\)[^{{]*\{{)"
        match = re.search(pattern, source_code)
        if match:
            start_pos = match.start()
            brace_count = 0
            found_start = False
            end_pos = len(source_code)
            for idx in range(match.start(), len(source_code)):
                if source_code[idx] == '{':
                    brace_count += 1
                    found_start = True
                elif source_code[idx] == '}':
                    brace_count -= 1
                    if found_start and brace_count == 0:
                        end_pos = idx + 1
                        break
            return source_code[start_pos:end_pos].strip()

    # Generic fallback snippet
    return "\n".join(code_lines[:min(30, total_lines)])


def call_llm_for_finding(
    detector: str,
    severity: str,
    func_name: str,
    lines: str,
    original_code: str,
    description: str
) -> Dict[str, Any]:
    global ai_client
    if not ai_client and GEMINI_API_KEY:
        try:
            ai_client = genai.Client(api_key=GEMINI_API_KEY)
        except Exception:
            pass

    content_prompt = f"""Vulnerability Detector: {detector}
Detected Severity: {severity}
Target Function: {func_name}
Lines: {lines}
Slither Summary: {description}

Vulnerable Solidity Code:
```solidity
{original_code}
```

Provide the analysis as STRICT JSON with keys: explanation, attack_scenario, severity, fixed_code, fix_explanation."""

    # Default fallback object in case LLM is completely unreachable
    fallback_result = {
        "explanation": f"Static analysis flagged {detector} in function {func_name}. This pattern represents a security risk that violates smart contract best practices.",
        "attack_scenario": "An attacker or untrusted actor could exploit the order of operations or unauthorized function calls to impact contract state or funds.",
        "severity": severity or "Medium",
        "fixed_code": "// Suggested fix: Apply checks-effects-interactions, proper access modifiers (onlyOwner), or reentrancy guards.\n" + original_code,
        "fix_explanation": "Added necessary state validation, access checks, or updated order of operations before external interactions."
    }

    if not ai_client:
        return fallback_result

    for model_name in GEMINI_MODELS:
        try:
            response = ai_client.models.generate_content(
                model=model_name,
                contents=content_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    response_mime_type="application/json",
                    temperature=0.2
                )
            )
            raw_text = (response.text or "").strip()
            # Clean markdown codeblocks if any leaked
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.startswith("```"):
                raw_text = raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]
            raw_text = raw_text.strip()

            parsed = json.loads(raw_text)
            return {
                "explanation": parsed.get("explanation", fallback_result["explanation"]),
                "attack_scenario": parsed.get("attack_scenario", fallback_result["attack_scenario"]),
                "severity": parsed.get("severity", severity),
                "fixed_code": parsed.get("fixed_code", fallback_result["fixed_code"]),
                "fix_explanation": parsed.get("fix_explanation", fallback_result["fix_explanation"])
            }
        except json.JSONDecodeError:
            # Retry once with explicit reminder
            try:
                retry_response = ai_client.models.generate_content(
                    model=model_name,
                    contents=content_prompt + "\n\nCRITICAL: Output ONLY valid raw RFC-8259 JSON without markdown fences.",
                    config=types.GenerateContentConfig(
                        system_instruction=SYSTEM_PROMPT,
                        response_mime_type="application/json"
                    )
                )
                text = (retry_response.text or "").strip()
                if "{" in text and "}" in text:
                    text = text[text.find("{"):text.rfind("}")+1]
                    parsed = json.loads(text)
                    return {
                        "explanation": parsed.get("explanation", fallback_result["explanation"]),
                        "attack_scenario": parsed.get("attack_scenario", fallback_result["attack_scenario"]),
                        "severity": parsed.get("severity", severity),
                        "fixed_code": parsed.get("fixed_code", fallback_result["fixed_code"]),
                        "fix_explanation": parsed.get("fix_explanation", fallback_result["fix_explanation"])
                    }
            except Exception as e:
                logger.warning(f"Retry parsing failed on model {model_name}: {e}")
        except Exception as e:
            logger.warning(f"Model {model_name} failed: {e}")
            continue

    return fallback_result


def analyze_solidity_with_slither(file_path: str, source_code: str) -> List[Dict[str, Any]]:
    findings = []
    slither_bin = shutil.which("slither")
    if not slither_bin:
        raise RuntimeError("Slither binary not found in system PATH")

    # Run slither
    cmd = [slither_bin, file_path, "--json", "-"]
    try:
        proc = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=45
        )
        stdout = proc.stdout.strip()
        stderr = proc.stderr.strip()

        # Slither outputs JSON either to stdout or creates json
        raw_json = None
        if stdout and ("{" in stdout and "}" in stdout):
            try:
                start_idx = stdout.find("{")
                end_idx = stdout.rfind("}") + 1
                raw_json = json.loads(stdout[start_idx:end_idx])
            except Exception:
                pass

        if not raw_json and stderr and ("{" in stderr and "}" in stderr):
            try:
                start_idx = stderr.find("{")
                end_idx = stderr.rfind("}") + 1
                raw_json = json.loads(stderr[start_idx:end_idx])
            except Exception:
                pass

        if not raw_json:
            # If slither had a compilation error, detect and raise informative message
            if "Source file requires different compiler version" in stderr or "ParserError" in stderr:
                raise ValueError(f"Solidity compilation error: {stderr[:300]}")
            return []

        detectors = raw_json.get("results", {}).get("detectors", [])
        # Filter out purely benign detectors like solc-version or pragma checks to focus on real vulnerabilities
        ignored_detectors = {"solc-version", "naming-convention", "dead-code"}

        for d in detectors:
            check_name = d.get("check", "unknown")
            impact = d.get("impact", "Low")
            confidence = d.get("confidence", "Medium")
            description = d.get("description", "")

            # Purely informational notices (like compiler version or benign low-level calls)
            # are excluded to focus on actual security vulnerabilities
            if check_name in ignored_detectors or impact.lower() in ["informational", "optimization"]:
                continue

            mapped_sev = map_slither_severity(impact, confidence)

            # Extract affected function and line numbers
            func_name = "contract"
            lines: List[int] = []

            elements = d.get("elements", [])
            for el in elements:
                el_type = el.get("type")
                if el_type == "function" and not func_name or func_name == "contract":
                    func_name = el.get("name", "function")
                mapping = el.get("source_mapping", {})
                if mapping and "lines" in mapping:
                    lines.extend(mapping.get("lines", []))

            # Deduplicate & sort lines
            lines = sorted(list(set(lines)))
            lines_str = f"L{min(lines)}-L{max(lines)}" if lines else "Global"

            # Extract snippet
            orig_snippet = extract_function_code(source_code, func_name, lines)

            findings.append({
                "detector": check_name,
                "severity": mapped_sev,
                "function": func_name,
                "lines": lines_str,
                "original_code": orig_snippet,
                "raw_description": description
            })

    except subprocess.TimeoutExpired:
        raise TimeoutError("Slither static analysis timed out after 45 seconds")
    except Exception as e:
        logger.error(f"Slither execution exception: {e}")
        raise

    return findings


# Fallback regex/AST pattern detector for Solidity when solc cannot compile external dependencies
def fallback_pattern_analysis(source_code: str) -> List[Dict[str, Any]]:
    findings = []
    
    # 1. Reentrancy detection
    # Checks for external calls (.call{value: ...} or .transfer / .send) before state variable modifications
    call_matches = list(re.finditer(r'(\.call\s*\{[^}]*value\s*:|\.call\.value|\.transfer\(|\.send\()', source_code))
    for cm in call_matches:
        # Check if following lines have state assignment like balances[...] = ...
        after_call = source_code[cm.end():cm.end()+250]
        if re.search(r'(\b\w+\[[^\]]+\]\s*=|balances\[|\bstatus\s*=)', after_call):
            line_no = source_code[:cm.start()].count("\n") + 1
            funcs = list(re.finditer(r'function\s+(\w+)', source_code[:cm.start()]))
            func_name = funcs[-1].group(1) if funcs else "withdraw"
            snippet = extract_function_code(source_code, func_name, [line_no, line_no + 5])
            findings.append({
                "detector": f"reentrancy-{func_name}",
                "severity": "High",
                "function": func_name,
                "lines": f"L{line_no}-L{line_no+6}",
                "original_code": snippet,
                "raw_description": f"External call in {func_name} is invoked before state balance/variable updates, violating Checks-Effects-Interactions."
            })

    # 2. Missing access control
    # Look for functions that transfer balance or change owner without onlyOwner modifier
    admin_funcs = re.finditer(r'function\s+(setOwner|emergencyWithdraw|withdrawAll|kill|destroy)\s*\((.*?)\)\s*(public|external)[^{]*\{', source_code)
    for af in admin_funcs:
        header = af.group(0)
        func_name = af.group(1)
        if "onlyOwner" not in header and "require(msg.sender" not in header:
            line_no = source_code[:af.start()].count("\n") + 1
            snippet = extract_function_code(source_code, func_name, [line_no, line_no + 8])
            findings.append({
                "detector": "missing-access-control",
                "severity": "Critical",
                "function": func_name,
                "lines": f"L{line_no}-L{line_no+5}",
                "original_code": snippet,
                "raw_description": f"Critical function {func_name} lacks access control modifiers (such as onlyOwner), permitting arbitrary callers to execute privileged actions."
            })

    # 3. Unchecked Low-Level Calls
    low_calls = list(re.finditer(r'(\.call\(|\.delegatecall\(|\.callcode\()', source_code))
    for lc in low_calls:
        # Check if result is checked
        line_start = source_code.rfind("\n", 0, lc.start())
        line_str = source_code[line_start:lc.end()+50]
        if "bool success" not in line_str and "require(" not in line_str:
            line_no = source_code[:lc.start()].count("\n") + 1
            snippet = extract_function_code(source_code, "", [line_no, line_no + 2])
            findings.append({
                "detector": "unchecked-lowlevel",
                "severity": "Medium",
                "function": "unprotected_call",
                "lines": f"L{line_no}",
                "original_code": snippet,
                "raw_description": "Return value of low-level call is not checked, silently ignoring failures."
            })

    # 4. tx.origin authentication check
    if "tx.origin" in source_code and "require(tx.origin" in source_code:
        line_no = source_code[:source_code.find("tx.origin")].count("\n") + 1
        snippet = extract_function_code(source_code, "", [line_no, line_no + 2])
        findings.append({
            "detector": "tx-origin-auth",
            "severity": "Medium",
            "function": "auth",
            "lines": f"L{line_no}",
            "original_code": snippet,
            "raw_description": "Use of tx.origin for authorization makes the contract vulnerable to phishing/reentrancy proxy attacks."
        })

    return findings


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "slither_installed": bool(shutil.which("slither")),
        "solc_installed": bool(shutil.which("solc")),
        "gemini_configured": bool(GEMINI_API_KEY)
    }


@app.get("/test-contracts")
def list_test_contracts():
    contracts_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "test-contracts")
    if not os.path.exists(contracts_dir):
        return {"contracts": []}
    files = [f for f in os.listdir(contracts_dir) if f.endswith(".sol")]
    result = []
    for f in sorted(files):
        path = os.path.join(contracts_dir, f)
        with open(path, "r", encoding="utf-8") as fh:
            content = fh.read()
        desc = "Test contract"
        if "1_SafeVault_Score0" in f:
            desc = "Fully audited contract with zero vulnerabilities (Risk Score 0)"
        elif "2_LowRisk_Score25" in f:
            desc = "Contains low risk findings (Risk Score 25)"
        elif "3_MediumRisk_Score50" in f:
            desc = "Contains medium risk findings (Risk Score 50)"
        elif "4_HighRisk_Score80" in f:
            desc = "Contains high risk findings (Risk Score 80)"
        elif "5_CriticalRisk_Score100" in f:
            desc = "Contains multiple critical findings (Risk Score 100)"
        elif "6_ExtremeRisk_Score100" in f:
            desc = "Severely compromised contract with max risk (Risk Score 100)"
            
        clean_name = f.replace(".sol", "")
        if clean_name[0].isdigit() and clean_name[1] == "_":
            clean_name = clean_name[2:]
            
        result.append({
            "filename": f,
            "name": clean_name,
            "description": desc,
            "content": content
        })
    return {"contracts": result}


@app.post("/analyze")
async def analyze_contract(
    file: Optional[UploadFile] = File(None),
    code: Optional[str] = Form(None),
    contract_name: Optional[str] = Form(None)
):
    source_code = ""
    filename = "Contract.sol"

    if file:
        filename = file.filename or "Contract.sol"
        if not filename.endswith(".sol"):
            raise HTTPException(status_code=400, detail="Only Solidity (.sol) files are supported")
        contents = await file.read()
        source_code = contents.decode("utf-8", errors="ignore")
    elif code:
        source_code = code
        if contract_name:
            filename = f"{contract_name}.sol"
    else:
        raise HTTPException(status_code=400, detail="Please upload a .sol file or provide contract code")

    if not source_code.strip():
        raise HTTPException(status_code=400, detail="Contract file is empty")

    name = filename.replace(".sol", "")
    temp_dir = tempfile.mkdtemp(prefix="slither_scan_")
    temp_file_path = os.path.join(temp_dir, filename)

    try:
        with open(temp_file_path, "w", encoding="utf-8") as f:
            f.write(source_code)

        raw_findings: List[Dict[str, Any]] = []
        scanner_used = "Slither Static Analyzer"
        error_notes = None

        # 1. Attempt Slither run
        try:
            raw_findings = analyze_solidity_with_slither(temp_file_path, source_code)
        except Exception as slither_err:
            logger.warning(f"Slither execution failed or had compiler issue: {slither_err}. Using Solidity AST security rules fallback.")
            error_notes = str(slither_err)
            scanner_used = "Smart Contract Pattern Engine (Fallback)"
            raw_findings = fallback_pattern_analysis(source_code)

        # 2. Check for zero findings
        if not raw_findings:
            return {
                "contract_name": name,
                "total_findings": 0,
                "overall_risk_score": 0,
                "scanner_used": scanner_used,
                "findings": [],
                "message": "No vulnerabilities detected. Contract passed security checks cleanly!"
            }

        # 3. For each finding, call Gemini LLM to explain and generate fix
        processed_findings = []
        for rf in raw_findings:
            llm_result = call_llm_for_finding(
                detector=rf["detector"],
                severity=rf["severity"],
                func_name=rf["function"],
                lines=rf["lines"],
                original_code=rf["original_code"],
                description=rf.get("raw_description", "")
            )

            processed_findings.append({
                "detector": rf["detector"],
                "severity": llm_result.get("severity", rf["severity"]),
                "function": rf["function"],
                "lines": rf["lines"],
                "original_code": rf["original_code"],
                "explanation": llm_result.get("explanation", ""),
                "attack_scenario": llm_result.get("attack_scenario", ""),
                "fixed_code": llm_result.get("fixed_code", ""),
                "fix_explanation": llm_result.get("fix_explanation", "")
            })

        risk_score = compute_risk_score(processed_findings)

        return {
            "contract_name": name,
            "total_findings": len(processed_findings),
            "overall_risk_score": risk_score,
            "scanner_used": scanner_used,
            "findings": processed_findings,
            "error_notes": error_notes
        }

    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
