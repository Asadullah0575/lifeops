export interface DocItem {
    id: string;
    name: string;
    category: string;
    date: string;
    size: string;
    status: "Verified" | "Parsing" | "Flagged";
}

export interface ApprovalItem {
    id: string;
    title: string;
    amount: string;
    vendor: string;
    category: string;
    status: "Pending" | "Approved" | "Rejected";
    date: string;
}

export interface TaskItem {
    id: string;
    title: string;
    dueDate: string;
    status: "Pending" | "Completed";
    priority: "High" | "Medium" | "Low";
}

export interface ActivityItem {
    id: string;
    action: string;
    timestamp: string;
    type: "upload" | "approval" | "task";
}

export function ingestDocumentRecord(docName: string, category: string, size: string) {
    if (typeof window === "undefined") return;

    const timestamp = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const timeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    // 1. Save Document
    const newDoc: DocItem = {
        id: `doc_${Date.now()}`,
        name: docName,
        category: category || "General",
        date: timestamp,
        size: size || "1.2 MB",
        status: "Verified",
    };
    const existingDocs = JSON.parse(localStorage.getItem("lifeops_user_docs") || "[]");
    localStorage.setItem("lifeops_user_docs", JSON.stringify([newDoc, ...existingDocs]));

    // 2. Automatically generate Pending Approval from uploaded document
    const newApproval: ApprovalItem = {
        id: `appr_${Date.now()}`,
        title: `Verify Invoiced Amount for ${docName}`,
        amount: "$120.00",
        vendor: docName.split("_")[0] || "Vendor",
        category: category || "Utilities",
        status: "Pending",
        date: `${timestamp} ${timeStr}`,
    };
    const existingApprovals = JSON.parse(localStorage.getItem("lifeops_approvals") || "[]");
    localStorage.setItem("lifeops_approvals", JSON.stringify([newApproval, ...existingApprovals]));

    // 3. Automatically generate Task from uploaded document
    const newTask: TaskItem = {
        id: `task_${Date.now()}`,
        title: `Review parsed metadata for ${docName}`,
        dueDate: "Today",
        status: "Pending",
        priority: "High",
    };
    const existingTasks = JSON.parse(localStorage.getItem("lifeops_tasks") || "[]");
    localStorage.setItem("lifeops_tasks", JSON.stringify([newTask, ...existingTasks]));

    // 4. Automatically generate Activity record
    const newActivity: ActivityItem = {
        id: `act_${Date.now()}`,
        action: `Uploaded and parsed ${docName} into active memory queue`,
        timestamp: `${timestamp} at ${timeStr}`,
        type: "upload",
    };
    const existingActivities = JSON.parse(localStorage.getItem("lifeops_activities") || "[]");
    localStorage.setItem("lifeops_activities", JSON.stringify([newActivity, ...existingActivities]));
}