from bedrock_agentcore.memory import MemoryClient

client = MemoryClient(region_name="us-east-1")
memory = client.create_memory(
    name="LifeOpsMemory",
    description="Event memory for LifeOps agent interactions",
)
print("Memory ID:", memory.get("id"))
