from fastapi import FastAPI
from pydantic import BaseModel
import sys
import os

# safer import
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(BASE_DIR)

from reputation import update_reputation

app = FastAPI(title="Verifier Agent")


class VerifyRequest(BaseModel):
    task_id: str
    result: str
    agent_id: str = "worker-agent"   # ✅ dynamic support added


@app.get("/")
def home():
    return {
        "service": "verifier-agent",
        "status": "running"
    }


@app.post("/verify")
def verify(data: VerifyRequest):

    report = data.result

    score = 0

    # Minimum Length
    if len(report) >= 500:
        score += 20

    # Required Sections
    if "Executive Summary" in report:
        score += 20

    if "Market Overview" in report:
        score += 20

    if "Conclusion" in report:
        score += 20

    if "References" in report:
        score += 20

    verified = score >= 80

    update_reputation(data.agent_id, verified)

    return {
        "task_id": data.task_id,
        "verified": verified,
        "score": score,
        "checks": {
            "minimum_length": len(report) >= 500,
            "executive_summary": "Executive Summary" in report,
            "market_overview": "Market Overview" in report,
            "conclusion": "Conclusion" in report,
            "references": "References" in report
        }
    }


@app.get("/.well-known/agent.json")
def agent_card():
    return {
        "name": "verifier-agent",
        "version": "1.0",
        "description": "Verifies completed work",
        "capabilities": ["verification"]
    }