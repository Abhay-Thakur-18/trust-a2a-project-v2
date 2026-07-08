import api from "./api";

/**
 * Get recent platform notifications/activities
 * @returns {Promise<{notifications: Array}>}
 */
export async function getNotifications() {
  try {
    // Fetch recent activities from different endpoints
    const [tasks, transactions, verifications] = await Promise.all([
      api.get("/tasks").catch(() => ({ data: { tasks: [] } })),
      api.get("/escrow/transactions").catch(() => ({ data: { transactions: [] } })),
      api.get("/verifications/all").catch(() => ({ data: { verifications: [] } })),
    ]);

    const notifications = [];
    const now = new Date();

    // Process recent tasks (last 24 hours)
    const recentTasks = (tasks.data?.tasks || []).filter((task) => {
      if (!task.created_at) return false;
      const taskDate = new Date(task.created_at);
      const hoursDiff = (now - taskDate) / (1000 * 60 * 60);
      return hoursDiff <= 24;
    });

    recentTasks.forEach((task) => {
      notifications.push({
        id: `task-${task.task_id}`,
        type: "task",
        title: getTaskNotificationTitle(task.status),
        description: task.description || task.task_id,
        timestamp: task.created_at,
        status: task.status,
        icon: getTaskIcon(task.status),
        color: getTaskColor(task.status),
      });
    });

    // Process recent transactions (last 24 hours)
    const recentTransactions = (transactions.data?.transactions || []).filter((tx) => {
      if (!tx.created_at) return false;
      const txDate = new Date(tx.created_at);
      const hoursDiff = (now - txDate) / (1000 * 60 * 60);
      return hoursDiff <= 24;
    });

    recentTransactions.forEach((tx) => {
      notifications.push({
        id: `escrow-${tx.transaction_id}`,
        type: "escrow",
        title: getEscrowNotificationTitle(tx.status),
        description: `${tx.amount} ${tx.currency || "USD"} - ${tx.task_id}`,
        timestamp: tx.created_at,
        status: tx.status,
        icon: getEscrowIcon(tx.status),
        color: getEscrowColor(tx.status),
      });
    });

    // Process recent verifications (last 24 hours)
    const recentVerifications = (verifications.data?.verifications || []).filter((ver) => {
      if (!ver.timestamp) return false;
      const verDate = new Date(ver.timestamp);
      const hoursDiff = (now - verDate) / (1000 * 60 * 60);
      return hoursDiff <= 24;
    });

    recentVerifications.forEach((ver) => {
      notifications.push({
        id: `verify-${ver.verification_id}`,
        type: "verification",
        title: `Verification ${ver.verification_score >= 70 ? "Passed" : "Failed"}`,
        description: `Task ${ver.task_id} - Score: ${ver.verification_score}`,
        timestamp: ver.timestamp,
        status: ver.verification_score >= 70 ? "passed" : "failed",
        icon: ver.verification_score >= 70 ? "✓" : "✗",
        color: ver.verification_score >= 70 ? "#10b981" : "#ef4444",
      });
    });

    // Sort by timestamp (most recent first)
    notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Return top 10 most recent
    return { notifications: notifications.slice(0, 10) };
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return { notifications: [] };
  }
}

function getTaskNotificationTitle(status) {
  const titles = {
    pending: "New Task Created",
    assigned: "Task Assigned to Worker",
    in_progress: "Task In Progress",
    submitted: "Task Submitted for Verification",
    verified: "Task Verified Successfully",
    paid: "Task Payment Released",
    rejected: "Task Rejected",
    failed: "Task Failed",
  };
  return titles[status] || "Task Updated";
}

function getTaskIcon(status) {
  const icons = {
    pending: "📝",
    assigned: "👤",
    in_progress: "⚙️",
    submitted: "📤",
    verified: "✅",
    paid: "💰",
    rejected: "❌",
    failed: "⚠️",
  };
  return icons[status] || "📋";
}

function getTaskColor(status) {
  const colors = {
    pending: "#f59e0b",
    assigned: "#3b82f6",
    in_progress: "#8b5cf6",
    submitted: "#06b6d4",
    verified: "#10b981",
    paid: "#22c55e",
    rejected: "#ef4444",
    failed: "#dc2626",
  };
  return colors[status] || "#6b7280";
}

function getEscrowNotificationTitle(status) {
  const titles = {
    locked: "Funds Locked in Escrow",
    completed: "Funds Released from Escrow",
    blocked: "Transaction Blocked",
    pending: "Escrow Transaction Pending",
  };
  return titles[status] || "Escrow Activity";
}

function getEscrowIcon(status) {
  const icons = {
    locked: "🔒",
    completed: "💸",
    blocked: "🚫",
    pending: "⏳",
  };
  return icons[status] || "💰";
}

function getEscrowColor(status) {
  const colors = {
    locked: "#f59e0b",
    completed: "#10b981",
    blocked: "#ef4444",
    pending: "#6b7280",
  };
  return colors[status] || "#6b7280";
}

/**
 * Get unread notification count
 * @returns {Promise<number>}
 */
export async function getUnreadCount() {
  try {
    const { notifications } = await getNotifications();
    return notifications.length;
  } catch {
    return 0;
  }
}

/**
 * Format relative time (e.g., "2m ago", "5h ago")
 */
export function formatRelativeTime(timestamp) {
  if (!timestamp) return "Unknown";
  
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
