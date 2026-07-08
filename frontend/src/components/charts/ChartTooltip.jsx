/* Rich chart tooltip — correct data for Pie, Bar, and Area charts */
function ChartTooltip({ active, payload, label, valueFormatter = (v) => v }) {
  if (!active || !payload?.length) return null;

  const item = payload[0];
  const dataPoint = item?.payload; // the raw data row

  /*
   * Display name resolution:
   *  - Pie chart:  item.name comes from nameKey="name" → the category label (e.g. "Verified")
   *  - Area/Line:  item.name is the series name set via the `name` prop on <Area>/<Line>
   *  - Bar chart:  item.name is the series name set via the `name` prop on <Bar>
   * We never use dataPoint.name because on Area/Line charts that field holds
   * the X-axis date string, not the series label.
   */
  const displayName = item?.name || label || "Value";

  const color =
    dataPoint?.fill ||   // Pie / custom Cell fill
    item?.color ||       // Recharts stroke/fill color
    item?.fill ||
    "#60a5fa";

  const value = item?.value;

  /*
   * Percentage — stored as `pct` in our data objects to avoid collision
   * with Recharts' own injected `percent` (0–1 decimal) on Pie charts.
   */
  const pct = dataPoint?.pct ?? null;

  return (
    <div
      className="rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-md"
      style={{
        background: "var(--card)",
        borderColor: color + "55",
        boxShadow: `0 8px 32px ${color}33`,
        minWidth: 160,
      }}
    >
      {/* X-axis label (date, category) shown as header */}
      {(label || dataPoint?.label) ? (
        <p
          className="mb-2 text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: "var(--muted-foreground)" }}
        >
          {dataPoint?.label || label}
        </p>
      ) : null}

      {/* Series name + colour swatch */}
      <div className="flex items-center gap-2 mb-1">
        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <span className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
          {displayName}
        </span>
      </div>

      {/* Primary value */}
      <p className="text-xl font-bold mt-1" style={{ color }}>
        {valueFormatter(value)}
      </p>

      {/* Percentage share — only shown for Pie slices */}
      {pct != null ? (
        <p className="mt-1 text-[11px]" style={{ color: "var(--muted-foreground)" }}>
          {pct}% of total
        </p>
      ) : null}
    </div>
  );
}

export default ChartTooltip;
