import boto3
from pydantic import BaseModel
from datetime import datetime, timezone
from strands import Agent, tool
from strands.models import BedrockModel

s3 = boto3.client("s3", region_name="us-east-1")
BUCKET = "lifeops-documents-adetayo"

dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
documents_table = dynamodb.Table("lifeops-documents")

model = BedrockModel(model_id="deepseek.v3.2", region_name="us-east-1", temperature=0.1)


class DocumentFacts(BaseModel):
    product: str
    date: str
    retailer: str
    amount: str
    deadline: str
    warranty: str
    responsibility: str


research_agent = Agent(
    model=model,
    system_prompt=(
        "You are the Research Agent. Extract facts from document text. "
        "For the deadline field: scan the entire text for any return policy, "
        "return window, expiration date, or due date, even if the word "
        "'deadline' never appears literally. A phrase like '30 days from "
        "purchase date' or 'valid until' counts as a deadline and must be "
        "captured exactly as written. Only use 'not present' if no such "
        "time-bound policy exists anywhere in the text. For every other "
        "field, if it isn't present in the text, set it to 'not present'."
    ),
)


@tool
def upload_document(local_path: str, document_id: str) -> str:
    """Upload a local file to S3 under a given document_id and return its S3 key."""
    key = f"documents/{document_id}"
    s3.upload_file(local_path, BUCKET, key)
    return key


def get_document_text(document_id: str) -> str:
    """Read a document's raw text content from S3. Shared by any extraction path."""
    key = f"documents/{document_id}"
    obj = s3.get_object(Bucket=BUCKET, Key=key)
    return obj["Body"].read().decode("utf-8", errors="ignore")


def extract_document_data(document_id: str) -> DocumentFacts:
    """Extract structured purchase/receipt facts from a document already in S3."""
    text = get_document_text(document_id)
    return research_agent.structured_output(DocumentFacts, text)


def save_document_record(document_id: str, document_type: str, fields: dict, status: str = "processed") -> None:
    """Persist a record of this document, whatever type it is."""
    item = {
        "document_id": document_id,
        "document_type": document_type,
        "status": status,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    item.update(fields)
    documents_table.put_item(Item=item)


orchestrator = Agent(
    model=model,
    system_prompt="You handle document uploads. Call upload_document to store the given file.",
    tools=[upload_document],
)


if __name__ == "__main__":
    document_id = "receipt-001"
    orchestrator(
        f"Upload the file at ./sample_receipt.txt with document_id '{document_id}'."
    )
    facts = extract_document_data(document_id)
    print(facts)
