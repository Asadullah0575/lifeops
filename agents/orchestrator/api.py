import logging
import os
import shutil
import uuid
from decimal import Decimal
from pathlib import Path

import boto3
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, Header, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from killer_workflow import run_workflow
from verification_agent import approve_approval, reject_approval

load_dotenv()
API_KEY = os.environ.get("LIFEOPS_API_KEY")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("lifeops")


def require_api_key(x_api_key: str = Header(None)):
    if not API_KEY or x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

dynamodb = boto3.resource("dynamodb", region_name="us-east-1")

MAX_UPLOAD_SIZE = 10 * 1024 * 1024
ALLOWED_EXTENSIONS = {".txt"}


@app.exception_handler(Exception)
async def handle_unexpected_error(request: Request, exc: Exception):
    logger.exception(f"Unhandled error on {request.method} {request.url.path}")
    return JSONResponse(
        status_code=500,
        content={"error": "Something went wrong processing this request."},
    )


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
async def upload(file: UploadFile = File(...), _=Depends(require_api_key)):
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext or 'unknown'}'. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    document_id = str(uuid.uuid4())
    temp_path = Path(f"/tmp/{document_id}_{file.filename}")

    try:
        size = 0
        with temp_path.open("wb") as f:
            while chunk := await file.read(1024 * 1024):
                size += len(chunk)
                if size > MAX_UPLOAD_SIZE:
                    raise HTTPException(status_code=413, detail="File too large, 10MB max")
                f.write(chunk)

        workflow = run_workflow(str(temp_path), document_id)
        return {
            "document_id": document_id,
            "facts": workflow["facts"],
            "result": workflow["result"],
        }
    finally:
        temp_path.unlink(missing_ok=True)


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


@app.get("/approvals")
async def list_approvals():
    table = dynamodb.Table("lifeops-approvals")
    items = table.scan().get("Items", [])
    items.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return _clean(items)


@app.post("/approvals/{approval_id}/approve")
async def approve(approval_id: str, _=Depends(require_api_key)):
    return {"result": approve_approval(approval_id)}


@app.post("/approvals/{approval_id}/reject")
async def reject(approval_id: str, _=Depends(require_api_key)):
    return {"result": reject_approval(approval_id)}


@app.get("/activity")
async def activity():
    actions_table = dynamodb.Table("lifeops-actions")
    approvals_table = dynamodb.Table("lifeops-approvals")

    actions = actions_table.scan().get("Items", [])
    approvals = approvals_table.scan().get("Items", [])

    feed = []
    for a in actions:
        feed.append({
            "kind": "action",
            "id": a.get("action_id"),
            "title": f"{a.get('action_type', 'action')} \u2014 {a.get('status', 'unknown')}",
            "detail": a.get("metadata", ""),
            "status": a.get("status", "unknown"),
            "created_at": a.get("created_at", ""),
            "verified_at": a.get("verified_at"),
        })
    for ap in approvals:
        feed.append({
            "kind": "approval",
            "id": ap.get("approval_id"),
            "title": ap.get("summary", "Approval requested"),
            "detail": ap.get("details", ""),
            "status": ap.get("status", "unknown"),
            "created_at": ap.get("created_at", ""),
            "risk_level": ap.get("risk_level"),
        })
    feed.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return _clean(feed)
