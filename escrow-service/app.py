from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Escrow Service")

# In-memory storage
escrow_db = {}


class PaymentRequest(BaseModel):
    task_id: str
    reward: int


@app.get("/")
def home():
    return {
        "service": "escrow-service",
        "status": "running"
    }


# -------------------------
# LOCK FUNDS
# -------------------------
@app.post("/lock-funds")
def lock_funds(data: PaymentRequest):

    escrow_db[data.task_id] = {
        "reward": data.reward,
        "status": "funds_locked"
    }

    return {
        "task_id": data.task_id,
        "reward": data.reward,
        "status": "funds_locked"
    }


# -------------------------
# RELEASE FUNDS (FIXED)
# -------------------------
@app.post("/release-funds")
def release_funds(data: dict):

    task_id = data.get("task_id")
    verified = data.get("verified", True)  # default safe

    # check existence
    if task_id not in escrow_db:
        return {
            "task_id": task_id,
            "error": "escrow not found"
        }

    # trust decision
    if verified:
        escrow_db[task_id]["status"] = "payment_released"
    else:
        escrow_db[task_id]["status"] = "payment_blocked"

    return {
        "task_id": task_id,
        "reward": escrow_db[task_id]["reward"],
        "status": escrow_db[task_id]["status"]
    }


# -------------------------
# DEBUG VIEW
# -------------------------
@app.get("/escrow/{task_id}")
def get_escrow(task_id: str):

    return escrow_db.get(task_id, {
        "error": "not found"
    })


# -------------------------
# A2A AGENT CARD
# -------------------------
@app.get("/.well-known/agent.json")
def agent_card():
    return {
        "name": "escrow-service",
        "version": "1.0",
        "description": "Handles reward settlement with trust verification",
        "capabilities": [
            "fund-locking",
            "payment-release"
        ]
    }