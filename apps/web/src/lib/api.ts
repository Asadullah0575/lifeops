export type Task = {
  task_id: string;
  title: string;
  due_date: string;
  priority: "low" | "medium" | "high";
  status: "open" | "complete" | "cancelled" | string;
  source_id?: string;
  created_at?: string;
};

export type Approval = {
  approval_id: string;
  action_type?: string;
  summary: string;
  details: string;
  risk_level: "low" | "medium" | "high" | string;
  status: "pending" | "approved" | "rejected" | string;
  created_at?: string;
};

export type ReceiptDocument = {
  document_type?: "receipt";
  document_id: string;
  product: string;
  date: string;
  retailer: string;
  amount: string;
  deadline: string;
  warranty: string;
  responsibility?: string;
  status: string;
  created_at?: string;
};

export type AppointmentDocument = {
  document_type: "appointment";
  document_id: string;
  appointment_type: string;
  provider: string;
  date: string;
  time: string;
  location: string;
  prep_instructions: string;
  cancellation_policy: string;
  status: string;
  created_at?: string;
};

export type Document = ReceiptDocument | AppointmentDocument;

export type ActivityItem = {
  kind: "action" | "approval";
  id: string;
  title: string;
  detail: string;
  status: string;
  created_at: string;
  verified_at?: string;
  risk_level?: string;
  tool?: string;
};

export type OverviewData = {
  open_task_count: number;
  pending_approval_count: number;
  recent_tasks: Task[];
  pending_approvals: Approval[];
  recent_actions?: any[];
};

export type DemoSample = {
  id: string;
  title: string;
  type: "receipt" | "appointment";
  filename: string;
  badge: string;
  description: string;
  content: string;
};

export type UploadResult = {
  document_id: string;
  facts: Record<string, string>;
  result: string;
  document_type?: string;
  sample_id?: string;
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_KEY = process.env.NEXT_PUBLIC_LIFEOPS_API_KEY || "";

function getHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...extraHeaders };
  if (API_KEY) {
    headers["x-api-key"] = API_KEY;
  }
  return headers;
}

// Fallback demo data to ensure zero white-screen demo crashes
export const FALLBACK_OVERVIEW: OverviewData = {
  open_task_count: 2,
  pending_approval_count: 1,
  recent_tasks: [
    {
      task_id: "demo-task-1",
      title: "Return window for Sony WH-1000XM5",
      due_date: "2026-09-19",
      priority: "medium",
      status: "open",
    },
    {
      task_id: "demo-task-2",
      title: "Attend Routine Cleaning with Dr. Amara Osei",
      due_date: "2026-09-10",
      priority: "medium",
      status: "open",
    },
  ],
  pending_approvals: [
    {
      approval_id: "demo-appr-1",
      summary: "Action requires approval: Cancellation policy for Routine Cleaning and Checkup: Late cancellations may incur a $50 fee.",
      details: "Late cancellations may incur a $50 fee. Cancellation requires human approval due to financial penalty risk.",
      risk_level: "high",
      status: "pending",
    },
  ],
  recent_actions: [
    {
      action_id: "act-1",
      action_type: "create_task",
      status: "completed",
      metadata: "Created task for Sony WH-1000XM5 return window",
      created_at: new Date().toISOString(),
    },
  ],
};

export const FALLBACK_SAMPLES: DemoSample[] = [
  {
    id: "sony-receipt",
    title: "Sony WH-1000XM5 Receipt",
    type: "receipt",
    filename: "sample_receipt.txt",
    badge: "Autonomous Path",
    description: "Standard electronic purchase ($149) with 30-day return window and 1-year warranty. Demonstrates automated task creation, reminder scheduling, and verification.",
    content: `BestBuy Electronics\nOrder Confirmation\n\nItem: Sony WH-1000XM5 Headphones\nDate of Purchase: August 20, 2026\nPrice: $149.00\nReturn Policy: 30 days from purchase date\nWarranty: 1 year manufacturer warranty`,
  },
  {
    id: "dental-appointment",
    title: "Riverside Dental Appointment",
    type: "appointment",
    filename: "sample_appointment.txt",
    badge: "Escalation Path",
    description: "Routine dental cleaning with prep instructions and a $50 cancellation penalty. Demonstrates appointment tracking and policy risk escalation.",
    content: `Riverside Family Dental\nAppointment Confirmation\n\nPatient: Adetayo\nAppointment Type: Routine Cleaning and Checkup\nProvider: Dr. Amara Osei, DDS\nDate: September 10, 2026\nTime: 2:30 PM\nLocation: 118 Riverside Ave, Suite 200\n\nPlease arrive 15 minutes early to complete paperwork. If this is your first visit, bring a valid photo ID and your insurance card.\n\nCancellation Policy: Please provide at least 24 hours notice to cancel or reschedule. Late cancellations may incur a $50 fee.`,
  },
  {
    id: "cloudstream-refund",
    title: "CloudStream Subscription",
    type: "receipt",
    filename: "sample_receipt_refund.txt",
    badge: "High Risk Approval",
    description: "Premium annual subscription ($89.99) with refund clause. Triggers high-risk financial approval gate to ensure human control.",
    content: `CloudStream Subscription Service\n\nItem: Annual Premium Subscription\nPurchase Date: August 25, 2026\nPrice: $89.99\nRefund Policy: Full refund available within 14 days, processed automatically upon request`,
  },
];

