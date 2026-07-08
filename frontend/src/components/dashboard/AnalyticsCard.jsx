function AnalyticsCard({ title, value }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
      <p className="text-slate-400 text-sm">{title}</p>

      <h2 className="mt-3 text-2xl font-bold text-white">
        {value}
      </h2>
    </div>
  );
}

export default AnalyticsCard;