import os
import psycopg2
from psycopg2 import pool

# Database connection parameters from environment
DB_HOST = os.environ.get("DB_HOST", "db")
DB_NAME = os.environ.get("DB_NAME", "postgres")
DB_USER = os.environ.get("DB_USER", "myuser")
DB_PASS = os.environ.get("DB_PASS", "mypassword")

# Create a connection pool
connection_pool = pool.SimpleConnectionPool(
    1,  # minconn
    10,  # maxconn
    host=DB_HOST,
    dbname=DB_NAME,
    user=DB_USER,
    password=DB_PASS
)

def get_connection():
    """Get a connection from the pool."""
    return connection_pool.getconn()

def release_connection(conn):
    """Release a connection back to the pool."""
    connection_pool.putconn(conn)

def execute_query(query, params=None, fetch=True, commit=None):
    """Execute a query and return the results."""
    conn = None
    cur = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(query, params)

        # If commit is explicitly set, use that value
        # Otherwise, commit only if not fetching (backward compatibility)
        should_commit = commit if commit is not None else not fetch

        if fetch:
            result = cur.fetchall()
        else:
            result = None

        if should_commit:
            conn.commit()

        return result
    except Exception as e:
        if conn:
            conn.rollback()
        raise e
    finally:
        if cur:
            cur.close()
        if conn:
            release_connection(conn)

def execute_many(query, params_list):
    """Execute a query with multiple parameter sets."""
    conn = None
    cur = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.executemany(query, params_list)
        conn.commit()
    except Exception as e:
        if conn:
            conn.rollback()
        raise e
    finally:
        if cur:
            cur.close()
        if conn:
            release_connection(conn)
