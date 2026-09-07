from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from dotenv import load_dotenv
import requests
import uuid
import json
import sys
import os

load_dotenv()
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "").strip()

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from crypto_utils import generate_keys, sign_message
from shared.database import get_connection, initialize_database, get_reputation as get_db_reputation

initialize_database()

app = FastAPI(title="Client Agent")

frontend_url = os.getenv("FRONTEND_URL", "").strip()
allowed_origins = [origin.strip() for origin in frontend_url.split(",") if origin.strip()] if frontend_url else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PRIVATE_KEY, PUBLIC_KEY = generate_keys()

# ----------------------------
# Docker / Standalone Service URLs
# ----------------------------
WORKER_URL = os.getenv("WORKER_URL", "http://worker-agent:8001")
VERIFIER_URL = os.getenv("VERIFIER_URL", "http://verifier-agent:8002")
ESCROW_URL = os.getenv("ESCROW_URL", "http://escrow-service:8003")


class TaskRequest(BaseModel):
    task: str
    reward: int


class GoogleAuthRequest(BaseModel):
    credential: str


@app.get("/")
def home():
    return {
        "service": "client-agent",
        "status": "running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "client-agent"
    }


def _lock_escrow_funds(task_id: str, reward: int):
    escrow_lock = requests.post(
        f"{ESCROW_URL}/lock-funds",
        json={
            "task_id": task_id,
            "reward": reward,
        },
        timeout=60,
    )
    escrow_lock.raise_for_status()
    return escrow_lock.json()


def _execute_task_workflow(task_id: str, task: str, reward: int):
    payload = {
        "task_id": task_id,
        "task": task,
    }

    message = json.dumps(payload, sort_keys=True)
    signature = sign_message(PRIVATE_KEY, message)

    worker_response = requests.post(
        f"{WORKER_URL}/accept-task",
        json={
            "task_id": task_id,
            "task": task,
            "signature": signature,
            "public_key": PUBLIC_KEY,
        },
        timeout=120,
    )
    worker_response.raise_for_status()
    worker_result = worker_response.json()

    verifier_response = requests.post(
        f"{VERIFIER_URL}/verify",
        json={
            "task_id": task_id,
            "result": worker_result.get("result", ""),
        },
        timeout=120,
    )
    verifier_response.raise_for_status()
    verification = verifier_response.json()

    payment_response = requests.post(
        f"{ESCROW_URL}/release-funds",
        json={
            "task_id": task_id,
            "reward": reward,
            "verified": verification.get("verified", False),
        },
        timeout=60,
    )
    payment_response.raise_for_status()

    return {
        "worker": worker_result,
        "verification": verification,
        "payment": payment_response.json(),
    }


