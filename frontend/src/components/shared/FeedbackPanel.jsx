import { CheckCircle2, MessageSquareQuote, XCircle } from "lucide-react";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { getScoreTone } from "../../lib/reportFormatter";

const toneBadgeConfig = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-rose-200 bg-rose-50 text-rose-700",
};

function ScoreRing({ score = 0 }) {
  const value = Math.max(0, Math.min(100, Number(score || 0)));
  const tone = getScoreTone(value);
  const ringColor = tone === "success" ? "#16a34a" : tone === "warning" ? "#d97706" : "#e11d48";

  return (
    <div className="relative flex h-16 w-16 items-center justify-center shrink-0">
      <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="3.2"
        />
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke={ringColor}
          strokeDasharray={`${value}, 100`}
          strokeLinecap="round"
          strokeWidth="3.2"
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-base font-bold text-slate-900 leading-none">{value}</p>
        <p className="text-[9px] font-medium tracking-tight text-slate-500">/ 100</p>
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
    <Card className={`border border-slate-200/80 bg-white ${compact ? "" : "shadow-xs"}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2">
              <MessageSquareQuote size={16} className="text-blue-600 shrink-0" />
              <CardTitle className="text-sm font-semibold text-slate-900">Verifier Evaluation</CardTitle>
            </div>
            {taskTitle ? <p className="text-xs text-slate-500 truncate">{taskTitle}</p> : null}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${toneBadgeConfig[tone] || toneBadgeConfig.success}`}>
                {verified ? (
                  <>
                    <CheckCircle2 size={12} /> Verified & Approved
                  </>
                ) : (
                  <>
                    <XCircle size={12} /> Rejected
                  </>
                )}
              </span>
              {verification?.task_id ? (
                <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  {verification.task_id}
                </span>
              ) : null}
            </div>
          </div>
          {score != null ? <ScoreRing score={score} /> : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-2">
        <div className="grid gap-2 sm:grid-cols-3 text-xs">
          <div className="rounded-lg border border-slate-200/80 bg-slate-50/70 p-2.5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Escrow Action</p>
            <p className="mt-1 font-semibold text-slate-900">{verified ? "Funds Released" : "Funds Held / Refunded"}</p>
          </div>
          <div className="rounded-lg border border-slate-200/80 bg-slate-50/70 p-2.5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Benchmark Score</p>
            <p className="mt-1 font-semibold text-slate-900">{score ?? "-"} / 100</p>
          </div>
          <div className="rounded-lg border border-slate-200/80 bg-slate-50/70 p-2.5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Audit Date</p>
            <p className="mt-1 font-semibold text-slate-900">{verification?.created_at?.slice(0, 10) || "Live"}</p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200/80 bg-slate-50/40 p-3.5">
          <p className="text-[11px] font-semibold text-slate-700">Detailed Feedback & Reasoning</p>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-600 whitespace-pre-wrap">{feedback || "No detailed feedback recorded."}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default FeedbackPanel;
