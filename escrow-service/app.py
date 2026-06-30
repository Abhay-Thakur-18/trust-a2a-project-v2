from fastapi import FastAPI
from pydantic import BaseModel
import time

app = FastAPI(title="Escrow Service")

# -------------------------
# STORAGE
# -------------------------
escrow_db = {}
transaction_log = []


class PaymentRequest(BaseModel):
    task_id: str
    reward: int


# -------------------------
# MOCK SETTLEMENT FUNCTION
# -------------------------
def release_payment(payer: str, payee: str, amount: int, task_id: str):

    tx = {
        "task_id": task_id,
        "payer": payer,
        "payee": payee,
        "amount": amount,
        "status": "success",
        "timestamp": time.time()
    }

    transaction_log.append(tx)
    return tx


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
# RELEASE FUNDS
# -------------------------
@app.post("/release-funds")
def release_funds(data: dict):

    task_id = data.get("task_id")
    verified = data.get("verified", False)

    if task_id not in escrow_db:
        return {
            "task_id": task_id,
            "error": "escrow not found"
        }

    reward = escrow_db[task_id]["reward"]

    if verified:
        escrow_db[task_id]["status"] = "payment_released"

        tx = release_payment(
            payer="client-agent",
            payee="worker-agent",
            amount=reward,
            task_id=task_id
        )

        return {
            "task_id": task_id,
            "reward": reward,
            "status": "payment_released",
            "transaction": tx
        }

    else:
        escrow_db[task_id]["status"] = "payment_blocked"

        return {
            "task_id": task_id,
            "reward": reward,
            "status": "payment_blocked"
        }


# -------------------------
# DEBUG VIEW
# -------------------------
@app.get("/escrow/{task_id}")
def get_escrow(task_id: str):
    return escrow_db.get(task_id, {"error": "not found"})


# -------------------------
# TRANSACTION LOG
# -------------------------
@app.get("/transactions")
def get_transactions():
    return {
        "total_transactions": len(transaction_log),
        "transactions": transaction_log
    }


# -------------------------
# AGENT CARD
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