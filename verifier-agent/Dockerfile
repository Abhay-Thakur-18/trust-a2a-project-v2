FROM python:3.11

WORKDIR /app

COPY . .

RUN pip install fastapi uvicorn requests pydantic pynacl

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8002"]