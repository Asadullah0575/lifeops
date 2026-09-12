# LifeOps

> **Your personal operations desk.**  
> Built for the *Agents for Humans Hackathon* (Aug 22 – Sep 14, 2026).

---

### The Problem We Built This For

Have you ever sat down on a Sunday evening with a pile of crumpled receipts, an email from the dentist that says *"Reply YES to confirm — $50 fee if cancelled within 48 hours"*, and a subscription confirmation you meant to cancel three weeks ago?

We did. Repeatedly.

Adult life is filled with administrative friction. None of these tasks are particularly hard on their own, but collectively they create an exhausting background hum of mental overhead:
- *When does the return window actually close?*
- *Did I remember to fast 6 hours before my appointment on Thursday?*
- *Will this free trial quietly turn into a $120 annual charge if I don't cancel it by 5 PM?*

Most AI apps try to solve this with a chat box. But when you're overwhelmed, you don't want to chat. You don't want a chatbot to write a poem about your dental cleaning. You want an operations manager sitting at a quiet desk who reads the document, takes care of the boring stuff, keeps track of the deadlines, and **never does anything expensive or irreversible without looking you in the eye first**.

That is why we built **LifeOps**.

---

## What LifeOps Actually Does

LifeOps acts like a meticulous personal chief of staff. You hand it an email, a scanned receipt, a medical notice, or a cancellation policy, and it gets to work:

1. **Catches the details you might miss**: dates, monetary amounts, cancellation penalties, return policies, preparation steps.
2. **Takes safe actions on its own**: puts reminders on your calendar, creates trackable obligations, drafts prep notes, and commits vendor policies to long-term memory.
3. **Double-checks its own work**: verifies that calendar holds and tasks are actually committed before checking them off.
4. **Stops cold at high-stakes decisions**: if an action involves real money, a cancellation penalty, or an irreversible choice, LifeOps holds the line and asks for your explicit sign-off in the **Governance Gate**.

```
  Document or Note
         │
         ▼
     [ Detect ] ────────── Catch raw signal from text or receipt
         │
         ▼
   [ Understand ] ──────── Extract facts: amounts, dates, penalties, windows
         │
         ▼
     [ Decide ] ────────── Risk check: Is this safe, or does it need a human?
       ┌─┴─┐
  Safe │   │ High Risk / Financial
       │   └─────────────► [ Escalate ] ── Needs your approval in the Governance Gate
       ▼
     [ Act ] ───────────── Schedule reminder, create task, draft note
       │
       ▼
    [ Verify ] ─────────── Double-check action was committed accurately
       │
       ▼
   [ Remember ] ────────── Store retailer policies & user habits in AgentCore Memory
```

---

## Why It Looks the Way It Does: Paper & Ink

We deliberately avoided the neon-purple, glowing, vibrating cyberpunk look that most AI tools use today. 

LifeOps was designed with a **Paper & Ink** aesthetic inspired by ledger books, stationery, and physical offices:
- **Paper** (`#1A1512`): A warm, deep charcoal background that is easy on tired eyes.
- **Ink** (`#F2E9DD`): A warm cream typeface that reads like high-grade book paper.
- **Kraft** (`#E0924A`): Warm amber accents for active work and deadlines.
- **Ledger** (`#33513F`): A calm forest green for verified actions and completed obligations.
- **Stamp** (`#C1442E`): A wax-seal red reserved strictly for items requiring your human approval.

No flashing lights, no blinking dots, no distraction machines. Just a calm, steady desk where work gets settled.

---

## A Quick Tour of the Desk

- **Overview (`/overview`)**: Your morning briefing. Shows active counts, pending approvals that need your eyes, upcoming obligations, and what the agent has remembered about you.
- **Obligations & Tasks (`/tasks`)**: Everything LifeOps is tracking on your behalf—return deadlines, doctor prep instructions, payment dates. Check them off with one click or filter by urgency.
- **Governance Gate (`/approvals`)**: The safety barrier. Whenever an action involves money or an irreversible consequence, LifeOps pauses here. You see exactly *why* the agent stopped, what the risk is, and you can approve or reject it with one click.
- **Intake Desk (`/upload`)**: Drop in a receipt or paste confirmation text. You can watch the agent move through each step in real time. We also included **3 one-click demo presets** so you can test real-world scenarios in 5 seconds.
- **Audit Trail (`/activity`)**: Total transparency. A permanent timeline showing every autonomous action, human decision, and verification timestamp.
- **Archives (`/documents`)**: Every document processed, with an expandable raw metadata inspector so you can see every fact extracted from the fine print.

---

## Built-In Demo Scenarios (Try These First!)

Inside the app under **New Doc** (`/upload`), you'll find three built-in test scenarios ready to run with a single click:

| Preset | What It Is | What LifeOps Does |
| :--- | :--- | :--- |
| **Sony WH-1000XM5 Receipt** | Electronic purchase receipt with a 30-day return policy. | **Safe autonomous path**: Extracts $399.99, creates a return deadline task, schedules a calendar hold 3 days before expiry, verifies completion, and stores Sony's return policy in memory. |
| **Riverside Dental Appointment** | Dental checkup with prep rules and a **$50 cancellation penalty**. | **Governance escalation**: Extracts the date and prep instructions, but **halts** on booking confirmation because of the financial cancellation penalty. Routes to Governance Gate for your approval. |
| **CloudStream Annual Refund** | SaaS subscription invoice with strict 14-day prorated refund rules. | **Financial risk gate**: Extracts $144.00, detects refund dispute deadlines, and escalates to the human before initiating any refund request. |

---

## Getting Started in 2 Minutes

### Prerequisites
- Python 3.11+
- Node.js 18+
- An AWS account (configured via `aws configure`) if connecting to live Bedrock/DynamoDB services. *Note: The app includes graceful local fallback mocks, so you can test the entire interface and flows even without active AWS credentials.*

### 1. Clone & Set Up
```bash
git clone https://github.com/Asadullah0575/lifeops.git
cd lifeops
```

### 2. Start the Agent Orchestrator (Backend)
```bash
cd agents/orchestrator
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn api:app --reload --port 8000
```
The backend will be running at `http://localhost:8000` (API documentation available at `http://localhost:8000/docs`).

### 3. Start the Operations Desk (Frontend)
In a new terminal window:
```bash
cd apps/web
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Architecture & Under the Hood

LifeOps is engineered with clean separation of concerns: the AI agent is not a frontend prompt; it runs as a dedicated Python orchestrator powered by AWS:

- **AI Reasoning**: Amazon Bedrock running Anthropic Claude 3.5 Sonnet / Haiku.
- **Agent Framework**: Strands Agents SDK coordinating document intake, verification, and action dispatching.
- **Memory & Facts**: AgentCore Runtime + Memory for persisting user preferences, merchant policies, and context across sessions.
- **Operational Storage**: Amazon DynamoDB single-table design (`lifeops-documents`, `lifeops-tasks`, `lifeops-actions`, `lifeops-approvals`).
- **Document Storage**: Amazon S3 for original document artifacts.
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, custom Paper & Ink theme.

---

## Our Principles

1. **Never pretend to do work you didn't do**: If an action fails to verify, report it. Never fake a success.
2. **Never spend a dollar without permission**: If an action has a financial consequence, the agent must ask first.
3. **Respect human attention**: Don't send 10 chat messages when a single silent calendar reminder is all that was needed.
4. **Be auditable**: Every single thing the agent touches is recorded in the activity trail with a timestamp and verification proof.

---

## License & Credits

Built with care for the **Agents for Humans Hackathon** (2026).  
Author: [Asadullah0575](https://github.com/Asadullah0575)
