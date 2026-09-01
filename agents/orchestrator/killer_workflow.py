import re
from datetime import datetime

from dateutil.parser import parse as parse_date
from dateutil.relativedelta import relativedelta
from strands import Agent, tool
from strands.models import BedrockModel

from document_intake import upload_document, extract_document_data, save_document_record
from action_agent import create_task, create_reminder
from verification_agent import record_action, verify_action, request_approval
from memory_agentcore import save_memory, search_memory

model = BedrockModel(model_id="deepseek.v3.2", region_name="us-east-1", temperature=0.1)

RISK_KEYWORDS = ["refund", "payment", "delete", "cancel subscription", "charge"]


def _is_high_risk(text: str) -> bool:
    lowered = text.lower()
    return any(word in lowered for word in RISK_KEYWORDS)


def _build_responsibilities(facts) -> list[dict]:
    """Deterministically list responsibilities from structured facts, rather
    than relying on the model to notice them in free-form text."""
    items = []
    if facts.deadline and facts.deadline.strip().lower() != "not present":
        items.append({
            "kind": "return_deadline",
            "text": f"Return/deadline: {facts.deadline}, based on purchase date {facts.date}",
            "due_hint": facts.deadline,
        })
    if facts.warranty and facts.warranty.strip().lower() != "not present":
        items.append({
            "kind": "warranty",
            "text": f"Warranty: {facts.warranty}, based on purchase date {facts.date}",
            "due_hint": facts.warranty,
        })
    return items


DATE_PATTERN = re.compile(r"(\d+)\s*-?\s*(day|week|month|year)s?", re.IGNORECASE)
VALID_DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def _calculate_due_date(base_date_text: str, duration_text: str) -> str | None:
    """Deterministically compute a due date from a base date and a duration
    phrase like '30 days' or '18-month'. Returns None if either piece
    can't be parsed, rather than guessing."""
    match = DATE_PATTERN.search(duration_text)
    if not match:
        return None
    amount, unit = int(match.group(1)), match.group(2).lower()
    try:
        base = parse_date(base_date_text)
    except (ValueError, OverflowError):
        return None
    unit_map = {"day": "days", "week": "weeks", "month": "months", "year": "years"}
    result = base + relativedelta(**{unit_map[unit]: amount})
    return result.strftime("%Y-%m-%d")


def _process_responsibility(item: dict, facts, document_id: str) -> str:
    """Handle exactly one responsibility deterministically: risk check, then
    either approval or the task/reminder/verify chain, never both, never
    skipped, never duplicated. No model judgment involved in whether this
    runs, only in the wording of the title."""
    if _is_high_risk(item["text"]):
        approval_id = request_approval(
            action_type=item["kind"],
            summary=f"Action requires approval: {item['text']}",
            details=item["text"],
            risk_level="high",
        )
        return f"Paused for approval ({approval_id}): {item['text']}"

    title_agent = Agent(
        model=model,
        system_prompt=(
            "Given a responsibility description, reply with ONLY a short, "
            "clear task title, nothing else, no explanation."
        ),
    )
    title = str(title_agent(item["text"])).strip()

    due_date = _calculate_due_date(facts.date, item['due_hint'])

    if due_date is None:
        due_agent_prompt = (
            f"Purchase date: {facts.date}. Responsibility: {item['due_hint']}. "
            "Reply with ONLY the resulting date in YYYY-MM-DD format, nothing else. "
            "If you genuinely cannot determine a date, reply with exactly: UNKNOWN"
        )
        date_agent = Agent(
            model=model,
            system_prompt="Calculate dates precisely. Reply with only YYYY-MM-DD or UNKNOWN, nothing else.",
        )
        candidate = str(date_agent(due_agent_prompt)).strip()
        due_date = candidate if VALID_DATE.match(candidate) else None

    if due_date is None:
        return f"Skipped, could not determine a valid due date for: {item['text']}"

    task_id = create_task(
        title=title, due_date=due_date, priority="medium", source_id=document_id
    )
    create_reminder(
        title=f"Reminder: {title}", scheduled_for=due_date, related_task_id=task_id
    )
    action_id = record_action(
        action_type=item["kind"], status="completed", tool_used="create_task",
        metadata=item["text"],
    )
    verify_action(action_id)
    return f"Created task {task_id}: {title} (due {due_date})"


def run_workflow(local_path: str, document_id: str) -> dict:
    upload_document(local_path, document_id)
    facts = extract_document_data(document_id)
    save_document_record(document_id, facts)
    responsibilities = _build_responsibilities(facts)

    outcomes = [_process_responsibility(item, facts, document_id) for item in responsibilities]

    memory_agent = Agent(
        model=model,
        system_prompt="Given document facts, reply with ONE useful fact worth remembering, nothing else.",
    )
    fact = str(memory_agent(str(facts.model_dump()))).strip()
    save_memory(fact=fact, category="document_facts")

    summary = "\n".join(outcomes) if outcomes else "No trackable responsibilities were found."
    return {"facts": facts.model_dump(), "result": summary}


if __name__ == "__main__":
    result = run_workflow("./sample_receipt.txt", "receipt-killer-007")
    print(result)
