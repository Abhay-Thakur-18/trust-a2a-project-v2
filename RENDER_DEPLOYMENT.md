# Render Backend Deployment Guide

This guide provides step-by-step instructions for deploying the 4 FastAPI microservices of the Trust A2A Network to **Render** as individual Web Services with a shared managed PostgreSQL database.

---

## 1. Shared Infrastructure Setup

### A. Managed PostgreSQL Database on Render
1. In the Render Dashboard, click **New +** -> **PostgreSQL**.
2. **Name**: `trust-a2a-db`
3. **Database Name**: `trustdb`
4. **User**: `trustuser`
5. **Region**: Select the closest region to your users.
6. Once provisioned, copy the **Internal Database URL** (for services running on Render) and **External Database URL** (for local testing if needed).
   - Format: `postgresql://trustuser:<password>@<host>/trustdb`

### B. Gemini API Key
- Obtain an API Key from Google AI Studio.
- Key name in environment: `GEMINI_API_KEY`

### C. Google OAuth Client ID
- Obtain a Web Client ID from Google Cloud Console Credentials.
- Key name in environment: `GOOGLE_CLIENT_ID`

---

## 2. Four Render Web Services Configuration

### Service 1: Client Agent
- **Service Type**: Web Service (Python)
- **Service Name**: `trust-client-agent`
- **Repository**: Your GitHub repository (`trust-a2a-project-v2`)
- **Root Directory**: `client-agent` (or leave empty if building from repo root)
- **Environment**: Python 3
- **Build Command**: `pip install -r client-agent/requirements.txt`
- **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
- **Health Check Path**: `/health`
- **Port**: Render automatically exposes port via `$PORT` (default 8000 for local)
- **Environment Variables**:
  - `DATABASE_URL`: *(Internal PostgreSQL URL from Render)*
  - `GOOGLE_CLIENT_ID`: `your_google_client_id.apps.googleusercontent.com`
  - `WORKER_URL`: `https://trust-worker-agent.onrender.com` *(Render URL of Worker Agent)*
  - `VERIFIER_URL`: `https://trust-verifier-agent.onrender.com` *(Render URL of Verifier Agent)*
  - `ESCROW_URL`: `https://trust-escrow-service.onrender.com` *(Render URL of Escrow Service)*
  - `FRONTEND_URL`: `https://your-app.vercel.app` *(Production Vercel frontend URL once deployed)*

---

### Service 2: Worker Agent
- **Service Type**: Web Service (Python)
- **Service Name**: `trust-worker-agent`
- **Repository**: Your GitHub repository (`trust-a2a-project-v2`)
- **Root Directory**: `worker-agent`
- **Environment**: Python 3
- **Build Command**: `pip install -r worker-agent/requirements.txt`
- **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
- **Health Check Path**: `/health`
- **Port**: Render automatically exposes port via `$PORT` (default 8001 for local)
- **Environment Variables**:
  - `DATABASE_URL`: *(Internal PostgreSQL URL from Render)*
  - `GEMINI_API_KEY`: `your_gemini_api_key`
  - `FRONTEND_URL`: `https://your-app.vercel.app`

---

### Service 3: Verifier Agent
- **Service Type**: Web Service (Python)
- **Service Name**: `trust-verifier-agent`
- **Repository**: Your GitHub repository (`trust-a2a-project-v2`)
- **Root Directory**: `verifier-agent`
- **Environment**: Python 3
- **Build Command**: `pip install -r verifier-agent/requirements.txt`
- **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
- **Health Check Path**: `/health`
- **Port**: Render automatically exposes port via `$PORT` (default 8002 for local)
- **Environment Variables**:
  - `DATABASE_URL`: *(Internal PostgreSQL URL from Render)*
  - `GEMINI_API_KEY`: `your_gemini_api_key`
  - `FRONTEND_URL`: `https://your-app.vercel.app`

---

### Service 4: Escrow Service
- **Service Type**: Web Service (Python)
- **Service Name**: `trust-escrow-service`
- **Repository**: Your GitHub repository (`trust-a2a-project-v2`)
- **Root Directory**: `escrow-service`
- **Environment**: Python 3
- **Build Command**: `pip install -r escrow-service/requirements.txt`
- **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
- **Health Check Path**: `/health`
- **Port**: Render automatically exposes port via `$PORT` (default 8003 for local)
- **Environment Variables**:
  - `DATABASE_URL`: *(Internal PostgreSQL URL from Render)*
  - `FRONTEND_URL`: `https://your-app.vercel.app`

---

## 3. Environment Variable Summary

| Variable Name | Required By | Purpose | Example Value |
|---|---|---|---|
| `DATABASE_URL` | All 4 Services | PostgreSQL connection string | `postgres://user:pass@host/dbname` |
| `GEMINI_API_KEY` | Worker, Verifier | Gemini 2.5 AI report generation & LLM judge | `AIzaSy...` |
| `GOOGLE_CLIENT_ID` | Client Agent | Server-side Google OAuth token verification | `...apps.googleusercontent.com` |
| `WORKER_URL` | Client Agent | URL to send tasks to Worker Agent | `https://trust-worker-agent.onrender.com` |
| `VERIFIER_URL` | Client Agent | URL to request verification from Verifier | `https://trust-verifier-agent.onrender.com` |
| `ESCROW_URL` | Client Agent | URL to lock/release funds with Escrow | `https://trust-escrow-service.onrender.com` |
| `FRONTEND_URL` | All 4 Services | Allowed CORS origin for production frontend | `https://your-app.vercel.app` |

---

## 4. Architectural Verification & Security Checklist

1. **No Hardcoded URLs**: All inter-service calls use `WORKER_URL`, `VERIFIER_URL`, and `ESCROW_URL` environment variables.
2. **No Localhost / Container Dependencies**: Database connection falls back to `DATABASE_URL` when provided by Render PostgreSQL.
3. **CORS Flexibility**: All services dynamically configure `CORSMiddleware` using `FRONTEND_URL`.
4. **Local Docker Continuity**: Local Docker Compose development works seamlessly using `docker-compose up`.
5. **No Secrets Exposed**: All secrets (`GEMINI_API_KEY`, `GOOGLE_CLIENT_ID`, database passwords) are supplied strictly via Render Environment Variables.
6. **Automatic Table Initialization**: All services call `initialize_database()` on startup, creating missing PostgreSQL tables automatically.
