import psycopg2
from psycopg2.extras import RealDictCursor

DB_HOST = "postgres"
DB_NAME = "trustdb"
DB_USER = "trustuser"
DB_PASSWORD = "trustpass"


def get_connection():
    return psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        cursor_factory=RealDictCursor
    )


def initialize_database():

    conn = get_connection()
    cur = conn.cursor()

    # -------------------------
    # TASKS
    # -------------------------
    cur.execute("""
    CREATE TABLE IF NOT EXISTS tasks(
        id SERIAL PRIMARY KEY,
        task_id VARCHAR(255) UNIQUE,
        task TEXT,
        reward INTEGER,
        status VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # -------------------------
    # VERIFICATIONS
    # -------------------------
    cur.execute("""
    CREATE TABLE IF NOT EXISTS verifications(
        id SERIAL PRIMARY KEY,
        task_id VARCHAR(255),
        verified BOOLEAN,
        score INTEGER,
        feedback TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # -------------------------
    # TRANSACTIONS
    # -------------------------
    cur.execute("""
    CREATE TABLE IF NOT EXISTS transactions(
        id SERIAL PRIMARY KEY,
        task_id VARCHAR(255),
        payer VARCHAR(255),
        payee VARCHAR(255),
        amount INTEGER,
        status VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # -------------------------
    # REPUTATION
    # -------------------------
    cur.execute("""
    CREATE TABLE IF NOT EXISTS reputation(
        id SERIAL PRIMARY KEY,
        agent_id VARCHAR(255) UNIQUE,
        success INTEGER DEFAULT 0,
        failure INTEGER DEFAULT 0,
        score INTEGER DEFAULT 100
    );
    """)

    conn.commit()
    cur.close()
    conn.close()


if __name__ == "__main__":
    initialize_database()
    print("✅ PostgreSQL Database Initialized")