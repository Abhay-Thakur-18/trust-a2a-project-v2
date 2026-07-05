FROM python:3.11

WORKDIR /app

COPY . .

RUN pip install --no-cache-dir -r client-agent/requirements.txt

WORKDIR /app/client-agent

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]