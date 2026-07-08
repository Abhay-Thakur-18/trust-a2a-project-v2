import { useState, useMemo } from "react";
import { X, CheckCircle2, XCircle } from "lucide-react";
import {
  Area, AreaChart, CartesianGrid,
  ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { EmptyState } from "../shared/DataState";
import { buildVerificationTrend } from "../../lib/chartUtils";

/* ── Hover tooltip ──────────────────────────────────────────────── */
function VerificationTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const pt = payload[0]?.payload;
  if (!pt) return null;

  const score     = pt.rawScore;
  const verified  = pt.verified === 1;
  const color     = score == null ? "#64748b" : score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div
      className="rounded-xl border px-4 py-3 shadow-xl backdrop-blur-md pointer-events-none"
      style={{
        background: "var(--card)",
        borderColor: color + "66",
        boxShadow: `0 8px 24px ${color}22`,
        minWidth: 190,
      }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--muted-foreground)" }}>
        {pt.created_at ? new Date(pt.created_at).toLocaleString() : pt.label}
      </p>

      <div className="flex items-center gap-2 mb-1.5">
        {verified
          ? <CheckCircle2 size={13} style={{ color: "#22c55e" }} />
          : <XCircle     size={13} style={{ color: "#ef4444" }} />}
        <span className="text-xs font-semibold" style={{ color: verified ? "#22c55e" : "#ef4444" }}>
          {verified ? "Verified" : "Rejected"}
        </span>
      </div>

      <p className="text-2xl font-bold" style={{ color }}>
        {score != null ? `${score}%` : "—"}
      </p>

      {pt.task_id && (
        <p className="mt-1.5 font-mono text-[11px] truncate" style={{ color: "var(--muted-foreground)" }}>
          {pt.task_id}
        </p>
      )}
      <p className="mt-1 text-[10px]" style={{ color: "var(--muted-foreground)" }}>
        Click to pin details
      </p>
    </div>
  );
}

/* ── Pinned detail panel ────────────────────────────────────────── */
function VerificationDetail({ item, onClose }) {
  const score    = item.rawScore;
  const verified = item.verified === 1;
  const color    = score == null ? "#64748b" : score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div
      className="rounded-xl border p-4 animate-fade-in"
      style={{ background: color + "0d", borderColor: color + "40" }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color }}>
          Verification Detail
        </p>
        <button
          onClick={onClose}
          className="rounded-full p-1 transition-colors hover:bg-muted/60"
          style={{ color: "var(--muted-foreground)" }}
        >
          <X size={14} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 mb-3">
        {[
          { label: "Score",    value: score != null ? `${score} / 100` : "—", color },
          { label: "Decision", value: verified ? "Approved" : "Rejected",     color: verified ? "#22c55e" : "#ef4444" },
          { label: "Task ID",  value: item.task_id || "—", mono: true },
          { label: "Date",     value: item.created_at ? new Date(item.created_at).toLocaleString() : "—" },
        ].map(({ label, value, color: c, mono }) => (
          <div key={label} className="rounded-lg border px-3 py-2" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: "var(--muted-foreground)" }}>{label}</p>
            <p className={`text-sm font-semibold truncate ${mono ? "font-mono text-[11px]" : ""}`} style={{ color: c || "var(--foreground)" }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {item.feedback && (
        <div className="rounded-lg border px-3 py-2.5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: "var(--muted-foreground)" }}>Feedback</p>
          <p className="text-xs leading-5" style={{ color: "var(--foreground)" }}>{item.feedback}</p>
        </div>
      )}
    </div>
  );
}

/* ── Main chart ─────────────────────────────────────────────────── */
function VerificationTrendChart({ verifications = [], className = "" }) {
  const [selectedPoint, setSelectedPoint] = useState(null);

  const data = useMemo(() => buildVerificationTrend(verifications), [verifications]);

  // Avg computed only over entries that actually have a score
  const avgScore = useMemo(() => {
    const scored = data.filter((d) => d.rawScore != null);
    if (!scored.length) return null;
    return Math.round(scored.reduce((s, d) => s + d.rawScore, 0) / scored.length);
  }, [data]);

  const handleChartClick = (chartData) => {
    if (!chartData?.activePayload?.length) return;
    const pt = chartData.activePayload[0]?.payload;
    if (pt) setSelectedPoint(pt);
  };

  return (
    <Card className={`transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Verification Trend</CardTitle>
            <CardDescription>Verifier scores across recent tasks</CardDescription>
          </div>
          {avgScore != null ? (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-right shrink-0">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Avg Score</p>
              <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-300">{avgScore}%</p>
            </div>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="h-64">
          {!data.length ? (
            <EmptyState title="No verification scores yet" description="Scores appear after verifier runs." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                onClick={handleChartClick}
                style={{ cursor: "pointer" }}
              >
                <defs>
                  <linearGradient id="vtGradScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"  stopColor="#22c55e" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.03} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" vertical={false} />

                {/* Pass threshold line at 80 */}
                <ReferenceLine
                  y={80}
                  stroke="#22c55e"
                  strokeDasharray="4 3"
                  strokeOpacity={0.4}
                  label={{ value: "Pass (80)", position: "insideTopRight", fontSize: 10, fill: "#22c55e", fillOpacity: 0.6 }}
                />

                <XAxis
                  dataKey="name"
                  tick={({ x, y, payload }) => {
                    // Find the data point to get the readable label
                    const pt = data.find((d) => d.name === payload.value);
                    return (
                      <text
                        x={x}
                        y={y + 10}
                        textAnchor={data.length > 7 ? "end" : "middle"}
                        fontSize={10}
                        fill="var(--muted-foreground)"
                        transform={data.length > 7 ? `rotate(-30, ${x}, ${y + 10})` : undefined}
                      >
                        {pt?.label ?? payload.value}
                      </text>
                    );
                  }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  height={data.length > 7 ? 38 : 22}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                  width={38}
                />

                <Tooltip content={<VerificationTooltip />} />

                {/* Highlight selected point by unique name key */}
                {selectedPoint && (
                  <ReferenceLine
                    x={selectedPoint.name}
                    stroke="#818cf8"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                  />
                )}

                <Area
                  type="monotone"
                  dataKey="score"
                  name="Verification Score"
                  stroke="#22c55e"
                  fill="url(#vtGradScore)"
                  strokeWidth={2.5}
                  connectNulls={false}
                  dot={(props) => {
                    const { cx, cy, payload } = props;
                    if (payload?.score == null) return null; // don't render dot for null scores
                    const isSelected = selectedPoint?.name === payload?.name;
                    const s = payload?.rawScore;
                    const dotColor = s == null ? "#64748b"
                      : s >= 80 ? "#22c55e"
                      : s >= 60 ? "#f59e0b"
                      : "#ef4444";
                    return (
                      <circle
                        key={payload?.name}
                        cx={cx}
                        cy={cy}
                        r={isSelected ? 6 : 4}
                        fill={dotColor}
                        stroke={isSelected ? "#fff" : "transparent"}
                        strokeWidth={isSelected ? 2 : 0}
                        style={{ filter: isSelected ? "drop-shadow(0 0 4px rgba(99,102,241,0.7))" : "none" }}
                      />
                    );
                  }}
                  activeDot={{ r: 6, fill: "#22c55e", stroke: "#fff", strokeWidth: 2 }}
                  animationDuration={800}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pinned detail panel */}
        {selectedPoint ? (
          <VerificationDetail item={selectedPoint} onClose={() => setSelectedPoint(null)} />
        ) : null}
      </CardContent>
    </Card>
  );
}

export default VerificationTrendChart;
