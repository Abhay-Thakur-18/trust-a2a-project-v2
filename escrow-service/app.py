from fastapi import FastAPI
from pydantic import BaseModel
import time
from shared.database import get_connection
from shared.database import initialize_database
initialize_database()

app = FastAPI(title="Escrow Service")


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

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO transactions
        (task_id, payer, payee, amount, status)
        VALUES (%s, %s, %s, %s, %s)
    """, (
        data.task_id,
        "client-agent",
        "worker-agent",
        data.reward,
        "locked"
    ))

    conn.commit()
    cur.close()
    conn.close()

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

    conn = get_connection()
    cur = conn.cursor()

    # check transaction
    cur.execute("""
        SELECT * FROM transactions
        WHERE task_id = %s
    """, (task_id,))

    tx = cur.fetchone()

    if not tx:
        return {
            "task_id": task_id,
            "error": "transaction not found"
        }

    reward = tx["amount"]

    if verified:

        cur.execute("""
            UPDATE transactions
            SET status = %s
            WHERE task_id = %s
        """, ("completed", task_id))

        cur.execute("""
            UPDATE tasks
            SET status = %s
            WHERE task_id = %s
        """, ("paid", task_id))

        status = "payment_released"

    else:

        cur.execute("""
            UPDATE transactions
            SET status = %s
            WHERE task_id = %s
        """, ("blocked", task_id))

        cur.execute("""
            UPDATE tasks
            SET status = %s
            WHERE task_id = %s
        """, ("failed", task_id))

        status = "payment_blocked"

    conn.commit()
    cur.close()
    conn.close()

    return {
        "task_id": task_id,
        "reward": reward,
        "status": status
    }


# -------------------------
# ESCROW STATUS
# -------------------------
@app.get("/escrow/{task_id}")
def get_escrow(task_id: str):

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT * FROM transactions
        WHERE task_id = %s
    """, (task_id,))

    result = cur.fetchone()

    cur.close()
    conn.close()

    return result if result else {"error": "not found"}


# -------------------------
# TRANSACTIONS LIST
# -------------------------
@app.get("/transactions")
def get_transactions():

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT * FROM transactions
        ORDER BY id DESC
    """)

    rows = cur.fetchall()

    cur.close()
    conn.close()

    return {
        "total_transactions": len(rows),
        "transactions": rows
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