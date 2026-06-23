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

    # 🔥 better scoring logic
    score = min(100, len(data.result) * 2)
    verified = score >= 60

    # 🔥 dynamic reputation update
    update_reputation(data.agent_id, verified)

    return {
        "task_id": data.task_id,
        "verified": verified,
        "score": score
    }


@app.get("/.well-known/agent.json")
def agent_card():
    return {
        "name": "verifier-agent",
        "version": "1.0",
        "description": "Verifies completed work",
        "capabilities": ["verification"]
    }