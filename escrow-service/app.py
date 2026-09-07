import os
import sys
import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from shared.database import get_connection, initialize_database

initialize_database()

app = FastAPI(title="Escrow Service")

frontend_url = os.getenv("FRONTEND_URL", "").strip()
allowed_origins = [origin.strip() for origin in frontend_url.split(",") if origin.strip()] if frontend_url else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PaymentRequest(BaseModel):
    task_id: str
    reward: int


@app.get("/")
def home():
    return {
        "service": "escrow-service",
        "status": "running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "escrow-service"
    }


# -------------------------
# LOCK FUNDS
# -------------------------
@app.post("/lock-funds")
def lock_funds(data: PaymentRequest):

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT id, status FROM transactions
        WHERE task_id = %s
        ORDER BY id DESC
        LIMIT 1
    """, (data.task_id,))
    existing = cur.fetchone()

    if existing:
        cur.close()
        conn.close()
        return {
            "task_id": data.task_id,
            "reward": data.reward,
            "status": "funds_locked" if existing["status"] == "locked" else existing["status"],
            "message": "Funds already locked for this task",
        }

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

    if tx["status"] != "locked":
        return {
            "task_id": task_id,
            "error": f"Cannot release funds with status '{tx['status']}'",
            "current_status": tx["status"],
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
@app.get("/escrow")
def get_escrow_summary():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            COALESCE(SUM(CASE WHEN status = 'locked' THEN amount ELSE 0 END), 0) AS locked_balance,
            COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) AS released_total,
            COALESCE(SUM(CASE WHEN status = 'blocked' THEN amount ELSE 0 END), 0) AS blocked_total,
            COUNT(*) AS total_transactions
        FROM transactions
    """)
    row = cur.fetchone()

    cur.close()
    conn.close()

    locked = int(row["locked_balance"] or 0)
    released = int(row["released_total"] or 0)
    blocked = int(row["blocked_total"] or 0)

    return {
        "balance": locked,
        "locked_balance": locked,
        "released_total": released,
        "blocked_total": blocked,
        "total_transactions": int(row["total_transactions"] or 0),
    }


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


# NOTE: /escrow summary route is defined above /escrow/{task_id} to avoid route conflicts.


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


@app.get("/agent-card")
def agent_card_alias():
    return agent_card()