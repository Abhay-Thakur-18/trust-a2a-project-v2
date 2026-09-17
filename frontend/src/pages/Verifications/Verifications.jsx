import { useMemo, useState } from "react";
import { RefreshCw, CheckCircle2, XCircle, Award, ShieldCheck, FileText, X, Copy, Check, Eye } from "lucide-react";
import { useApiQuery } from "../../hooks/useApiQuery";
import { getVerifications } from "../../services/verificationService";
import { EmptyState, ErrorState, LoadingSkeleton } from "../../components/shared/DataState";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import MetricCard from "../../components/shared/MetricCard";
import StatusBadge from "../../components/shared/StatusBadge";
import { Link } from "react-router-dom";

function Verifications() {
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const { data, loading, error, refetch } = useApiQuery(getVerifications);

  const rows = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const avgScore = useMemo(() => {
    const scored = rows.filter((r) => r.score != null || r.verification_score != null);
    if (!scored.length) return null;
    return Math.round(
      scored.reduce((s, r) => s + Number(r.score ?? r.verification_score ?? 0), 0) / scored.length,
    );
  }, [rows]);

  const passCount = useMemo(() => rows.filter((r) => r.verified || Number(r.score ?? r.verification_score) >= 80).length, [rows]);
  const failCount = rows.length - passCount;

  const copyId = (id, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  if (loading) return <LoadingSkeleton rows={8} />;
  if (error) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Verifications</h1>
          <p className="text-sm text-slate-500 mt-1">
            Independent Gemini AI evaluation logs, criteria benchmarks, and escrow release gates.
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
            Refresh Audits
          </Button>
        </div>
      </div>

      {/* ── Top Metrics: Verification Overview ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Verifications"
          value={rows.length}
          icon={Award}
          delta="All evaluated deliverables"
          tone="default"
        />
        <MetricCard
          title="Verified"
          value={passCount}
          icon={CheckCircle2}
          delta={`${rows.length ? Math.round((passCount / rows.length) * 100) : 0}% acceptance rate`}
          tone="success"
        />
        <MetricCard
          title="Failed / Flagged"
          value={failCount}
          icon={XCircle}
          delta={`${failCount} blocked / escrow refund`}
          tone={failCount > 0 ? "destructive" : "default"}
        />
        <MetricCard
          title="Average Score"
          value={avgScore != null ? `${avgScore}/100` : "—"}
          icon={ShieldCheck}
          delta="Gemini 2.5 judge benchmark"
          tone={avgScore >= 80 ? "success" : "warning"}
        />
      </div>

      {/* ── Large Verification Table ── */}
      <Card className="border border-slate-200 bg-white shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">Verification Audit Logs</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Detailed AI evaluation records and escrow release authorizations
            </CardDescription>
          </div>
          <span className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-mono font-semibold text-slate-700">
            {rows.length} Audits
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {!rows.length ? (
            <div className="p-10">
              <EmptyState
                title="No verifications logged yet"
                description="Create a task to trigger the autonomous AI verification pipeline. Detailed score logs will appear here."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-200 bg-slate-50/60 text-xs">
                    <TableHead className="py-3.5 px-4 font-bold text-slate-700 min-w-[280px]">Task</TableHead>
                    <TableHead className="py-3.5 px-3 font-bold text-slate-700 min-w-[130px]">Verification Status</TableHead>
                    <TableHead className="py-3.5 px-3 font-bold text-slate-700 min-w-[100px]">Score</TableHead>
                    <TableHead className="py-3.5 px-3 font-bold text-slate-700 min-w-[120px]">Verifier</TableHead>
                    <TableHead className="py-3.5 px-3 font-bold text-slate-700 min-w-[110px]">Date</TableHead>
                    <TableHead className="py-3.5 px-4 text-right font-bold text-slate-700 min-w-[130px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => {
                    const score = row.score ?? row.verification_score;
                    const isPassed = row.verified || Number(score || 0) >= 80;
                    const taskId = row.task_id || row.id;

                    return (
                      <TableRow
                        key={taskId}
                        className="border-b border-slate-100 hover:bg-slate-50/80 cursor-pointer transition-colors text-xs"
                        onClick={() => setSelectedAudit(row)}
                      >
                        <TableCell className="py-3.5 px-4">
                          <p className="font-semibold text-slate-900 leading-snug">
                            {row.task || `Task ID: ${taskId}`}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5 font-mono text-[11px] text-slate-400">
                            <span>{taskId}</span>
                            <button
                              type="button"
                              onClick={(e) => copyId(taskId, e)}
                              className="p-0.5 text-slate-400 hover:text-slate-600 rounded"
                              title="Copy Task ID"
                            >
                              {copiedId === taskId ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                            </button>
                          </div>
                        </TableCell>
                        <TableCell className="py-3.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${
                              isPassed
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-rose-50 text-rose-800 border-rose-200"
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${isPassed ? "bg-emerald-600" : "bg-rose-600"}`} />
                            {isPassed ? "Verified & Passed" : "Flagged / Rejected"}
                          </span>
                        </TableCell>
                        <TableCell className="py-3.5 px-3">
                          {score != null ? (
                            <span
                              className={`inline-flex items-center font-bold px-2 py-0.5 rounded text-xs ${
                                Number(score) >= 80
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-rose-50 text-rose-700 border border-rose-200"
                              }`}
                            >
                              {score}/100
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </TableCell>
                        <TableCell className="py-3.5 px-3 text-slate-700 font-medium">
                          {row.verifier_id || "verifier-agent"}
                        </TableCell>
                        <TableCell className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                          {row.created_at ? row.created_at.slice(0, 10) : "Live"}
                        </TableCell>
                        <TableCell className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => setSelectedAudit(row)}
                              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
                            >
                              <Eye size={12} /> Inspect
                            </button>
                            {row.generated_report && (
                              <Link
                                to={`/reports/${taskId}`}
                                state={{ task: row }}
                                className="inline-flex items-center gap-1 rounded-md bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                              >
                                View Report
                              </Link>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Verification Detail Inspection Modal ── */}
      {selectedAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={20} className="text-blue-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">Verification Inspection</h3>
                  <p className="text-xs text-slate-500">Autonomous Gemini AI evaluator audit record</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAudit(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Task Title */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Evaluated Task</span>
                <p className="text-sm font-semibold text-slate-900 mt-1">{selectedAudit.task || selectedAudit.task_id}</p>
              </div>

              {/* Benchmark Summary Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Verdict</span>
                  <p className="mt-1 font-bold text-sm">
                    {selectedAudit.verified || Number(selectedAudit.score ?? selectedAudit.verification_score) >= 80 ? (
                      <span className="text-emerald-700">Approved ✓</span>
                    ) : (
                      <span className="text-rose-700">Rejected ✗</span>
                    )}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Quality Score</span>
                  <p className="mt-1 font-bold text-slate-900 text-base">
                    {selectedAudit.score ?? selectedAudit.verification_score ?? "—"}/100
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Escrow Action</span>
                  <p className="mt-1 font-semibold text-slate-800">
                    {selectedAudit.verified || Number(selectedAudit.score ?? selectedAudit.verification_score) >= 80
                      ? "Payout Released"
                      : "Funds Held"}
                  </p>
                </div>
              </div>

              {/* Task ID and timestamp */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50/50 p-3 text-xs">
                <span className="font-mono text-slate-600">ID: {selectedAudit.task_id || selectedAudit.id}</span>
                <span className="text-slate-500">Timestamp: {selectedAudit.created_at || "Live Execution"}</span>
              </div>

              {/* Verifier Reasoning & Feedback */}
              <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 space-y-2">
                <p className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-blue-600" />
                  Detailed AI Evaluation Reasoning
                </p>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-xs bg-white border border-slate-200 p-3.5 rounded-lg">
                  {selectedAudit.feedback || selectedAudit.verification_feedback || "The autonomous verifier evaluated the deliverable against technical completeness, accuracy, and structural standards."}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-3.5">
              {selectedAudit.generated_report ? (
                <Link
                  to={`/reports/${selectedAudit.task_id || selectedAudit.id}`}
                  state={{ task: selectedAudit }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs"
                >
                  <FileText size={13} /> View Deliverable Report
                </Link>
              ) : (
                <span className="text-xs text-slate-400">No deliverable document attached</span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedAudit(null)}
                className="h-8 text-xs font-semibold border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Verifications;
