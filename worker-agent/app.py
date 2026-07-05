from fastapi import FastAPI
from pydantic import BaseModel
import json
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from crypto_utils import verify_message
from gemini_service import generate_report
from shared.database import get_connection
from shared.database import initialize_database

initialize_database()

app = FastAPI(title="Worker Agent")


class TaskRequest(BaseModel):
    task_id: str
    task: str


@app.get("/")
def home():
    return {
        "service": "worker-agent",
        "status": "running"
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