export async function fetchOverview(): Promise<OverviewData> {
  try {
    const res = await fetch(`${BASE_URL}/overview`, {
      headers: getHeaders(),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Server responded ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Overview fetch failed, using fallback demo state:", err);
    return FALLBACK_OVERVIEW;
  }
}

export async function fetchTasks(): Promise<Task[]> {
  try {
    const res = await fetch(`${BASE_URL}/tasks`, {
      headers: getHeaders(),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Server responded ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Tasks fetch failed, using fallback:", err);
    return FALLBACK_OVERVIEW.recent_tasks;
  }
}

export async function completeTask(taskId: string): Promise<{ result: string; action_id: string }> {
  const res = await fetch(`${BASE_URL}/tasks/${taskId}/complete`, {
    method: "POST",
    headers: getHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Server responded ${res.status}`);
  }
  return await res.json();
}

export async function fetchApprovals(): Promise<Approval[]> {
  try {
    const res = await fetch(`${BASE_URL}/approvals`, {
      headers: getHeaders(),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Server responded ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Approvals fetch failed, using fallback:", err);
    return FALLBACK_OVERVIEW.pending_approvals;
  }
}

export async function submitApprovalDecision(
  approvalId: string,
  decision: "approve" | "reject"
): Promise<{ result: string; action_id: string }> {
  const res = await fetch(`${BASE_URL}/approvals/${approvalId}/${decision}`, {
    method: "POST",
    headers: getHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Server responded ${res.status}`);
  }
  return await res.json();
}

export async function fetchDocuments(): Promise<Document[]> {
  try {
    const res = await fetch(`${BASE_URL}/documents`, {
      headers: getHeaders(),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Server responded ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Documents fetch failed, returning empty fallback:", err);
    return [];
  }
}

export async function fetchActivity(): Promise<ActivityItem[]> {
  try {
    const res = await fetch(`${BASE_URL}/activity`, {
      headers: getHeaders(),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Server responded ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Activity fetch failed, using fallback:", err);
    return [
      {
        kind: "action",
        id: "demo-act-1",
        title: "return_deadline — completed",
        detail: "Return/deadline: 30 days from purchase date, based on purchase date August 20, 2026",
        status: "completed",
        created_at: new Date().toISOString(),
        verified_at: new Date().toISOString(),
        tool: "create_task",
      },
      {
        kind: "approval",
        id: "demo-appr-1",
        title: "Action requires approval: Cancellation policy for Routine Cleaning and Checkup",
        detail: "Late cancellations may incur a $50 fee.",
        status: "pending",
        created_at: new Date(Date.now() - 3600000).toISOString(),
        risk_level: "high",
      },
    ];
  }
}

export async function fetchSamples(): Promise<DemoSample[]> {
  try {
    const res = await fetch(`${BASE_URL}/samples`, {
      headers: getHeaders(),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Server responded ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Samples fetch failed, using local presets:", err);
    return FALLBACK_SAMPLES;
  }
}

export async function loadDemoSample(sampleId: string): Promise<UploadResult> {
  const res = await fetch(`${BASE_URL}/samples/${sampleId}/load`, {
    method: "POST",
    headers: getHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Server responded ${res.status}`);
  }
  return await res.json();
}

export async function uploadDocument(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}/upload`, {
    method: "POST",
    headers: getHeaders(),
    body: formData,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Server responded ${res.status}`);
  }
  return await res.json();
}

export async function uploadText(text: string, filename: string = "pasted_document.txt"): Promise<UploadResult> {
  const res = await fetch(`${BASE_URL}/upload/text`, {
    method: "POST",
    headers: getHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ text, filename }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Server responded ${res.status}`);
  }
  return await res.json();
}

export async function fetchMemories(): Promise<string[]> {
  try {
    const res = await fetch(`${BASE_URL}/memory`, {
      headers: getHeaders(),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Server responded ${res.status}`);
    const data = await res.json();
    return data.memories || [];
  } catch (err) {
    return [
      "[retailer_preferences] BestBuy Electronics: 30-day return policy for electronics",
      "[user_preferences] User prefers morning appointments and reminder alerts 3 days prior",
    ];
  }
}

export async function checkHealth(): Promise<{ status: string; service: string; model: string }> {
  try {
    const res = await fetch(`${BASE_URL}/health`, {
      headers: getHeaders(),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Server responded ${res.status}`);
    return await res.json();
  } catch (err) {
    return {
      status: "standby",
      service: "LifeOps Desk (Offline / Demo Mode)",
      model: "Bedrock AgentCore",
    };
  }
}

