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

  const score = pt.rawScore;
  const verified = pt.verified === 1;
  const color = score == null ? "#64748b" : score >= 80 ? "#16a34a" : score >= 60 ? "#d97706" : "#e11d48";

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-lg pointer-events-none min-w-[180px]">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
        {pt.created_at ? new Date(pt.created_at).toLocaleString() : pt.label}
      </p>

      <div className="flex items-center gap-1.5 mb-1">
        {verified ? (
          <CheckCircle2 size={13} className="text-emerald-600" />
        ) : (
          <XCircle size={13} className="text-rose-600" />
        )}
        <span className="text-xs font-semibold" style={{ color }}>
          {verified ? "Verified & Approved" : "Rejected"}
        </span>
      </div>

      <p className="text-xl font-bold text-slate-900 leading-tight">
        {score != null ? `${score}%` : "—"}
      </p>

      {pt.task_id && (
        <p className="mt-1 font-mono text-[10px] text-slate-500 truncate bg-slate-100 px-1 py-0.5 rounded">
          {pt.task_id}
        </p>
      )}
      <p className="mt-1 text-[10px] text-slate-400">
        Click point to inspect
      </p>
    </div>
  );
}

/* ── Pinned detail panel ────────────────────────────────────────── */
function VerificationDetail({ item, onClose }) {
  const score = item.rawScore;
  const verified = item.verified === 1;
  const badgeBorder = verified ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800";

  return (
    <div className={`rounded-xl border p-4 animate-fade-in ${badgeBorder}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider">
          Verification Inspection
        </p>
        <button
          onClick={onClose}
          className="rounded-md p-1 transition-colors hover:bg-black/5 text-slate-600"
        >
          <X size={14} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mb-2">
        {[
          { label: "Benchmark Score", value: score != null ? `${score} / 100` : "—" },
          { label: "Status", value: verified ? "Approved" : "Rejected" },
          { label: "Task ID", value: item.task_id || "—", mono: true },
          { label: "Audit Date", value: item.created_at ? new Date(item.created_at).toLocaleDateString() : "—" },
        ].map(({ label, value, mono }) => (
          <div key={label} className="rounded-lg border border-slate-200/80 bg-white p-2.5">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">{label}</p>
            <p className={`text-xs font-semibold text-slate-900 truncate ${mono ? "font-mono text-[11px]" : ""}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {item.feedback && (
        <div className="rounded-lg border border-slate-200/80 bg-white p-3 mt-2">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Verifier Remarks</p>
          <p className="text-xs text-slate-700 leading-relaxed">{item.feedback}</p>
        </div>
      )}
    </div>
  );
}

/* ── Main chart ─────────────────────────────────────────────────── */
function VerificationTrendChart({ verifications = [], className = "" }) {
  const [selectedPoint, setSelectedPoint] = useState(null);

  const data = useMemo(() => buildVerificationTrend(verifications), [verifications]);

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
    <Card className={`border border-slate-200/80 bg-white shadow-xs ${className}`}>
      <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-semibold text-slate-900">Verification Quality Trend</CardTitle>
            <CardDescription className="text-xs text-slate-500">Verifier scores across chronological tasks</CardDescription>
          </div>
          {avgScore != null ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-right shrink-0">
              <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-700">Avg Score</p>
              <p className="text-base font-bold text-emerald-800">{avgScore}%</p>
            </div>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        <div className="h-64">
          {!data.length ? (
            <EmptyState title="No verification scores yet" description="Scores appear after verifier runs." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                onClick={handleChartClick}
                style={{ cursor: "pointer" }}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="vtGradScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#16a34a" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />

                {/* Pass threshold line at 80 */}
                <ReferenceLine
                  y={80}
                  stroke="#16a34a"
                  strokeDasharray="4 3"
                  strokeOpacity={0.6}
                  label={{ value: "Pass Threshold (80%)", position: "insideTopRight", fontSize: 10, fill: "#16a34a" }}
                />

                <XAxis
                  dataKey="name"
                  tick={({ x, y, payload }) => {
                    const pt = data.find((d) => d.name === payload.value);
                    return (
                      <text
                        x={x}
                        y={y + 10}
                        textAnchor={data.length > 7 ? "end" : "middle"}
                        fontSize={10}
                        fill="#64748B"
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
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                  width={38}
                />

                <Tooltip content={<VerificationTooltip />} />

                {selectedPoint && (
                  <ReferenceLine
                    x={selectedPoint.name}
                    stroke="#2563eb"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                  />
                )}

                <Area
                  type="monotone"
                  dataKey="score"
                  name="Verification Score"
                  stroke="#16a34a"
                  fill="url(#vtGradScore)"
                  strokeWidth={2}
                  connectNulls={false}
                  dot={(props) => {
                    const { cx, cy, payload } = props;
                    if (payload?.score == null) return null;
                    const isSelected = selectedPoint?.name === payload?.name;
                    const s = payload?.rawScore;
                    const dotColor = s == null ? "#64748b"
                      : s >= 80 ? "#16a34a"
                      : s >= 60 ? "#d97706"
                      : "#e11d48";
                    return (
                      <circle
                        key={payload?.name}
                        cx={cx}
                        cy={cy}
                        r={isSelected ? 5.5 : 3.5}
                        fill={dotColor}
                        stroke="#ffffff"
                        strokeWidth={isSelected ? 2 : 1}
                      />
                    );
                  }}
                  activeDot={{ r: 5, fill: "#16a34a", stroke: "#ffffff", strokeWidth: 2 }}
                  animationDuration={700}
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
