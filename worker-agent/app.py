from fastapi import FastAPI
from pydantic import BaseModel
import json
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from crypto_utils import verify_message

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
        return {"error": "Invalid signature"}

    return {
        "task_id": data["task_id"],
        "result": f"Task received: {data['task']}",
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