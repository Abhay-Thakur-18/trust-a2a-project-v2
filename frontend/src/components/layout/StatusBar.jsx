import { useState, useEffect } from "react";
import { RefreshCw, Activity, Clock, ChevronUp, ChevronDown } from "lucide-react";
import { SERVICE_URLS } from "../../services/api";

const SERVICES = [
  { key: "client", label: "Client Agent", url: SERVICE_URLS.client },
  { key: "worker", label: "Worker Agent", url: SERVICE_URLS.worker },
  { key: "verifier", label: "Verifier Agent", url: SERVICE_URLS.verifier },
  { key: "escrow", label: "Escrow Service", url: SERVICE_URLS.escrow },
];

function useServiceStatus() {
  const [statuses, setStatuses] = useState(() =>
    Object.fromEntries(SERVICES.map((s) => [s.key, "checking"]))
  );
  const [lastChecked, setLastChecked] = useState(null);

  const checkAll = async () => {
    const results = await Promise.all(
      SERVICES.map(async (s) => {
        try {
          const res = await fetch(s.url + "/health", { signal: AbortSignal.timeout(3000) });
          return [s.key, res.ok ? "online" : "degraded"];
        } catch {
          try {
            const res2 = await fetch(s.url, { signal: AbortSignal.timeout(3000) });
            return [s.key, res2.ok || res2.status < 500 ? "online" : "degraded"];
          } catch {
            return [s.key, "offline"];
          }
        }
      })
    );
    setStatuses(Object.fromEntries(results));
    setLastChecked(new Date());
  };

  useEffect(() => {
    checkAll();
    const interval = setInterval(checkAll, 30_000);
    return () => clearInterval(interval);
  }, []);

  return { statuses, lastChecked, refresh: checkAll };
}

function StatusDot({ status }) {
  if (status === "online") {
    return <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />;
  }
  if (status === "checking") {
    return <span className="h-2 w-2 rounded-full bg-slate-300 animate-pulse shrink-0" />;
  }
  if (status === "degraded") {
    return <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />;
  }
  return <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />;
}

function StatusBar() {
  const { statuses, lastChecked, refresh } = useServiceStatus();
  const [collapsed, setCollapsed] = useState(false);

  const allOnline = SERVICES.every((s) => statuses[s.key] === "online");
  const anyOffline = SERVICES.some((s) => statuses[s.key] === "offline");

  const overallStatus = allOnline ? "All Systems Operational" : anyOffline ? "Services Offline" : "Service Checking";
  const overallTextColor = allOnline ? "text-emerald-700" : anyOffline ? "text-red-700" : "text-amber-700";

  const timeStr = lastChecked
    ? lastChecked.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "—";

  return (
    <footer className="sticky bottom-0 z-20 flex items-center justify-between border-t border-slate-200 bg-white/95 backdrop-blur-sm px-4 py-1.5 text-xs text-slate-600 select-none">
      <div className="flex items-center gap-4 overflow-x-auto">
        {/* Main Status Toggle */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className={`flex items-center gap-1.5 font-medium hover:opacity-80 transition-opacity shrink-0 ${overallTextColor}`}
        >
          <Activity size={12} />
          <span>{overallStatus}</span>
          {collapsed ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </button>

        {!collapsed && (
          <>
            <div className="h-3 w-px bg-slate-200 shrink-0" />
            <div className="flex items-center gap-4">
              {SERVICES.map((s) => (
                <div key={s.key} className="flex items-center gap-1.5 shrink-0">
                  <StatusDot status={statuses[s.key]} />
                  <span className="text-slate-500 text-[11px]">{s.label}</span>
                  <span className="capitalize text-[10px] font-medium text-slate-700">
                    {statuses[s.key]}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-2.5 shrink-0 ml-3">
        <span className="flex items-center gap-1 text-[11px] text-slate-400">
          <Clock size={11} />
          {timeStr}
        </span>
        <button
          onClick={refresh}
          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          title="Refresh connection status"
        >
          <RefreshCw size={11} />
        </button>
      </div>
    </footer>
  );
}

export default StatusBar;
