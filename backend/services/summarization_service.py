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
            try:
                self.summarizer = pipeline(
                    "summarization",
                    model="facebook/bart-large-cnn",
                    device=self.device
                )
            except Exception as e:
                logger.error("Failed to load summarizer model: %s", str(e))
                raise

    async def generate_meeting_minutes(self, transcript: str):
        self.load_models()
        loop = asyncio.get_event_loop()
        try:
            result = await loop.run_in_executor(None, self.process_transcript, transcript)
            logger.info("Meeting minutes generated successfully.")
            return result
        except Exception as ex:
            logger.error("Error during meeting minutes generation: %s", str(ex))
            return {
                "summary": "",
                "action_items": [],
                "decisions": [],
                "participants": [],
                "error": str(ex)
            }

    def process_transcript(self, transcript: str):
        if not transcript or len(transcript.strip()) < 15:
            logger.error("Transcript too short or empty.")
            return {
                "summary": "",
                "action_items": [],
                "decisions": [],
                "participants": [],
                "error": "Transcript too short or empty."
            }

        cleaned = re.sub(r"\[[^\]]*\]", "", transcript)  # remove timestamps
        cleaned = re.sub(r"^[A-Za-z]+: ", "", cleaned, flags=re.MULTILINE)  # remove speaker labels

        # Determine dynamic length limits
        input_length = len(cleaned.split())
        max_length = min(150, int(input_length * 0.7))  # 70% of input or 150 max
        min_length = min(50, max(15, int(input_length * 0.3)))  # 30% of input or 50 max, at least 15

        logger.info(
            f"Calling summarizer with max_length={max_length}, min_length={min_length}, input_length={input_length}"
        )

        try:
            summary_result = self.summarizer(
                cleaned,
                max_length=max_length,
                min_length=min_length,
                do_sample=False
            )
            summary = summary_result[0].get("summary_text", "").strip()
            if not summary:
                logger.warning("Summarizer returned empty summary.")
        except Exception as e:
            logger.error("Summarization model failed: %s", str(e))
            summary = ""
        
        # Extract action items, decisions, participants
        action_items = re.findall(
    r"([A-Z][^.!?\n]*\b(?:will|should|needs to|plan to)\b[^.!?\n]*[.!?])",
    transcript,
    flags=re.IGNORECASE
)
        decisions = re.findall(r"(decided|agreed|approved|rejected|concluded)[^.\n]*[.\n]", transcript)
        participants = list(set(re.findall(r"^[A-Za-z]+:", transcript, flags=re.MULTILINE)))

        return {
            "summary": summary,
            "action_items": action_items,
            "decisions": decisions,
            "participants": participants
        }
