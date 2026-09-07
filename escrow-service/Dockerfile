FROM python:3.11

WORKDIR /app

COPY . .

RUN pip install --no-cache-dir -r escrow-service/requirements.txt

ENV PYTHONPATH=/app

WORKDIR /app/escrow-service

CMD uvicorn app:app --host 0.0.0.0 --port ${PORT:-8003}