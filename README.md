# Google A2A Trust-Based Agent Collaboration System

## Overview

This project demonstrates a trust-based multi-agent collaboration system inspired by Google's Agent-to-Agent (A2A) protocol.

The system contains four independent services:

* Client Agent
* Worker Agent
* Verifier Agent
* Escrow Service

The main objective is to ensure that payment is released only after successful verification of work.

---

## Architecture

Client Agent → Worker Agent → Verifier Agent → Escrow Service

1. Client creates a task and reward.
2. Escrow locks the reward.
3. Worker completes the task.
4. Verifier evaluates the result.
5. Escrow releases payment if verification succeeds.
6. Reputation is updated after each task.

---

## Technologies Used

* Python
* FastAPI
* Docker
* Docker Compose

---

## Services

### Client Agent

Port: 8000

Responsibilities:

* Create tasks
* Discover agents
* Manage workflow

### Worker Agent

Port: 8001

Responsibilities:

* Accept tasks
* Generate results

### Verifier Agent

Port: 8002

Responsibilities:

* Verify work
* Calculate score
* Update reputation

### Escrow Service

Port: 8003

Responsibilities:

* Lock funds
* Release payment after verification

---

## Running the Project

```bash
docker-compose up --build
```

---

## Sample Request

POST /create-task

```json
{
  "task": "Generate AI market report",
  "reward": 100
}
```

---

## Sample Response

```json
{
  "success": true,
  "verification": {
    "verified": true,
    "score": 80
  },
  "payment": {
    "status": "payment_released"
  }
}
```

---

## Features

* Multi-Agent Collaboration
* Agent Discovery
* Verification-Based Payment
* Reputation Tracking
* Dockerized Microservices
* Mock Settlement Layer

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