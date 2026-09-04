import re
from datetime import datetime

from dateutil.parser import parse as parse_date
from dateutil.relativedelta import relativedelta
from strands import Agent, tool
from strands.models import BedrockModel

from document_intake import upload_document, extract_document_data, save_document_record
from appointment_intake import classify_document_type, extract_appointment_data
from action_agent import create_task, create_reminder
from verification_agent import record_action, verify_action, request_approval
from memory_agentcore import save_memory, search_memory

model = BedrockModel(model_id="deepseek.v3.2", region_name="us-east-1", temperature=0.1)

RISK_KEYWORDS = ["refund", "payment", "delete", "cancel", "cancellation fee", "charge", "late fee", "penalty"]


def _is_high_risk(text: str) -> bool:
    lowered = text.lower()
    return any(word in lowered for word in RISK_KEYWORDS)


def _relabel_if_high_risk(item: dict) -> dict:
    """If a responsibility actually involves a keyword like refund or payment,
    relabel its kind and text so approval screens describe it accurately."""
    if _is_high_risk(item["text"]):
        matched = next((w for w in RISK_KEYWORDS if w in item["text"].lower()), "financial")
        return {
            **item,
            "kind": matched.replace(" ", "_"),
            "text": item["text"].replace("Return/deadline", matched.capitalize()),
        }
    return item


def _build_receipt_responsibilities(facts) -> list[dict]:
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


def _build_appointment_responsibilities(facts) -> list[dict]:
    items = [{
        "kind": "appointment",
        "text": (
            f"Attend {facts.appointment_type} with {facts.provider} on "
            f"{facts.date} at {facts.time}, location {facts.location}. "
            f"Prep: {facts.prep_instructions}"
        ),
        "due_hint": None,
        "exact_date": facts.date,
    }]
    if facts.cancellation_policy and facts.cancellation_policy.strip().lower() != "not present":
        items.append({
            "kind": "cancellation_policy",
            "text": f"Cancellation policy for {facts.appointment_type}: {facts.cancellation_policy}",
            "due_hint": None,
            "exact_date": facts.date,
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


def _resolve_due_date(item: dict, base_date_text: str) -> str | None:
    """A responsibility either has an exact date already (appointments) or
    needs one calculated from a duration phrase (receipts)."""
    if item.get("exact_date"):
        try:
            return parse_date(item["exact_date"]).strftime("%Y-%m-%d")
        except (ValueError, OverflowError):
            return None
    return _calculate_due_date(base_date_text, item["due_hint"])


def _process_responsibility(item: dict, base_date_text: str, document_id: str) -> str:
    """Handle exactly one responsibility deterministically: risk check, then
    either approval or the task/reminder/verify chain, never both."""
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

    due_date = _resolve_due_date(item, base_date_text)

    if due_date is None:
        due_agent_prompt = (
            f"Base date: {base_date_text}. Responsibility: {item.get('due_hint') or item['text']}. "
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
    document_type = classify_document_type(document_id)

    if document_type == "appointment":
        facts = extract_appointment_data(document_id)
        save_document_record(document_id, "appointment", facts.model_dump())
        responsibilities = _build_appointment_responsibilities(facts)
        base_date_text = facts.date
        facts_dict = facts.model_dump()
    else:
        facts = extract_document_data(document_id)
        save_document_record(document_id, "receipt", facts.model_dump())
        responsibilities = _build_receipt_responsibilities(facts)
        base_date_text = facts.date
        facts_dict = facts.model_dump()

    responsibilities = [_relabel_if_high_risk(item) for item in responsibilities]
    outcomes = [_process_responsibility(item, base_date_text, document_id) for item in responsibilities]

    memory_agent = Agent(
        model=model,
        system_prompt="Given document facts, reply with ONE useful fact worth remembering, nothing else.",
    )
    fact = str(memory_agent(str(facts_dict))).strip()
    save_memory(fact=fact, category=f"{document_type}_facts")

    summary = "\n".join(outcomes) if outcomes else "No trackable responsibilities were found."
    return {"facts": facts_dict, "document_type": document_type, "result": summary}


if __name__ == "__main__":
    result = run_workflow("./sample_appointment.txt", "appointment-killer-001")
    print(result)
