from fastapi import FastAPI
from pydantic import BaseModel
import sys
import os

# safer import
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(BASE_DIR)

from reputation import update_reputation
from gemini_judge import evaluate_report

app = FastAPI(title="Verifier Agent")


class VerifyRequest(BaseModel):
    task_id: str
    result: str
    agent_id: str = "worker-agent"


@app.get("/")
def home():
    return {
        "service": "verifier-agent",
        "status": "running"
    }


@app.post("/verify")
def verify(data: VerifyRequest):

    report = data.result

    try:
        # ==========================
        # Gemini AI Verification
        # ==========================
        ai_result = evaluate_report(report)

        verified = ai_result["verified"]
        score = ai_result["score"]
        feedback = ai_result["feedback"]

    except Exception as e:

        print("Gemini Judge Failed:", str(e))
        print("Using Rule-Based Verification...")

        # ==========================
        # Fallback Rule-Based Verification
        # ==========================

        score = 0

        checks = {
            "minimum_length": len(report) >= 500,
            "executive_summary": "Executive Summary" in report,
            "market_overview": "Market Overview" in report,
            "conclusion": "Conclusion" in report,
            "references": "References" in report
        }

        if checks["minimum_length"]:
            score += 20

        if checks["executive_summary"]:
            score += 20

        if checks["market_overview"]:
            score += 20

        if checks["conclusion"]:
            score += 20

        if checks["references"]:
            score += 20

        verified = score >= 80

        feedback = "Fallback rule-based verification used."

    # ==========================
    # Reputation Update
    # ==========================

    update_reputation(data.agent_id, verified)

    return {
        "task_id": data.task_id,
        "verified": verified,
        "score": score,
        "feedback": feedback
    }


@app.get("/.well-known/agent.json")
def agent_card():
    return {
        "name": "verifier-agent",
        "version": "2.0",
        "description": "LLM-based verifier with fallback rule engine",
        "capabilities": [
            "verification",
            "llm-evaluation"
        ]
    }