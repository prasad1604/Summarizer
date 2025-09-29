import re
import torch
import logging
from transformers import pipeline
import asyncio

logger = logging.getLogger(__name__)

class SummarizationService:
    def __init__(self):
        self.summarizer = None
        self.device = 0 if torch.cuda.is_available() else -1

    def load_models(self):
        if self.summarizer is None:
            logger.info("Loading summarization model")
            self.summarizer = pipeline("summarization", model="facebook/bart-large-cnn", device=self.device)

    async def generate_meeting_minutes(self, transcript: str):
        self.load_models()
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, self._process_transcript, transcript)
        return result

    def _process_transcript(self, transcript: str):
        cleaned = re.sub(r"\[[\d:]+\]", "", transcript)  # remove timestamps
        cleaned = re.sub(r"^[A-Za-z\s]+:", "", cleaned, flags=re.MULTILINE)  # remove speaker labels for summary
        summary = self.summarizer(cleaned, max_length=150, min_length=50, do_sample=False)[0]['summary_text']
        # Simple dummy extraction; improve for production
        action_items = re.findall(r'\b[A-Z][a-z]+\s(?:will|should|needs to|plan to)\s[^.]+', transcript)
        decisions = re.findall(r'\b(?:decided|agreed|approved|rejected|concluded)[^.]+', transcript)
        participants = list(set(re.findall(r'^([A-Za-z]+):', transcript, re.MULTILINE)))
        return {
            "summary": summary.strip(),
            "action_items": action_items,
            "decisions": decisions,
            "participants": participants,
        }
