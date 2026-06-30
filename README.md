# Google A2A Trust-Based Agent Collaboration System

## Overview

This project implements a **multi-agent distributed system** inspired by Google's Agent-to-Agent (A2A) protocol.

It demonstrates how independent AI agents collaborate to complete tasks in a secure and trust-based environment where:

👉 Work is verified before payment is released.

---

## Problem Statement

In real-world AI systems:

- Agents may produce incorrect or low-quality outputs
- There is no trust guarantee between systems
- Payments or rewards should not be released blindly

This project solves this problem using:

✔ Verification Layer  
✔ Escrow-Based Payment System  
✔ Reputation Tracking  

---

## System Architecture

- Client Agent
- Worker Agent
- Verifier Agent
- Escrow Service

---

## Workflow

1. Client Agent creates a task with reward  
2. Escrow Service locks the funds  
3. Worker Agent executes the task  
4. Worker returns generated output  
5. Verifier Agent validates the output  
6. Escrow Service releases payment if verified  
7. Reputation system is updated  

---

## Technologies Used

- Python 3.11
- FastAPI
- Docker
- Docker Compose
- REST APIs

---

## Services Description

### Client Agent (Port: 8000)
- Task creation
- Agent discovery
- Workflow initiation
- Reputation check

---

### Worker Agent (Port: 8001)
- Accept task requests
- Generate AI-based output
- Return processed result

---

### Verifier Agent (Port: 8002)
- Validate generated output
- Check required sections
- Assign verification score
- Update reputation system

---

### Escrow Service (Port: 8003)
- Lock reward funds
- Release payment after verification
- Maintain transaction history

---

## How to Run the Project

```bash id="run_fixed"
docker-compose up --build
```

---

## Sample Request

POST /create-task

```json
POST /create-task
{
  "task": "Generate AI Healthcare Report",
  "reward": 500
}
```

---

## Sample Response

```json
{
  "success": true,
  "task_id": "b7efb50f-6955-4ce7-8a8a-ada007e31fb6",
  "worker": {
    "task_id": "b7efb50f-6955-4ce7-8a8a-ada007e31fb6",
    "result": "# AI Healthcare Report\n\n## Executive Summary\nThis report provides an overview of AI Healthcare Report and highlights its current state.\n\n## Market Overview\nThe market is growing rapidly due to AI adoption.\n\n## Conclusion\nAI Healthcare Report is expected to grow significantly.",
    "agent_id": "worker-agent"
  },
  "verification": {
    "task_id": "b7efb50f-6955-4ce7-8a8a-ada007e31fb6",
    "verified": true,
    "score": 100,
    "checks": {
      "minimum_length": true,
      "executive_summary": true,
      "market_overview": true,
      "conclusion": true,
      "references": true
    }
  },
  "payment": {
    "task_id": "b7efb50f-6955-4ce7-8a8a-ada007e31fb6",
    "reward": 500,
    "status": "payment_released",
    "transaction": {
      "task_id": "b7efb50f-6955-4ce7-8a8a-ada007e31fb6",
      "payer": "client-agent",
      "payee": "worker-agent",
      "amount": 500,
      "status": "success"
    }
  }
}
```

---

## Features

* Multi-agent distributed system
* A2A communication flow
* Trust-based verification system
* Escrow-based payment simulation
* Reputation tracking system
* Dockerized microservices architecture

---

## Future Improvements

* Full Ed25519 Signature Enforcement
* Multi-Worker Selection
* Cloud Deployment
* Dashboard UI



                    +----------------+
                    | Client Agent   |
                    +----------------+
                            |
                            v
                    +----------------+
                    | Worker Agent   |
                    +----------------+
                            |
                            v
                    +----------------+
                    | Verifier Agent |
                    +----------------+
                            |
                            v
                    +----------------+
                    | Escrow Service |
                    +----------------+

                    Task Flow:
Client Agent → Worker Agent → Verifier Agent → Escrow Service