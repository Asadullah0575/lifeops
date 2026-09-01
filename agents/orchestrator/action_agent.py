import re
import uuid
from datetime import datetime, timezone
from typing import Literal

import boto3
from strands import Agent, tool
from strands.models import BedrockModel

dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
tasks_table = dynamodb.Table("lifeops-tasks")
reminders_table = dynamodb.Table("lifeops-reminders")

model = BedrockModel(model_id="deepseek.v3.2", region_name="us-east-1")

VALID_DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
ALLOWED_UPDATE_FIELDS = {"title", "due_date", "priority"}


@tool
def create_task(
    title: str,
    due_date: str,
    priority: Literal["low", "medium", "high"],
    source_id: str,
) -> str:
    """Create a new task. due_date must be in YYYY-MM-DD format, e.g. 2026-09-19.
    If an open task already exists for this source_id and due_date, returns
    the existing task's id instead of creating a duplicate."""
    if not VALID_DATE.match(due_date):
        return f"Error: due_date must be in YYYY-MM-DD format, got '{due_date}'"
    if not title or not title.strip():
        return "Error: title cannot be empty"

    existing = tasks_table.scan(
        ConsistentRead=True,
        FilterExpression="source_id = :sid AND due_date = :dd AND #s = :open",
        ExpressionAttributeNames={"#s": "status"},
        ExpressionAttributeValues={
            ":sid": source_id, ":dd": due_date, ":open": "open"
        },
    ).get("Items", [])
    if existing:
        return existing[0]["task_id"]

    task_id = str(uuid.uuid4())
    tasks_table.put_item(Item={
        "task_id": task_id,
        "title": title.strip(),
        "due_date": due_date,
        "priority": priority,
        "status": "open",
        "source_id": source_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return task_id


@tool
def update_task(task_id: str, field: str, value: str) -> str:
    """Update a task's title, due_date, or priority. No other fields can be
    changed through this tool. Returns an error if the task doesn't exist,
    the field isn't allowed, or the value is invalid for that field."""
    if field not in ALLOWED_UPDATE_FIELDS:
        return (
            f"Error: '{field}' cannot be updated through this tool. "
            f"Allowed fields: {', '.join(sorted(ALLOWED_UPDATE_FIELDS))}"
        )
    if field == "priority" and value not in ("low", "medium", "high"):
        return f"Error: priority must be low, medium, or high, got '{value}'"
    if field == "due_date" and not VALID_DATE.match(value):
        return f"Error: due_date must be in YYYY-MM-DD format, got '{value}'"
    if field == "title" and not value.strip():
        return "Error: title cannot be empty"

    existing = tasks_table.get_item(Key={"task_id": task_id}).get("Item")
    if not existing:
        return f"Error: no task found with id {task_id}"
    tasks_table.update_item(
        Key={"task_id": task_id},
        UpdateExpression="SET #f = :v",
        ExpressionAttributeNames={"#f": field},
        ExpressionAttributeValues={":v": value},
    )
    return f"Updated {field} on task {task_id}"


@tool
def complete_task(task_id: str) -> str:
    """Mark a task as complete. Returns an error message if the task doesn't exist."""
    existing = tasks_table.get_item(Key={"task_id": task_id}).get("Item")
    if not existing:
        return f"Error: no task found with id {task_id}"
    tasks_table.update_item(
        Key={"task_id": task_id},
        UpdateExpression="SET #s = :v",
        ExpressionAttributeNames={"#s": "status"},
        ExpressionAttributeValues={":v": "complete"},
    )
    return f"Task {task_id} marked complete"


@tool
def create_reminder(title: str, scheduled_for: str, related_task_id: str) -> str:
    """Create a reminder tied to a task. scheduled_for must be in YYYY-MM-DD format.
    If a reminder already exists for this task, returns the existing reminder's id."""
    if not VALID_DATE.match(scheduled_for):
        return f"Error: scheduled_for must be in YYYY-MM-DD format, got '{scheduled_for}'"

    existing = reminders_table.scan(
        ConsistentRead=True,
        FilterExpression="related_task_id = :tid AND #s = :active",
        ExpressionAttributeNames={"#s": "status"},
        ExpressionAttributeValues={":tid": related_task_id, ":active": "active"},
    ).get("Items", [])
    if existing:
        return existing[0]["reminder_id"]

    reminder_id = str(uuid.uuid4())
    reminders_table.put_item(Item={
        "reminder_id": reminder_id,
        "title": title,
        "scheduled_for": scheduled_for,
        "related_task_id": related_task_id,
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return reminder_id


@tool
def cancel_reminder(reminder_id: str) -> str:
    """Cancel an existing reminder. Returns an error message if it doesn't exist."""
    existing = reminders_table.get_item(Key={"reminder_id": reminder_id}).get("Item")
    if not existing:
        return f"Error: no reminder found with id {reminder_id}"
    reminders_table.update_item(
        Key={"reminder_id": reminder_id},
        UpdateExpression="SET #s = :v",
        ExpressionAttributeNames={"#s": "status"},
        ExpressionAttributeValues={":v": "cancelled"},
    )
    return f"Reminder {reminder_id} cancelled"


action_agent = Agent(
    model=model,
    system_prompt=(
        "You are the Action Agent. Given a responsibility, call create_task to "
        "create a task for it, then call create_reminder tied to that task's id, "
        "scheduled a few days before the due date. Use clear, specific titles. "
        "Always express due_date and scheduled_for in YYYY-MM-DD format. "
        "If asked to update, complete, or cancel something that doesn't exist, "
        "report the error plainly rather than guessing."
    ),
    tools=[create_task, update_task, complete_task, create_reminder, cancel_reminder],
)
