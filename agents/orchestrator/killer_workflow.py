from strands import Agent, tool
from strands.models import BedrockModel

from document_intake import upload_document, extract_document_data
from action_agent import create_task, create_reminder
from verification_agent import record_action, verify_action, request_approval
from memory_agentcore import save_memory, search_memory

model = BedrockModel(model_id="deepseek.v3.2", region_name="us-east-1", temperature=0.1)


def build_orchestrator() -> Agent:
    """Create a fresh orchestrator with no memory of prior requests."""
    return Agent(
        model=model,
        system_prompt=(
            "You handle a document end to end, given already-extracted facts. "
            "This is a new, independent request with no connection to any "
            "other document. Do not reason about patterns across documents "
            "or reference prior requests. Follow these steps in order, every time:\n"
            "1. Decide if there is a responsibility to act on. A deadline, return "
            "window, due date, or expiration counts as a responsibility, even if "
            "no immediate action is required today. If there is one, call "
            "create_task, then create_reminder tied to it.\n"
            "2. Judge risk based solely on this document's content: routine tasks "
            "and reminders are low risk. Anything involving money, deletions, or "
            "irreversible third-party actions is high risk. If low or medium risk "
            "and you created a task, call record_action then verify_action. If "
            "high risk, call request_approval instead and do not create a task "
            "or reminder.\n"
            "3. Always call save_memory exactly once with a useful fact from this "
            "document, such as a preference, retailer, or recurring pattern, "
            "tagged with a category. Do this even if no task was needed.\n"
            "4. Report a clear final summary of exactly what you did."
        ),
        tools=[
            create_task, create_reminder,
            record_action, verify_action, request_approval,
            save_memory, search_memory,
        ],
    )


def run_workflow(local_path: str, document_id: str) -> dict:
    upload_document(local_path, document_id)
    facts = extract_document_data(document_id)
    prompt = (
        f"Extracted facts from document {document_id}: {facts.model_dump()}. "
        "Process this end to end, following all four steps."
    )
    orchestrator = build_orchestrator()
    result = str(orchestrator(prompt))
    return {"facts": facts.model_dump(), "result": result}


if __name__ == "__main__":
    result = run_workflow("./sample_receipt.txt", "receipt-killer-003")
    print(result)
