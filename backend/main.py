from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import uuid
import os
from datetime import datetime
from contextlib import asynccontextmanager
import uvicorn

from models.database import init_db
from models.meeting import Meeting, MeetingStatus
from services.audio_service import AudioService
from services.summarization_service import SummarizationService
from services.export_service import ExportService
from utils.file_utils import validate_audio_file, save_uploaded_file


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup code
    await init_db()
    yield
    # Optional shutdown code below (if any)


app = FastAPI(title="Meeting Minutes Generator API", lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


audio_service = AudioService()
summarization_service = SummarizationService()
export_service = ExportService()


os.makedirs("uploads", exist_ok=True)
os.makedirs("exports", exist_ok=True)


@app.post("/api/upload")
async def upload_file(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not validate_audio_file(file):
        raise HTTPException(status_code=400, detail="Invalid audio file format")
    job_id = str(uuid.uuid4())
    file_path = await save_uploaded_file(file, job_id)
    meeting = Meeting(
        id=job_id,
        filename=file.filename,
        file_path=file_path,
        status=MeetingStatus.UPLOADED,
        created_at=datetime.utcnow(),
    )
    await meeting.save()
    background_tasks.add_task(process_meeting, job_id)
    return {"job_id": job_id, "filename": file.filename, "status": "uploaded"}


@app.get("/api/status/{job_id}")
async def get_status(job_id: str):
    meeting = await Meeting.get(job_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Job not found")
    return {
        "job_id": job_id,
        "status": meeting.status.value,
        "progress": meeting.progress,
        "current_stage": meeting.current_stage,
        "created_at": str(meeting.created_at),
        "completed_at": str(meeting.completed_at) if meeting.completed_at else None,
        "error": meeting.error,
    }


@app.get("/api/summary/{job_id}")
async def get_summary(job_id: str):
    meeting = await Meeting.get(job_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Job not found")
    if meeting.status != MeetingStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Processing not completed")
    return {
        "job_id": job_id,
        "filename": meeting.filename,
        "summary": meeting.summary,
        "action_items": meeting.action_items,
        "decisions": meeting.decisions,
        "participants": meeting.participants,
        "duration": meeting.duration,
    }


@app.get("/api/export/{job_id}")
async def export_meeting(job_id: str, format: str = "txt"):
    meeting = await Meeting.get(job_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Job not found")
    if meeting.status != MeetingStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Processing not completed")
    export_path = await export_service.export_meeting(meeting, format)
    return FileResponse(export_path, filename=f"meeting-minutes-{job_id[:8]}.{format}")


async def process_meeting(job_id: str):
    meeting = await Meeting.get(job_id)
    if not meeting:
        return
    try:
        meeting.status = MeetingStatus.TRANSCRIBING
        meeting.current_stage = "Transcribing"
        meeting.progress = 25
        await meeting.save()

        transcript = await audio_service.transcribe_audio(meeting.file_path)
        meeting.transcript = transcript
        meeting.progress = 50
        await meeting.save()

        meeting.status = MeetingStatus.ANALYZING
        meeting.current_stage = "Analyzing"
        meeting.progress = 75
        await meeting.save()

        summary_result = await summarization_service.generate_meeting_minutes(transcript)
        meeting.summary = summary_result["summary"]
        meeting.action_items = summary_result["action_items"]
        meeting.decisions = summary_result["decisions"]
        meeting.participants = summary_result["participants"]

        meeting.status = MeetingStatus.COMPLETED
        meeting.current_stage = "Complete"
        meeting.progress = 100
        meeting.completed_at = datetime.utcnow()
        await meeting.save()
    except Exception as e:
        meeting.status = MeetingStatus.FAILED
        meeting.error = str(e)
        await meeting.save()


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
