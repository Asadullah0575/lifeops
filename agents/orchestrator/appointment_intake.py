from typing import Literal

from pydantic import BaseModel
from strands import Agent
from strands.models import BedrockModel

from document_intake import get_document_text

model = BedrockModel(model_id="deepseek.v3.2", region_name="us-east-1", temperature=0.1)


class DocumentType(BaseModel):
    document_type: Literal["receipt", "appointment"]


classifier_agent = Agent(
    model=model,
    system_prompt=(
        "You classify documents into exactly one type. 'receipt' means a "
        "purchase, order confirmation, or shopping receipt with a product "
        "and a price. 'appointment' means a scheduled visit, booking, or "
        "meeting with a date, time, and a provider or location, with no "
        "purchase price involved. Choose exactly one."
    ),
)


def classify_document_type(document_id: str) -> str:
    """Decide whether an already-uploaded document is a receipt or an appointment."""
    text = get_document_text(document_id)
    result = classifier_agent.structured_output(DocumentType, text)
    return result.document_type


class AppointmentFacts(BaseModel):
    appointment_type: str
    provider: str
    date: str
    time: str
    location: str
    prep_instructions: str
    cancellation_policy: str


appointment_research_agent = Agent(
    model=model,
    system_prompt=(
        "You are the Research Agent for appointments. Extract these fields "
        "precisely: appointment_type (what kind of appointment this is), "
        "provider (the doctor, business, or organization name), date, time, "
        "location, prep_instructions (anything the person must do beforehand, "
        "such as fasting, bringing documents, or arriving early), and "
        "cancellation_policy. If a field isn't present in the text, set it "
        "to 'not present'. Be precise and brief."
    ),
)


def extract_appointment_data(document_id: str) -> AppointmentFacts:
    """Extract structured appointment facts from a document already in S3."""
    text = get_document_text(document_id)
    return appointment_research_agent.structured_output(AppointmentFacts, text)
