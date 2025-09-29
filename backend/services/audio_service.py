import whisper
import torch
import asyncio
import logging

logger = logging.getLogger(__name__)

class AudioService:
    def __init__(self, model_name="base"):
        self.model_name = model_name
        self.model = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"AudioService initialized on device {self.device}")

    def load_model(self):
        if self.model is None:
            logger.info(f"Loading Whisper model '{self.model_name}'")
            self.model = whisper.load_model(self.model_name, device=self.device)

    async def transcribe_audio(self, file_path: str, language: str = None) -> str:
        self.load_model()
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, self._transcribe_sync, file_path)
        return result

    def _transcribe_sync(self, file_path: str) -> str:
        result = self.model.transcribe(file_path)
    
        # Format transcription with timestamps
        segments = result.get('segments', [])
        transcript_lines = []
        for segment in segments:
            start = int(segment['start'])
            m, s = divmod(start, 60)
            timestamp = f"[{m:02d}:{s:02d}]"
            text = segment['text'].strip()
            transcript_lines.append(f"{timestamp} {text}")
        return "\n\n".join(transcript_lines)
