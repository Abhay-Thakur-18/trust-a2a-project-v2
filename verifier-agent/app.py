from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(BASE_DIR)

from shared.database import (
    get_connection,
    initialize_database,
    update_reputation,
)
from gemini_judge import evaluate_report

initialize_database()

app = FastAPI(title="Verifier Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class VerifyRequest(BaseModel):
    task_id: str
    result: str
    agent_id: str = "worker-agent"


@app.get("/")
def home():
    return {
        "service": "verifier-agent",
        "status": "running"
    }


@app.post("/verify")
def verify(data: VerifyRequest):

    report = data.result

    try:
        # ==========================
        # Gemini AI Verification
        # ==========================
        ai_result = evaluate_report(report)

        verified = ai_result["verified"]
        score = ai_result["score"]
        feedback = ai_result["feedback"]

    except Exception as e:

        print("Gemini Judge Failed:", str(e))
        print("Using Rule-Based Verification...")

        score = 0

        checks = {
            "minimum_length": len(report) >= 500,
            "executive_summary": "Executive Summary" in report,
            "market_overview": "Market Overview" in report,
            "conclusion": "Conclusion" in report,
            "references": "References" in report
        }

        if checks["minimum_length"]:
            score += 20

        if checks["executive_summary"]:
            score += 20

        if checks["market_overview"]:
            score += 20

        if checks["conclusion"]:
            score += 20

        if checks["references"]:
            score += 20

        verified = score >= 80
        passed = [label for label, ok in checks.items() if ok]
        failed = [label.replace("_", " ").title() for label, ok in checks.items() if not ok]
        feedback = (
            f"Rule-based verification completed with score {score}/100. "
            f"Passed checks: {', '.join(passed) if passed else 'none'}. "
            f"Missing checks: {', '.join(failed) if failed else 'none'}. "
            f"Report length: {len(report)} characters. "
            f"{'Task approved for escrow release.' if verified else 'Task rejected — escrow payment will be blocked.'}"
        )

    print("\n========== VERIFIER ==========")
    print("Task ID :", data.task_id)
    print("Verified :", verified)
    print("Score :", score)

    conn = get_connection()
    cur = conn.cursor()

    # ==========================
    # Save verification history
    # ==========================
    cur.execute("""
        INSERT INTO verifications
        (task_id, verified, score, feedback)
        VALUES (%s, %s, %s, %s)
    """, (
        data.task_id,
        verified,
        score,
        feedback
    ))

    # ==========================
    # Update task
    # ==========================
    cur.execute("""
        UPDATE tasks
        SET
            status=%s,
            verification_score=%s,
            verification_feedback=%s
        WHERE task_id=%s
    """, (
        "verified",
        score,
        feedback,
        data.task_id
    ))

    print("Task Rows Updated :", cur.rowcount)

    conn.commit()
    cur.close()
    conn.close()

    print("Verification Saved Successfully")
    print("===============================\n")

    # ==========================
    # Update Reputation
    # ==========================
    update_reputation(data.agent_id, verified)

    return {
        "task_id": data.task_id,
        "verified": verified,
        "score": score,
        "feedback": feedback
    }


@app.get("/verifications")
def list_verifications():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM verifications ORDER BY created_at DESC LIMIT 100")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return {"total": len(rows), "verifications": rows}


@app.get("/.well-known/agent.json")
def agent_card():
    return {
        "name": "verifier-agent",
        "version": "2.0",
        "description": "LLM-based verifier with fallback rule engine",
        "capabilities": [
            "verification",
            "llm-evaluation"
        ]
    }