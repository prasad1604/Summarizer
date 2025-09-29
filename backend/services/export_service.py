import os
from docx import Document
from fastapi import BackgroundTasks

class ExportService:
    def __init__(self):
        self.export_dir = "exports"
        os.makedirs(self.export_dir, exist_ok=True)

    async def export_meeting(self, meeting, fmt):
        if fmt == "txt":
            return await self._export_txt(meeting)
        elif fmt == "md":
            return await self._export_md(meeting)
        elif fmt == "docx":
            return await self._export_docx(meeting)
        else:
            raise ValueError(f"Unsupported export format: {fmt}")

    async def _export_txt(self, meeting):
        path = os.path.join(self.export_dir, f"{meeting.id}.txt")
        with open(path, "w", encoding="utf-8") as f:
            f.write(meeting.summary)
        return path

    async def _export_md(self, meeting):
        path = os.path.join(self.export_dir, f"{meeting.id}.md")
        with open(path, "w", encoding="utf-8") as f:
            f.write("# Summary\n")
            f.write(meeting.summary)
        return path

    async def _export_docx(self, meeting):
        path = os.path.join(self.export_dir, f"{meeting.id}.docx")
        doc = Document()
        doc.add_heading('Meeting Summary', 0)
        doc.add_paragraph(meeting.summary)
        doc.save(path)
        return path
