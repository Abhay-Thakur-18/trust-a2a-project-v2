export const STATUS_COLORS = {
  created: "#94a3b8",
  locked: "#f59e0b",
  processing: "#3b82f6",
  completed: "#6366f1",
  verified: "#22c55e",
  paid: "#10b981",
  failed: "#ef4444",
  blocked: "#f97316",
  unknown: "#64748b",
};

export const STATUS_LABELS = {
  created: "Created",
  locked: "Locked",
  processing: "Processing",
  completed: "Completed",
  verified: "Verified",
  paid: "Paid",
  failed: "Failed",
  blocked: "Blocked",
  unknown: "Unknown",
};

export const ESCROW_COLORS = {
  locked: "#f59e0b",
  completed: "#22c55e",
  blocked: "#ef4444",
};

const STATUS_ORDER = ["created", "locked", "processing", "completed", "verified", "paid", "failed", "blocked"];

export const aggregateTaskStatus = (tasks = []) => {
  const counts = tasks.reduce((acc, task) => {
    const key = String(task?.status || "unknown").toLowerCase();
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return STATUS_ORDER.filter((status) => counts[status])
    .map((status) => ({
      key: status,
      name: STATUS_LABELS[status] || status,
      value: counts[status],
      fill: STATUS_COLORS[status] || STATUS_COLORS.unknown,
      pct: tasks.length ? Math.round((counts[status] / tasks.length) * 100) : 0,
    }))
    .concat(
      Object.keys(counts)
        .filter((status) => !STATUS_ORDER.includes(status))
        .map((status) => ({
          key: status,
          name: STATUS_LABELS[status] || status,
          value: counts[status],
          fill: STATUS_COLORS.unknown,
          pct: tasks.length ? Math.round((counts[status] / tasks.length) * 100) : 0,
        })),
    );
};

export const aggregateEscrowStatus = (transactions = []) => {
  const counts = transactions.reduce((acc, tx) => {
    const key = String(tx?.status || "unknown").toLowerCase();
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return ["locked", "completed", "blocked"]
    .filter((status) => counts[status])
    .map((status) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: counts[status],
      fill: ESCROW_COLORS[status],
      pct: transactions.length ? Math.round((counts[status] / transactions.length) * 100) : 0,
    }));
};

export const buildVerificationTrend = (verifications = []) => {
  // Backend returns newest-first; reverse to chronological for chart
  const ordered = [...verifications].reverse().slice(-12);
  return ordered.map((item, index) => {
    const date = item?.created_at ? String(item.created_at).slice(5, 10) : null;
    const score = item?.score != null ? Number(item.score) : null;
    return {
      // Unique key: use DB id if available to prevent duplicate-date collisions
      name: item?.id ? `${date ?? "V"}-${item.id}` : `V${index + 1}`,
      label: date || `V${index + 1}`,
      score: score,               // keep null — connectNulls=false breaks line for missing scores
      rawScore: score,            // same value, explicit alias used by tooltip/detail panel
      hasScore: score != null,
      verified: item?.verified ? 1 : 0,
      task_id: item?.task_id || null,
      feedback: item?.feedback || null,
      created_at: item?.created_at || null,
      id: item?.id ?? null,
    };
  });
};

export const buildTransactionTrend = (transactions = []) => {
  // Backend returns newest-first (ORDER BY id DESC); reverse for chronological order
  const ordered = [...transactions].reverse().slice(-15);
  return ordered.map((item, index) => {
    const date = item?.created_at ? String(item.created_at).slice(5, 10) : null;
    return {
      name: `txn-${item?.id ?? index}`,           // unique internal key
      label: date ? `${date}` : `T${index + 1}`,  // display label (may repeat dates)
      shortLabel: `#${index + 1}`,                // always-unique short label for axis
      amount: Number(item?.amount || 0),
      status: String(item?.status || "unknown").toLowerCase(),
      task_id: item?.task_id || null,
      payer: item?.payer || null,
      payee: item?.payee || null,
      created_at: item?.created_at || null,
      txnId: item?.id ?? null,
    };
  });
};
