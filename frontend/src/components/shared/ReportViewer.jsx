import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, ChevronDown, ChevronUp, Copy, ExternalLink, FileText, IndianRupee, UserRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button, buttonVariants } from "../ui/button";
import { Badge } from "../ui/badge";
import StatusBadge from "./StatusBadge";
import FeedbackPanel from "./FeedbackPanel";
import MarkdownRenderer from "./MarkdownRenderer";
import { formatCurrency } from "../../lib/formatters";
import { parseReportSections } from "../../lib/reportFormatter";
import { cn } from "../../lib/utils";

function ReportViewer({ task, defaultOpen = false, showDetailLink = true }) {
  const [open, setOpen] = useState(defaultOpen);
  const sections = useMemo(() => parseReportSections(task?.generated_report), [task?.generated_report]);
  const previewSection = sections[0];

  if (!task?.generated_report) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(task.generated_report);
    } catch {
      // ignore clipboard failures
    }
  };

  return (
    <Card className="glass-panel overflow-hidden transition-all duration-300 hover:shadow-lg">
      <CardHeader className="space-y-4 border-b border-border/60 bg-gradient-to-r from-muted/30 to-transparent">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <FileText size={12} />
                Worker Report
              </Badge>
              <StatusBadge status={task.status} />
              {task.verification_score != null ? (
                <Badge variant="outline">Score {task.verification_score}/100</Badge>
              ) : null}
            </div>
            <CardTitle className="text-xl leading-tight">{task.task}</CardTitle>
            <p className="font-mono text-xs text-muted-foreground">{task.task_id}</p>

            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
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
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            {showDetailLink ? (
              <Link
                to={`/reports/${task.task_id}`}
                state={{ task }}
                className={cn(buttonVariants({ variant: "default", size: "sm" }))}
              >
                <ExternalLink size={14} />
                Full Detail
              </Link>
            ) : null}
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy size={14} />
              Copy
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setOpen((v) => !v)}>
              {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {open ? "Collapse" : "Preview"}
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Collapsed preview */}
      {!open && previewSection ? (
        <CardContent className="border-b border-border/60 bg-muted/10 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Report Preview</p>
          <h3 className="mt-2 text-base font-semibold text-primary">{previewSection.title}</h3>
          <div className="mt-2 line-clamp-4 text-sm leading-7 text-foreground/80">
            <MarkdownRenderer content={previewSection.content.slice(0, 420) + (previewSection.content.length > 420 ? "…" : "")} />
          </div>
        </CardContent>
      ) : null}

      {/* Expanded full view */}
      {open ? (
        <CardContent className="grid gap-0 p-0 lg:grid-cols-[1.4fr_0.9fr]">
          {/* Sections */}
          <div className="space-y-3 p-5">
            {sections.map((section, index) => (
              <section
                key={`${section.title}-${index}`}
                className="animate-fade-in-up rounded-xl border border-border/60 bg-background/80 overflow-hidden"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Section header stripe */}
                <div className="border-b border-border/40 bg-muted/30 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                      {index + 1}
                    </span>
                    <h3 className="text-sm font-semibold tracking-wide text-primary">{section.title}</h3>
                  </div>
                </div>
                <div className="p-4">
                  <MarkdownRenderer content={section.content} />
                </div>
              </section>
            ))}
          </div>

          {/* Feedback sidebar */}
          <div className="border-t border-border/60 bg-muted/15 p-5 lg:border-t-0 lg:border-l">
            <FeedbackPanel
              verification={{
                verified: Number(task.verification_score || 0) >= 80,
                score: task.verification_score,
                feedback: task.verification_feedback,
                task_id: task.task_id,
                created_at: task.created_at,
              }}
              compact
            />
          </div>
        </CardContent>
      ) : null}
    </Card>
  );
}

export default ReportViewer;
