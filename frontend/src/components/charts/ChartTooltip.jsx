/* Rich chart tooltip — clean white enterprise B2B SaaS design */
function ChartTooltip({ active, payload, label, valueFormatter = (v) => v }) {
  if (!active || !payload?.length) return null;

  const item = payload[0];
  const dataPoint = item?.payload;

  const displayName = item?.name || label || "Value";

  const color =
    dataPoint?.fill ||
    item?.color ||
    item?.fill ||
    "#2563eb";

  const value = item?.value;
  const pct = dataPoint?.pct ?? null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-lg min-w-[160px]">
      {(label || dataPoint?.label) ? (
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {dataPoint?.label || label}
        </p>
      ) : null}

      <div className="flex items-center gap-2 mb-1">
        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <span className="text-xs font-semibold text-slate-700">
          {displayName}
        </span>
      </div>

      <p className="text-lg font-bold text-slate-900 leading-tight">
        {valueFormatter(value)}
      </p>

      {pct != null ? (
        <p className="mt-1 text-[11px] font-medium text-slate-500">
          {pct}% of total
        </p>
      ) : null}
    </div>
  );
}

export default ChartTooltip;
