import { ShieldCheck, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { getReputationTone } from "../../lib/reportFormatter";

const toneClasses = {
  success: "text-emerald-600 dark:text-emerald-300",
  warning: "text-amber-600 dark:text-amber-300",
  danger: "text-red-600 dark:text-red-300",
};

function ReputationCard({ reputation }) {
  if (!reputation) return null;

  const score = Number(reputation.score ?? 100);
  const tone = getReputationTone(score);
  const successRate = Number(reputation.success_rate ?? 100);

  return (
    <Card className="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base">{reputation.agent_id || "worker-agent"}</CardTitle>
          <ShieldCheck size={16} className={toneClasses[tone]} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-semibold tracking-tight">{score}</p>
            <p className="text-xs text-muted-foreground">Reputation Score</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-medium">{successRate}%</p>
            <p className="text-xs text-muted-foreground">Success Rate</p>
          </div>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 transition-all duration-700"
            style={{ width: `${score}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-300">
              <TrendingUp size={14} />
              <span className="text-xs uppercase tracking-wide">Success</span>
            </div>
            <p className="mt-1 text-lg font-semibold">{reputation.success_count ?? 0}</p>
          </div>
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2">
            <div className="flex items-center gap-1 text-red-600 dark:text-red-300">
              <TrendingDown size={14} />
              <span className="text-xs uppercase tracking-wide">Failures</span>
            </div>
            <p className="mt-1 text-lg font-semibold">{reputation.failure_count ?? 0}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ReputationCard;
