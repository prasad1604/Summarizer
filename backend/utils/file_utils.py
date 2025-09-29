from pathlib import Path

ALLOWED_EXTENSIONS = {'.mp3', '.wav', '.mp4', '.m4a', '.flac'}

def validate_audio_file(file) -> bool:
    ext = Path(file.filename).suffix.lower()
    return ext in ALLOWED_EXTENSIONS

async def save_uploaded_file(file, job_id) -> str:
    upload_dir = Path("uploads")
    upload_dir.mkdir(exist_ok=True)
    ext = Path(file.filename).suffix.lower()
    filepath = upload_dir / f"{job_id}{ext}"
    content = await file.read()
    with open(filepath, "wb") as f:
        f.write(content)
    return str(filepath)
