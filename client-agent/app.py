from fastapi import FastAPI
from pydantic import BaseModel
import requests
import uuid
import json
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from crypto_utils import generate_keys, sign_message
from reputation import get_reputation

app = FastAPI(title="Client Agent")

PRIVATE_KEY, PUBLIC_KEY = generate_keys()


class TaskRequest(BaseModel):
    task: str
    reward: int


@app.get("/")
def home():
    return {
        "service": "client-agent",
        "status": "running"
    }


# ----------------------------
# MAIN WORKFLOW (FIXED)
# ----------------------------
@app.post("/create-task")
def create_task(data: TaskRequest):

    task_id = str(uuid.uuid4())

    # -------------------------
    # 1. LOCK FUNDS (IMPORTANT FIX)
    # -------------------------
    escrow_lock = requests.post(
        "http://localhost:8003/lock-funds",
        json={
            "task_id": task_id,
            "reward": data.reward
        }
    )

    lock_result = escrow_lock.json()

    # ❗ STOP if escrow failed
    if lock_result.get("status") != "funds_locked":
        return {
            "success": False,
            "error": "Escrow lock failed",
            "details": lock_result
        }

    # -------------------------
    # 2. SEND TO WORKER
    # -------------------------
    payload = {
        "task_id": task_id,
        "task": data.task
    }

    message = json.dumps(payload, sort_keys=True)
    signature = sign_message(PRIVATE_KEY, message)

    worker_response = requests.post(
        "http://localhost:8001/accept-task",
        json={
            "task_id": task_id,
            "task": data.task,
            "signature": signature,
            "public_key": PUBLIC_KEY
        }
    )

    worker_result = worker_response.json()

    # -------------------------
    # 3. VERIFY RESULT
    # -------------------------
    verifier_response = requests.post(
        "http://localhost:8002/verify",
        json={
            "task_id": task_id,
            "result": worker_result.get("result", "")
        }
    )

    verification = verifier_response.json()

    # -------------------------
    # 4. RELEASE PAYMENT (FIXED)
    # -------------------------
    payment_response = requests.post(
        "http://localhost:8003/release-funds",
        json={
            "task_id": task_id,
            "reward": data.reward,
            "verified": verification.get("verified", False)
        }
    )

    return {
        "success": True,
        "task_id": task_id,
        "worker": worker_result,
        "verification": verification,
        "payment": payment_response.json()
    }


# ----------------------------
# AGENT CARD
# ----------------------------
@app.get("/.well-known/agent.json")
def agent_card():
    return {
        "name": "client-agent",
        "version": "1.0",
        "description": "Creates tasks and manages workflow",
        "capabilities": ["task-creation"]
    }


# ----------------------------
# DISCOVERY SYSTEM
# ----------------------------
@app.get("/discover-agents")
def discover_agents():

    agents = []

    urls = [
        "http://localhost:8001/.well-known/agent.json",
        "http://localhost:8002/.well-known/agent.json",
        "http://localhost:8003/.well-known/agent.json"
    ]

    for url in urls:
        try:
            response = requests.get(url, timeout=3)
            agents.append(response.json())
        except Exception as e:
            agents.append({"error": str(e), "url": url})

    return {
        "discovered_agents": agents
    }


# ----------------------------
# REPUTATION
# ----------------------------
@app.get("/reputation/{agent_id}")
def reputation(agent_id: str):
    return get_reputation(agent_id)