function StatusBadge({ status }) {
  const key = String(status || "unknown").toLowerCase();

  const statusStyles = {
    // Success / Completed / Verified / Released / Online
    completed: "bg-emerald-50 text-emerald-800 border-emerald-200",
    paid: "bg-emerald-50 text-emerald-800 border-emerald-200",
    released: "bg-emerald-50 text-emerald-800 border-emerald-200",
    verified: "bg-emerald-50 text-emerald-800 border-emerald-200",
    passed: "bg-emerald-50 text-emerald-800 border-emerald-200",
    pass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    online: "bg-emerald-50 text-emerald-800 border-emerald-200",
    active: "bg-emerald-50 text-emerald-800 border-emerald-200",

    // Processing / Active / In Progress
    processing: "bg-blue-50 text-blue-800 border-blue-200",
    in_progress: "bg-blue-50 text-blue-800 border-blue-200",
    running: "bg-blue-50 text-blue-800 border-blue-200",
    assigned: "bg-blue-50 text-blue-800 border-blue-200",

    // Pending / Created
    created: "bg-slate-100 text-slate-700 border-slate-200",
    pending: "bg-slate-100 text-slate-700 border-slate-200",
    submitted: "bg-slate-100 text-slate-700 border-slate-200",

    // Warning / Locked / Review / Degraded
    locked: "bg-amber-50 text-amber-800 border-amber-200",
    review: "bg-amber-50 text-amber-800 border-amber-200",
    degraded: "bg-amber-50 text-amber-800 border-amber-200",
    checking: "bg-amber-50 text-amber-800 border-amber-200",
    hold: "bg-amber-50 text-amber-800 border-amber-200",

    // Failed / Error / Rejected / Flagged / Offline
    failed: "bg-rose-50 text-rose-800 border-rose-200",
    fail: "bg-rose-50 text-rose-800 border-rose-200",
    rejected: "bg-rose-50 text-rose-800 border-rose-200",
    flagged: "bg-rose-50 text-rose-800 border-rose-200",
    error: "bg-rose-50 text-rose-800 border-rose-200",
    blocked: "bg-rose-50 text-rose-800 border-rose-200",
    offline: "bg-rose-50 text-rose-800 border-rose-200",
  };

  const dotStyles = {
    completed: "bg-emerald-600",
    paid: "bg-emerald-600",
    released: "bg-emerald-600",
    verified: "bg-emerald-600",
    passed: "bg-emerald-600",
    pass: "bg-emerald-600",
    success: "bg-emerald-600",
    online: "bg-emerald-600",
    active: "bg-emerald-600",

    processing: "bg-blue-600 animate-pulse",
    in_progress: "bg-blue-600 animate-pulse",
    running: "bg-blue-600 animate-pulse",
    assigned: "bg-blue-600",

    created: "bg-slate-500",
    pending: "bg-slate-500",
    submitted: "bg-slate-500",

    locked: "bg-amber-500",
    review: "bg-amber-500",
    degraded: "bg-amber-500",
    checking: "bg-amber-500 animate-pulse",
    hold: "bg-amber-500",

    failed: "bg-rose-600",
    fail: "bg-rose-600",
    rejected: "bg-rose-600",
    flagged: "bg-rose-600",
    error: "bg-rose-600",
    blocked: "bg-rose-600",
    offline: "bg-rose-600",
  };

  const currentClass = statusStyles[key] || "bg-slate-50 text-slate-600 border-slate-200";
  const dotClass = dotStyles[key] || "bg-slate-400";

  const displayStatus = String(status || "Unknown")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold ${currentClass}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass} shrink-0`} />
      <span>{displayStatus}</span>
    </span>
  );
}

export default StatusBadge;
