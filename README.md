# Trust-Based A2A Multi-Agent Collaboration Platform

A production-ready multi-agent collaboration platform built with **FastAPI, React, PostgreSQL, Docker, and Google Gemini**. The system enables secure task execution through independent verification, escrow-controlled payments, and a modular microservices architecture.

---

## Overview

This project demonstrates a complete **Agent-to-Agent (A2A)** collaboration workflow where independent services communicate to execute, verify, and financially settle tasks in a trusted environment.

Unlike a traditional task management system, this platform introduces a trust layer through verification and escrow, ensuring that payments are released only after successful validation.

---

## Dashboard Preview

> Replace these placeholders with actual screenshots after uploading them to the repository.

```
docs/images/dashboard.png
docs/images/tasks.png
docs/images/transactions.png
docs/images/reports.png
```

---

## Key Features

- Trust-Based Multi-Agent Architecture
- Independent Verification Workflow
- Escrow Payment Mechanism
- Reputation & Trust Model
- Google Gemini Integration
- PostgreSQL Persistence
- Modern React Dashboard
- Dockerized Deployment
- RESTful APIs
- Modular Service Design
- Analytics Dashboard
- Reports & Activity Timeline

---

# System Architecture

```
                        React Dashboard
                               │
                               │
                         REST API Calls
                               │
                               ▼

                  ┌────────────────────────┐
                  │     Client Agent       │
                  │        Port 8000       │
                  └───────────┬────────────┘
                              │
                       Create Task
                              │
                              ▼

                  ┌────────────────────────┐
                  │     Worker Agent       │
                  │        Port 8001       │
                  └───────────┬────────────┘
                              │
                     Submit Completed Task
                              │
                              ▼

                  ┌────────────────────────┐
                  │    Verifier Agent      │
                  │        Port 8002       │
                  └───────────┬────────────┘
                              │
                     Verification Result
                              │
                              ▼

                  ┌────────────────────────┐
                  │    Escrow Service      │
                  │        Port 8003       │
                  └───────────┬────────────┘
                              │
                              ▼

                       PostgreSQL Database
```

---

# Workflow

```
Client

↓

Create Task

↓

Worker Accepts Task

↓

Task Execution

↓

Verifier Reviews Task

↓

Escrow Releases Payment

↓

Transaction Recorded

↓

Dashboard Updated
```

---

# Technology Stack

| Layer | Technology |
|--------|------------|
| Frontend | React 19 |
| Build Tool | Vite |
| Styling | Tailwind CSS v4 |
| UI Components | Shadcn UI |
| Charts | Recharts |
| Backend | FastAPI |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Validation | Pydantic |
| AI Integration | Google Gemini |
| Authentication | Google OAuth |
| API | REST |
| Containerization | Docker |
| Version Control | Git |

---

# Project Structure

```text
trust-a2a-project-v2
│
├── client-agent/
│
├── worker-agent/
│
├── verifier-agent/
│
├── escrow-service/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── docker-compose.yml
│
├── requirements.txt
│
└── README.md
```

---

# Services

| Service | Port |
|----------|------|
| Frontend Dashboard | 4173 |
| Client Agent | 8000 |
| Worker Agent | 8001 |
| Verifier Agent | 8002 |
| Escrow Service | 8003 |
| PostgreSQL | 5432 |

---

# API Endpoints

## Client Agent

| Method | Endpoint |
|---------|----------|
| GET | / |
| POST | /create-task |
| GET | /agent-card |
| GET | /discovery-agent |

---

## Worker Agent

| Method | Endpoint |
|---------|----------|
| GET | / |
| POST | /accept-task |
| GET | /agent-card |

---

## Verifier Agent

| Method | Endpoint |
|---------|----------|
| GET | / |
| POST | /verify |
| GET | /agent-card |

---

## Escrow Service

| Method | Endpoint |
|---------|----------|
| GET | / |
| POST | /lock-funds |
| POST | /release-funds |
| GET | /escrow |
| GET | /transactions |
| GET | /agent-card |

---

# Local Development

## Clone Repository

```bash
git clone https://github.com/Abhay-Thakur-18/trust-a2a-project-v2.git

cd trust-a2a-project-v2
```

---

## Backend

```bash
docker compose up --build
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

Production Preview

```bash
npm run preview
```

---

# Environment Variables

Example:

```env
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
DATABASE_URL=YOUR_DATABASE_URL
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

---

# Dashboard Modules

- Dashboard
- Tasks
- Workers
- Verifications
- Escrow
- Transactions
- Reports
- Settings
- User Profile

---

# Project Highlights

- Modular Microservices
- Independent Agent Communication
- Dockerized Deployment
- Escrow Controlled Payments
- Verification Pipeline
- PostgreSQL Persistence
- Modern React Dashboard
- Protected Routes
- Google Authentication
- Analytics & Reports

---

# Current Status

| Module | Status |
|----------|--------|
| Frontend Dashboard | Completed |
| Backend Services | Completed |
| PostgreSQL Integration | Completed |
| Docker Deployment | Completed |
| Google OAuth | Configured |
| Escrow Workflow | Completed |
| Task Verification | Completed |
| Analytics Dashboard | Completed |

---

# Future Improvements

- JWT Authentication
- WebSocket Notifications
- Redis Queue
- Agent Discovery Registry
- Reputation Engine
- Trust Score Algorithm
- Audit Logging
- Kubernetes Deployment
- CI/CD Pipeline
- Automated Testing

---

# Author

**Abhay Pratap Singh**

Artificial Intelligence Engineer

GitHub

https://github.com/Abhay-Thakur-18

LinkedIn

https://www.linkedin.com/in/abhay-pratap-singh-engineer/

---

# License

This project is licensed under the MIT License.

---

If you found this project useful, consider giving the repository a ⭐.
