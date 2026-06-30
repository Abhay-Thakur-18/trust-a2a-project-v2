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

# ----------------------------
# Docker Service URLs (FIXED)
# ----------------------------
WORKER_URL = "http://worker-agent:8001"
VERIFIER_URL = "http://verifier-agent:8002"
ESCROW_URL = "http://escrow-service:8003"


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
# MAIN WORKFLOW (FIXED + SAFE)
# ----------------------------
@app.post("/create-task")
def create_task(data: TaskRequest):

    task_id = str(uuid.uuid4())

    try:
        # -------------------------
        # 1. LOCK FUNDS
        # -------------------------
        escrow_lock = requests.post(
            f"{ESCROW_URL}/lock-funds",
            json={
                "task_id": task_id,
                "reward": data.reward
            },
            timeout=5
        )

        lock_result = escrow_lock.json()

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
            f"{WORKER_URL}/accept-task",
            json={
                "task_id": task_id,
                "task": data.task,
                "signature": signature,
                "public_key": PUBLIC_KEY
            },
            timeout=5
        )

        worker_result = worker_response.json()

        # -------------------------
        # 3. VERIFY RESULT
        # -------------------------
        verifier_response = requests.post(
            f"{VERIFIER_URL}/verify",
            json={
                "task_id": task_id,
                "result": worker_result.get("result", "")
            },
            timeout=5
        )

        verification = verifier_response.json()

        # -------------------------
        # 4. RELEASE PAYMENT
        # -------------------------
        payment_response = requests.post(
            f"{ESCROW_URL}/release-funds",
            json={
                "task_id": task_id,
                "reward": data.reward,
                "verified": verification.get("verified", False)
            },
            timeout=5
        )

        return {
            "success": True,
            "task_id": task_id,
            "worker": worker_result,
            "verification": verification,
            "payment": payment_response.json()
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
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
# DISCOVERY SYSTEM (FIXED)
# ----------------------------
@app.get("/discover-agents")
def discover_agents():

    agents = []

    urls = [
        f"{WORKER_URL}/.well-known/agent.json",
        f"{VERIFIER_URL}/.well-known/agent.json",
        f"{ESCROW_URL}/.well-known/agent.json"
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