import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "postgres")
DB_NAME = os.getenv("DB_NAME", "trustdb")
DB_USER = os.getenv("DB_USER", "trustuser")
DB_PASSWORD = os.getenv("DB_PASSWORD", "trustpass")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_SSLMODE = os.getenv("DB_SSLMODE", "")
DATABASE_URL = os.getenv("DATABASE_URL", "").strip()


# ==========================================
# DATABASE CONNECTION
# ==========================================

def get_connection():
    if DATABASE_URL:
        return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

    conn_kwargs = {
        "host": DB_HOST,
        "database": DB_NAME,
        "user": DB_USER,
        "password": DB_PASSWORD,
        "port": DB_PORT,
        "cursor_factory": RealDictCursor,
    }
    if DB_SSLMODE:
        conn_kwargs["sslmode"] = DB_SSLMODE

    return psycopg2.connect(**conn_kwargs)



# ==========================================
# INITIALIZE DATABASE
# ==========================================

def initialize_database():

    conn = get_connection()
    cur = conn.cursor()

    # -------------------------
    # TASKS
    # -------------------------

    cur.execute("""
    CREATE TABLE IF NOT EXISTS tasks(
        task_id VARCHAR(255) PRIMARY KEY,
        task TEXT NOT NULL,
        reward INTEGER NOT NULL,
        status TEXT DEFAULT 'created',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        worker_id VARCHAR(255),
        generated_report TEXT,
        verification_score INTEGER,
        verification_feedback TEXT
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
        payer TEXT,
        payee TEXT,
        amount INTEGER,
        status TEXT,
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


# ==========================================
# REPUTATION FUNCTIONS
# ==========================================

def get_reputation(agent_id):

    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        """
        SELECT *
        FROM reputation
        WHERE agent_id=%s
        """,
        (agent_id,)
    )

    agent = cur.fetchone()

    if not agent:

        cur.execute("""
            INSERT INTO reputation
            (
                agent_id,
                success,
                failure,
                score
            )
            VALUES
            (
                %s,
                0,
                0,
                100
            )
        """, (agent_id,))

        conn.commit()

        cur.execute(
            """
            SELECT *
            FROM reputation
            WHERE agent_id=%s
            """,
            (agent_id,)
        )

        agent = cur.fetchone()

    cur.close()
    conn.close()

    return agent


def update_reputation(agent_id, success):

    print("\n========== UPDATE REPUTATION ==========")
    print("Agent:", agent_id)
    print("Success:", success)

    get_reputation(agent_id)

    conn = get_connection()
    cur = conn.cursor()

    if success:

        print("Increasing reputation...")

        cur.execute("""
            UPDATE reputation
            SET
                success = success + 1,
                score = LEAST(score + 2, 100)
            WHERE agent_id=%s
        """, (agent_id,))

    else:

        print("Decreasing reputation...")

        cur.execute("""
            UPDATE reputation
            SET
                failure = failure + 1,
                score = GREATEST(score - 10, 0)
            WHERE agent_id=%s
        """, (agent_id,))

    print("Rows Updated:", cur.rowcount)

    conn.commit()

    cur.close()
    conn.close()

    updated = get_reputation(agent_id)

    print("New Reputation:", updated)
    print("======================================")

    return updated