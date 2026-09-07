from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from crypto_utils import verify_message
from gemini_service import generate_report
from shared.database import get_connection, initialize_database, get_reputation

initialize_database()

app = FastAPI(title="Worker Agent")

frontend_url = os.getenv("FRONTEND_URL", "").strip()
allowed_origins = [origin.strip() for origin in frontend_url.split(",") if origin.strip()] if frontend_url else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TaskRequest(BaseModel):
    task_id: str
    task: str


@app.get("/")
def home():
    return {
        "service": "worker-agent",
        "status": "running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "worker-agent"
    }


@app.post("/accept-task")
def accept_task(data: dict):

    payload = {
        "task_id": data["task_id"],
        "task": data["task"]
    }

    message = json.dumps(payload, sort_keys=True)

    valid = verify_message(
        data["public_key"],
        message,
        data["signature"]
    )

    if not valid:
        return {
            "error": "Invalid signature"
        }

    print("\n========== WORKER START ==========")
    print("Task ID :", data["task_id"])

    # -----------------------------
    # Update Task Status -> Processing
    # -----------------------------
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE tasks
        SET status=%s
        WHERE task_id=%s
    """, (
        "processing",
        data["task_id"]
    ))

    print("Processing Update Rows :", cur.rowcount)

    conn.commit()
    cur.close()
    conn.close()

    # -----------------------------
    # Generate AI Report
    # -----------------------------
    report = generate_report(data["task"])

    print("Report Generated Successfully")
    print("Report Length :", len(report))

    # -----------------------------
    # Save Worker + Report + Status
    # -----------------------------
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE tasks
        SET
            status=%s,
            worker_id=%s,
            generated_report=%s
        WHERE task_id=%s
    """, (
        "completed",
        "worker-agent",
        report,
        data["task_id"]
    ))

    print("Completed Update Rows :", cur.rowcount)

    conn.commit()

    print("Database Commit Successful")

    cur.close()
    conn.close()

    print("========== WORKER END ==========\n")

    return {
        "task_id": data["task_id"],
        "result": report,
        "agent_id": "worker-agent"
    }


@app.get("/.well-known/agent.json")
def agent_card():
    return {
        "name": "worker-agent",
        "version": "1.0",
        "description": "Executes assigned tasks",
        "capabilities": [
            "task-execution"
        ]
    }


@app.get("/agent-card")
def agent_card_alias():
    return agent_card()


@app.get("/workers")
def list_workers():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            worker_id,
            COUNT(*) AS tasks_total,
            COUNT(CASE WHEN status IN ('completed', 'verified', 'paid') THEN 1 END) AS tasks_completed,
            ROUND(AVG(verification_score)::numeric, 1) AS avg_score
        FROM tasks
        WHERE worker_id IS NOT NULL
        GROUP BY worker_id
        ORDER BY tasks_completed DESC
    """)
    worker_rows = cur.fetchall()

    workers = []
    for row in worker_rows:
        rep = get_reputation(row["worker_id"])
        workers.append({
            **dict(row),
            "reputation_score": rep.get("score") if rep else None,
            "success_count": rep.get("success") if rep else 0,
            "failure_count": rep.get("failure") if rep else 0,
        })

    cur.execute("""
        SELECT
            task_id,
            task,
            status,
            worker_id,
            reward,
            verification_score,
            verification_feedback,
            created_at,
            generated_report
        FROM tasks
        WHERE worker_id IS NOT NULL
        ORDER BY created_at DESC
        LIMIT 50
    """)
    assignments = cur.fetchall()

    cur.close()
    conn.close()

    return {
        "total_workers": len(workers),
        "workers": workers,
        "assignments": assignments,
    }