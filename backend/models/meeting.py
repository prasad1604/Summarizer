from enum import Enum
from datetime import datetime
from typing import List, Optional
import json
import aiosqlite
from models.database import DATABASE_URL

class MeetingStatus(Enum):
    UPLOADED = "uploaded"
    TRANSCRIBING = "transcribing"
    ANALYZING = "analyzing"
    SUMMARIZING = "summarizing"
    COMPLETED = "completed"
    FAILED = "failed"

class Meeting:
    def __init__(self, id: str, filename: str, file_path: str, status: MeetingStatus,
                 current_stage: str = None, progress: int = 0, transcript: str = None,
                 summary: str = None, action_items: List[str] = None,
                 decisions: List[str] = None, participants: List[str] = None,
                 duration: float = None, created_at: datetime = None,
                 completed_at: datetime = None, error: str = None):
        self.id = id
        self.filename = filename
        self.file_path = file_path
        self.status = status
        self.current_stage = current_stage
        self.progress = progress
        self.transcript = transcript
        self.summary = summary
        self.action_items = action_items or []
        self.decisions = decisions or []
        self.participants = participants or []
        self.duration = duration
        self.created_at = created_at or datetime.utcnow()
        self.completed_at = completed_at
        self.error = error

    async def save(self):
        async with aiosqlite.connect(DATABASE_URL) as db:
            await db.execute("""
                INSERT OR REPLACE INTO meetings 
                (id, filename, file_path, status, current_stage, progress, transcript,
                 summary, action_items, decisions, participants, duration,
                 created_at, completed_at, error)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                self.id, self.filename, self.file_path, self.status.value,
                self.current_stage, self.progress, self.transcript, self.summary,
                json.dumps(self.action_items), json.dumps(self.decisions),
                json.dumps(self.participants), self.duration,
                self.created_at.isoformat() if self.created_at else None,
                self.completed_at.isoformat() if self.completed_at else None,
                self.error
            ))
            await db.commit()

    @classmethod
    async def get(cls, meeting_id: str) -> Optional['Meeting']:
        async with aiosqlite.connect(DATABASE_URL) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute("SELECT * FROM meetings WHERE id = ?", (meeting_id,))
            row = await cursor.fetchone()
            if not row:
                return None
            return cls(
                id=row['id'],
                filename=row['filename'],
                file_path=row['file_path'],
                status=MeetingStatus(row['status']),
                current_stage=row['current_stage'],
                progress=row['progress'],
                transcript=row['transcript'],
                summary=row['summary'],
                action_items=json.loads(row['action_items']) if row['action_items'] else [],
                decisions=json.loads(row['decisions']) if row['decisions'] else [],
                participants=json.loads(row['participants']) if row['participants'] else [],
                duration=row['duration'],
                created_at=datetime.fromisoformat(row['created_at']) if row['created_at'] else None,
                completed_at=datetime.fromisoformat(row['completed_at']) if row['completed_at'] else None,
                error=row['error']
            )
