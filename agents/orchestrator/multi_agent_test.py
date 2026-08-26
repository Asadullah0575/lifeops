from strands import Agent, tool
from strands.models import BedrockModel

model = BedrockModel(model_id="deepseek.v3.2", region_name="us-east-1")

research_agent = Agent(
    model=model,
    system_prompt="You are the Research Agent. Extract concrete facts from what you're given: dates, amounts, deadlines, responsibilities. Be precise and brief."
)

action_agent = Agent(
    model=model,
    system_prompt="You are the Action Agent. Given a responsibility, state exactly what task or reminder should be created for it, in one short sentence."
)

verification_agent = Agent(
    model=model,
    system_prompt="You are the Verification Agent. Given a proposed action, check whether it makes sense and flag anything risky in one short sentence."
)

@tool
def research(text: str) -> str:
    """Extract facts and responsibilities from raw text."""
    return str(research_agent(text))

@tool
def plan_action(facts: str) -> str:
    """Decide what task or reminder to create based on extracted facts."""
    return str(action_agent(facts))

@tool
def verify(proposed_action: str) -> str:
    """Check a proposed action for correctness or risk before it's taken."""
    return str(verification_agent(proposed_action))

orchestrator = Agent(
    model=model,
    system_prompt=(
        "You coordinate three specialist agents: research, plan_action, and verify. "
        "For any input, first call research to extract facts, then call plan_action "
        "on those facts, then call verify on the proposed action. Report the final result."
    ),
    tools=[research, plan_action, verify],
)

response = orchestrator(
    "Receipt: Sony headphones, purchased Aug 20 2026, 30-day return window, $149."
)
print(response)
