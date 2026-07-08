import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { EmptyState } from "../shared/DataState";
import { formatCurrency } from "../../lib/formatters";
import { ESCROW_COLORS, buildTransactionTrend } from "../../lib/chartUtils";

const STATUS_LABELS = {
  locked: "Locked",
  completed: "Released",
  blocked: "Blocked",
};

const STATUS_COLORS = {
  locked: "#f59e0b",
  completed: "#22c55e",
  blocked: "#ef4444",
};

/* ── Hover tooltip (shows while hovering) ─────────────────────────── */
function EscrowTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  if (!item) return null;
  const color = STATUS_COLORS[item.status] || "#60a5fa";

  return (
    <div
      className="rounded-xl border px-4 py-3 shadow-xl backdrop-blur-md pointer-events-none"
      style={{
        background: "var(--card)",
        borderColor: color + "66",
        boxShadow: `0 8px 24px ${color}22`,
        minWidth: 200,
      }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--muted-foreground)" }}>
        {item.created_at ? new Date(item.created_at).toLocaleString() : item.label}
      </p>
      <div className="flex items-center gap-2 mb-2">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-xs font-semibold" style={{ color }}>
          {STATUS_LABELS[item.status] || item.status}
        </span>
      </div>
      <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
        {formatCurrency(item.amount ?? 0)}
      </p>
      {item.task_id && (
        <p className="mt-1.5 font-mono text-[11px] truncate" style={{ color: "var(--muted-foreground)" }}>
          {item.task_id}
        </p>
      )}
      <p className="mt-1 text-[10px]" style={{ color: "var(--muted-foreground)" }}>
        Click bar to pin details
      </p>
    </div>
  );
}

