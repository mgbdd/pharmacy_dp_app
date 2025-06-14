import os
from .database import get_connection, release_connection

def init_db():
    conn = None
    cur = None

    files = ['scheme.sql', 'sync_triggers.sql', 'test_data.sql', 'status_update.sql', 'views_and_functions.sql']

    for code_file in files:
        CURRENT_DIR = os.path.dirname(__file__)
        SCHEMA_FILE = os.path.join(CURRENT_DIR, '..', 'requests', code_file)
        SCHEMA_FILE = os.path.normpath(SCHEMA_FILE)

        try:
            conn = get_connection()
            conn.autocommit = False
            cur = conn.cursor()

            with open(SCHEMA_FILE, 'r') as f:
                sql_script = f.read()
                cur.execute(sql_script)
                conn.commit()

        except Exception as e:
            if conn:
                conn.rollback()
            print(f"Произошла непредвиденная ошибка: {e}")

        finally:
            if cur:
                cur.close()
            if conn:
                release_connection(conn)
