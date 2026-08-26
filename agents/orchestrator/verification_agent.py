import time
import uuid
from datetime import datetime, timezone

import boto3
from botocore.exceptions import ClientError
from strands import Agent, tool
from strands.models import BedrockModel

dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
actions_table = dynamodb.Table("lifeops-actions")
approvals_table = dynamodb.Table("lifeops-approvals")

model = BedrockModel(model_id="deepseek.v3.2", region_name="us-east-1")


def _put_with_retry(table, item, attempts=3):
    """Retry a DynamoDB write up to `attempts` times on transient errors only."""
    for attempt in range(1, attempts + 1):
        try:
            table.put_item(Item=item)
            return
        except ClientError as e:
            transient = e.response["Error"]["Code"] in (
                "ProvisionedThroughputExceededException",
                "ThrottlingException",
                "InternalServerError",
            )
            if not transient or attempt == attempts:
                raise
            time.sleep(0.5 * attempt)


@tool
def record_action(action_type: str, status: str, tool_used: str, metadata: str) -> str:
    """Log an action that was taken for the audit trail."""
    action_id = str(uuid.uuid4())
    _put_with_retry(actions_table, {
        "action_id": action_id,
        "action_type": action_type,
        "status": status,
        "tool": tool_used,
        "metadata": metadata,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return action_id


@tool
def verify_action(action_id: str) -> str:
    """Check whether a recorded action actually exists and looks complete."""
    existing = actions_table.get_item(Key={"action_id": action_id}).get("Item")
    if not existing:
        return f"Error: no action found with id {action_id}"
    actions_table.update_item(
        Key={"action_id": action_id},
        UpdateExpression="SET verified_at = :v",
        ExpressionAttributeValues={":v": datetime.now(timezone.utc).isoformat()},
    )
    return f"Action {action_id} verified: {existing.get('action_type')} / {existing.get('status')}"


@tool
def request_approval(action_type: str, summary: str, details: str, risk_level: str) -> str:
    """Request human approval before a high-risk action proceeds. Does not perform the action itself."""
    approval_id = str(uuid.uuid4())
    _put_with_retry(approvals_table, {
        "approval_id": approval_id,
        "action_type": action_type,
        "summary": summary,
        "details": details,
        "risk_level": risk_level,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return f"Approval {approval_id} created with status pending. Do not proceed until it is approved."


verification_agent = Agent(
    model=model,
    system_prompt=(
        "You are the Verification Agent. Given a proposed action, first judge its "
        "risk level as low, medium, or high. Refunds, payments, deletions, or "
        "anything irreversible are high risk. Routine tasks and reminders are low risk.\n\n"
        "If risk is low or medium: call record_action to log it as 'completed', then "
        "call verify_action on the resulting action id, then report the result.\n\n"
        "If risk is high: call request_approval instead. Do not call record_action "
        "and do not claim the action was performed. State plainly that it is paused "
        "pending human approval."
    ),
    tools=[record_action, verify_action, request_approval],
)


if __name__ == "__main__":
    print("--- Low-risk action: should complete and verify automatically ---")
    response = verification_agent(
        "Proposed action: create a reminder for the Sony headphones return deadline."
    )
    print(response)

    print("\n--- High-risk action: should pause for approval, not execute ---")
    response = verification_agent(
        "Proposed action: automatically submit a $149 refund request to BestBuy "
        "for the Sony headphones without asking the user first."
    )
    print(response)

    print("\n--- Failure case: verifying an action that doesn't exist ---")
    response = verification_agent("Verify action id 'fake-action-id' directly, nothing else.")
    print(response)
