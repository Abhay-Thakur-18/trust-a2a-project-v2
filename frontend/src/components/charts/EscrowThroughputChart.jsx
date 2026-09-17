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
  locked: "#d97706",
  completed: "#16a34a",
  blocked: "#e11d48",
};

/* ── Hover tooltip ───────────────────────────────────────────────── */
function EscrowTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  if (!item) return null;
  const color = STATUS_COLORS[item.status] || "#2563eb";

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-lg pointer-events-none min-w-[190px]">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
        {item.created_at ? new Date(item.created_at).toLocaleString() : item.label}
      </p>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-xs font-semibold" style={{ color }}>
          {STATUS_LABELS[item.status] || item.status}
        </span>
      </div>
      <p className="text-xl font-bold text-slate-900 leading-tight">
        {formatCurrency(item.amount ?? 0)}
      </p>
      {item.task_id && (
        <p className="mt-1 font-mono text-[10px] text-slate-500 truncate bg-slate-100 px-1 py-0.5 rounded">
          {item.task_id}
        </p>
      )}
      <p className="mt-1 text-[10px] text-slate-400">
        Click bar to pin details
      </p>
    </div>
  );
}

/* ── Pinned detail panel ────────────────────────────────────────── */
function TransactionDetail({ item, onClose }) {
  const color = STATUS_COLORS[item.status] || "#2563eb";
  const rows = [
    { label: "Amount", value: formatCurrency(item.amount ?? 0), highlight: true },
    { label: "Status", value: STATUS_LABELS[item.status] || item.status, color },
    { label: "Task ID", value: item.task_id || "—", mono: true },
    { label: "Payer Agent", value: item.payer || "—" },
    { label: "Payee Agent", value: item.payee || "—" },
    { label: "Timestamp", value: item.created_at ? new Date(item.created_at).toLocaleString() : "—" },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-800">
          Transaction Audit Detail
        </p>
        <button
          onClick={onClose}
          className="rounded-md p-1 transition-colors hover:bg-slate-200 text-slate-500"
        >
          <X size={14} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {rows.map(({ label, value, highlight, mono, color: cellColor }) => (
          <div
            key={label}
            className="rounded-lg border border-slate-200/80 bg-white px-3 py-2"
          >
            <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">
              {label}
            </p>
            <p
              className={`text-xs font-semibold truncate ${mono ? "font-mono text-[11px]" : ""} ${highlight ? "text-sm text-slate-900" : "text-slate-800"}`}
              style={cellColor ? { color: cellColor } : undefined}
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
    <Card className={`border border-slate-200/80 bg-white shadow-xs ${className}`}>
      <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-sm font-semibold text-slate-900">Escrow Throughput</CardTitle>
            <CardDescription className="text-xs text-slate-500">Per-transaction volume from escrow ledger</CardDescription>
          </div>

          {data.length ? (
            <div className="flex gap-2 shrink-0">
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-right min-w-[80px]">
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Total Volume</p>
                <p className="text-sm font-bold text-slate-900">{formatCurrency(totalAmount)}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-right min-w-[80px]">
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Count</p>
                <p className="text-sm font-bold text-slate-900">{transactions.length}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-right min-w-[80px]">
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Avg Tx</p>
                <p className="text-sm font-bold text-slate-900">
                  {formatCurrency(transactions.length ? Math.round(totalAmount / transactions.length) : 0)}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        <div className="h-64">
          {!data.length ? (
            <EmptyState title="No transactions yet" description="Create a task to see escrow activity." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                barSize={24}
                onClick={handleBarClick}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ cursor: "pointer" }}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
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
                        fill="#64748B"
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
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => formatCurrency(v, true)}
                  width={52}
                />
                <Tooltip
                  content={<EscrowTooltip />}
                  cursor={{ fill: "rgba(37,99,235,0.04)", radius: 4 }}
                />

                <Bar
                  dataKey="amount"
                  radius={[4, 4, 0, 0]}
                  animationDuration={600}
                  onMouseEnter={(_, index) => setHoveredIndex(index)}
                >
                  {data.map((entry, index) => {
                    const isSelected = selectedItem?.name === entry.name;
                    const isHovered = hoveredIndex === index;

                    let fillColor = entry.status === "locked"
                      ? "#f59e0b"
                      : entry.status === "blocked"
                        ? "#f43f5e"
                        : "#10b981";

                    if (isSelected) {
                      fillColor = "#2563eb";
                    }

                    return (
                      <Cell
                        key={entry.name}
                        fill={fillColor}
                        opacity={isHovered ? 1 : 0.85}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pinned detail panel */}
        {selectedItem ? (
          <TransactionDetail item={selectedItem} onClose={() => setSelectedItem(null)} />
        ) : null}

        {/* Status legend */}
        {statusSummary.length ? (
          <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
            {statusSummary.map(({ status, count }) => {
              const color = STATUS_COLORS[status] || "#2563eb";
              return (
                <div
                  key={status}
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                  <span>{STATUS_LABELS[status] || status}</span>
                  <span className="font-bold text-slate-900">{count}</span>
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
