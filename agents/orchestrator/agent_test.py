from strands import Agent, tool
from strands.models import BedrockModel

@tool
def get_deadline_status(days_left: int) -> str:
    """Check whether a deadline is urgent based on days remaining."""
    if days_left <= 3:
        return f"{days_left} days left. This is urgent."
    return f"{days_left} days left. Not urgent yet."

model = BedrockModel(
    model_id="deepseek.v3.2",
    region_name="us-east-1",
)

agent = Agent(model=model, tools=[get_deadline_status])

response = agent("A task is due in 2 days. Check the deadline status and tell me what it says.")
print(response)
