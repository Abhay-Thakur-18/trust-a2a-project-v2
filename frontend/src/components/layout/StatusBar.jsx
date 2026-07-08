import { useState, useEffect } from "react";
import { Wifi, WifiOff, Activity, Server, Shield, Vault, Clock } from "lucide-react";

const SERVICES = [
  { key: "client",   label: "Client Agent",   url: "http://localhost:8000", color: "#3B82F6" },
  { key: "worker",   label: "Worker Agent",   url: "http://localhost:8001", color: "#06B6D4" },
  { key: "verifier", label: "Verifier Agent", url: "http://localhost:8002", color: "#10B981" },
  { key: "escrow",   label: "Escrow Service", url: "http://localhost:8003", color: "#8B5CF6" },
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
          const res = await fetch(s.url + "/health", { signal: AbortSignal.timeout(2500) });
          return [s.key, res.ok ? "online" : "degraded"];
        } catch {
          try {
            // Fallback: try root endpoint
            const res2 = await fetch(s.url, { signal: AbortSignal.timeout(2500) });
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

function ServiceDot({ status, color }) {
  if (status === "checking") {
    return (
      <span className="inline-block h-2 w-2 rounded-full bg-muted animate-pulse" />
    );
  }
  if (status === "online") {
    return (
      <span className="relative inline-flex h-2 w-2">
        <span
          className="absolute inline-flex h-full w-full rounded-full opacity-70 animate-ping"
          style={{ backgroundColor: color }}
        />
        <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      </span>
    );
  }
  return (
    <span className="inline-block h-2 w-2 rounded-full bg-destructive" />
  );
}

function StatusBar() {
  const { statuses, lastChecked, refresh } = useServiceStatus();
  const [collapsed, setCollapsed] = useState(false);

  const allOnline = SERVICES.every((s) => statuses[s.key] === "online");
  const anyOffline = SERVICES.some((s) => statuses[s.key] === "offline");
  const overallColor = allOnline ? "#10B981" : anyOffline ? "#EF4444" : "#F59E0B";
  const overallLabel = allOnline ? "All Systems Operational" : anyOffline ? "Service Degraded" : "Checking…";

  const timeStr = lastChecked
    ? lastChecked.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "—";

  return (
    <div
      className="status-bar sticky bottom-0 z-30 border-t px-4 py-1.5 flex items-center gap-3 text-xs select-none"
      style={{
        background: "var(--nav-bg)",
        borderColor: "var(--header-border)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 -1px 8px rgba(0,0,0,0.06)",
        transition: "background 0.3s ease",
      }}
    >
      {/* Overall status */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="flex items-center gap-1.5 font-semibold transition-opacity hover:opacity-80 shrink-0"
        style={{ color: overallColor }}
        title={collapsed ? "Expand status bar" : "Collapse status bar"}
      >
        <Activity size={11} />
        {overallLabel}
      </button>

      {/* Divider */}
      {!collapsed && (
        <div className="h-3 w-px bg-border/60 shrink-0" />
      )}

      {/* Individual services */}
      {!collapsed && (
        <div className="flex items-center gap-3 flex-1 overflow-x-auto">
          {SERVICES.map((s) => (
            <div
              key={s.key}
              className="flex items-center gap-1.5 whitespace-nowrap transition-all hover:opacity-80 cursor-default"
              title={`${s.label}: ${statuses[s.key]}`}
            >
              <ServiceDot status={statuses[s.key]} color={s.color} />
              <span className="text-muted-foreground">{s.label}</span>
              <span
                className="font-medium capitalize"
                style={{
                  color: statuses[s.key] === "online"
                    ? s.color
                    : statuses[s.key] === "offline"
                      ? "var(--destructive)"
                      : "var(--muted-foreground)",
                }}
              >
                {statuses[s.key]}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="ml-auto flex items-center gap-2 shrink-0">
        {!collapsed && (
          <>
            <span className="text-muted-foreground/60 flex items-center gap-1">
              <Clock size={10} />
              {timeStr}
            </span>
            <div className="h-3 w-px bg-border/60" />
          </>
        )}
        <button
          onClick={refresh}
          className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          title="Refresh status"
        >
          <Wifi size={11} />
        </button>
      </div>
    </div>
  );
}

export default StatusBar;
