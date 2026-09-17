import { ShieldCheck, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { getReputationTone } from "../../lib/reportFormatter";

const toneConfig = {
  success: {
    icon: "text-emerald-600",
    bar: "bg-emerald-600",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  warning: {
    icon: "text-amber-600",
    bar: "bg-amber-500",
    badge: "border-amber-200 bg-amber-50 text-amber-700",
  },
  danger: {
    icon: "text-rose-600",
    bar: "bg-rose-600",
    badge: "border-rose-200 bg-rose-50 text-rose-700",
  },
};

function ReputationCard({ reputation }) {
  if (!reputation) return null;

  const score = Number(reputation.score ?? 100);
  const tone = getReputationTone(score);
  const config = toneConfig[tone] || toneConfig.success;
  const successRate = Number(reputation.success_rate ?? 100);

  return (
    <Card className="border border-slate-200/80 bg-white shadow-xs transition-all duration-200 hover:border-slate-300 hover:shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm font-semibold text-slate-900">{reputation.agent_id || "worker-agent"}</CardTitle>
          <div className="flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium border-slate-200 bg-slate-50 text-slate-700">
            <ShieldCheck size={13} className={config.icon} />
            <span>Score {score}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-2xl font-bold tracking-tight text-slate-900">{score}</p>
            <p className="text-xs text-slate-500">Reputation Index</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">{successRate}%</p>
            <p className="text-xs text-slate-500">Success Rate</p>
          </div>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${config.bar}`}
            style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg border border-slate-200/80 bg-slate-50/60 p-2.5">
            <div className="flex items-center gap-1 text-emerald-700 font-medium">
              <TrendingUp size={13} />
              <span>Success</span>
            </div>
            <p className="mt-1 text-base font-bold text-slate-900">{reputation.success_count ?? 0}</p>
          </div>
          <div className="rounded-lg border border-slate-200/80 bg-slate-50/60 p-2.5">
            <div className="flex items-center gap-1 text-rose-700 font-medium">
              <TrendingDown size={13} />
              <span>Failures</span>
            </div>
            <p className="mt-1 text-base font-bold text-slate-900">{reputation.failure_count ?? 0}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ReputationCard;
