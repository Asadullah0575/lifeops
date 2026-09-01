import shutil
import uuid
from pathlib import Path
from decimal import Decimal

import boto3
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from killer_workflow import run_workflow

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

dynamodb = boto3.resource("dynamodb", region_name="us-east-1")


def _clean(items):
    """Convert DynamoDB's Decimal types to plain numbers so FastAPI can serialize them."""
    def fix(v):
        if isinstance(v, Decimal):
            return int(v) if v % 1 == 0 else float(v)
        if isinstance(v, dict):
            return {k: fix(x) for k, x in v.items()}
        if isinstance(v, list):
            return [fix(x) for x in v]
        return v
    return [fix(i) for i in items]


@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    document_id = str(uuid.uuid4())
    temp_path = Path(f"/tmp/{document_id}_{file.filename}")

    with temp_path.open("wb") as f:
        shutil.copyfileobj(file.file, f)

    workflow = run_workflow(str(temp_path), document_id)
    temp_path.unlink(missing_ok=True)

    return {
        "document_id": document_id,
        "facts": workflow["facts"],
        "result": workflow["result"],
    }


@app.get("/tasks")
async def list_tasks():
    table = dynamodb.Table("lifeops-tasks")
    items = table.scan().get("Items", [])
    items.sort(key=lambda x: x.get("due_date", ""))
    return _clean(items)


@app.get("/documents")
async def list_documents():
    table = dynamodb.Table("lifeops-documents")
    items = table.scan().get("Items", [])
    items.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return _clean(items)


@app.get("/overview")
async def overview():
    tasks_table = dynamodb.Table("lifeops-tasks")
    approvals_table = dynamodb.Table("lifeops-approvals")

    tasks = tasks_table.scan().get("Items", [])
    approvals = approvals_table.scan().get("Items", [])

    open_tasks = [t for t in tasks if t.get("status") == "open"]
    pending_approvals = [a for a in approvals if a.get("status") == "pending"]

    return _clean([{
        "open_task_count": len(open_tasks),
        "pending_approval_count": len(pending_approvals),
        "recent_tasks": sorted(open_tasks, key=lambda x: x.get("due_date", ""))[:5],
        "pending_approvals": pending_approvals[:5],
    }])[0]
