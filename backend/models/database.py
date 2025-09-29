import aiosqlite
from pathlib import Path

DATABASE_URL = "meeting_minutes.db"

async def init_db():
    async with aiosqlite.connect(DATABASE_URL) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS meetings (
                id TEXT PRIMARY KEY,
                filename TEXT NOT NULL,
                file_path TEXT NOT NULL,
                status TEXT NOT NULL,
                current_stage TEXT,
                progress INTEGER DEFAULT 0,
                transcript TEXT,
                summary TEXT,
                action_items TEXT,
                decisions TEXT,
                participants TEXT,
                duration REAL,
                created_at TIMESTAMP,
                completed_at TIMESTAMP,
                error TEXT
            )
        """)
        await db.commit()
