from bedrock_agentcore import BedrockAgentCoreApp

from document_intake import extract_document_data
from killer_workflow import build_orchestrator

app = BedrockAgentCoreApp()


@app.entrypoint
def invoke(payload):
    document_id = payload.get("document_id", "receipt-001")
    facts = extract_document_data(document_id)
    prompt = (
        f"Extracted facts from document {document_id}: {facts.model_dump()}. "
        "Process this end to end, following all four steps."
    )
    orchestrator = build_orchestrator()
    result = str(orchestrator(prompt))
    return {"document_id": document_id, "facts": facts.model_dump(), "result": result}


if __name__ == "__main__":
    app.run()
