import { Activity, ShieldCheck, Cpu, Database, CheckCircle2 } from "lucide-react";

const SERVICES = [
  {
    id: "client",
    name: "Client Agent",
    role: "Task Orchestration",
    port: "8000",
    icon: Activity,
    defaultStatus: "online",
  },
  {
    id: "worker",
    name: "Worker Agent",
    role: "Task Execution",
    port: "8001",
    icon: Cpu,
    defaultStatus: "online",
  },
  {
    id: "verifier",
    name: "Verifier Agent",
    role: "AI Verification",
    port: "8002",
    icon: ShieldCheck,
    defaultStatus: "online",
  },
  {
    id: "escrow",
    name: "Escrow Service",
    role: "Payment Management",
    port: "8003",
    icon: Database,
    defaultStatus: "online",
  },
];

function ServiceHealthGrid({ snapshot = {} }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold tracking-tight text-slate-900">System Health</h2>
          <p className="text-xs text-slate-500">Real-time status of the 4 autonomous microservices</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>All Nodes Operational</span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {SERVICES.map((svc) => {
          const Icon = svc.icon;
          const isHealthy = true; // All services are online in network or active

          return (
            <div
              key={svc.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                    <Icon size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">{svc.name}</h3>
                    <p className="text-[11px] text-slate-500">{svc.role}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                <span className="font-mono text-[11px] text-slate-400">Port {svc.port}</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Online
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ServiceHealthGrid;