# ----------------------------
# MAIN WORKFLOW (LOCK FIRST, PAY AFTER VERIFY)
# ----------------------------
@app.post("/create-task")
def create_task(data: TaskRequest):
    task_id = str(uuid.uuid4())

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
    INSERT INTO tasks (task_id, task, reward, status)
    VALUES (%s, %s, %s, %s)
    """, (
        task_id,
        data.task,
        data.reward,
        "created",
    ))

    conn.commit()
    cur.close()
    conn.close()

    try:
        lock_result = _lock_escrow_funds(task_id, data.reward)

        if lock_result.get("status") != "funds_locked":
            return {
                "success": False,
                "error": "Escrow lock failed",
                "details": lock_result,
            }

        conn = get_connection()
        cur = conn.cursor()
        cur.execute(
            "UPDATE tasks SET status = %s WHERE task_id = %s",
            ("locked", task_id),
        )
        conn.commit()
        cur.close()
        conn.close()

        return {
            "success": True,
            "task_id": task_id,
            "status": "locked",
            "escrow": lock_result,
            "message": "Funds locked in escrow. Run workflow execution to process payment.",
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
        }


@app.post("/create-task/{task_id}/execute")
def execute_task(task_id: str):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM tasks WHERE task_id = %s", (task_id,))
    task_row = cur.fetchone()
    cur.close()
    conn.close()

    if not task_row:
        return {"success": False, "error": "Task not found"}

    if task_row["status"] not in ("locked", "created"):
        return {
            "success": False,
            "error": f"Task cannot be executed from status '{task_row['status']}'",
        }

    try:
        result = _execute_task_workflow(
            task_id,
            task_row["task"],
            task_row["reward"],
        )

        return {
            "success": True,
            "task_id": task_id,
            "status": result["payment"].get("status"),
            **result,
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
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


@app.get("/agent-card")
def agent_card_alias():
    return agent_card()


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


@app.get("/discovery-agent")
def discovery_agent_alias():
    return discover_agents()


# ----------------------------
# TASK LISTING
# ----------------------------
@app.get("/tasks")
def list_tasks():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM tasks ORDER BY created_at DESC LIMIT 100")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return {"total": len(rows), "tasks": rows}


@app.get("/tasks/{task_id}")
def get_task(task_id: str):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM tasks WHERE task_id = %s", (task_id,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    if not row:
        return {"error": "Task not found"}
    return row


# ----------------------------
# GOOGLE AUTH (server-verified)
# ----------------------------
@app.post("/auth/google")
def auth_google(payload: GoogleAuthRequest):
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=503,
            detail="Google OAuth is not configured. Set GOOGLE_CLIENT_ID in environment.",
        )

    try:
        idinfo = id_token.verify_oauth2_token(
            payload.credential,
            google_requests.Request(),
            GOOGLE_CLIENT_ID,
        )
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {exc}") from exc

    issuer = idinfo.get("iss")
    if issuer not in ("accounts.google.com", "https://accounts.google.com"):
        raise HTTPException(status_code=401, detail="Invalid token issuer.")

    email = idinfo.get("email")
    if not email:
        raise HTTPException(status_code=401, detail="Google account email is required.")

    if not idinfo.get("email_verified"):
        raise HTTPException(status_code=401, detail="Google email is not verified.")

    return {
        "user": {
            "id": f"google-{idinfo['sub']}",
            "googleId": idinfo["sub"],
            "email": email,
            "name": idinfo.get("name") or email.split("@")[0],
            "picture": idinfo.get("picture"),
            "provider": "google",
            "role": "Operator",
            "organization": idinfo.get("hd") or "Trust A2A Network",
            "emailVerified": True,
        }
    }


# ----------------------------
# REPUTATION
# ----------------------------
def _format_reputation(agent_id: str):
    rep = get_db_reputation(agent_id)
    success = int(rep.get("success") or 0)
    failure = int(rep.get("failure") or 0)
    total = success + failure

    return {
        "agent_id": rep.get("agent_id") or agent_id,
        "score": int(rep.get("score") or 100),
        "success_count": success,
        "failure_count": failure,
        "total_events": total,
        "success_rate": round((success / total) * 100, 1) if total else 100.0,
    }


@app.get("/reputation/{agent_id}")
def reputation(agent_id: str):
    return _format_reputation(agent_id)


@app.get("/reputations")
def list_reputations():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM reputation ORDER BY score DESC, success DESC")
    rows = cur.fetchall()
    cur.close()
    conn.close()

    reputations = []
    for row in rows:
        success = int(row.get("success") or 0)
        failure = int(row.get("failure") or 0)
        total = success + failure
        reputations.append({
            "agent_id": row.get("agent_id"),
            "score": int(row.get("score") or 100),
            "success_count": success,
            "failure_count": failure,
            "total_events": total,
            "success_rate": round((success / total) * 100, 1) if total else 100.0,
        })

    return {"total": len(reputations), "reputations": reputations}


@app.post("/reset-platform")
def reset_platform():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("TRUNCATE tasks, transactions, verifications, reputation RESTART IDENTITY CASCADE")
    conn.commit()
    cur.close()
    conn.close()
    return {
        "success": True,
        "message": "Platform data reset. Dashboard starts from zero.",
    }