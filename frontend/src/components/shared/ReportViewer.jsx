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
    <Card className="border border-slate-200/80 bg-white shadow-xs transition-all duration-200 hover:border-slate-300">
      <CardHeader className="space-y-3 border-b border-slate-100 bg-slate-50/50 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-700">
                <FileText size={12} className="text-slate-500" />
                Worker Report
              </span>
              <StatusBadge status={task.status} />
              {task.verification_score != null ? (
                <span className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-700">
                  Score {task.verification_score}/100
                </span>
              ) : null}
            </div>
            <CardTitle className="text-base font-semibold text-slate-900 leading-snug">{task.task}</CardTitle>
            <p className="font-mono text-xs text-slate-400">{task.task_id}</p>

            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              {task.worker_id ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5">
                  <UserRound size={12} className="text-slate-400" />
                  {task.worker_id}
                </span>
              ) : null}
              {task.reward != null ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 font-medium text-slate-800">
                  <IndianRupee size={12} className="text-slate-400" />
                  {formatCurrency(task.reward)}
                </span>
              ) : null}
              {task.created_at ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5">
                  <CalendarDays size={12} className="text-slate-400" />
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
                <ExternalLink size={13} className="mr-1" />
                Full Report
              </Link>
            ) : null}
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy size={13} className="mr-1" />
              Copy
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setOpen((v) => !v)}>
              {open ? <ChevronUp size={14} className="mr-1" /> : <ChevronDown size={14} className="mr-1" />}
              {open ? "Collapse" : "Preview"}
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Collapsed preview */}
      {!open && previewSection ? (
        <CardContent className="p-5 bg-white">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Report Preview</p>
          <h3 className="mt-1.5 text-sm font-semibold text-slate-900">{previewSection.title}</h3>
          <div className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-600">
            <MarkdownRenderer content={previewSection.content.slice(0, 350) + (previewSection.content.length > 350 ? "…" : "")} />
          </div>
        </CardContent>
      ) : null}

      {/* Expanded full view */}
      {open ? (
        <CardContent className="grid gap-0 p-0 lg:grid-cols-[1.4fr_0.9fr]">
          {/* Sections */}
          <div className="space-y-3 p-5 bg-white">
            {sections.map((section, index) => (
              <section
                key={`${section.title}-${index}`}
                className="rounded-lg border border-slate-200/80 bg-white overflow-hidden shadow-2xs"
              >
                {/* Section header stripe */}
                <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-2.5 flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-[10px] font-bold text-blue-600 border border-blue-100">
                    {index + 1}
                  </span>
                  <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wide">{section.title}</h3>
                </div>
                <div className="p-4 text-xs leading-relaxed text-slate-700">
                  <MarkdownRenderer content={section.content} />
                </div>
              </section>
            ))}
          </div>

          {/* Feedback sidebar */}
          <div className="border-t border-slate-100 bg-slate-50/40 p-5 lg:border-t-0 lg:border-l">
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
