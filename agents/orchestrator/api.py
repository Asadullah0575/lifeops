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
from pydantic import BaseModel

from action_agent import complete_task
from killer_workflow import run_workflow
from verification_agent import approve_approval, record_action, reject_approval, verify_action

load_dotenv()
API_KEY = os.environ.get("LIFEOPS_API_KEY")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("lifeops")


def require_api_key(x_api_key: str = Header(None)):
    if not API_KEY or x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")

app = FastAPI(title="LifeOps Agent API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
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


class TextUploadRequest(BaseModel):
    text: str
    filename: str = "pasted_document.txt"


@app.post("/upload/text")
async def upload_text(req: TextUploadRequest, _=Depends(require_api_key)):
    content = req.text.strip()
    if not content:
        raise HTTPException(status_code=400, detail="Document text cannot be empty")

    document_id = str(uuid.uuid4())
    temp_path = Path(f"/tmp/{document_id}_{req.filename}")
    try:
        temp_path.write_text(content, encoding="utf-8")
        workflow = run_workflow(str(temp_path), document_id)
        return {
            "document_id": document_id,
            "facts": workflow.get("facts", {}),
            "result": workflow.get("result", ""),
            "document_type": workflow.get("document_type", "unknown"),
        }
    finally:
        temp_path.unlink(missing_ok=True)


DEMO_SAMPLES = {
    "sony-receipt": {
        "id": "sony-receipt",
        "title": "Sony WH-1000XM5 Receipt",
        "type": "receipt",
        "filename": "sample_receipt.txt",
        "badge": "Autonomous Path",
        "description": "Standard electronic purchase ($149) with 30-day return window and 1-year warranty. Demonstrates automated task creation, reminder scheduling, and verification.",
    },
    "dental-appointment": {
        "id": "dental-appointment",
        "title": "Riverside Dental Appointment",
        "type": "appointment",
        "filename": "sample_appointment.txt",
        "badge": "Escalation Path",
        "description": "Routine dental cleaning with prep instructions and a $50 cancellation penalty. Demonstrates appointment tracking and policy risk escalation.",
    },
    "cloudstream-refund": {
        "id": "cloudstream-refund",
        "title": "CloudStream Subscription",
        "type": "receipt",
        "filename": "sample_receipt_refund.txt",
        "badge": "High Risk Approval",
        "description": "Premium annual subscription ($89.99) with refund clause. Triggers high-risk financial approval gate to ensure human control.",
    },
}


@app.get("/samples")
async def list_samples():
    base_dir = Path(__file__).parent
    result = []
    for sample_id, s in DEMO_SAMPLES.items():
        file_path = base_dir / s["filename"]
        content = file_path.read_text(encoding="utf-8") if file_path.exists() else ""
        result.append({**s, "content": content})
    return result


@app.post("/samples/{sample_id}/load")
async def load_sample(sample_id: str, _=Depends(require_api_key)):
    if sample_id not in DEMO_SAMPLES:
        raise HTTPException(status_code=404, detail="Sample not found")
    sample = DEMO_SAMPLES[sample_id]
    file_path = Path(__file__).parent / sample["filename"]
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Sample file missing on server")

    document_id = f"demo-{sample_id}-{uuid.uuid4().hex[:6]}"
    workflow = run_workflow(str(file_path), document_id)
    return {
        "document_id": document_id,
        "sample_id": sample_id,
        "facts": workflow.get("facts", {}),
        "result": workflow.get("result", ""),
        "document_type": workflow.get("document_type", "unknown"),
    }


@app.get("/tasks")
async def list_tasks():
    table = dynamodb.Table("lifeops-tasks")
    items = table.scan().get("Items", [])
    items.sort(key=lambda x: (x.get("status", "") != "open", x.get("due_date", "")))
    return _clean(items)


@app.post("/tasks/{task_id}/complete")
async def complete_task_route(task_id: str, _=Depends(require_api_key)):
    res = complete_task(task_id)
    if res.startswith("Error:"):
        raise HTTPException(status_code=400, detail=res)
    action_id = record_action(
        action_type="task_completed",
        status="completed",
        tool_used="complete_task",
        metadata=f"Task {task_id} completed by user",
    )
    verify_action(action_id)
    return {"result": res, "action_id": action_id}


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
    actions_table = dynamodb.Table("lifeops-actions")

    tasks = tasks_table.scan().get("Items", [])
    approvals = approvals_table.scan().get("Items", [])
    actions = actions_table.scan().get("Items", [])

    open_tasks = [t for t in tasks if t.get("status") == "open"]
    pending_approvals = [a for a in approvals if a.get("status") == "pending"]

    # Gather recent autonomous actions
    recent_actions = sorted(actions, key=lambda x: x.get("created_at", ""), reverse=True)[:4]

    return _clean([{
        "open_task_count": len(open_tasks),
        "pending_approval_count": len(pending_approvals),
        "recent_tasks": sorted(open_tasks, key=lambda x: x.get("due_date", ""))[:5],
        "pending_approvals": pending_approvals[:5],
        "recent_actions": recent_actions,
    }])[0]


@app.get("/approvals")
async def list_approvals():
    table = dynamodb.Table("lifeops-approvals")
    items = table.scan().get("Items", [])
    items.sort(key=lambda x: (x.get("status", "") != "pending", x.get("created_at", "")), reverse=False)
    return _clean(items)


@app.post("/approvals/{approval_id}/approve")
async def approve(approval_id: str, _=Depends(require_api_key)):
    res = approve_approval(approval_id)
    if res.startswith("Error:"):
        raise HTTPException(status_code=400, detail=res)
    action_id = record_action(
        action_type="approval_approved",
        status="completed",
        tool_used="approve_approval",
        metadata=f"Human approved decision for approval {approval_id}",
    )
    verify_action(action_id)
    return {"result": res, "action_id": action_id}


@app.post("/approvals/{approval_id}/reject")
async def reject(approval_id: str, _=Depends(require_api_key)):
    res = reject_approval(approval_id)
    if res.startswith("Error:"):
        raise HTTPException(status_code=400, detail=res)
    action_id = record_action(
        action_type="approval_rejected",
        status="rejected",
        tool_used="reject_approval",
        metadata=f"Human rejected approval {approval_id}",
    )
    verify_action(action_id)
    return {"result": res, "action_id": action_id}


@app.get("/memory")
async def get_memories():
    try:
        from memory_agentcore import search_memory
        facts = search_memory("")
        memories = [f for f in facts.split("\n") if f.strip() and f != "No matching memory found."]
    except Exception as e:
        logger.warning(f"Could not read AgentCore memory directly: {e}")
        memories = []
    return {"memories": memories}


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "LifeOps Orchestrator",
        "framework": "Strands Agents SDK + Bedrock AgentCore",
        "model": "deepseek.v3.2",
    }


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
            "title": f"{a.get('action_type', 'action')} — {a.get('status', 'unknown')}",
            "detail": a.get("metadata", ""),
            "status": a.get("status", "unknown"),
            "created_at": a.get("created_at", ""),
            "verified_at": a.get("verified_at"),
            "tool": a.get("tool"),
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

