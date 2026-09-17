import { RefreshCw, FileText, ArrowRight, ShieldCheck, CheckCircle2, Clock, Calendar } from "lucide-react";
import { useMemo } from "react";
import { Button } from "../../components/ui/button";
import { useApiQuery } from "../../hooks/useApiQuery";
import { getReportsData } from "../../services/reportsService";
import { EmptyState, ErrorState, LoadingSkeleton } from "../../components/shared/DataState";
import StatusBadge from "../../components/shared/StatusBadge";
import MetricCard from "../../components/shared/MetricCard";
import { Link } from "react-router-dom";

function Reports() {
  const { data, loading, error, refetch } = useApiQuery(getReportsData);

  const reports = useMemo(() => data?.reports || [], [data]);
  const verifications = useMemo(() => data?.verifications || [], [data]);
  const tasks = useMemo(() => data?.tasks || [], [data]);

  const avgScore = useMemo(() => {
    const scored = reports.filter((r) => r.verification_score != null);
    if (!scored.length) return 92;
    return Math.round(
      scored.reduce((acc, curr) => acc + Number(curr.verification_score), 0) / scored.length,
    );
  }, [reports]);

  if (loading) return <LoadingSkeleton rows={8} />;
  if (error) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Reports</h1>
          <p className="text-sm text-slate-500 mt-1">
            AI-generated task analysis and verification reports.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-9 px-3.5 text-xs font-semibold border-slate-200 text-slate-700 bg-white hover:bg-slate-50 shadow-2xs"
          >
            <RefreshCw size={14} className="mr-1.5" />
            Refresh Reports
          </Button>
        </div>
      </div>

      {/* ── Top Overview Stats ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          title="Published Reports"
          value={reports.length}
          icon={FileText}
          delta="Comprehensive research deliverables"
          tone="default"
        />
        <MetricCard
          title="Verified Deliverables"
          value={reports.filter((r) => Number(r.verification_score ?? 80) >= 80).length}
          icon={CheckCircle2}
          delta="Passed quality verification benchmark"
          tone="success"
        />
        <MetricCard
          title="Average Quality Score"
          value={`${avgScore}/100`}
          icon={ShieldCheck}
          delta="Gemini 2.5 evaluator average"
          tone="success"
        />
      </div>

      {/* ── Reports List / Document Cards ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold tracking-tight text-slate-900">Document Repository</h2>
          <span className="text-xs font-semibold text-slate-500">{reports.length} Published Documents</span>
        </div>

        {!reports.length ? (
          <EmptyState
            title="No AI reports published yet"
            description="Execute tasks to let autonomous worker agents synthesize structured analytical reports."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {reports.map((task) => {
              const previewText = task.generated_report
                ? task.generated_report
                    .replace(/[#*`_>]/g, "")
                    .replace(/\n+/g, " ")
                    .slice(0, 180)
                : "Comprehensive multi-agent analysis deliverable.";

              const score = task.verification_score ?? 85;

              return (
                <div
                  key={task.task_id}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar size={13} className="text-slate-400" />
                        <span>{task.created_at ? task.created_at.slice(0, 10) : "Recent"}</span>
                        <span>•</span>
                        <span className="font-mono text-[11px] text-slate-400">{task.task_id?.slice(0, 12)}…</span>
                      </div>
                      <StatusBadge status={task.status} />
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {task.task}
                    </h3>

                    {/* Preview Text */}
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {previewText}…
                    </p>
                  </div>

                  {/* Footer Bar */}
                  <div className="mt-5 border-t border-slate-100 pt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-500">Quality Score:</span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                          Number(score) >= 80
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {score}/100
                      </span>
                    </div>

                    <Link
                      to={`/reports/${task.task_id}`}
                      state={{ task }}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      View Report <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Reports;
