import boto3
from pydantic import BaseModel
from strands import Agent, tool
from strands.models import BedrockModel

s3 = boto3.client("s3", region_name="us-east-1")
BUCKET = "lifeops-documents-adetayo"

model = BedrockModel(model_id="deepseek.v3.2", region_name="us-east-1", temperature=0.1)


class DocumentFacts(BaseModel):
    product: str
    date: str
    retailer: str
    amount: str
    deadline: str
    warranty: str
    responsibility: str


def build_research_agent() -> Agent:
    return Agent(
        model=model,
        system_prompt=(
            "You are the Research Agent. This is a new, independent document "
            "with no connection to any other document you may have seen. "
            "Extract facts from document text. "
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


def extract_document_data(document_id: str) -> DocumentFacts:
    """Read a document's raw text content and extract structured facts from it."""
    key = f"documents/{document_id}"
    obj = s3.get_object(Bucket=BUCKET, Key=key)
    text = obj["Body"].read().decode("utf-8", errors="ignore")
    return build_research_agent().structured_output(DocumentFacts, text)


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
