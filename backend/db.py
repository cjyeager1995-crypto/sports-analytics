import sqlite3
import json
import os
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(__file__), "cache.db")


def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db():
    conn = get_conn()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS player_search_cache (
            query TEXT PRIMARY KEY,
            results TEXT NOT NULL,
            cached_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS game_log_cache (
            player_id INTEGER NOT NULL,
            range_key TEXT NOT NULL,
            data TEXT NOT NULL,
            cached_at TEXT NOT NULL,
            PRIMARY KEY (player_id, range_key)
        );
    """)
    conn.close()


CACHE_TTL_HOURS = 6


def get_cached(table: str, key_cols: dict) -> dict | list | None:
    conn = get_conn()
    where = " AND ".join(f"{k} = ?" for k in key_cols)
    vals = list(key_cols.values())
    row = conn.execute(
        f"SELECT * FROM {table} WHERE {where}", vals
    ).fetchone()
    conn.close()
    if row is None:
        return None
    cached_at = datetime.fromisoformat(row["cached_at"])
    if datetime.now() - cached_at > timedelta(hours=CACHE_TTL_HOURS):
        return None
    data_col = "results" if "results" in row.keys() else "data"
    return json.loads(row[data_col])


def set_cache(table: str, key_cols: dict, data):
    conn = get_conn()
    data_col = "results" if table == "player_search_cache" else "data"
    cols = list(key_cols.keys()) + [data_col, "cached_at"]
    placeholders = ",".join(["?"] * len(cols))
    col_names = ",".join(cols)
    vals = list(key_cols.values()) + [json.dumps(data), datetime.now().isoformat()]
    conn.execute(
        f"INSERT OR REPLACE INTO {table} ({col_names}) VALUES ({placeholders})", vals
    )
    conn.commit()
    conn.close()


init_db()
