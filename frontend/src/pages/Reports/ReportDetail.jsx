import { useMemo } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Copy, Download, IndianRupee, Loader2, UserRound, CheckCircle2, ShieldCheck } from "lucide-react";
import { useApiQuery } from "../../hooks/useApiQuery";
import { getTaskById } from "../../services/taskService";
import { formatCurrency } from "../../lib/formatters";
import { parseReportSections } from "../../lib/reportFormatter";
import FeedbackPanel from "../../components/shared/FeedbackPanel";
import StatusBadge from "../../components/shared/StatusBadge";
import MarkdownRenderer from "../../components/shared/MarkdownRenderer";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { EmptyState, ErrorState, LoadingSkeleton } from "../../components/shared/DataState";

function ReportDetail() {
  const { taskId } = useParams();
  const location = useLocation();
  const cachedTask = location.state?.task?.task_id === taskId ? location.state.task : null;

  const { data: task, loading, error, refetch } = useApiQuery(() => getTaskById(taskId), {
    immediate: !!taskId,
    initialData: cachedTask,
    deps: [taskId],
  });

  const sections = useMemo(() => parseReportSections(task?.generated_report), [task?.generated_report]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(task.generated_report || "");
    } catch {
      // ignore
    }
  };

  const handleDownload = () => {
    const blob = new Blob([task.generated_report || ""], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${task.task_id}-report.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (!task && loading) {
    return (
      <div className="min-h-[60vh] space-y-6">
        <LoadingSkeleton rows={10} />
      </div>
    );
  }

  if (error || task?.error) {
    return <ErrorState title="Report not found" onRetry={() => refetch()} />;
  }

  if (!task?.generated_report) {
    return <EmptyState title="No report content" description="This task does not have a generated report yet." />;
  }

  const isVerified = Number(task.verification_score ?? 80) >= 80;

  return (
    <div className="min-h-[60vh] space-y-6">
      {/* ── Top Action & Navigation Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <Link
          to="/reports"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Reports
        </Link>
        <div className="flex items-center gap-2">
          {loading ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Loader2 size={13} className="animate-spin text-blue-600" />
              Syncing
            </span>
          ) : null}
          <Button variant="outline" size="sm" onClick={handleCopy} className="h-8 text-xs font-semibold border-slate-200 text-slate-700 bg-white hover:bg-slate-50">
            <Copy size={13} className="mr-1.5" />
            Copy Markdown
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} className="h-8 text-xs font-semibold border-slate-200 text-slate-700 bg-white hover:bg-slate-50">
            <Download size={13} className="mr-1.5" />
            Export (.md)
          </Button>
        </div>
      </div>

      {/* ── Main Report Card & Intelligence Layout ── */}
      <Card className="border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* Document Header */}
        <CardHeader className="border-b border-slate-200 bg-slate-50/60 p-6 md:p-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700">
              AI Deliverable Document
            </span>
            <StatusBadge status={task.status} />
            {task.verification_score != null && (
              <span className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-bold ${
                isVerified
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-rose-50 text-rose-800 border-rose-200"
              }`}>
                <CheckCircle2 size={13} /> Verifier Score {task.verification_score}/100
              </span>
            )}
          </div>

          <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
            {task.task}
          </CardTitle>

          {/* Metadata Row */}
          <div className="flex flex-wrap gap-2.5 text-xs text-slate-600 pt-1">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1 font-mono text-slate-500">
              ID: {task.task_id}
            </span>
            {task.worker_id && (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1">
                <UserRound size={13} className="text-slate-400" />
                {task.worker_id}
              </span>
            )}
            {task.reward != null && (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1 font-bold text-slate-900">
                <IndianRupee size={13} className="text-slate-400" />
                {formatCurrency(task.reward)} Escrow
              </span>
            )}
            {task.created_at && (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1">
                <CalendarDays size={13} className="text-slate-400" />
                {task.created_at.slice(0, 10)}
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="grid gap-0 p-0 xl:grid-cols-[240px_minmax(0,1fr)_340px]">
          {/* Table of Contents */}
          <aside className="border-b border-slate-200 bg-slate-50/40 p-6 xl:sticky xl:top-0 xl:h-fit xl:self-start xl:border-b-0 xl:border-r">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Document Sections</p>
            <nav className="mt-3 space-y-1">
              {sections.map((section, index) => (
                <button
                  key={`${section.title}-${index}`}
                  type="button"
                  onClick={() => {
                    document.getElementById(`section-${index}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="block w-full rounded-lg px-2.5 py-2 text-left text-xs text-slate-600 transition hover:bg-white hover:text-slate-900 hover:shadow-2xs font-medium"
                >
                  <span className="mr-1.5 text-slate-400 font-bold">{index + 1}.</span>
                  {section.title}
                </button>
              ))}
            </nav>
          </aside>

          {/* Section Content */}
          <article className="min-w-0 space-y-6 p-6 sm:p-8 bg-white">
            {sections.map((section, index) => (
              <section
                key={`${section.title}-${index}`}
                id={`section-${index}`}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs"
              >
                {/* Section header */}
                <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50/70 px-5 py-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-[10px] font-bold text-blue-600 border border-blue-100">
                    {index + 1}
                  </span>
                  <h2 className="text-xs font-bold uppercase tracking-wide text-slate-800">{section.title}</h2>
                </div>

                <div className="p-5 text-sm leading-relaxed text-slate-800">
                  <MarkdownRenderer content={section.content} />
                </div>
              </section>
            ))}
          </article>

          {/* Verification Audit Sidebar */}
          <aside className="border-t border-slate-200 bg-slate-50/30 p-6 xl:sticky xl:top-0 xl:h-fit xl:self-start xl:border-t-0 xl:border-l">
            <FeedbackPanel
              verification={{
                verified: isVerified,
                score: task.verification_score,
                feedback: task.verification_feedback,
                task_id: task.task_id,
                created_at: task.created_at,
              }}
            />
          </aside>
        </CardContent>
      </Card>
    </div>
  );
}

export default ReportDetail;
