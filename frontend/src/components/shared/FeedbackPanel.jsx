import { CheckCircle2, MessageSquareQuote, XCircle } from "lucide-react";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { getScoreTone } from "../../lib/reportFormatter";

const toneClasses = {
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  danger: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
};

function ScoreRing({ score = 0 }) {
  const value = Math.max(0, Math.min(100, Number(score || 0)));
  const tone = getScoreTone(value);
  const ringColor = tone === "success" ? "#22c55e" : tone === "warning" ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative flex h-20 w-20 items-center justify-center">
      <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.12"
          strokeWidth="3"
        />
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke={ringColor}
          strokeDasharray={`${value}, 100`}
          strokeLinecap="round"
          strokeWidth="3"
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-lg font-semibold leading-none">{value}</p>
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Score</p>
      </div>
    </div>
  );
}

function FeedbackPanel({ verification, taskTitle, compact = false }) {
  if (!verification && !compact) return null;

  const verified = verification?.verified;
  const score = verification?.score ?? verification?.verification_score;
  const feedback = verification?.feedback || verification?.verification_feedback;
  const tone = getScoreTone(score);

  if (!feedback && score == null) return null;

  return (
    <Card className={`overflow-hidden border-border/70 ${compact ? "" : "shadow-sm"}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MessageSquareQuote size={16} className="text-primary" />
              <CardTitle className="text-base">Verifier Feedback</CardTitle>
            </div>
            {taskTitle ? <p className="text-sm text-muted-foreground">{taskTitle}</p> : null}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={toneClasses[tone]}>
                {verified ? (
                  <span className="inline-flex items-center gap-1"><CheckCircle2 size={12} /> Verified</span>
                ) : (
                  <span className="inline-flex items-center gap-1"><XCircle size={12} /> Rejected</span>
                )}
              </Badge>
              {verification?.task_id ? (
                <span className="font-mono text-[11px] text-muted-foreground">{verification.task_id}</span>
              ) : null}
            </div>
          </div>
          {score != null ? <ScoreRing score={score} /> : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 border-t border-border/60 bg-muted/20 pt-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border/60 bg-background/70 px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Decision</p>
            <p className="mt-1 text-sm font-medium">{verified ? "Approve release" : "Block payment"}</p>
          </div>
          <div className="rounded-lg border border-border/60 bg-background/70 px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Quality Score</p>
            <p className="mt-1 text-sm font-medium">{score ?? "-"} / 100</p>
          </div>
          <div className="rounded-lg border border-border/60 bg-background/70 px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Reviewed On</p>
            <p className="mt-1 text-sm font-medium">{verification?.created_at?.slice(0, 10) || "Live"}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-background/80 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Detailed Feedback</p>
          <p className="mt-2 text-sm leading-7 text-foreground/90">{feedback || "No detailed feedback available."}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default FeedbackPanel;