/* ── Pinned detail panel (shows after click) ──────────────────────── */
function TransactionDetail({ item, onClose }) {
  const color = STATUS_COLORS[item.status] || "#60a5fa";
  const rows = [
    { label: "Amount",   value: formatCurrency(item.amount ?? 0), highlight: true },
    { label: "Status",   value: STATUS_LABELS[item.status] || item.status, color },
    { label: "Task ID",  value: item.task_id || "—", mono: true },
    { label: "Payer",    value: item.payer   || "—" },
    { label: "Payee",    value: item.payee   || "—" },
    { label: "Date",     value: item.created_at ? new Date(item.created_at).toLocaleString() : "—" },
  ];

  return (
    <div
      className="rounded-xl border p-4 animate-fade-in"
      style={{
        background: color + "0d",
        borderColor: color + "40",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color }}>
          Transaction Detail
        </p>
        <button
          onClick={onClose}
          className="rounded-full p-1 transition-colors hover:bg-muted/60"
          style={{ color: "var(--muted-foreground)" }}
        >
          <X size={14} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {rows.map(({ label, value, highlight, mono, color: cellColor }) => (
          <div
            key={label}
            className="rounded-lg border px-3 py-2"
            style={{
              background: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: "var(--muted-foreground)" }}>
              {label}
            </p>
            <p
              className={`text-sm font-semibold truncate ${mono ? "font-mono text-[11px]" : ""} ${highlight ? "text-base" : ""}`}
              style={{ color: cellColor || "var(--foreground)" }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main chart ───────────────────────────────────────────────────── */
function EscrowThroughputChart({ transactions = [], className = "" }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const data = useMemo(() => buildTransactionTrend(transactions), [transactions]);
  // totalAmount uses ALL transactions for accurate volume, not just the chart slice
  const totalAmount = useMemo(
    () => transactions.reduce((s, t) => s + Number(t?.amount || 0), 0),
    [transactions],
  );

  const statusSummary = useMemo(() => {
    const counts = {};
    transactions.forEach((tx) => {
      const k = String(tx.status || "unknown").toLowerCase();
      counts[k] = (counts[k] || 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({ status, count }));
  }, [transactions]);

  const handleBarClick = (barData) => {
    if (!barData?.activePayload?.length) return;
    const item = barData.activePayload[0]?.payload;
    if (item) setSelectedItem(item);
  };

  return (
    <Card className={`glass-panel transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>Escrow Throughput</CardTitle>
            <CardDescription>Per-transaction amounts from escrow ledger</CardDescription>
          </div>

          {data.length ? (
            <div className="flex gap-2 shrink-0">
              <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-right min-w-[90px]">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Volume</p>
                <p className="text-base font-bold text-sky-500 dark:text-sky-300">{formatCurrency(totalAmount)}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-2 text-right min-w-[90px]">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Transactions</p>
                <p className="text-base font-bold">{transactions.length}</p>
              </div>
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-right min-w-[90px]">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Avg</p>
                <p className="text-base font-bold text-emerald-500 dark:text-emerald-300">
                  {formatCurrency(transactions.length ? Math.round(totalAmount / transactions.length) : 0)}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="h-64">
          {!data.length ? (
            <EmptyState title="No transactions yet" description="Create a task to see escrow activity." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                barSize={26}
                onClick={handleBarClick}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ cursor: "pointer" }}
              >
                {/* Static gradients — never inside .map() to avoid React Fragment key bugs */}
                <defs>
                  <linearGradient id="etGradLocked" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.55} />
                  </linearGradient>
                  <linearGradient id="etGradLockedH" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fde68a" stopOpacity={1} />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.9} />
                  </linearGradient>
                  <linearGradient id="etGradCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4ade80" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0.55} />
                  </linearGradient>
                  <linearGradient id="etGradCompletedH" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#86efac" stopOpacity={1} />
                    <stop offset="100%" stopColor="#4ade80" stopOpacity={0.9} />
                  </linearGradient>
                  <linearGradient id="etGradBlocked" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f87171" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.55} />
                  </linearGradient>
                  <linearGradient id="etGradBlockedH" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fca5a5" stopOpacity={1} />
                    <stop offset="100%" stopColor="#f87171" stopOpacity={0.9} />
                  </linearGradient>
                  <linearGradient id="etGradSelected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity={1} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.8} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={({ x, y, payload }) => {
                    const pt = data.find((d) => d.name === payload.value);
                    return (
                      <text
                        x={x}
                        y={y + 10}
                        textAnchor={data.length > 8 ? "end" : "middle"}
                        fontSize={10}
                        fill="var(--muted-foreground)"
                        transform={data.length > 8 ? `rotate(-35, ${x}, ${y + 10})` : undefined}
                      >
                        {pt?.label ?? payload.value}
                      </text>
                    );
                  }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  height={data.length > 8 ? 44 : 24}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => formatCurrency(v, true)}
                  width={52}
                />
                <Tooltip
                  content={<EscrowTooltip />}
                  cursor={{ fill: "rgba(99,102,241,0.07)", radius: 6 }}
                />

                <Bar
                  dataKey="amount"
                  radius={[7, 7, 0, 0]}
                  animationDuration={700}
                  onMouseEnter={(_, index) => setHoveredIndex(index)}
                >
                  {data.map((entry, index) => {
                    const isSelected = selectedItem?.name === entry.name;
                    const isHovered  = hoveredIndex === index;

                    // Selected bar gets a distinct indigo highlight
                    if (isSelected) {
                      return (
                        <Cell
                          key={entry.name}
                          fill="url(#etGradSelected)"
                          style={{ filter: "drop-shadow(0 0 6px rgba(99,102,241,0.6))" }}
                        />
                      );
                    }

                    const gradBase = entry.status === "locked"
                      ? "etGradLocked"
                      : entry.status === "blocked"
                        ? "etGradBlocked"
                        : "etGradCompleted";

                    return (
                      <Cell
                        key={entry.name}
                        fill={`url(#${isHovered ? gradBase + "H" : gradBase})`}
                        style={{
                          transition: "filter 0.15s ease",
                          filter: isHovered
                            ? "brightness(1.15) drop-shadow(0 2px 6px rgba(0,0,0,0.2))"
                            : "none",
                        }}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pinned detail panel — appears on click */}
        {selectedItem ? (
          <TransactionDetail item={selectedItem} onClose={() => setSelectedItem(null)} />
        ) : null}

        {/* Status legend */}
        {statusSummary.length ? (
          <div className="flex flex-wrap gap-2 border-t border-border/40 pt-3">
            {statusSummary.map(({ status, count }) => {
              const color = ESCROW_COLORS[status] || "#60a5fa";
              return (
                <div
                  key={status}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                  style={{ background: color + "18", border: `1px solid ${color}40`, color }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                  {STATUS_LABELS[status] || status}
                  <span className="font-bold">{count}</span>
                </div>
              );
            })}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default EscrowThroughputChart;
