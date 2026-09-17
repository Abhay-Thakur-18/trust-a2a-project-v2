function MetricCard({ icon: Icon, title, value, delta, tone = "default" }) {
  const iconToneStyles = {
    default: "bg-blue-50 text-blue-600 border-blue-100",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    destructive: "bg-rose-50 text-rose-700 border-rose-200",
  };

  const badgeToneStyles = {
    default: "text-slate-500 bg-slate-50 border-slate-200",
    success: "text-emerald-700 bg-emerald-50 border-emerald-200 font-semibold",
    warning: "text-amber-700 bg-amber-50 border-amber-200 font-semibold",
    destructive: "text-rose-700 bg-rose-50 border-rose-200 font-semibold",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-all duration-150 flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        {Icon ? (
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${iconToneStyles[tone] || iconToneStyles.default} shrink-0`}>
            <Icon size={18} />
          </div>
        ) : null}
      </div>

      <div className="mt-3">
        <p className="text-3xl font-bold tracking-tight text-slate-900 leading-none">{value}</p>
        {delta ? (
          <p className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] ${badgeToneStyles[tone] || badgeToneStyles.default}`}>
              {delta}
            </span>
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default MetricCard;
