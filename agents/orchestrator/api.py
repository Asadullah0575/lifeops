import shutil
import uuid
from pathlib import Path

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from document_intake import orchestrator, extract_document_data

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    document_id = str(uuid.uuid4())
    temp_path = Path(f"/tmp/{document_id}_{file.filename}")

    with temp_path.open("wb") as f:
        shutil.copyfileobj(file.file, f)

    orchestrator(f"Upload the file at {temp_path} with document_id '{document_id}'.")
    facts = extract_document_data(document_id)

    temp_path.unlink(missing_ok=True)

    return {"document_id": document_id, "facts": facts.model_dump()}
