from bedrock_agentcore.memory import MemoryClient
from strands import tool

MEMORY_ID = "LifeOpsMemory-Jxml472nSN"
ACTOR_ID = "lifeops-user"
SESSION_ID = "lifeops-ongoing"

client = MemoryClient(region_name="us-east-1")


@tool
def save_memory(fact: str, category: str) -> str:
    """Save a useful fact or preference for future reference."""
    event = client.create_event(
        memory_id=MEMORY_ID,
        actor_id=ACTOR_ID,
        session_id=SESSION_ID,
        messages=[(f"[{category}] {fact}", "ASSISTANT")],
    )
    return str(event.get("eventId", "saved"))


@tool
def search_memory(query: str) -> str:
    """Search saved facts for ones relevant to the query."""
    events = client.list_events(
        memory_id=MEMORY_ID,
        actor_id=ACTOR_ID,
        session_id=SESSION_ID,
        max_results=50,
    )
    matches = []
    for e in events:
        for msg in e.get("payload", []):
            text = msg.get("conversational", {}).get("content", {}).get("text", "")
            if query.lower() in text.lower():
                matches.append(text)
    return "\n".join(matches) if matches else "No matching memory found."


if __name__ == "__main__":
    print(save_memory("BestBuy Electronics: 30-day return policy", "retailer_preferences"))
    print(save_memory("User prefers email reminders over SMS", "user_preferences"))
    print("---")
    print(search_memory("BestBuy"))
    print("---")
    print(search_memory("SMS"))
