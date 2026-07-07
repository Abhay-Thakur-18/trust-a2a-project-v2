import { useMemo } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Copy, Download, IndianRupee, Loader2, UserRound } from "lucide-react";
import { useApiQuery } from "../../hooks/useApiQuery";
import { getTaskById } from "../../services/taskService";
import { formatCurrency } from "../../lib/formatters";
import { parseReportSections } from "../../lib/reportFormatter";
import FeedbackPanel from "../../components/shared/FeedbackPanel";
import StatusBadge from "../../components/shared/StatusBadge";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
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

  return (
    <div className="min-h-[60vh] space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" render={<Link to="/reports" />}>
          <ArrowLeft size={14} />
          Back to Reports
        </Button>
        <div className="flex items-center gap-2">
          {loading ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 size={12} className="animate-spin" />
              Syncing
            </span>
          ) : null}
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy size={14} />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download size={14} />
            Download
          </Button>
        </div>
      </div>

      <Card className="glass-panel overflow-hidden">
        <CardHeader className="border-b border-border/60 bg-gradient-to-r from-primary/10 via-transparent to-sky-500/10">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Report Detail</Badge>
            <StatusBadge status={task.status} />
            {task.verification_score != null ? <Badge variant="outline">Score {task.verification_score}/100</Badge> : null}
          </div>
          <CardTitle className="mt-3 text-2xl leading-tight md:text-3xl">{task.task}</CardTitle>
          <p className="font-mono text-xs text-muted-foreground">{task.task_id}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
            {task.worker_id ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2.5 py-1">
                <UserRound size={12} />
                {task.worker_id}
              </span>
            ) : null}
            {task.reward != null ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2.5 py-1">
                <IndianRupee size={12} />
                {formatCurrency(task.reward)}
              </span>
            ) : null}
            {task.created_at ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2.5 py-1">
                <CalendarDays size={12} />
                {task.created_at.slice(0, 10)}
              </span>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="grid gap-6 p-0 xl:grid-cols-[240px_minmax(0,1fr)_360px]">
          <aside className="border-b border-border/60 p-5 xl:sticky xl:top-0 xl:h-fit xl:self-start xl:border-b-0 xl:border-r">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Contents</p>
            <nav className="mt-3 space-y-2">
              {sections.map((section, index) => (
                <button
                  key={`${section.title}-${index}`}
                  type="button"
                  onClick={() => {
                    document.getElementById(`section-${index}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="block w-full rounded-lg border border-transparent px-3 py-2 text-left text-sm text-muted-foreground transition hover:border-border/60 hover:bg-muted/40 hover:text-foreground"
                >
                  {section.title}
                </button>
              ))}
            </nav>
          </aside>

          <article className="min-w-0 space-y-5 p-5">
            {sections.map((section, index) => (
              <section
                key={`${section.title}-${index}`}
                id={`section-${index}`}
                className="report-section rounded-2xl border border-border/60 bg-background/80 p-5 shadow-sm"
              >
                <h2 className="text-lg font-semibold text-primary">{section.title}</h2>
                <div className="report-prose mt-4 space-y-4 text-sm leading-8 text-foreground/90">
                  {section.content.split("\n\n").map((paragraph, idx) => {
                    const trimmed = paragraph.trim();
                    if (trimmed.startsWith("- ") || trimmed.match(/^\d+\./)) {
                      const items = trimmed.split("\n").filter(Boolean);
                      return (
                        <ul key={idx} className="list-disc space-y-2 pl-5">
                          {items.map((item, itemIdx) => (
                            <li key={itemIdx}>{item.replace(/^[-\d.]+\s*/, "")}</li>
                          ))}
                        </ul>
                      );
                    }
                    return <p key={idx}>{trimmed}</p>;
                  })}
                </div>
              </section>
            ))}
          </article>

          <aside className="border-t border-border/60 p-5 xl:sticky xl:top-0 xl:h-fit xl:self-start xl:border-t-0 xl:border-l">
            <FeedbackPanel
              verification={{
                verified: Number(task.verification_score || 0) >= 80,
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
